import { NextResponse } from 'next/server';
import { getStripe, PRICES } from '@/lib/stripe';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { getAuthUserId } from '@/lib/api-auth';

export async function POST(req: Request) {
  try {
    const { product_type, connection_id } = await req.json();

    // Validate product type
    if (!PRICES[product_type]) {
      return NextResponse.json({ error: 'Invalid product type' }, { status: 400 });
    }

    // Use the authenticated session's user ID (works for anonymous users too)
    const user_id = await getAuthUserId();
    if (!user_id) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    // Check for existing purchase (duplicate prevention)
    let query = supabaseAdmin
      .from('purchases')
      .select('id')
      .eq('user_id', user_id)
      .eq('product_type', product_type)
      .limit(1);

    if (connection_id) {
      query = query.eq('connection_id', connection_id);
    }

    const { data: existing } = await query;
    if (existing && existing.length > 0) {
      return NextResponse.json({ already_purchased: true });
    }

    // Open-session de-duplication: if this user has an OPEN Stripe checkout session
    // for the same product in the last 30 minutes, return its URL instead of creating
    // a new one. Prevents the "user clicks buy N times in a burst" pattern where each
    // click spins up a brand-new Stripe session (observed in real users on Apr 11).
    const thirtyMinAgo = Math.floor(Date.now() / 1000) - 30 * 60;
    const recentSessions = await getStripe().checkout.sessions.list({
      limit: 20,
      created: { gte: thirtyMinAgo },
    });
    const reusable = recentSessions.data.find((s) => {
      if (s.status !== 'open') return false;
      const md = s.metadata ?? {};
      if (md.user_id !== user_id) return false;
      if (md.product_type !== product_type) return false;
      if (connection_id && md.connection_id !== connection_id) return false;
      if (!connection_id && md.connection_id) return false;
      return !!s.url;
    });
    if (reusable) {
      return NextResponse.json({ url: reusable.url });
    }

    // Build success URL
    const origin = new URL(req.url).origin;
    const successParams = new URLSearchParams({
      purchase: 'success',
      product: product_type,
    });
    if (connection_id) {
      successParams.set('connection_id', connection_id);
    }

    const session = await getStripe().checkout.sessions.create({
      mode: 'payment',
      line_items: [{ price: PRICES[product_type], quantity: 1 }],
      allow_promotion_codes: true,
      // Disable adaptive pricing — keeps all users on USD matching the in-app "$2.99 USD" /
      // "$1.99 USD" labels in PRICE_DISPLAY. Prior behavior auto-converted to local currency
      // on the Stripe Checkout page (e.g., AU users saw local-currency amounts), causing
      // price-surprise bail at the exact moment of intent. Re-enable once there's baseline
      // US revenue and we can A/B test international conversion separately.
      adaptive_pricing: { enabled: false },
      metadata: {
        user_id,
        product_type,
        ...(connection_id && { connection_id }),
      },
      // {CHECKOUT_SESSION_ID} is a Stripe template variable replaced with the real session ID
      success_url: `${origin}/quiz?${successParams.toString()}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/quiz`,
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error('Checkout error:', err);
    return NextResponse.json({ error: 'Failed to create checkout session' }, { status: 500 });
  }
}
