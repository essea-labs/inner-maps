import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { getAuthUserId } from '@/lib/api-auth';

/**
 * POST /api/purchases/claim
 *
 * Migrates an anonymous purchase to a real user account.
 * Called after a user signs up/in following an anonymous purchase.
 */
export async function POST(req: Request) {
  try {
    const { stripe_session_id } = await req.json();

    if (!stripe_session_id || typeof stripe_session_id !== 'string') {
      return NextResponse.json({ error: 'Missing stripe_session_id' }, { status: 400 });
    }

    // Verify the caller is authenticated
    const authUserId = await getAuthUserId();
    if (!authUserId) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    // Look up the purchase by stripe_session_id
    const { data: purchase, error: fetchError } = await supabaseAdmin
      .from('purchases')
      .select('id, user_id')
      .eq('stripe_session_id', stripe_session_id)
      .limit(1)
      .single();

    if (fetchError || !purchase) {
      return NextResponse.json({ error: 'Purchase not found' }, { status: 404 });
    }

    // If the purchase already belongs to this user, nothing to do
    if (purchase.user_id === authUserId) {
      return NextResponse.json({ claimed: true, already_owned: true });
    }

    // Only allow claiming purchases from anonymous users
    const { data: currentOwner } = await supabaseAdmin
      .from('users')
      .select('is_anonymous')
      .eq('id', purchase.user_id)
      .limit(1)
      .single();

    // If the current owner is not anonymous (or doesn't exist), don't allow claim
    if (currentOwner && currentOwner.is_anonymous === false) {
      return NextResponse.json({ error: 'Purchase belongs to another user' }, { status: 403 });
    }

    // Migrate the purchase to the authenticated user
    const { error: updateError } = await supabaseAdmin
      .from('purchases')
      .update({ user_id: authUserId })
      .eq('id', purchase.id);

    if (updateError) {
      console.error('Failed to claim purchase:', updateError.message);
      return NextResponse.json({ error: 'Failed to claim purchase' }, { status: 500 });
    }

    return NextResponse.json({ claimed: true });
  } catch (err) {
    console.error('Purchase claim error:', err);
    return NextResponse.json({ error: 'Failed to claim purchase' }, { status: 500 });
  }
}
