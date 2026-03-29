import posthog from 'posthog-js';

let initialized = false;

export function initPostHog() {
  if (typeof window === 'undefined') return;
  if (initialized) return;

  const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
  const host = process.env.NEXT_PUBLIC_POSTHOG_HOST;
  if (!key) return;

  posthog.init(key, {
    api_host: host || 'https://us.i.posthog.com',
    autocapture: false,
    capture_pageview: false,
    capture_pageleave: false,
    persistence: 'localStorage+cookie',
    loaded: (ph) => {
      if (process.env.NODE_ENV !== 'production') {
        ph.opt_out_capturing();
      }
    },
  });
  initialized = true;
}

export function getPostHog() {
  if (typeof window === 'undefined') return null;
  if (!initialized) initPostHog();
  return posthog;
}
