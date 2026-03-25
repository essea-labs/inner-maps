'use client';

import { useState } from 'react';
import { useQuizStore } from '@/store/quiz-store';
import { ENNEAGRAM_QS } from '@/lib/quiz-data';
import { encodeProfileSlug } from '@/lib/profile-slug';
import TabBar from '@/components/ui/TabBar';
import SignupForm from '@/components/quiz/SignupForm';
import useAuth from '@/hooks/useAuth';

export default function Results() {
  const results = useQuizStore((s) => s.results);
  const userName = useQuizStore((s) => s.userName);
  const setInviteModalOpen = useQuizStore((s) => s.setInviteModalOpen);
  const setScreen = useQuizStore((s) => s.setScreen);
  const setActiveTab = useQuizStore((s) => s.setActiveTab);
  const showToast = useQuizStore((s) => s.showToast);
  const { user, loading: authLoading } = useAuth();

  const [signupOpen, setSignupOpen] = useState(false);
  const [signupIntent, setSignupIntent] = useState('save');
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  function openSignup(intent: string) {
    setSignupIntent(intent);
    setSignupOpen(true);
  }

  // True when the user has a real (non-anonymous) account.
  // Only evaluate once auth has resolved to avoid a brief flash of the save CTA.
  const isRealUser = !authLoading && !!user && !user.is_anonymous;

  if (!results) return null;

  const r = results;

  function getProfileUrl() {
    const slug = encodeProfileSlug(
      r.cognitiveType,
      r.enneagramDisplay,
      r.attachmentStyle,
      r.topConnection,
      r.starSign?.sign ?? '',
    );
    return `https://innermaps.io/profile/${slug}`;
  }

  function handleCopyLink() {
    navigator.clipboard?.writeText(getProfileUrl()).then(() => showToast('✓ Link copied!'));
  }

  function handleShare() {
    if (navigator.share) {
      navigator.share({
        title: 'My Inner Maps Profile',
        text: `I'm a ${r.cognitiveType} ${r.enneagramDisplay} ${r.starSign?.sign} ${r.starSign?.symbol}. Discover yours:`,
        url: getProfileUrl(),
      });
    }
  }

  const purchasedIndividual = useQuizStore((s) => s.purchasedIndividual);
  const startCheckout = useQuizStore((s) => s.startCheckout);

  async function handleUpsell() {
    // Already purchased — go straight to report
    if (purchasedIndividual) {
      setScreen('individualReport');
      return;
    }
    // Anonymous user — need to sign up first
    if (!isRealUser) {
      openSignup('purchase_individual');
      return;
    }
    // Authenticated — go to Stripe checkout
    setCheckoutLoading(true);
    await startCheckout('individual_report', user!.id);
    setCheckoutLoading(false);
  }

  const avoidancePct = (parseFloat(r.avoidance) / 5 * 100).toFixed(0);
  const anxietyPct = (100 - parseFloat(r.anxiety) / 5 * 100).toFixed(0);

  return (
    <div style={{ paddingBottom: 80 }}>
      <div className="results-page">
        <div className="results-header">
          <div className="logo">✦ Inner Maps ✦</div>
          <h1>{userName ? `${userName}'s Profile` : 'Your Profile'}</h1>
          <p>Here&apos;s what makes you, <em>you</em>.</p>
        </div>

        {/* Share Card */}
        <div className="share-card" id="shareCard">
          <div className="share-card-title">✦ Inner Maps ✦</div>
          <div className="share-card-results">
            <div className="share-card-item">
              <div className="share-card-item-label">Personality</div>
              <div className="share-card-item-value">{r.cognitiveType}</div>
            </div>
            <div className="share-card-item">
              <div className="share-card-item-label">Enneagram</div>
              <div className="share-card-item-value">{r.enneagramDisplay}</div>
            </div>
            <div className="share-card-item">
              <div className="share-card-item-label">Attachment Style</div>
              <div className="share-card-item-value">{r.attachmentStyle}</div>
            </div>
            <div className="share-card-item">
              <div className="share-card-item-label">Connection Style</div>
              <div className="share-card-item-value" style={{ fontSize: r.topConnection.length > 12 ? 14 : 18 }}>
                {r.topConnection}
              </div>
            </div>
            <div className="share-card-item-wide">
              <div className="share-card-item-label">Star Sign</div>
              <div className="share-card-item-value">{r.starSign?.sign} {r.starSign?.symbol}</div>
            </div>
          </div>
          <div className="share-card-url">innermaps.io</div>
        </div>

        {/* Share Buttons */}
        <div className="share-buttons">
          <button className="share-btn" style={{ width: '100%', maxWidth: 280, fontSize: 15, padding: '14px 24px', textAlign: 'center', justifyContent: 'center' }} onClick={handleShare}>Share</button>
        </div>

        {/* Compatibility CTA */}
        <div
          onClick={() => isRealUser ? setInviteModalOpen(true) : openSignup('compatibility')}
          style={{ background: 'var(--card-bg)', borderRadius: 'var(--radius)', padding: 20, marginBottom: 28, boxShadow: 'var(--card-shadow)', display: 'flex', alignItems: 'center', gap: 14, cursor: 'pointer', transition: 'all 0.2s' }}
        >
          <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'linear-gradient(135deg,var(--peach-light),var(--peach))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>⟡</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: 'var(--font-playfair-family)', fontSize: 16, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 2 }}>Check Your Compatibility</div>
            <div style={{ fontSize: 13, color: 'var(--text-light)' }}>Invite a friend and see how your worlds align</div>
          </div>
          <div style={{ color: 'var(--peach)', fontSize: 18, flexShrink: 0 }}>→</div>
        </div>

        {/* Personality Type Card */}
        <div className="result-card" style={{ animationDelay: '0.1s' }}>
          <div className="result-card-header">
            <span className="result-card-category">🧠 PERSONALITY TYPE</span>
            <span className="result-card-lock" onClick={handleUpsell}>🔒 Full insights</span>
          </div>
          <div className="result-card-type">{r.cognitiveType}</div>
          <div className="result-card-name">{r.cognitiveTypeName}</div>
          <div className="result-card-desc">{r.cognitiveTypeDesc}</div>
        </div>

        {/* Enneagram Card */}
        <div className="result-card" style={{ animationDelay: '0.2s' }}>
          <div className="result-card-header">
            <span className="result-card-category">🔮 ENNEAGRAM</span>
            <span className="result-card-lock" onClick={handleUpsell}>🔒 Full insights</span>
          </div>
          <div className="result-card-type">{r.enneagramDisplay}</div>
          <div className="result-card-name">{r.enneagramName}</div>
          <div className="result-card-desc">{ENNEAGRAM_QS[r.enneagramType - 1]?.desc}</div>
          <div className="result-card-desc" style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid var(--peach-pale)', fontSize: 13, color: 'var(--text-light)' }}>
            Your {r.enneagramWing}-wing ({ENNEAGRAM_QS[r.enneagramWing - 1]?.name}) adds a secondary flavour, blending {ENNEAGRAM_QS[r.enneagramType - 1]?.name.replace('The ', '')} drive with {ENNEAGRAM_QS[r.enneagramWing - 1]?.name.replace('The ', '')} energy.
          </div>
        </div>

        {/* Attachment Style Card */}
        <div className="result-card" style={{ animationDelay: '0.3s' }}>
          <div className="result-card-header">
            <span className="result-card-category">💛 ATTACHMENT STYLE</span>
            <span className="result-card-lock" onClick={handleUpsell}>🔒 Full insights</span>
          </div>
          <div className="result-card-type">{r.attachmentStyle}</div>
          <div className="result-card-desc">{r.attachmentDesc}</div>
          <div style={{ textAlign: 'center', marginTop: 16, position: 'relative', width: 180, height: 180, marginLeft: 'auto', marginRight: 'auto' }}>
            <div style={{ position: 'absolute', width: '100%', height: '100%', border: '1px solid var(--peach-pale)', borderRadius: 8 }} />
            <div style={{ position: 'absolute', left: '50%', top: 0, bottom: 0, width: 1, background: 'var(--peach-pale)' }} />
            <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, height: 1, background: 'var(--peach-pale)' }} />
            <div className="attachment-dot" style={{ left: `${avoidancePct}%`, top: `${anxietyPct}%`, transform: 'translate(-50%,-50%)' }} />
            <div style={{ position: 'absolute', bottom: -18, left: '50%', transform: 'translateX(-50%)', fontSize: 10, color: 'var(--text-light)' }}>Avoidance →</div>
            <div style={{ position: 'absolute', left: -40, top: '50%', transform: 'translateY(-50%) rotate(-90deg)', fontSize: 10, color: 'var(--text-light)' }}>Anxiety →</div>
          </div>
        </div>

        {/* Connection Style Card */}
        <div className="result-card" style={{ animationDelay: '0.4s' }}>
          <div className="result-card-header">
            <span className="result-card-category">🤝 CONNECTION STYLE</span>
            <span className="result-card-lock" onClick={handleUpsell}>🔒 Full insights</span>
          </div>
          <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 16, fontStyle: 'italic' }}>How you prefer to receive love</div>
          <div style={{ marginBottom: 16 }}>
            <div className="result-card-name" style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', color: 'var(--peach)', marginBottom: 6 }}>Primary</div>
            <div className="result-card-name">{r.topConnection}</div>
            <div className="result-card-desc">{r.connectionDescs[r.connectionSorted[0]?.[0]]}</div>
          </div>
          {r.connectionSorted[1] && (
            <div style={{ paddingTop: 16, borderTop: '1px solid var(--peach-pale)' }}>
              <div className="result-card-name" style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', color: 'var(--peach)', marginBottom: 6 }}>Secondary</div>
              <div className="result-card-name">{r.connectionNames[r.connectionSorted[1][0]]}</div>
              <div className="result-card-desc">{r.connectionDescs[r.connectionSorted[1][0]]}</div>
            </div>
          )}
        </div>

        {/* Star Sign Card */}
        {r.starSign && (
          <div className="result-card" style={{ animationDelay: '0.5s' }}>
            <div className="result-card-header">
              <span className="result-card-category">✦ STAR SIGN</span>
            </div>
            <div className="result-card-type">{r.starSign.sign} {r.starSign.symbol}</div>
            <div className="result-card-desc">{r.starSign.desc}</div>
          </div>
        )}

        {/* Upsell Section */}
        <div className="upsell-section" id="upsell">
          <h2>Your Full Profile, <em>Unlocked</em></h2>
          <p className="upsell-subtitle">Go deeper than the surface</p>
          <div className="upsell-features">
            <div className="upsell-feature"><span className="upsell-check">✓</span> Deep dive into your {r.cognitiveType} personality. How you think, love and work.</div>
            <div className="upsell-feature"><span className="upsell-check">✓</span> Your {r.attachmentStyle} attachment: triggers, patterns & growth strategies</div>
            <div className="upsell-feature"><span className="upsell-check">✓</span> Enneagram {r.enneagramDisplay}: core fears, desires & your path to growth</div>
            <div className="upsell-feature"><span className="upsell-check">✓</span> How your 5 profiles interact, the full picture of who you are</div>
            <div className="upsell-feature"><span className="upsell-check">✓</span> Personalised tips you can actually use today</div>
          </div>
          <div className="upsell-price">$9.99</div>
          <div className="upsell-price-note">One-time purchase · PDF download + saved to your profile</div>
          <button className="upsell-cta" onClick={handleUpsell} disabled={checkoutLoading} style={{ opacity: checkoutLoading ? 0.6 : 1 }}>
            {checkoutLoading ? 'Loading checkout…' : 'Get My Full Report ✦'}
          </button>
        </div>

        <div className="disclaimer">
          This assessment is not affiliated with The Myers-Briggs Company or the MBTI® instrument.
          For entertainment and self-reflection purposes. Not a clinical assessment.
        </div>
      </div>
      <TabBar />

      {/* Signup modal — triggered by locked actions */}
      {signupOpen && (
        <div
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 200, display: 'flex', alignItems: 'flex-end' }}
          onClick={(e) => { if (e.target === e.currentTarget) setSignupOpen(false); }}
        >
          <div style={{ width: '100%', maxWidth: 440, margin: '0 auto', background: 'var(--bg)', borderRadius: '20px 20px 0 0', maxHeight: '90vh', overflowY: 'auto' }}>
            <SignupForm intent={signupIntent} onClose={() => setSignupOpen(false)} />
          </div>
        </div>
      )}
    </div>
  );
}
