import { NextResponse } from 'next/server';
import { getStripe, PRICES } from '@/lib/stripe';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function POST(req: Request) {
  try {
    const { product_type, user_id, connection_id } = await req.json();

    // Validate product type
    if (!PRICES[product_type]) {
      return NextResponse.json({ error: 'Invalid product type' }, { status: 400 });
    }
    if (!user_id) {
      return NextResponse.json({ error: 'Missing user_id' }, { status: 400 });
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
