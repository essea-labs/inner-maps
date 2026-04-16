import Stripe from 'stripe';

let _stripe: Stripe | null = null;

export function getStripe(): Stripe {
  if (!_stripe) {
    const key = process.env.STRIPE_SECRET_KEY?.trim();
    if (!key) {
      throw new Error('STRIPE_SECRET_KEY is not set');
    }
    _stripe = new Stripe(key, {
      apiVersion: '2026-02-25.clover',
    });
  }
  return _stripe;
}

// Trim whitespace/newlines — env vars set via copy-paste sometimes include trailing \n
export const PRICES: Record<string, string> = {
  individual_report: (process.env.STRIPE_PRICE_INDIVIDUAL ?? '').trim(),
  compatibility_report: (process.env.STRIPE_PRICE_COMPATIBILITY ?? '').trim(),
};

export const PRICE_DISPLAY: Record<string, string> = {
  individual_report: '$2.99 USD',
  compatibility_report: '$1.99 USD',
};
