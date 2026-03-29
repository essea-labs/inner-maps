'use client';

import { useEffect } from 'react';
import * as Sentry from '@sentry/nextjs';

export default function Error({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '60dvh',
        textAlign: 'center',
        padding: '2rem',
      }}
    >
      <div>
        <h2 className="playfair" style={{ fontSize: '1.5rem', marginBottom: '0.75rem' }}>
          Something went wrong
        </h2>
        <p style={{ fontSize: '0.95rem', opacity: 0.7, marginBottom: '1.5rem' }}>
          We hit an unexpected error. Please try again.
        </p>
        <button
          onClick={() => unstable_retry()}
          className="cta-button"
          style={{ marginRight: '0.75rem' }}
        >
          Try again
        </button>
        <a href="/quiz" style={{ color: '#E8A87C', fontSize: '0.9rem', textDecoration: 'underline' }}>
          Start over
        </a>
      </div>
    </div>
  );
}
