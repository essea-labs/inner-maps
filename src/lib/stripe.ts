import Stripe from 'stripe';

let _stripe: Stripe | null = null;

export function getStripe(): Stripe {
  if (!_stripe) {
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error('STRIPE_SECRET_KEY is not set');
    }
    _stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2026-02-25.clover',
    });
  }
  return _stripe;
}

export const PRICES: Record<string, string> = {
  individual_report: process.env.STRIPE_PRICE_INDIVIDUAL!,
  compatibility_report: process.env.STRIPE_PRICE_COMPATIBILITY!,
};

export const PRICE_DISPLAY: Record<string, string> = {
  individual_report: '$9.99',
  compatibility_report: '$4.99',
};
