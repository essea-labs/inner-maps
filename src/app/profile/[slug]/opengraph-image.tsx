import { ImageResponse } from 'next/og';
import { decodeProfileSlug } from '@/lib/profile-slug';

export const alt = 'Inner Maps personality profile';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function Image({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const profile = decodeProfileSlug(slug);

  // Fallback for invalid slugs
  const cognitiveType = profile?.cognitiveType ?? 'XXXX';
  const enneagramDisplay = profile?.enneagramDisplay ?? '?';
  const attachmentStyle = profile?.attachmentStyle ?? '?';
  const connectionStyle = profile?.connectionStyle ?? '?';
  const starSign = profile?.starSign ?? '?';
  const starSymbol = profile?.starSymbol ?? '✦';

  const [playfairFont, dmSansFont] = await Promise.all([
    fetch(
      'https://fonts.gstatic.com/s/playfairdisplay/v40/nuFvD-vYSZviVYUb_rj3ij__anPXJzDwcbmjWBN2PKeiukDQ.ttf',
    ).then((r) => r.arrayBuffer()),
    fetch(
      'https://fonts.gstatic.com/s/dmsans/v17/rP2tp2ywxg089UriI5-g4vlH9VoD8CmcqZG40F9JadbnoEwAopxhTg.ttf',
    ).then((r) => r.arrayBuffer()),
  ]);

  const dimensions = [
    { label: 'Personality', value: cognitiveType },
    { label: 'Enneagram', value: enneagramDisplay },
    { label: 'Attachment', value: attachmentStyle },
    { label: 'Connection', value: connectionStyle },
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
          background: 'linear-gradient(135deg, #E8A87C 0%, #D4845A 100%)',
          fontFamily: 'DM Sans',
          color: 'white',
        }}
      >
        {/* Title */}
        <div
          style={{
            fontFamily: 'Playfair Display',
            fontSize: 36,
            letterSpacing: 4,
            marginBottom: 40,
            display: 'flex',
          }}
        >
          ✦ Inner Maps ✦
        </div>

        {/* 2x2 Grid */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'center',
            gap: 20,
            maxWidth: 700,
            marginBottom: 28,
          }}
        >
          {dimensions.map((d) => (
            <div
              key={d.label}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                width: 300,
                height: 110,
                borderRadius: 16,
                background: 'rgba(255,255,255,0.15)',
              }}
            >
              <div
                style={{
                  fontSize: 14,
                  textTransform: 'uppercase',
                  letterSpacing: 2,
                  opacity: 0.85,
                  marginBottom: 8,
                  display: 'flex',
                }}
              >
                {d.label}
              </div>
              <div
                style={{
                  fontFamily: 'Playfair Display',
                  fontSize: d.value.length > 14 ? 24 : 32,
                  fontWeight: 700,
                  display: 'flex',
                }}
              >
                {d.value}
              </div>
            </div>
          ))}
        </div>

        {/* Star Sign */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            fontSize: 28,
            fontFamily: 'Playfair Display',
            marginBottom: 32,
          }}
        >
          <span>{starSymbol}</span>
          <span>{starSign}</span>
        </div>

        {/* Footer URL */}
        <div
          style={{
            fontSize: 16,
            opacity: 0.7,
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
      ],
    },
  );
}
