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

/** Mark invite as completed when invitee signs up. */
export async function completeInvite(
  inviteCode: string,
  inviteeId: string
): Promise<void> {
  const { error } = await supabase
    .from('invites')
    .update({ status: 'completed', invitee_id: inviteeId })
    .eq('invite_code', inviteCode);
  if (error) console.error('completeInvite error:', error.message);
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

/** Maps a raw quiz_results DB row to QuizResults shape with full rehydration */
function mapQR(qr: any): QuizResults {
  const starSign = qr.star_sign
    ? (STAR_SIGNS.find(s => s.sign === qr.star_sign) ?? null)
    : null;

  const raw: QuizResults = {
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

  return rehydrateResults(raw, starSign);
}

/** Fetch completed connections for a user — both as inviter AND as invitee. */
export async function fetchConnections(userId: string): Promise<Connection[]> {
  const SELECT = `
    id,
    invite_code,
    status,
    created_at,
    invitee:invitee_id (
      name,
      quiz_results (
        cognitive_type, enneagram_type, enneagram_wing, enneagram_display,
        attachment_style, anxiety_score, avoidance_score,
        connection_scores, top_connection, star_sign
      )
    ),
    inviter:inviter_id (
      name,
      quiz_results (
        cognitive_type, enneagram_type, enneagram_wing, enneagram_display,
        attachment_style, anxiety_score, avoidance_score,
        connection_scores, top_connection, star_sign
      )
    )
  `;

  // Run both queries in parallel
  const [inviterRes, inviteeRes] = await Promise.all([
    supabase.from('invites').select(SELECT).eq('inviter_id', userId).eq('status', 'completed'),
    supabase.from('invites').select(SELECT).eq('invitee_id', userId).eq('status', 'completed'),
  ]);

  const seenIds = new Set<string>();
  const connections: Connection[] = [];

  // Supabase returns quiz_results as an object (not array) when user_id has a UNIQUE constraint.
  // Handle both shapes to be safe.
  function extractQR(raw: any) {
    if (!raw) return null;
    return Array.isArray(raw) ? (raw[0] ?? null) : raw;
  }

  // Inviter side — show invitee's results
  for (const row of (inviterRes.data ?? [])) {
    if (seenIds.has(row.id)) continue;
    seenIds.add(row.id);
    const other = (row as any).invitee as any;
    const qr = extractQR(other?.quiz_results);
    connections.push({
      id: row.id,
      name: other?.name ?? 'Someone',
      status: 'completed' as const,
      invitedDaysAgo: Math.floor((Date.now() - new Date(row.created_at).getTime()) / 86400000),
      results: qr ? mapQR(qr) : undefined,
    });
  }

  // Invitee side — show inviter's results
  for (const row of (inviteeRes.data ?? [])) {
    if (seenIds.has(row.id)) continue;
    seenIds.add(row.id);
    const other = (row as any).inviter as any;
    const qr = extractQR(other?.quiz_results);
    connections.push({
      id: row.id,
      name: other?.name ?? 'Someone',
      status: 'completed' as const,
      invitedDaysAgo: Math.floor((Date.now() - new Date(row.created_at).getTime()) / 86400000),
      results: qr ? mapQR(qr) : undefined,
    });
  }

  return connections;
}
