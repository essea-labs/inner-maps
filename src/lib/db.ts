import { supabase } from './supabase';
import type { QuizResults, QuizAnswers, Connection } from './types';
import { rehydrateResults, getStarSign, STAR_SIGNS } from './quiz-data';

// ===== USER PROFILE =====

export async function saveUserProfile(
  userId: string,
  opts: {
    name?: string;
    email?: string | null;
    birthMonth?: number | null;
    birthDay?: number | null;
    isAnonymous?: boolean;
  }
): Promise<boolean> {
  const { error } = await supabase
    .from('users')
    .upsert(
      {
        id: userId,
        ...(opts.name !== undefined && { name: opts.name }),
        ...(opts.email !== undefined && { email: opts.email }),
        ...(opts.birthMonth !== undefined && { birthday_month: opts.birthMonth }),
        ...(opts.birthDay !== undefined && { birthday_day: opts.birthDay }),
        ...(opts.isAnonymous !== undefined && { is_anonymous: opts.isAnonymous }),
      },
      { onConflict: 'id' }
    );
  if (error) console.error('saveUserProfile error:', error.message);
  return !error;
}

// ===== QUIZ RESULTS =====

export async function saveQuizResults(
  userId: string,
  results: QuizResults,
  rawAnswers: QuizAnswers
): Promise<boolean> {
  const { error } = await supabase
    .from('quiz_results')
    .upsert(
      {
        user_id: userId,
        cognitive_type: results.cognitiveType,
        enneagram_type: results.enneagramType,
        enneagram_wing: results.enneagramWing,
        enneagram_display: results.enneagramDisplay,
        attachment_style: results.attachmentStyle,
        anxiety_score: parseFloat(results.anxiety),
        avoidance_score: parseFloat(results.avoidance),
        connection_scores: results.connectionScores,
        top_connection: results.topConnection,
        star_sign: results.starSign?.sign ?? null,
        raw_answers: rawAnswers,
      },
      { onConflict: 'user_id' }
    );
  if (error) console.error('saveQuizResults error:', error.message);
  return !error;
}

// ===== INVITES =====

/** Generate a short, human-readable invite code (8 chars, no ambiguous characters). */
function generateInviteCode(): string {
  const chars = 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
  return Array.from({ length: 8 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}

/** Create an invite — called only when the modal opens for a real user. Returns the invite_code. */
export async function createInvite(inviterId: string): Promise<string> {
  const code = generateInviteCode();
  const { error } = await supabase.from('invites').insert({
    inviter_id: inviterId,
    invite_code: code,
    status: 'pending',
  });
  if (error) throw new Error('createInvite error: ' + error.message);
  return code;
}

/** Public lookup by invite_code (RLS allows select for all). */
export async function getInviteByCode(
  code: string
): Promise<{ inviter_id: string } | null> {
  const { data, error } = await supabase
    .from('invites')
    .select('inviter_id')
    .eq('invite_code', code)
    .single();
  if (error || !data) return null;
  return data as { inviter_id: string };
}

/** Mark invite as completed when invitee signs up.
 *  Uses server-side API route to bypass RLS (anon key can't update other users' invites). */
export async function completeInvite(
  inviteCode: string,
  inviteeId: string
): Promise<boolean> {
  try {
    const res = await fetch('/api/invite-complete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ inviteCode, inviteeId }),
    });
    const data = await res.json();
    if (!res.ok) {
      console.error('completeInvite API error:', data.error);
      return false;
    }
    return true;
  } catch (err) {
    console.error('completeInvite fetch error:', err);
    return false;
  }
}

// ===== FETCH USER QUIZ RESULTS (for state restoration) =====

export async function fetchUserQuizResults(
  userId: string
): Promise<{ results: QuizResults; name: string; birthMonth: number | null; birthDay: number | null } | null> {
  const { data, error } = await supabase
    .from('quiz_results')
    .select(`
      cognitive_type,
      enneagram_type,
      enneagram_wing,
      enneagram_display,
      attachment_style,
      anxiety_score,
      avoidance_score,
      connection_scores,
      top_connection,
      star_sign,
      user:user_id (
        name,
        birthday_month,
        birthday_day
      )
    `)
    .eq('user_id', userId)
    .single();

  if (error || !data) return null;

  const qr = data as any;
  const user = qr.user as any;

  const birthMonth = user?.birthday_month ?? null;
  const birthDay = user?.birthday_day ?? null;
  const starSign = (birthMonth && birthDay) ? getStarSign(birthMonth, birthDay)
    : qr.star_sign ? (STAR_SIGNS.find(s => s.sign === qr.star_sign) ?? null)
    : null;

  const rawResults: QuizResults = {
    cognitiveType: qr.cognitive_type,
    cognitiveTypeName: '',
    cognitiveTypeDesc: '',
    attachmentStyle: qr.attachment_style,
    attachmentDesc: '',
    anxiety: String(qr.anxiety_score),
    avoidance: String(qr.avoidance_score),
    connectionScores: qr.connection_scores ?? {},
    connectionSorted: Object.entries(qr.connection_scores ?? {}).sort(
      (a: any, b: any) => b[1] - a[1]
    ) as [string, number][],
    connectionNames: {},
    connectionDescs: {},
    topConnection: qr.top_connection,
    enneagramType: qr.enneagram_type,
    enneagramWing: qr.enneagram_wing,
    enneagramName: '',
    enneagramDisplay: qr.enneagram_display,
    starSign,
  };

  return {
    name: user?.name ?? '',
    birthMonth,
    birthDay,
    results: rehydrateResults(rawResults, starSign),
  };
}

// ===== PURCHASES =====

export async function hasPurchase(
  userId: string,
  productType: 'individual_report' | 'compatibility_report',
  connectionId?: string
): Promise<boolean> {
  let query = supabase
    .from('purchases')
    .select('id')
    .eq('user_id', userId)
    .eq('product_type', productType)
    .limit(1);

  if (connectionId) {
    query = query.eq('connection_id', connectionId);
  }

  const { data } = await query;
  return (data?.length ?? 0) > 0;
}

// ===== CONNECTIONS =====

/** Fetch completed connections for a user — both as inviter AND as invitee.
 *  Uses server-side API route to bypass RLS (anon key can't join to other users' profiles).
 *  Returns { data, error } so callers can distinguish "no connections" from "API failed". */
export async function fetchConnections(userId: string): Promise<{ data: Connection[]; error: boolean }> {
  try {
    const res = await fetch(`/api/connections?userId=${encodeURIComponent(userId)}`);
    if (!res.ok) {
      console.error('fetchConnections API error:', await res.text());
      return { data: [], error: true };
    }
    return { data: await res.json(), error: false };
  } catch (err) {
    console.error('fetchConnections fetch error:', err);
    return { data: [], error: true };
  }
}
