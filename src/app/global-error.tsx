'use client';

import { useEffect } from 'react';
import * as Sentry from '@sentry/nextjs';

export default function GlobalError({
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
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: '100dvh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#FFF8F5',
          color: '#2D2217',
          fontFamily: '"DM Sans", system-ui, sans-serif',
          textAlign: 'center',
          padding: '2rem',
        }}
      >
        <div>
          <h2
            style={{
              fontFamily: '"Playfair Display", Georgia, serif',
              fontSize: '1.5rem',
              marginBottom: '0.75rem',
            }}
          >
            Something went wrong
          </h2>
          <p style={{ fontSize: '0.95rem', opacity: 0.7, marginBottom: '1.5rem' }}>
            We hit an unexpected error. Please try again.
          </p>
          <button
            onClick={() => unstable_retry()}
            style={{
              background: '#E8A87C',
              color: '#fff',
              border: 'none',
              borderRadius: '12px',
              padding: '12px 32px',
              fontSize: '1rem',
              fontWeight: 600,
              cursor: 'pointer',
              marginRight: '0.75rem',
            }}
          >
            Try again
          </button>
          <a
            href="/quiz"
            style={{
              color: '#E8A87C',
              fontSize: '0.9rem',
              textDecoration: 'underline',
            }}
          >
            Start over
          </a>
        </div>
      </body>
    </html>
  );
}
