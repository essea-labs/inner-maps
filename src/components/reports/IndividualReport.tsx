'use client';

import { useState, useEffect, useRef } from 'react';
import { useQuizStore } from '@/store/quiz-store';
import {
  TYPE_DEEP_DIVE, ENNEAGRAM_DEEP_DIVE, ATTACHMENT_DEEP_DIVE,
  CONNECTION_DEEP_DIVE, STARSIGN_DEEP_DIVE, generateIntersectionInsights,
} from '@/lib/deep-dive-data';
import { ZODIAC_ELEMENTS } from '@/lib/compatibility';
import SignupForm from '@/components/quiz/SignupForm';
import useAuth from '@/hooks/useAuth';

export default function IndividualReport() {
  const results = useQuizStore((s) => s.results);
  const userName = useQuizStore((s) => s.userName);
  const setScreen = useQuizStore((s) => s.setScreen);
  const setActiveTab = useQuizStore((s) => s.setActiveTab);
  const purchasedIndividual = useQuizStore((s) => s.purchasedIndividual);
  const receiptUrl = useQuizStore((s) => s.receiptUrl);
  const { user } = useAuth();
  const [signupOpen, setSignupOpen] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);
  const reportRef = useRef<HTMLDivElement>(null);
  const isRealUser = !!user && !user.is_anonymous;

  // Purchase gate — redirect back to results if not purchased (useEffect avoids render-time setState)
  useEffect(() => {
    if (results && !purchasedIndividual) {
      setScreen('results');
    }
  }, [results, purchasedIndividual, setScreen]);

  if (!results || !purchasedIndividual) return null;

  const r = results;
  const dd = TYPE_DEEP_DIVE[r.cognitiveType];
  const edd = ENNEAGRAM_DEEP_DIVE[r.enneagramType];
  const add = ATTACHMENT_DEEP_DIVE[r.attachmentStyle];
  const cdd = CONNECTION_DEEP_DIVE[r.connectionSorted[0][0]];
  const sdd = r.starSign ? STARSIGN_DEEP_DIVE[r.starSign.sign] : null;
  const intersections = generateIntersectionInsights(r);
  const element = r.starSign ? ZODIAC_ELEMENTS[r.starSign.sign] : '';

  const elementTip =
    element === 'fire' ? "start something bold you've been putting off" :
    element === 'earth' ? 'slow down and enjoy something sensory — a meal, a walk, a bath' :
    element === 'air' ? 'have a conversation that stretches your thinking' :
    'spend time near water and let your intuition speak';

  return (
    <>
      <div className="report-topnav">
        <button className="report-topnav-back" onClick={() => setScreen('results')}>←</button>
        <span className="report-topnav-title">Full Report</span>
        <button
          onClick={async () => {
            if (!reportRef.current || pdfLoading) return;
            setPdfLoading(true);
            try {
              const { generateReportPDF } = await import('@/lib/generate-pdf');
              const name = (userName || 'your').toLowerCase().replace(/\s+/g, '-');
              await generateReportPDF(reportRef.current, `${name}-inner-maps-report.pdf`);
            } catch (err) {
              console.error('PDF generation failed:', err);
            } finally {
              setPdfLoading(false);
            }
          }}
          disabled={pdfLoading}
          style={{
            background: 'var(--peach)',
            color: 'white',
            border: 'none',
            borderRadius: 20,
            padding: '6px 14px',
            fontSize: 12,
            fontWeight: 600,
            cursor: pdfLoading ? 'wait' : 'pointer',
            opacity: pdfLoading ? 0.6 : 1,
            fontFamily: 'var(--font-dm-sans-family)',
          }}
        >
          {pdfLoading ? 'Generating…' : 'Download PDF ↓'}
        </button>
      </div>
      <div className="report-page" ref={reportRef}>

        <div className="report-header">
          <span className="report-badge">✦ Full Report</span>
          <h1>{userName ? `${userName}'s` : 'Your'} Inner Maps</h1>
          <p>Your complete 5-dimension profile</p>
        </div>

        {/* Save to Profile CTA — only for anonymous users */}
        {!isRealUser && (
          <div
            onClick={() => setSignupOpen(true)}
            style={{
              background: 'linear-gradient(135deg, var(--peach-pale), var(--card-bg))',
              borderRadius: 'var(--radius)',
              padding: '16px 20px',
              marginBottom: 24,
              display: 'flex',
              alignItems: 'center',
              gap: 14,
              cursor: 'pointer',
              border: '1px solid var(--peach-pale)',
            }}
          >
            <div style={{ fontSize: 24, flexShrink: 0 }}>✦</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: 'var(--font-playfair-family)', fontSize: 15, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 2 }}>
                Save your report forever
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                Create a free account to keep it — and discover compatibility with friends
              </div>
            </div>
            <div style={{ color: 'var(--peach)', fontSize: 16 }}>→</div>
          </div>
        )}

        {/* Summary Card */}
        <div className="share-card" style={{ marginBottom: 24 }}>
          <div className="share-card-title">✦ Your Complete Profile ✦</div>
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
              <div className="share-card-item-label">Attachment</div>
              <div className="share-card-item-value">{r.attachmentStyle}</div>
            </div>
            <div className="share-card-item">
              <div className="share-card-item-label">Connection</div>
              <div className="share-card-item-value" style={{ fontSize: r.topConnection.length > 12 ? 14 : 18 }}>{r.topConnection}</div>
            </div>
            <div className="share-card-item-wide">
              <div className="share-card-item-label">Star Sign</div>
              <div className="share-card-item-value">{r.starSign?.sign} {r.starSign?.symbol}</div>
            </div>
          </div>
        </div>

        {/* 1. Personality Deep Dive */}
        {dd && (
          <div className="report-card">
            <div className="report-card-header">
              <span className="report-card-icon">🧠</span>
              <span className="report-card-category">Personality Type — Deep Dive</span>
            </div>
            <div className="report-highlight">
              <div className="report-highlight-label">Your Type</div>
              <div className="report-highlight-text">{r.cognitiveType} — {r.cognitiveTypeName}</div>
            </div>
            <div className="report-section-title">How You Think</div>
            <p className="report-text">{dd.think}</p>
            <div className="report-section-title">How You Love</div>
            <p className="report-text">{dd.love}</p>
            <div className="report-section-title">How You Work</div>
            <p className="report-text">{dd.work}</p>
            <div className="report-highlight" style={{ borderLeftColor: '#66BB6A' }}>
              <div className="report-highlight-label" style={{ color: '#2E7D32' }}>Your Superpower</div>
              <p className="report-text" style={{ margin: 0 }}>{dd.superpower}</p>
            </div>
            <div className="report-highlight" style={{ borderLeftColor: 'var(--peach)' }}>
              <div className="report-highlight-label">Your Blind Spot</div>
              <p className="report-text" style={{ margin: 0 }}>{dd.blindspot}</p>
            </div>
          </div>
        )}

        {/* 2. Enneagram Deep Dive */}
        {edd && (
          <div className="report-card">
            <div className="report-card-header">
              <span className="report-card-icon">🔮</span>
              <span className="report-card-category">Enneagram — Deep Dive</span>
            </div>
            <div className="report-highlight">
              <div className="report-highlight-label">Your Type</div>
              <div className="report-highlight-text">{r.enneagramDisplay} — {r.enneagramName}</div>
            </div>
            <div className="report-section-title">Core Fear</div>
            <p className="report-text">{edd.fear}</p>
            <div className="report-section-title">Core Desire</div>
            <p className="report-text">{edd.desire}</p>
            <div className="report-section-title">Under Stress</div>
            <p className="report-text">{edd.stress}</p>
            <div className="report-section-title">At Your Best</div>
            <p className="report-text">{edd.best}</p>
            <div className="report-section-title">Growth Strategies</div>
            <ul className="report-list">
              {edd.strategies.map((s: string, i: number) => <li key={i}>{s}</li>)}
            </ul>
          </div>
        )}

        {/* 3. Attachment Deep Dive */}
        {add && (
          <div className="report-card">
            <div className="report-card-header">
              <span className="report-card-icon">💛</span>
              <span className="report-card-category">Attachment Style — Deep Dive</span>
            </div>
            <div className="report-highlight">
              <div className="report-highlight-label">Your Style</div>
              <div className="report-highlight-text">{r.attachmentStyle}</div>
            </div>
            <div className="report-section-title">Your Triggers</div>
            <ul className="report-list">
              {add.triggers.map((t: string, i: number) => <li key={i}>{t}</li>)}
            </ul>
            <div className="report-section-title">Your Patterns</div>
            <ul className="report-list">
              {add.patterns.map((p: string, i: number) => <li key={i}>{p}</li>)}
            </ul>
            <div className="report-section-title">In Conflict</div>
            <p className="report-text">{add.conflict}</p>
            <div className="report-section-title">Growth Strategies</div>
            <ul className="report-list">
              {add.strategies.map((s: string, i: number) => <li key={i}>{s}</li>)}
            </ul>
          </div>
        )}

        {/* 4. Connection Style Deep Dive */}
        {cdd && (
          <div className="report-card">
            <div className="report-card-header">
              <span className="report-card-icon">🤝</span>
              <span className="report-card-category">Connection Style — Deep Dive</span>
            </div>
            <div className="report-highlight">
              <div className="report-highlight-label">Primary</div>
              <div className="report-highlight-text">{r.topConnection}</div>
            </div>
            <div className="report-section-title">What This Means Day-to-Day</div>
            <p className="report-text">{cdd.dayToDay}</p>
            <div className="report-section-title">How to Ask For It</div>
            <p className="report-text">{cdd.askForIt}</p>
            <div className="report-section-title">When This Need Isn&apos;t Met</div>
            <p className="report-text">{cdd.unmet}</p>
            <div style={{ marginTop: 20, paddingTop: 16, borderTop: '1px solid var(--peach-pale)' }}>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', color: 'var(--peach)', marginBottom: 12 }}>Your Full Ranking</div>
              {r.connectionSorted.map(([key, score], i) => (
                <div key={key} className="report-score-bar">
                  <span style={{ fontSize: 13, color: 'var(--text-secondary)', width: 130, flexShrink: 0 }}>
                    {i === 0 ? '★ ' : ''}{r.connectionNames[key]}
                  </span>
                  <div className="report-score-bar-track">
                    <div className="report-score-bar-fill" style={{ width: `${(score / 4 * 100).toFixed(0)}%` }} />
                  </div>
                  <span className="report-score-label">{score}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 5. Star Sign Deep Dive */}
        {sdd && r.starSign && (
          <div className="report-card">
            <div className="report-card-header">
              <span className="report-card-icon">✦</span>
              <span className="report-card-category">Star Sign — Deep Dive</span>
            </div>
            <div className="report-highlight">
              <div className="report-highlight-label">Your Sign</div>
              <div className="report-highlight-text">{r.starSign.sign} {r.starSign.symbol}</div>
            </div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', margin: '12px 0' }}>
              <span style={{ background: 'var(--peach-pale)', color: 'var(--peach-deep)', padding: '6px 14px', borderRadius: 20, fontSize: 12, fontWeight: 600 }}>{sdd.element}</span>
              <span style={{ background: 'var(--peach-pale)', color: 'var(--peach-deep)', padding: '6px 14px', borderRadius: 20, fontSize: 12, fontWeight: 600 }}>{sdd.modality}</span>
            </div>
            <div className="report-section-title">Your Season</div>
            <p className="report-text">{sdd.season}</p>
            <div className="report-section-title">Ruling Planet</div>
            <p className="report-text">{sdd.planet}</p>
            <div className="report-section-title">Your Strengths</div>
            <p className="report-text">{sdd.strengths}</p>
            <div className="report-section-title">Your Growth Edges</div>
            <p className="report-text">{sdd.challenges}</p>
            <div className="report-section-title">How This Shows Up in Your Life</div>
            <p className="report-text">{sdd.practicalInsight}</p>
          </div>
        )}

        {/* 6. Intersection */}
        <div className="report-intersection">
          <h3>How Your 5 Dimensions Interact</h3>
          {intersections.map((ins: string, i: number) => <p key={i}>{ins}</p>)}
        </div>

        {/* 7. Tips */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ textAlign: 'center', marginBottom: 16 }}>
            <div className="report-badge">Personalised for you</div>
            <h2 style={{ fontFamily: 'var(--font-playfair-family)', fontSize: 22, fontWeight: 700 }}>5 Things to Try This Week</h2>
          </div>
          <div className="report-tip-card">
            <div className="report-tip-number">1</div>
            <div className="report-tip-text">
              As a {r.cognitiveType}, {r.cognitiveType[0] === 'I'
                ? 'protect your alone time this week — block 30 minutes of uninterrupted solitude and notice how it recharges you'
                : "reach out to someone you haven't spoken to in a while — your social energy is a gift, use it intentionally"}.
            </div>
          </div>
          {edd && (
            <div className="report-tip-card">
              <div className="report-tip-number">2</div>
              <div className="report-tip-text">{edd.strategies[0]}</div>
            </div>
          )}
          {add && (
            <div className="report-tip-card">
              <div className="report-tip-number">3</div>
              <div className="report-tip-text">{add.strategies[0]}</div>
            </div>
          )}
          <div className="report-tip-card">
            <div className="report-tip-number">4</div>
            <div className="report-tip-text">
              Your connection style is {r.topConnection} — this week, tell someone close to you exactly how they can make you feel loved. Most people want to show up for you; they just need the roadmap.
            </div>
          </div>
          {r.starSign && (
            <div className="report-tip-card">
              <div className="report-tip-number">5</div>
              <div className="report-tip-text">
                Lean into your {r.starSign.sign} {element} energy: {elementTip}.
              </div>
            </div>
          )}
        </div>

        {/* Cross-sell */}
        <div style={{ textAlign: 'center', padding: '24px 0' }}>
          <p style={{ fontSize: 13, color: 'var(--text-light)', marginBottom: 12 }}>Want to see how you connect with someone?</p>
          <button
            className="cta-button"
            onClick={() => {
              if (isRealUser) { setActiveTab('compat'); setScreen('connections'); }
              else setSignupOpen(true);
            }}
            style={{ animation: 'none', fontSize: 14, padding: '14px 32px' }}
          >
            Check Your Compatibility →
          </button>
        </div>

        {receiptUrl && (
          <div style={{ textAlign: 'center', marginBottom: 16 }}>
            <a
              href={receiptUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{ fontSize: 12, color: 'var(--text-light)', textDecoration: 'underline' }}
            >
              View purchase receipt →
            </a>
          </div>
        )}

        <div className="disclaimer">
          This assessment is not affiliated with The Myers-Briggs Company or the MBTI® instrument.
          For entertainment and self-reflection purposes. Not a clinical assessment.
        </div>
      </div>

      {signupOpen && (
        <div
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 200, display: 'flex', alignItems: 'flex-end' }}
          onClick={(e) => { if (e.target === e.currentTarget) setSignupOpen(false); }}
        >
          <div style={{ width: '100%', maxWidth: 440, margin: '0 auto', background: 'var(--bg)', borderRadius: '20px 20px 0 0', maxHeight: '90vh', overflowY: 'auto' }}>
            <SignupForm intent="compatibility" onClose={() => setSignupOpen(false)} />
          </div>
        </div>
      )}
    </>
  );
}
