import { supabase } from './supabase';
import type { QuizResults, QuizAnswers, Connection } from './types';

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

/** Create an invite — called only when user taps Share. Returns the invite_code UUID. */
export async function createInvite(inviterId: string): Promise<string> {
  const code = crypto.randomUUID();
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

// ===== CONNECTIONS =====

/** Fetch completed connections for a user, joined with their quiz_results. */
export async function fetchConnections(userId: string): Promise<Connection[]> {
  const { data, error } = await supabase
    .from('invites')
    .select(`
      invite_code,
      status,
      created_at,
      invitee:invitee_id (
        name,
        quiz_results (
          cognitive_type,
          enneagram_type,
          enneagram_wing,
          enneagram_display,
          attachment_style,
          anxiety_score,
          avoidance_score,
          connection_scores,
          top_connection,
          star_sign
        )
      )
    `)
    .eq('inviter_id', userId)
    .eq('status', 'completed');

  if (error || !data) return [];

  return data.map((row: any) => {
    const invitee = row.invitee as any;
    const qr = invitee?.quiz_results?.[0];
    return {
      name: invitee?.name ?? 'Someone',
      status: 'completed' as const,
      invitedDaysAgo: Math.floor(
        (Date.now() - new Date(row.created_at).getTime()) / 86400000
      ),
      results: qr
        ? {
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
            starSign: qr.star_sign
              ? { sign: qr.star_sign, symbol: '', emoji: '', dates: '', tagline: '', desc: '', month: [] }
              : null,
          }
        : undefined,
    } satisfies Connection;
  });
}
