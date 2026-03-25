import type { Metadata } from 'next';
import { decodeProfileSlug } from '@/lib/profile-slug';

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const p = decodeProfileSlug(slug);

  if (!p) {
    return { title: 'Inner Maps — Discover Your Full Self' };
  }

  const title = `${p.cognitiveType} · ${p.enneagramDisplay} · ${p.starSign} — Inner Maps`;
  const description = `${p.cognitiveType} personality, ${p.enneagramDisplay} enneagram, ${p.attachmentStyle} attachment, ${p.connectionStyle} connection style, ${p.starSign} ${p.starSymbol}. Discover your full self in under 12 minutes.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'profile',
      siteName: 'Inner Maps',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
  };
}

export default async function ProfilePage({ params }: Props) {
  const { slug } = await params;
  const p = decodeProfileSlug(slug);

  if (!p) {
    return (
      <div className="results-page" style={{ textAlign: 'center', padding: '60px 24px' }}>
        <div className="logo">✦ Inner Maps ✦</div>
        <h1 style={{ marginTop: 24 }}>Profile not found</h1>
        <p style={{ marginTop: 12, color: 'var(--text-light)' }}>
          This link doesn&apos;t seem right. Take the quiz to discover your profile!
        </p>
        <a
          href="/quiz"
          className="cta-btn"
          style={{ display: 'inline-block', marginTop: 24 }}
        >
          Take the Quiz
        </a>
      </div>
    );
  }

  const dimensions = [
    { label: 'Personality', value: p.cognitiveType },
    { label: 'Enneagram', value: p.enneagramDisplay },
    { label: 'Attachment Style', value: p.attachmentStyle },
    { label: 'Connection Style', value: p.connectionStyle },
    { label: 'Star Sign', value: `${p.starSign} ${p.starSymbol}` },
  ];

  return (
    <div className="results-page" style={{ paddingBottom: 60 }}>
      <div className="results-header">
        <div className="logo">✦ Inner Maps ✦</div>
        <h1>Personality Profile</h1>
        <p>Here&apos;s what makes them, <em>them</em>.</p>
      </div>

      {/* Share Card */}
      <div className="share-card" id="shareCard">
        <div className="share-card-title">✦ Inner Maps ✦</div>
        <div className="share-card-results">
          {dimensions.slice(0, 4).map((d) => (
            <div className="share-card-item" key={d.label}>
              <div className="share-card-item-label">{d.label}</div>
              <div
                className="share-card-item-value"
                style={{
                  fontSize: d.value.length > 12 ? 14 : 18,
                }}
              >
                {d.value}
              </div>
            </div>
          ))}
          <div className="share-card-item-wide">
            <div className="share-card-item-label">Star Sign</div>
            <div className="share-card-item-value">
              {p.starSign} {p.starSymbol}
            </div>
          </div>
        </div>
        <div className="share-card-url">innermaps.io</div>
      </div>

      {/* CTA */}
      <div style={{ textAlign: 'center', marginTop: 32 }}>
        <a
          href="/quiz"
          className="cta-btn"
          style={{ display: 'inline-block', fontSize: 16, padding: '16px 32px' }}
        >
          Discover Your Full Self
        </a>
        <p style={{ marginTop: 12, fontSize: 13, color: 'var(--text-light)' }}>
          5 dimensions · Under 12 minutes · Always free
        </p>
      </div>
    </div>
  );
}
