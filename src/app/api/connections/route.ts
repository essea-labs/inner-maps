import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { getAuthUserId } from '@/lib/api-auth';
import { rehydrateResults, getStarSign, STAR_SIGNS } from '@/lib/quiz-data';
import type { QuizResults, Connection } from '@/lib/types';

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

function extractQR(raw: any) {
  if (!raw) return null;
  return Array.isArray(raw) ? (raw[0] ?? null) : raw;
}

/**
 * Server-side connections fetch — uses admin client to bypass RLS.
 * The client-side supabase can see invites but can't join to other users'
 * profiles or quiz_results due to RLS on those tables.
 */
export async function GET(request: NextRequest) {
  try {
    const userId = request.nextUrl.searchParams.get('userId');
    if (!userId) {
      return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
    }

    // Verify the caller is the user they claim to be
    const authUserId = await getAuthUserId();
    if (!authUserId || authUserId !== userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const admin = getSupabaseAdmin();

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

    const [inviterRes, inviteeRes] = await Promise.all([
      admin.from('invites').select(SELECT).eq('inviter_id', userId).eq('status', 'completed'),
      admin.from('invites').select(SELECT).eq('invitee_id', userId).eq('status', 'completed'),
    ]);

    const seenIds = new Set<string>();
    const connections: Connection[] = [];

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

    return NextResponse.json(connections);
  } catch (err: any) {
    console.error('connections API error:', err.message);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
