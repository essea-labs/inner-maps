import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { getAuthUserId } from '@/lib/api-auth';

/**
 * POST /api/invites/claim
 *
 * Migrates an invite's invitee_id from an anonymous user to a real user.
 * Called when User B signs into an existing (different) account after
 * completing an invite anonymously.
 */
export async function POST(req: Request) {
  try {
    const { invite_code } = await req.json();

    if (!invite_code || typeof invite_code !== 'string') {
      return NextResponse.json({ error: 'Missing invite_code' }, { status: 400 });
    }

    const authUserId = await getAuthUserId();
    if (!authUserId) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const admin = getSupabaseAdmin();

    // Look up the invite
    const { data: invite, error: fetchError } = await admin
      .from('invites')
      .select('id, invitee_id, inviter_id, status')
      .eq('invite_code', invite_code)
      .single();

    if (fetchError || !invite) {
      return NextResponse.json({ error: 'Invite not found' }, { status: 404 });
    }

    // Already belongs to this user
    if (invite.invitee_id === authUserId) {
      return NextResponse.json({ claimed: true, already_owned: true });
    }

    // Don't allow claiming your own invite
    if (invite.inviter_id === authUserId) {
      return NextResponse.json({ error: 'Cannot claim your own invite' }, { status: 400 });
    }

    // Only allow claiming from anonymous users
    if (invite.invitee_id) {
      const { data: currentOwner } = await admin
        .from('users')
        .select('is_anonymous')
        .eq('id', invite.invitee_id)
        .single();

      if (currentOwner && currentOwner.is_anonymous === false) {
        return NextResponse.json({ error: 'Invite belongs to another user' }, { status: 403 });
      }
    }

    // Migrate the invite to the authenticated user
    const { error: updateError } = await admin
      .from('invites')
      .update({ invitee_id: authUserId })
      .eq('id', invite.id);

    if (updateError) {
      console.error('Failed to claim invite:', updateError.message);
      return NextResponse.json({ error: 'Failed to claim invite' }, { status: 500 });
    }

    return NextResponse.json({ claimed: true });
  } catch (err) {
    console.error('Invite claim error:', err);
    return NextResponse.json({ error: 'Failed to claim invite' }, { status: 500 });
  }
}
