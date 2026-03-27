import { ImageResponse } from 'next/og';

export const alt = 'Inner Maps — Discover Your Full Self';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function Image() {
  const dimensions = [
    { emoji: '\uD83E\uDDE0', label: 'Personality Type' },
    { emoji: '\uD83D\uDD2E', label: 'Enneagram' },
    { emoji: '\uD83D\uDC9B', label: 'Attachment Style' },
    { emoji: '\uD83E\uDD1D', label: 'Connection Style' },
    { emoji: '\u2728', label: 'Star Sign' },
  ];

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #FFF8F5 0%, #F5E6D8 100%)',
          fontFamily: 'Georgia, serif',
          color: '#2D2217',
        }}
      >
        {/* Brand header */}
        <div
          style={{
            fontSize: 18,
            letterSpacing: 6,
            textTransform: 'uppercase',
            color: '#C4956B',
            marginBottom: 24,
            display: 'flex',
            alignItems: 'center',
            gap: 12,
          }}
        >
          <span>&#10022;</span>
          <span>Inner Maps</span>
          <span>&#10022;</span>
        </div>

        {/* Headline */}
        <div
          style={{
            fontSize: 52,
            fontWeight: 700,
            textAlign: 'center',
            lineHeight: 1.2,
            marginBottom: 12,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <span>Discover Your <span style={{ fontStyle: 'italic', color: '#C4956B' }}>Full Self</span></span>
          <span>in Under 12 Minutes</span>
        </div>

        {/* Subheadline */}
        <div
          style={{
            fontSize: 20,
            color: '#8B7B6B',
            textAlign: 'center',
            marginBottom: 40,
            fontFamily: 'sans-serif',
            display: 'flex',
          }}
        >
          One quiz. Five dimensions. Understand yourself.
        </div>

        {/* Dimension pills */}
        <div
          style={{
            display: 'flex',
            gap: 16,
            flexWrap: 'wrap',
            justifyContent: 'center',
            maxWidth: 900,
          }}
        >
          {dimensions.map((d) => (
            <div
              key={d.label}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                background: 'white',
                borderRadius: 12,
                padding: '12px 24px',
                fontSize: 18,
                fontWeight: 500,
                fontFamily: 'sans-serif',
                boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
              }}
            >
              <span>{d.emoji}</span>
              <span>{d.label}</span>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div
          style={{
            position: 'absolute',
            bottom: 28,
            fontSize: 16,
            color: '#C4956B',
            letterSpacing: 1,
            fontFamily: 'sans-serif',
            display: 'flex',
          }}
        >
          innermaps.io
        </div>
      </div>
    ),
    {
      ...size,
    },
  );
}
