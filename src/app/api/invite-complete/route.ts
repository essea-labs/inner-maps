import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { getAuthUserId } from '@/lib/api-auth';

/**
 * Server-side invite completion — uses admin client to bypass RLS.
 * The client-side supabase (anon key) may not have permission to update
 * invite rows created by another user.
 */
export async function POST(request: NextRequest) {
  try {
    const { inviteCode, inviteeId } = await request.json();

    if (!inviteCode || !inviteeId) {
      return NextResponse.json({ error: 'Missing inviteCode or inviteeId' }, { status: 400 });
    }

    // Verify the caller is the invitee they claim to be
    const authUserId = await getAuthUserId();
    if (!authUserId || authUserId !== inviteeId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const admin = getSupabaseAdmin();

    // Verify the invite exists and is still pending
    const { data: invite, error: lookupError } = await admin
      .from('invites')
      .select('id, status, inviter_id')
      .eq('invite_code', inviteCode)
      .single();

    if (lookupError || !invite) {
      console.error('Invite lookup failed:', lookupError?.message ?? 'not found');
      return NextResponse.json({ error: 'Invite not found' }, { status: 404 });
    }

    if (invite.status === 'completed') {
      // Already completed — not an error, just a no-op
      return NextResponse.json({ success: true, already_completed: true });
    }

    // Prevent self-invite
    if (invite.inviter_id === inviteeId) {
      return NextResponse.json({ error: 'Cannot complete your own invite' }, { status: 400 });
    }

    // Complete the invite
    const { error: updateError } = await admin
      .from('invites')
      .update({ status: 'completed', invitee_id: inviteeId })
      .eq('invite_code', inviteCode);

    if (updateError) {
      console.error('completeInvite admin error:', updateError.message);
      return NextResponse.json({ error: 'Failed to complete invite' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('invite-complete error:', err.message);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
