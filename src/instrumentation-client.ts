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
});

// Export router transition tracking for Sentry navigation instrumentation
export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;

// Initialize PostHog (opts out of capturing in dev; no-ops in SSR)
import { initPostHog } from './lib/posthog';
initPostHog();
