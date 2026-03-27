import { getStripe } from '@/lib/stripe';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function POST(req: Request) {
  const body = await req.text();
  const sig = req.headers.get('stripe-signature');

  if (!sig) {
    return new Response('Missing stripe-signature header', { status: 400 });
  }

  let event;
  try {
    event = getStripe().webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return new Response('Invalid signature', { status: 400 });
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const metadata = session.metadata ?? {};
    const { user_id, product_type, connection_id } = metadata;

    if (!user_id || !product_type) {
      console.warn('Webhook missing metadata (non-fatal):', { user_id, product_type, session_id: session.id });
      return new Response('ok', { status: 200 });
    }
    {
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
        console.error('Failed to record purchase:', error.message);
      }
    }
  }

  return new Response('ok', { status: 200 });
}
