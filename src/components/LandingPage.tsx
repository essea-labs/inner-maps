'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useQuizStore } from '@/store/quiz-store';
import { analytics } from '@/lib/analytics';
import TabBar from '@/components/ui/TabBar';

export default function LandingPage() {
  const setScreen = useQuizStore((s) => s.setScreen);
  const [inviterName, setInviterName] = useState<string | null>(null);
  const [isInviteFlow, setIsInviteFlow] = useState(false);

  useEffect(() => {
    const code = sessionStorage.getItem('innerMapsInviterCode');
    if (code) {
      setIsInviteFlow(true);
      const name = sessionStorage.getItem('innerMapsInviterName');
      if (name) setInviterName(name);
    }
  }, []);

  return (
    <>
      <div className="landing" style={{ paddingBottom: 100 }}>
        <div className="logo">✦ Inner Maps ✦</div>

        {isInviteFlow && (
          <div className="invite-banner">
            <div className="invite-banner-title">
              {inviterName
                ? `${inviterName} invited you to discover your personality!`
                : "You've been invited to discover your personality!"}
            </div>
            <div className="invite-banner-text">
              When you complete the quiz, your results will be shared with{' '}
              {inviterName || 'the person who invited you'} so you can explore
              your compatibility together.
            </div>
          </div>
        )}

        <h1>Discover Your <em>Full Self</em> in Under 10 Minutes</h1>
        <p className="subtitle">One quiz. Five dimensions. Understand yourself — then see how you match with others.</p>

        <button className="cta-button" onClick={() => { analytics.quizStarted(); setScreen('name'); }}>
          Take the Quiz
        </button>

        <div className="dimension-grid">
          <div className="dimension-card">
            <span className="dimension-icon">🧠</span>
            <div className="dimension-label">Personality Type</div>
            <div className="dimension-sublabel">How you think and act</div>
          </div>
          <div className="dimension-card">
            <span className="dimension-icon">🔮</span>
            <div className="dimension-label">Enneagram</div>
            <div className="dimension-sublabel">What drives you deep down</div>
          </div>
          <div className="dimension-card">
            <span className="dimension-icon">💛</span>
            <div className="dimension-label">Attachment Style</div>
            <div className="dimension-sublabel">How you bond in relationships</div>
          </div>
          <div className="dimension-card">
            <span className="dimension-icon">🤝</span>
            <div className="dimension-label">Connection Style</div>
            <div className="dimension-sublabel">How you prefer to receive love</div>
          </div>
          <div className="dimension-card-wide" style={{ padding: '10px 12px' }}>
            <span className="dimension-icon" style={{ marginBottom: 2 }}>✦</span>
            <div className="dimension-label">Star Sign</div>
          </div>
        </div>

        <div className="compat-teaser">
          <div className="compat-teaser-label">Then go deeper</div>
          <div className="compat-teaser-visual">
            <div className="compat-teaser-card">
              <div className="compat-teaser-avatar" style={{ background: 'var(--peach-pale)' }}>🌙</div>
              <div className="compat-teaser-name">You</div>
              <div className="compat-teaser-type">INFJ · Type 4</div>
            </div>
            <div className="compat-teaser-heart">✦</div>
            <div className="compat-teaser-card">
              <div className="compat-teaser-avatar" style={{ background: 'var(--cream)' }}>☀️</div>
              <div className="compat-teaser-name">A friend</div>
              <div className="compat-teaser-type">ENFP · Type 7</div>
            </div>
          </div>
          <h3>See how you <em>actually connect</em></h3>
          <p className="compat-teaser-desc">Compare your results with anyone — a partner, friend, or family member. Get a free compatibility breakdown across all five dimensions.</p>
        </div>

        <div className="how-it-works">
          <div className="how-it-works-label">How it works</div>
          <div className="how-steps">
            <div className="how-step">
              <div className="how-step-icon">✦</div>
              <div className="how-step-content">
                <div className="how-step-title">Take the quiz</div>
                <div className="how-step-sub">10 minutes. Five dimensions. Your full profile.</div>
              </div>
            </div>
            <div className="how-step">
              <div className="how-step-icon">🔗</div>
              <div className="how-step-content">
                <div className="how-step-title">Share your link</div>
                <div className="how-step-sub">Invite anyone to take it too — it&apos;s free for them.</div>
              </div>
            </div>
            <div className="how-step">
              <div className="how-step-icon">💛</div>
              <div className="how-step-content">
                <div className="how-step-title">See your compatibility</div>
                <div className="how-step-sub">Strengths, blind spots, and tips tailored to your exact pairing.</div>
              </div>
            </div>
          </div>
        </div>

        <div className="landing-footer">
          <Link href="/privacy">Privacy Policy</Link>
          <span> · </span>
          <Link href="/terms">Terms of Service</Link>
        </div>
      </div>

      <TabBar />
    </>
  );
}
