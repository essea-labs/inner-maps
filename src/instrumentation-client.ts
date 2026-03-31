import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1.0,
  integrations: [
    Sentry.browserTracingIntegration(),
    Sentry.replayIntegration({
      maskAllText: false,
      blockAllMedia: false,
    }),
  ],
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
  beforeSend(event) {
    // Filter out non-fatal Supabase Auth lock contention on Mobile Safari.
    // Multiple concurrent auth requests race for a navigator.locks lock;
    // the loser throws an AbortError that doesn't affect users.
    const msg = event.exception?.values?.[0]?.value ?? '';
    if (msg.includes('Lock was stolen by another request')) return null;
    return event;
  },
});

// Export router transition tracking for Sentry navigation instrumentation
export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;

// Initialize PostHog (opts out of capturing in dev; no-ops in SSR)
import { initPostHog } from './lib/posthog';
initPostHog();
