import posthog from 'posthog-js';

let initialized = false;

export function initPostHog() {
  if (typeof window === 'undefined') return;
  if (initialized) return;

  const key = process.env.NEXT_PUBLIC_POSTHOG_KEY?.trim();
  if (!key) return;

  posthog.init(key, {
    api_host: '/ingest',
    ui_host: 'https://us.posthog.com',
    autocapture: false,
    capture_pageview: true,
    capture_pageleave: true,
    persistence: 'localStorage+cookie',
    disable_session_recording: false,
    session_recording: {
      maskAllInputs: true,
      maskTextSelector: '[data-sensitive]',
    },
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
