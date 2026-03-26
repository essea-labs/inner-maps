import { ImageResponse } from 'next/og';

export const dynamic = 'force-dynamic';
export const alt = 'Inner Maps — Discover Your Full Self';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function Image() {
  const [playfairFont, dmSansFont, notoSymbolsFont] = await Promise.all([
    fetch(
      'https://fonts.gstatic.com/s/playfairdisplay/v40/nuFvD-vYSZviVYUb_rj3ij__anPXJzDwcbmjWBN2PKeiukDQ.ttf',
    ).then((r) => r.arrayBuffer()),
    fetch(
      'https://fonts.gstatic.com/s/dmsans/v17/rP2tp2ywxg089UriI5-g4vlH9VoD8CmcqZG40F9JadbnoEwAopxhTg.ttf',
    ).then((r) => r.arrayBuffer()),
    fetch(
      'https://fonts.gstatic.com/s/notosanssymbols2/v25/I_uyMoGduATTei9eI8daxVHDyfisHr71-jPszfp-fMA.ttf',
    ).then((r) => r.arrayBuffer()),
  ]);

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
          background: '#FFF8F5',
          fontFamily: 'DM Sans',
          color: '#2D2217',
        }}
      >
        {/* Brand header */}
        <div
          style={{
            fontFamily: 'Playfair Display',
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
          <span style={{ fontFamily: 'Noto Sans Symbols 2' }}>✦</span>
          <span>Inner Maps</span>
          <span style={{ fontFamily: 'Noto Sans Symbols 2' }}>✦</span>
        </div>

        {/* Headline */}
        <div
          style={{
            fontFamily: 'Playfair Display',
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
            display: 'flex',
          }}
        >
          innermaps.io
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: 'Playfair Display', data: playfairFont, weight: 700 },
        { name: 'DM Sans', data: dmSansFont, weight: 400 },
        { name: 'Noto Sans Symbols 2', data: notoSymbolsFont, weight: 400 },
      ],
    },
  );
}
