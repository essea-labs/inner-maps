import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase-admin';

/**
 * Public GET endpoint — resolves an invite code to the inviter's first name.
 * Used to personalize the disclosure banner for referred users.
 */
export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get('code');
  if (!code) {
    return NextResponse.json({ inviterName: null });
  }

  try {
    const admin = getSupabaseAdmin();

    const { data: invite } = await admin
      .from('invites')
      .select('inviter_id')
      .eq('invite_code', code)
      .eq('status', 'pending')
      .single();

    if (!invite) {
      return NextResponse.json({ inviterName: null });
    }

    const { data: user } = await admin
      .from('users')
      .select('name')
      .eq('id', invite.inviter_id)
      .single();

    // Extract first name only, cap at 20 chars
    const fullName = user?.name ?? '';
    const firstName = fullName.split(/\s+/)[0]?.slice(0, 20) || null;

    return NextResponse.json({ inviterName: firstName });
  } catch {
    return NextResponse.json({ inviterName: null });
  }
}
