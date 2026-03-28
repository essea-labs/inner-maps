'use client';

import { useState, useRef } from 'react';
import { useQuizStore } from '@/store/quiz-store';
import { calculateCompatibility } from '@/lib/compatibility';
import TabBar from '@/components/ui/TabBar';
import SignupForm from '@/components/quiz/SignupForm';
import useAuth from '@/hooks/useAuth';

export default function CompatibilityView() {
  const results = useQuizStore((s) => s.results);
  const activeConnection = useQuizStore((s) => s.activeConnection);
  const userName = useQuizStore((s) => s.userName);
  const setScreen = useQuizStore((s) => s.setScreen);
  const setActiveTab = useQuizStore((s) => s.setActiveTab);
  const purchasedCompatibility = useQuizStore((s) => s.purchasedCompatibility);
  const startCheckout = useQuizStore((s) => s.startCheckout);
  const showToast = useQuizStore((s) => s.showToast);
  const { user, loading: authLoading } = useAuth();
  const isRealUser = !authLoading && !!user && !user.is_anonymous;
  const [signupOpen, setSignupOpen] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  if (!results) {
    return (
      <div style={{ paddingBottom: 80 }}>
        <div className="connections-page">
          <div className="connections-page-header">
            <div className="logo">✦ Inner Maps ✦</div>
            <h1>Compatibility</h1>
          </div>
          <div className="connections-empty">
            <div className="connections-empty-icon">✦</div>
            <h3>Take the quiz first</h3>
            <p>Complete your Inner Maps profile to see compatibility with others.</p>
          </div>
        </div>
        <TabBar />
      </div>
    );
  }

  if (!activeConnection || !activeConnection.results) {
    return (
      <div style={{ paddingBottom: 80 }}>
        <div className="connections-page">
          <div className="connections-page-header">
            <div className="logo">✦ Inner Maps ✦</div>
            <h1>Compatibility</h1>
          </div>
          <div className="connections-empty">
            <div className="connections-empty-icon">⟡</div>
            <h3>Select a connection</h3>
            <p>Choose someone from your connections to see your compatibility.</p>
          </div>
        </div>
        <TabBar />
      </div>
    );
  }

  const conn = activeConnection;
  const compat = calculateCompatibility(results, conn.results!);
  const myName = userName || 'You';

  function handleBack() {
    setActiveTab('compat');
    setScreen('compatibility');
  }

  const compatCardRef = useRef<HTMLDivElement>(null);

  async function handleSaveImage() {
    if (!compatCardRef.current) return;
    try {
      const html2canvas = (await import('html2canvas')).default;
      const canvas = await html2canvas(compatCardRef.current, {
        scale: 2,
        backgroundColor: null,
        useCORS: true,
      });
      const url = canvas.toDataURL('image/png');
      const a = document.createElement('a');
      a.href = url;
      a.download = `inner-maps-compatibility.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      showToast('✓ Image saved!');
    } catch {
      showToast('Could not save image — try again.');
    }
  }

  async function handleUnlock() {
    const connectionId = conn.id;
    // Already purchased
    if (connectionId && purchasedCompatibility[connectionId]) {
      setScreen('compatibilityReport');
      return;
    }
    // Anonymous — sign up first
    if (!isRealUser) {
      setSignupOpen(true);
      return;
    }
    // Authenticated — go to Stripe
    setCheckoutLoading(true);
    await startCheckout('compatibility_report', connectionId);
    setCheckoutLoading(false);
  }

  const myAttachFontSize = results.attachmentStyle.length > 8 ? 13 : 16;
  const theirAttachFontSize = conn.results!.attachmentStyle.length > 8 ? 13 : 16;

  return (
    <div style={{ paddingBottom: 80 }}>
      <div className="compat-topnav">
        <button className="compat-topnav-back" onClick={handleBack}>←</button>
        <span className="compat-topnav-title">{myName} & {conn.name}</span>
      </div>

      <div className="compat-page">
        <div className="compat-header" style={{ paddingTop: 24 }}>
          <div className="logo">✦ Inner Maps ✦</div>
          <h1>{myName} & {conn.name}</h1>
          <p>Here&apos;s how your inner worlds align</p>
        </div>

        {/* Signup CTA — only for confirmed anonymous users (hide while auth loading) */}
        {!authLoading && !isRealUser && (
          <div
            onClick={() => setSignupOpen(true)}
            style={{
              background: 'linear-gradient(135deg, var(--peach), var(--peach-deep, #D4956A))',
              borderRadius: 'var(--radius)',
              padding: '16px 20px',
              marginBottom: 20,
              display: 'flex',
              alignItems: 'center',
              gap: 14,
              cursor: 'pointer',
            }}
          >
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: 'var(--font-playfair-family)', fontSize: 15, fontWeight: 600, color: 'white', marginBottom: 3 }}>
                Keep your results
              </div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.9)' }}>
                Create a free account to save your profile and invite others
              </div>
            </div>
            <div style={{ color: 'white', fontSize: 16, flexShrink: 0 }}>→</div>
          </div>
        )}

        {/* Shareable Card */}
        <div className="compat-share-card" ref={compatCardRef}>
          <div className="compat-share-card-brand">✦ Inner Maps ✦</div>
          <div className="compat-share-card-names">{myName} & {conn.name}</div>
          <div className="compat-share-card-score">{compat.overall}%</div>
          <div style={{ fontSize: 10, color: 'white', fontWeight: 600, letterSpacing: 2, marginTop: -6, marginBottom: 16, textAlign: 'center', opacity: 0.85 }}>OVERALL COMPATIBILITY</div>
          <div className="compat-share-card-grid">
            <div className="compat-share-card-item">
              <div className="compat-share-card-item-label">Personality</div>
              <div className="compat-share-card-item-values">
                <span>{results.cognitiveType}</span>
                <span className="vs">&amp;</span>
                <span>{conn.results!.cognitiveType}</span>
              </div>
            </div>
            <div className="compat-share-card-item">
              <div className="compat-share-card-item-label">Enneagram</div>
              <div className="compat-share-card-item-values">
                <span>{results.enneagramDisplay}</span>
                <span className="vs">&amp;</span>
                <span>{conn.results!.enneagramDisplay}</span>
              </div>
            </div>
            <div className="compat-share-card-item">
              <div className="compat-share-card-item-label">Attachment Style</div>
              <div className="compat-share-card-item-values" style={{ fontSize: Math.max(results.attachmentStyle.length, conn.results!.attachmentStyle.length) > 10 ? 11 : 14 }}>
                <span>{results.attachmentStyle}</span>
                <span className="vs">&amp;</span>
                <span>{conn.results!.attachmentStyle}</span>
              </div>
            </div>
            <div className="compat-share-card-item">
              <div className="compat-share-card-item-label">Connection Style</div>
              <div className="compat-share-card-item-values" style={{ fontSize: results.topConnection.length > 12 ? 11 : 14 }}>
                <span>{results.topConnection}</span>
                <span className="vs">&amp;</span>
                <span>{conn.results!.topConnection}</span>
              </div>
            </div>
            <div className="compat-share-card-item-wide">
              <div className="compat-share-card-item-label">Star Sign</div>
              <div className="compat-share-card-item-values">
                <span>{results.starSign?.sign} {results.starSign?.symbol}</span>
                <span className="vs">&amp;</span>
                <span>{conn.results!.starSign?.sign} {conn.results!.starSign?.symbol}</span>
              </div>
            </div>
          </div>
          <div className="compat-share-card-url">innermaps.io</div>
        </div>
        <button className="compat-share-cta" onClick={handleSaveImage} style={{ marginBottom: 24 }}>
          Save
        </button>

        {/* Star Sign */}
        <div className="compat-card" style={{ animationDelay: '0.1s' }}>
          <div className="compat-card-header">
            <div className="compat-card-header-left">
              <span className="compat-card-icon">✦</span>
              <span className="compat-card-category">Star Sign</span>
            </div>
            <span className="result-card-lock" onClick={handleUnlock}>🔒 Full insights</span>
          </div>
          <div className="compat-vs">
            <div className="compat-vs-item">
              <div className="compat-vs-name">{myName}</div>
              <div className="compat-vs-value">{results.starSign?.sign} {results.starSign?.symbol}</div>
            </div>
            <div className="compat-vs-ampersand">&amp;</div>
            <div className="compat-vs-item">
              <div className="compat-vs-name">{conn.name}</div>
              <div className="compat-vs-value">{conn.results!.starSign?.sign} {conn.results!.starSign?.symbol}</div>
            </div>
          </div>
          <div className="compat-insight">{compat.zodiac.insight}</div>
          <div className="compat-detail">💡 {compat.zodiac.detail}</div>
          {!(conn.id && purchasedCompatibility[conn.id]) && (
            <div onClick={handleUnlock} style={{ cursor: 'pointer', marginTop: 12, paddingTop: 12, borderTop: '1px solid var(--peach-pale)', position: 'relative', overflow: 'hidden' }}>
              <p style={{ fontSize: 13, color: 'var(--text-light)', margin: 0, WebkitMaskImage: 'linear-gradient(to bottom, black 30%, transparent)', maskImage: 'linear-gradient(to bottom, black 30%, transparent)' }}>
                {compat.zodiac.detail}
              </p>
              <div style={{ fontSize: 12, color: 'var(--peach)', fontWeight: 600, marginTop: 4 }}>Unlock full insight &rarr;</div>
            </div>
          )}
        </div>

        {/* Personality */}
        <div className="compat-card" style={{ animationDelay: '0.2s' }}>
          <div className="compat-card-header">
            <div className="compat-card-header-left">
              <span className="compat-card-icon">🧠</span>
              <span className="compat-card-category">Personality Type</span>
            </div>
            <span className="result-card-lock" onClick={handleUnlock}>🔒 Full insights</span>
          </div>
          <div className="compat-vs">
            <div className="compat-vs-item">
              <div className="compat-vs-name">{myName}</div>
              <div className="compat-vs-value">{results.cognitiveType}</div>
            </div>
            <div className="compat-vs-ampersand">&amp;</div>
            <div className="compat-vs-item">
              <div className="compat-vs-name">{conn.name}</div>
              <div className="compat-vs-value">{conn.results!.cognitiveType}</div>
            </div>
          </div>
          <div className="compat-insight">{compat.personality.insight}</div>
          <div className="compat-detail">💡 {compat.personality.detail}</div>
          {!(conn.id && purchasedCompatibility[conn.id]) && (
            <div onClick={handleUnlock} style={{ cursor: 'pointer', marginTop: 12, paddingTop: 12, borderTop: '1px solid var(--peach-pale)', position: 'relative', overflow: 'hidden' }}>
              <p style={{ fontSize: 13, color: 'var(--text-light)', margin: 0, WebkitMaskImage: 'linear-gradient(to bottom, black 30%, transparent)', maskImage: 'linear-gradient(to bottom, black 30%, transparent)' }}>
                {compat.personality.detail}
              </p>
              <div style={{ fontSize: 12, color: 'var(--peach)', fontWeight: 600, marginTop: 4 }}>Unlock full insight &rarr;</div>
            </div>
          )}
        </div>

        {/* Enneagram */}
        <div className="compat-card" style={{ animationDelay: '0.3s' }}>
          <div className="compat-card-header">
            <div className="compat-card-header-left">
              <span className="compat-card-icon">🔮</span>
              <span className="compat-card-category">Enneagram</span>
            </div>
            <span className="result-card-lock" onClick={handleUnlock}>🔒 Full insights</span>
          </div>
          <div className="compat-vs">
            <div className="compat-vs-item">
              <div className="compat-vs-name">{myName}</div>
              <div className="compat-vs-value">{results.enneagramDisplay}</div>
            </div>
            <div className="compat-vs-ampersand">&amp;</div>
            <div className="compat-vs-item">
              <div className="compat-vs-name">{conn.name}</div>
              <div className="compat-vs-value">{conn.results!.enneagramDisplay}</div>
            </div>
          </div>
          <div className="compat-insight">{compat.enneagram.insight}</div>
          <div className="compat-detail">💡 {compat.enneagram.detail}</div>
          {!(conn.id && purchasedCompatibility[conn.id]) && (
            <div onClick={handleUnlock} style={{ cursor: 'pointer', marginTop: 12, paddingTop: 12, borderTop: '1px solid var(--peach-pale)', position: 'relative', overflow: 'hidden' }}>
              <p style={{ fontSize: 13, color: 'var(--text-light)', margin: 0, WebkitMaskImage: 'linear-gradient(to bottom, black 30%, transparent)', maskImage: 'linear-gradient(to bottom, black 30%, transparent)' }}>
                {compat.enneagram.detail}
              </p>
              <div style={{ fontSize: 12, color: 'var(--peach)', fontWeight: 600, marginTop: 4 }}>Unlock full insight &rarr;</div>
            </div>
          )}
        </div>

        {/* Attachment */}
        <div className="compat-card" style={{ animationDelay: '0.4s' }}>
          <div className="compat-card-header">
            <div className="compat-card-header-left">
              <span className="compat-card-icon">💛</span>
              <span className="compat-card-category">Attachment Style</span>
            </div>
            <span className="result-card-lock" onClick={handleUnlock}>🔒 Full insights</span>
          </div>
          <div className="compat-vs">
            <div className="compat-vs-item">
              <div className="compat-vs-name">{myName}</div>
              <div className="compat-vs-value" style={{ fontSize: myAttachFontSize }}>{results.attachmentStyle}</div>
            </div>
            <div className="compat-vs-ampersand">&amp;</div>
            <div className="compat-vs-item">
              <div className="compat-vs-name">{conn.name}</div>
              <div className="compat-vs-value" style={{ fontSize: theirAttachFontSize }}>{conn.results!.attachmentStyle}</div>
            </div>
          </div>
          <div className="compat-insight">{compat.attachment.insight}</div>
          <div className="compat-detail">💡 {compat.attachment.detail}</div>
          {!(conn.id && purchasedCompatibility[conn.id]) && (
            <div onClick={handleUnlock} style={{ cursor: 'pointer', marginTop: 12, paddingTop: 12, borderTop: '1px solid var(--peach-pale)', position: 'relative', overflow: 'hidden' }}>
              <p style={{ fontSize: 13, color: 'var(--text-light)', margin: 0, WebkitMaskImage: 'linear-gradient(to bottom, black 30%, transparent)', maskImage: 'linear-gradient(to bottom, black 30%, transparent)' }}>
                {compat.attachment.detail}
              </p>
              <div style={{ fontSize: 12, color: 'var(--peach)', fontWeight: 600, marginTop: 4 }}>Unlock full insight &rarr;</div>
            </div>
          )}
        </div>

        {/* Connection */}
        <div className="compat-card" style={{ animationDelay: '0.5s' }}>
          <div className="compat-card-header">
            <div className="compat-card-header-left">
              <span className="compat-card-icon">🤝</span>
              <span className="compat-card-category">Connection Style</span>
            </div>
            <span className="result-card-lock" onClick={handleUnlock}>🔒 Full insights</span>
          </div>
          <div className="compat-vs">
            <div className="compat-vs-item">
              <div className="compat-vs-name">{myName}</div>
              <div className="compat-vs-value" style={{ fontSize: results.topConnection.length > 12 ? 12 : 16 }}>{results.topConnection}</div>
            </div>
            <div className="compat-vs-ampersand">&amp;</div>
            <div className="compat-vs-item">
              <div className="compat-vs-name">{conn.name}</div>
              <div className="compat-vs-value" style={{ fontSize: conn.results!.topConnection.length > 12 ? 12 : 16 }}>{conn.results!.topConnection}</div>
            </div>
          </div>
          <div className="compat-insight">{compat.connection.insight}</div>
          <div className="compat-detail">💡 {compat.connection.detail}</div>
          {!(conn.id && purchasedCompatibility[conn.id]) && (
            <div onClick={handleUnlock} style={{ cursor: 'pointer', marginTop: 12, paddingTop: 12, borderTop: '1px solid var(--peach-pale)', position: 'relative', overflow: 'hidden' }}>
              <p style={{ fontSize: 13, color: 'var(--text-light)', margin: 0, WebkitMaskImage: 'linear-gradient(to bottom, black 30%, transparent)', maskImage: 'linear-gradient(to bottom, black 30%, transparent)' }}>
                {compat.connection.detail}
              </p>
              <div style={{ fontSize: 12, color: 'var(--peach)', fontWeight: 600, marginTop: 4 }}>Unlock full insight &rarr;</div>
            </div>
          )}
        </div>

        {/* Upsell */}
        <div className="upsell-section" style={{ marginTop: 24 }}>
          {conn.id && purchasedCompatibility[conn.id] ? (
            <>
              <h2>Your Full Report is <em>Unlocked</em></h2>
              <p className="upsell-subtitle">View the full picture of how you and {conn.name} connect</p>
              <button className="upsell-cta" onClick={() => setScreen('compatibilityReport')}>
                View Compatibility Report &rarr;
              </button>
            </>
          ) : (
            <>
              <h2>Go Deeper Together</h2>
              <p className="upsell-subtitle">Unlock the full picture of how you and {conn.name} connect</p>
              <div className="upsell-features">
                <div className="upsell-feature"><span className="upsell-check">✓</span> Detailed breakdown of your dynamic across all 5 dimensions</div>
                <div className="upsell-feature"><span className="upsell-check">✓</span> Your biggest strengths as a pair — and where to watch out</div>
                <div className="upsell-feature"><span className="upsell-check">✓</span> Personalised tips to deepen your connection</div>
                <div className="upsell-feature"><span className="upsell-check">✓</span> Communication guide based on both your styles</div>
              </div>
              <div className="upsell-price">$4.99</div>
              <div className="upsell-price-note">One-time purchase</div>
              <button className="upsell-cta" onClick={handleUnlock} disabled={checkoutLoading} style={{ opacity: checkoutLoading ? 0.6 : 1 }}>
                {checkoutLoading ? 'Loading checkout…' : 'Unlock Full Compatibility Report ✦'}
              </button>
            </>
          )}
        </div>
      </div>
      <TabBar />

      {signupOpen && (
        <div
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 200, display: 'flex', alignItems: 'flex-end' }}
          onClick={(e) => { if (e.target === e.currentTarget) setSignupOpen(false); }}
        >
          <div style={{ width: '100%', maxWidth: 440, margin: '0 auto', background: 'var(--bg)', borderRadius: '20px 20px 0 0', maxHeight: '90vh', overflowY: 'auto' }}>
            <SignupForm intent="purchase_compatibility" onClose={() => setSignupOpen(false)} />
          </div>
        </div>
      )}
    </div>
  );
}
