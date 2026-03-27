import { NextResponse } from 'next/server';
import { getStripe } from '@/lib/stripe';
import { supabaseAdmin } from '@/lib/supabase-admin';

/**
 * POST /api/purchases/confirm
 *
 * Client-side purchase confirmation — called when the user returns from Stripe.
 * Retrieves the Stripe checkout session, verifies payment succeeded, and writes
 * the purchase to Supabase. This ensures the purchase is recorded even if the
 * webhook is delayed or misconfigured.
 */
export async function POST(req: Request) {
  try {
    const { session_id } = await req.json();

    if (!session_id || typeof session_id !== 'string') {
      return NextResponse.json({ error: 'Missing session_id' }, { status: 400 });
    }

    // Retrieve the session from Stripe (expand payment_intent for receipt_url)
    const session = await getStripe().checkout.sessions.retrieve(session_id, {
      expand: ['payment_intent'],
    });

    if (session.payment_status !== 'paid') {
      return NextResponse.json({ error: 'Payment not completed' }, { status: 400 });
    }

    const metadata = session.metadata ?? {};
    const { user_id, product_type, connection_id } = metadata;

    if (!user_id || !product_type) {
      return NextResponse.json({ error: 'Missing metadata in session' }, { status: 400 });
    }

    // Upsert the purchase (idempotent — safe to call even if webhook already wrote it)
    const { error } = await supabaseAdmin.from('purchases').upsert(
      {
        user_id,
        product_type,
        stripe_session_id: session.id,
        connection_id: connection_id || null,
        amount_cents: session.amount_total,
      },
      { onConflict: 'stripe_session_id' }
    );

    if (error) {
      console.error('Failed to confirm purchase:', error.message);
      return NextResponse.json({ error: 'Failed to record purchase' }, { status: 500 });
    }

    // Extract receipt URL from the payment intent's latest charge
    let receipt_url: string | null = null;
    const pi = session.payment_intent;
    if (pi && typeof pi === 'object' && 'latest_charge' in pi) {
      const charge = pi.latest_charge;
      if (charge && typeof charge === 'object' && 'receipt_url' in charge) {
        receipt_url = (charge as any).receipt_url;
      }
    }

    return NextResponse.json({
      confirmed: true,
      product_type,
      connection_id: connection_id || null,
      receipt_url,
    });
  } catch (err) {
    console.error('Purchase confirm error:', err);
    return NextResponse.json({ error: 'Failed to confirm purchase' }, { status: 500 });
  }
}
