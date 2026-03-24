'use client';

import { useQuizStore } from '@/store/quiz-store';

export default function LandingPage() {
  const setScreen = useQuizStore((s) => s.setScreen);

  return (
    <div className="landing">
      <div className="logo">✦ Inner Maps ✦</div>
      <h1>Discover Your <em>Full Self</em> in Under 12 Minutes</h1>
      <p className="subtitle">One quiz. Five dimensions. Understand yourself, and help the people closest to you understand you too.</p>

      <button className="cta-button" onClick={() => setScreen('name')}>
        Start Your Free Profile
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
        <div className="dimension-card-wide">
          <span className="dimension-icon">✦</span>
          <div className="dimension-label">Star Sign</div>
          <div className="dimension-sublabel">Your astrology profile</div>
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
              <div className="how-step-sub">12 minutes. Five dimensions. Your full profile.</div>
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
    </div>
  );
}
