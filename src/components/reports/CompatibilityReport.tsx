'use client';

import { useEffect, useState, useRef } from 'react';
import { useQuizStore } from '@/store/quiz-store';
import { calculateCompatibility, ZODIAC_ELEMENTS } from '@/lib/compatibility';
import { TYPE_DEEP_DIVE, ATTACHMENT_DEEP_DIVE, CONNECTION_DEEP_DIVE, COMPAT_DEEP, generatePairStrengths, generatePairChallenges } from '@/lib/deep-dive-data';
import { ENNEAGRAM_QS } from '@/lib/quiz-data';

export default function CompatibilityReport() {
  const results = useQuizStore((s) => s.results);
  const activeConnection = useQuizStore((s) => s.activeConnection);
  const userName = useQuizStore((s) => s.userName);
  const setScreen = useQuizStore((s) => s.setScreen);
  const purchasedCompatibility = useQuizStore((s) => s.purchasedCompatibility);

  const connectionId = activeConnection?.id;
  const isPurchased = !!(connectionId && purchasedCompatibility[connectionId]);

  // Purchase gate — redirect back to compat view if not purchased (useEffect avoids render-time setState)
  useEffect(() => {
    if (results && activeConnection?.results && !isPurchased) {
      setScreen('compatibility');
    }
  }, [results, activeConnection, isPurchased, setScreen]);

  if (!results || !activeConnection?.results || !isPurchased) return null;

  const r = results;
  const tr = activeConnection.results!;
  const conn = activeConnection;
  const myName = userName || 'You';

  const compat = calculateCompatibility(r, tr);
  const strengths = generatePairStrengths(compat);
  const challenges = generatePairChallenges(compat);
  const e1 = r.starSign ? ZODIAC_ELEMENTS[r.starSign.sign] : '';
  const e2 = tr.starSign ? ZODIAC_ELEMENTS[tr.starSign.sign] : '';

  function enneagramBrings(type: number, name: string): string {
    const brings = type <= 3
      ? 'brings drive, structure, and a desire to make things better'
      : type <= 6
      ? 'brings depth, insight, and a unique way of seeing the world'
      : 'brings energy, strength, and a gift for keeping things moving';
    return `As ${ENNEAGRAM_QS[type - 1]?.name}, ${name} ${brings}.`;
  }

  function commsStyle(cogType: string, name: string): string {
    return cogType[0] === 'I'
      ? `Give ${name} space to process before expecting a response. They think deeply — silence doesn't mean disengagement.`
      : `Let ${name} think out loud. They process by talking, and interrupting can feel like dismissal.`;
  }

  // Enneagram core needs for personalised tips
  const enneagramNeeds: Record<number, string> = {
    1: 'to feel that things are being done right',
    2: 'to feel appreciated for what they give',
    3: 'to feel valued for who they are, not just what they achieve',
    4: 'to feel seen for their uniqueness',
    5: 'to feel competent and not overwhelmed',
    6: 'to feel safe and supported',
    7: 'to feel free and not boxed in',
    8: 'to feel respected and not controlled',
    9: 'to feel that their voice matters',
  };

  // Connection style → feeling word for tip 4
  const connectionFeeling: Record<string, string> = {
    'Words of Affirmation': 'appreciated',
    'Acts of Service': 'supported',
    'Gifts': 'thought of',
    'Quality Time': 'valued',
    'Physical Touch': 'close to you',
  };

  const conflictTip = r.attachmentStyle === 'Avoidant' || tr.attachmentStyle === 'Avoidant'
    ? "One of you needs space during tension. Agree on a \"pause and return\" rule — take 20 minutes, then come back. The conversation isn't over; it's just breathing."
    : r.attachmentStyle === 'Anxious' || tr.attachmentStyle === 'Anxious'
    ? "One of you needs resolution quickly. Agree on a reassurance signal — \"I'm not going anywhere, I just need a moment\" — before taking any space."
    : 'You both handle conflict relatively well. Focus on staying curious rather than defensive — ask "help me understand" instead of "why did you."';

  const personalityTip = r.cognitiveType[0] !== tr.cognitiveType[0]
    ? "One of you recharges alone, the other through people. Respecting this difference — without taking it personally — transforms your dynamic."
    : r.cognitiveType[2] !== tr.cognitiveType[2]
    ? "One of you leads with logic, the other with feeling. Neither is wrong — learn to translate between head and heart."
    : 'You share core traits, which means easy communication but also shared blind spots. Push each other into unfamiliar territory.';

  const myConnKey = r.connectionSorted[0]?.[0] || 'quality';
  const theirConnKey = Object.keys(tr.connectionNames).find((k) => tr.connectionNames[k] === tr.topConnection) || 'quality';

  const [pdfLoading, setPdfLoading] = useState(false);
  const reportRef = useRef<HTMLDivElement>(null);

  return (
    <>
      <div className="report-topnav">
        <button className="report-topnav-back" onClick={() => setScreen('compatibility')}>←</button>
        <span className="report-topnav-title">{myName} & {conn.name}</span>
        <div style={{ width: 32 }} />
      </div>
      <div className="report-page" ref={reportRef}>

        <div className="report-header">
          <span className="report-badge">✦ Full Compatibility Report</span>
          <h1>{myName} & {conn.name}</h1>
          <p>Your complete compatibility across 5 dimensions</p>
        </div>

        {/* Download PDF button — matches individual report style */}
        <button
          onClick={async () => {
            if (!reportRef.current || pdfLoading) return;
            setPdfLoading(true);
            try {
              const { generateCompatPDF } = await import('@/lib/generate-pdf');
              const n = `${(myName).toLowerCase()}-${(conn.name || 'friend').toLowerCase()}`.replace(/\s+/g, '-');
              await generateCompatPDF(n + '-compatibility-report.pdf', r, tr, myName, conn.name, compat, strengths, challenges);
            } catch (err) {
              console.error('PDF generation failed:', err);
            } finally {
              setPdfLoading(false);
            }
          }}
          disabled={pdfLoading}
          style={{
            width: '100%',
            padding: '14px 24px',
            background: 'var(--card-bg)',
            border: '1.5px solid var(--peach)',
            borderRadius: 'var(--radius)',
            color: 'var(--peach)',
            fontSize: 14,
            fontWeight: 600,
            cursor: pdfLoading ? 'wait' : 'pointer',
            opacity: pdfLoading ? 0.6 : 1,
            fontFamily: 'var(--font-dm-sans-family)',
            marginBottom: 16,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
          }}
        >
          {pdfLoading ? 'Generating PDF…' : '↓ Download Report as PDF'}
        </button>

        {/* Duo Score */}
        <div className="compat-duo-card" style={{ marginBottom: 24 }}>
          <div className="compat-duo-names">
            <div className="compat-duo-person">
              <div className="compat-duo-avatar">{(myName)[0]}</div>
              <div className="compat-duo-name">{myName}</div>
            </div>
            <div className="compat-duo-ampersand">&amp;</div>
            <div className="compat-duo-person">
              <div className="compat-duo-avatar">{conn.name[0]}</div>
              <div className="compat-duo-name">{conn.name}</div>
            </div>
          </div>
          <div className="compat-duo-score">{compat.overall}%</div>
          <div className="compat-duo-label">Overall Compatibility</div>
          <p style={{ fontSize: 12, color: 'var(--text-light)', textAlign: 'center', marginTop: 8, fontStyle: 'italic', lineHeight: 1.5, padding: '0 12px' }}>
            Compatibility isn&apos;t about being the same — it&apos;s about understanding where you click and where you grow.
          </p>
        </div>

        {/* Strengths */}
        <div className="report-pair-strengths">
          <h3>💚 Your Biggest Strengths</h3>
          <p className="report-text" style={{ color: '#2E7D32' }}>
            Your strongest dimensions are <strong>{strengths[0]}</strong> and <strong>{strengths[1]}</strong>. These are the areas where you naturally click — lean into them. They&apos;re the foundation your connection is built on.
          </p>
        </div>

        {/* Challenges */}
        <div className="report-pair-challenges">
          <h3>⚡ Where to Be Intentional</h3>
          <p className="report-text" style={{ color: 'var(--warm-brown)' }}>
            Your growth edges are <strong>{challenges[0]}</strong> and <strong>{challenges[1]}</strong>. These aren&apos;t weaknesses — they&apos;re invitations. The dimensions where you differ most are where you have the most to teach each other.
          </p>
        </div>

        {/* Star Sign Deep */}
        <div className="report-card">
          <div className="report-card-header">
            <span className="report-card-icon">✦</span>
            <span className="report-card-category">Star Sign Compatibility</span>
          </div>
          <div className="compat-vs" style={{ marginBottom: 14 }}>
            <div className="compat-vs-item">
              <div className="compat-vs-name">{myName}</div>
              <div className="compat-vs-value">{r.starSign?.sign} {r.starSign?.symbol}</div>
            </div>
            <div className="compat-vs-ampersand">&amp;</div>
            <div className="compat-vs-item">
              <div className="compat-vs-name">{conn.name}</div>
              <div className="compat-vs-value">{tr.starSign?.sign} {tr.starSign?.symbol}</div>
            </div>
          </div>
          <div className="report-score-bar">
            <span style={{ fontSize: 12, color: 'var(--text-light)' }}>Your dynamic</span>
            <div className="report-score-bar-track"><div className="report-score-bar-fill" style={{ width: `${compat.zodiac.score}%` }} /></div>
            <span className="report-score-label">{compat.zodiac.score}%</span>
          </div>
          <p className="report-text" style={{ fontStyle: 'italic' }}>{compat.zodiac.insight}</p>
          <div className="report-highlight" style={{ borderLeftColor: '#66BB6A' }}>
            <div className="report-highlight-label" style={{ color: '#2E7D32' }}>Strength</div>
            <p className="report-text" style={{ margin: 0 }}>{COMPAT_DEEP.zodiac.strength(r.starSign?.sign ?? 'Aries', tr.starSign?.sign ?? 'Aries')}</p>
          </div>
          <div className="report-highlight">
            <div className="report-highlight-label">Watch Out</div>
            <p className="report-text" style={{ margin: 0 }}>{COMPAT_DEEP.zodiac.watchOut(r.starSign?.sign ?? 'Aries', tr.starSign?.sign ?? 'Aries')}</p>
          </div>
        </div>

        {/* Personality Deep */}
        <div className="report-card">
          <div className="report-card-header">
            <span className="report-card-icon">🧠</span>
            <span className="report-card-category">Personality Compatibility</span>
          </div>
          <div className="compat-vs" style={{ marginBottom: 14 }}>
            <div className="compat-vs-item">
              <div className="compat-vs-name">{myName}</div>
              <div className="compat-vs-value">{r.cognitiveType}</div>
            </div>
            <div className="compat-vs-ampersand">&amp;</div>
            <div className="compat-vs-item">
              <div className="compat-vs-name">{conn.name}</div>
              <div className="compat-vs-value">{tr.cognitiveType}</div>
            </div>
          </div>
          <div className="report-score-bar">
            <span style={{ fontSize: 12, color: 'var(--text-light)' }}>Your dynamic</span>
            <div className="report-score-bar-track"><div className="report-score-bar-fill" style={{ width: `${compat.personality.score}%` }} /></div>
            <span className="report-score-label">{compat.personality.score}%</span>
          </div>
          <p className="report-text" style={{ fontStyle: 'italic' }}>{compat.personality.insight}</p>
          <div className="report-section-title">How {myName} Communicates</div>
          <p className="report-text">{TYPE_DEEP_DIVE[r.cognitiveType]?.think?.substring(0, 150)}...</p>
          <div className="report-section-title">How {conn.name} Communicates</div>
          <p className="report-text">{TYPE_DEEP_DIVE[tr.cognitiveType]?.think?.substring(0, 150)}...</p>
          <div className="report-highlight">
            <div className="report-highlight-label">Try This</div>
            <p className="report-text" style={{ margin: 0 }}>{personalityTip}</p>
          </div>
        </div>

        {/* Enneagram Deep */}
        <div className="report-card">
          <div className="report-card-header">
            <span className="report-card-icon">🔮</span>
            <span className="report-card-category">Enneagram Compatibility</span>
          </div>
          <div className="compat-vs" style={{ marginBottom: 14 }}>
            <div className="compat-vs-item">
              <div className="compat-vs-name">{myName}</div>
              <div className="compat-vs-value">{r.enneagramDisplay}</div>
            </div>
            <div className="compat-vs-ampersand">&amp;</div>
            <div className="compat-vs-item">
              <div className="compat-vs-name">{conn.name}</div>
              <div className="compat-vs-value">{tr.enneagramDisplay}</div>
            </div>
          </div>
          <div className="report-score-bar">
            <span style={{ fontSize: 12, color: 'var(--text-light)' }}>Your dynamic</span>
            <div className="report-score-bar-track"><div className="report-score-bar-fill" style={{ width: `${compat.enneagram.score}%` }} /></div>
            <span className="report-score-label">{compat.enneagram.score}%</span>
          </div>
          <p className="report-text" style={{ fontStyle: 'italic' }}>{compat.enneagram.insight}</p>
          <div className="report-highlight" style={{ borderLeftColor: '#66BB6A' }}>
            <div className="report-highlight-label" style={{ color: '#2E7D32' }}>What {myName} Brings</div>
            <p className="report-text" style={{ margin: 0 }}>{enneagramBrings(r.enneagramType, myName)}</p>
          </div>
          <div className="report-highlight" style={{ borderLeftColor: '#66BB6A' }}>
            <div className="report-highlight-label" style={{ color: '#2E7D32' }}>What {conn.name} Brings</div>
            <p className="report-text" style={{ margin: 0 }}>{enneagramBrings(tr.enneagramType, conn.name)}</p>
          </div>
        </div>

        {/* Attachment Deep */}
        <div className="report-card">
          <div className="report-card-header">
            <span className="report-card-icon">💛</span>
            <span className="report-card-category">Attachment Compatibility</span>
          </div>
          <div className="compat-vs" style={{ marginBottom: 14 }}>
            <div className="compat-vs-item">
              <div className="compat-vs-name">{myName}</div>
              <div className="compat-vs-value" style={{ fontSize: r.attachmentStyle.length > 8 ? 13 : 16 }}>{r.attachmentStyle}</div>
            </div>
            <div className="compat-vs-ampersand">&amp;</div>
            <div className="compat-vs-item">
              <div className="compat-vs-name">{conn.name}</div>
              <div className="compat-vs-value" style={{ fontSize: tr.attachmentStyle.length > 8 ? 13 : 16 }}>{tr.attachmentStyle}</div>
            </div>
          </div>
          <div className="report-score-bar">
            <span style={{ fontSize: 12, color: 'var(--text-light)' }}>Your dynamic</span>
            <div className="report-score-bar-track"><div className="report-score-bar-fill" style={{ width: `${compat.attachment.score}%` }} /></div>
            <span className="report-score-label">{compat.attachment.score}%</span>
          </div>
          <p className="report-text" style={{ fontStyle: 'italic' }}>{compat.attachment.insight}</p>
          <div className="report-section-title">During Conflict</div>
          <p className="report-text"><strong>{myName}:</strong> {ATTACHMENT_DEEP_DIVE[r.attachmentStyle]?.conflict}</p>
          <p className="report-text"><strong>{conn.name}:</strong> {ATTACHMENT_DEEP_DIVE[tr.attachmentStyle]?.conflict}</p>
          <div className="report-highlight">
            <div className="report-highlight-label">To Deepen Trust</div>
            <p className="report-text" style={{ margin: 0 }}>
              {r.attachmentStyle === tr.attachmentStyle
                ? "You share the same attachment style, which means you understand each other's needs intuitively. Use that understanding as a foundation — but challenge each other to grow beyond your comfort zone."
                : "Your attachment styles differ, which creates a natural dynamic tension. The key is naming your patterns out loud: \"I'm pulling away because I'm overwhelmed\" or \"I'm reaching out because I need reassurance.\" Transparency turns triggers into connection points."}
            </p>
          </div>
        </div>

        {/* Connection Style Deep */}
        <div className="report-card">
          <div className="report-card-header">
            <span className="report-card-icon">🤝</span>
            <span className="report-card-category">Connection Style Compatibility</span>
          </div>
          <div className="compat-vs" style={{ marginBottom: 14 }}>
            <div className="compat-vs-item">
              <div className="compat-vs-name">{myName}</div>
              <div className="compat-vs-value" style={{ fontSize: r.topConnection.length > 12 ? 12 : 16 }}>{r.topConnection}</div>
            </div>
            <div className="compat-vs-ampersand">&amp;</div>
            <div className="compat-vs-item">
              <div className="compat-vs-name">{conn.name}</div>
              <div className="compat-vs-value" style={{ fontSize: tr.topConnection.length > 12 ? 12 : 16 }}>{tr.topConnection}</div>
            </div>
          </div>
          <div className="report-score-bar">
            <span style={{ fontSize: 12, color: 'var(--text-light)' }}>Your dynamic</span>
            <div className="report-score-bar-track"><div className="report-score-bar-fill" style={{ width: `${compat.connection.score}%` }} /></div>
            <span className="report-score-label">{compat.connection.score}%</span>
          </div>
          <p className="report-text" style={{ fontStyle: 'italic' }}>{compat.connection.insight}</p>
          <div className="report-section-title">How to Show Love to {myName}</div>
          <p className="report-text">{CONNECTION_DEEP_DIVE[myConnKey]?.askForIt}</p>
          <div className="report-section-title">How to Show Love to {conn.name}</div>
          <p className="report-text">{CONNECTION_DEEP_DIVE[theirConnKey]?.askForIt}</p>
        </div>

        {/* Communication Guide */}
        <div className="report-intersection">
          <h3>Your Communication Guide</h3>
          <p><strong>When {myName} need{userName ? 's' : ''} to be heard:</strong> {commsStyle(r.cognitiveType, myName)}</p>
          <p><strong>When {conn.name} needs to be heard:</strong> {commsStyle(tr.cognitiveType, conn.name)}</p>
          <p><strong>During conflict:</strong> {conflictTip}</p>
        </div>

        {/* Tips */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ textAlign: 'center', marginBottom: 16 }}>
            <div className="report-badge">For both of you</div>
            <h2 style={{ fontFamily: 'var(--font-playfair-family)', fontSize: 22, fontWeight: 700 }}>5 Ways to Deepen Your Connection</h2>
          </div>
          <div className="report-tip-card">
            <div className="report-tip-number">1</div>
            <div className="report-tip-text">As {ENNEAGRAM_QS[r.enneagramType - 1]?.name}, {myName} needs {enneagramNeeds[r.enneagramType]}. As {ENNEAGRAM_QS[tr.enneagramType - 1]?.name}, {conn.name} needs {enneagramNeeds[tr.enneagramType]}. This week, meet the other person&apos;s need without mentioning you read this. See if they notice.</div>
          </div>
          <div className="report-tip-card">
            <div className="report-tip-number">2</div>
            <div className="report-tip-text">This week, show up in each other&apos;s connection style. {myName}: try {tr.topConnection.toLowerCase()}. {conn.name}: try {r.topConnection.toLowerCase()}. It won&apos;t feel natural. It might even be funny. Both good signs.</div>
          </div>
          <div className="report-tip-card">
            <div className="report-tip-number">3</div>
            <div className="report-tip-text">Pick an activity that plays to your strongest compatibility dimension ({strengths[0]}). You&apos;re already good at this one — make it a regular thing.</div>
          </div>
          <div className="report-tip-card">
            <div className="report-tip-number">4</div>
            <div className="report-tip-text">Ask each other: &ldquo;What&apos;s one thing I do that makes you feel really {connectionFeeling[r.topConnection] || 'valued'}?&rdquo; The answer might surprise you.</div>
          </div>
          <div className="report-tip-card">
            <div className="report-tip-number">5</div>
            <div className="report-tip-text">Both send your compatibility card to a friend who knows you as a pair. Ask: accurate? Their reaction is usually better than the quiz itself.</div>
          </div>
        </div>

        <div className="disclaimer">
          For entertainment and self-reflection purposes. Not a clinical assessment.
        </div>
      </div>
    </>
  );
}
