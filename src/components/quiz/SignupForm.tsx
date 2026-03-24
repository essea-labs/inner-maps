'use client';

import { useState } from 'react';
import { useQuizStore } from '@/store/quiz-store';

export default function SignupForm() {
  const setScreen = useQuizStore((s) => s.setScreen);
  const [isLogin, setIsLogin] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  function handleSkip() {
    setScreen('results');
  }

  return (
    <div className="signup-screen">
      <div className="logo">✦ Inner Maps ✦</div>
      <h2>{isLogin ? <>Welcome <em>back</em></> : <>Your results are <em>ready</em></>}</h2>
      <p className="signup-subtitle">
        {isLogin
          ? 'Sign in to see your saved results and compatibility matches.'
          : 'Create a free account to save your results and come back anytime.'}
      </p>

      {!isLogin && (
        <div className="signup-benefits">
          <div className="signup-benefit"><span className="signup-benefit-icon">✦</span> See your complete 5-dimension profile</div>
          <div className="signup-benefit"><span className="signup-benefit-icon">✦</span> Save results &amp; track changes over time</div>
          <div className="signup-benefit"><span className="signup-benefit-icon">✦</span> Invite friends and check compatibility</div>
        </div>
      )}

      <div className="signup-form">
        <button className="signup-social-btn apple" onClick={() => setScreen('results')}>
          <span className="signup-social-icon"></span>
          {isLogin ? 'Sign in with Apple' : 'Continue with Apple'}
        </button>
        <button className="signup-social-btn google" onClick={() => setScreen('results')}>
          <svg className="signup-social-icon" width="18" height="18" viewBox="0 0 18 18">
            <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 01-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
            <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" fill="#34A853"/>
            <path d="M3.964 10.71A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.997 8.997 0 000 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
            <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.958L3.964 6.29C4.672 4.163 6.656 2.58 9 2.58z" fill="#EA4335"/>
          </svg>
          {isLogin ? 'Sign in with Google' : 'Continue with Google'}
        </button>

        <div className="signup-divider">or</div>

        <input
          type="email"
          className="signup-input"
          placeholder="Email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          className="signup-input"
          placeholder={isLogin ? 'Password' : 'Create a password'}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button className="signup-cta" onClick={() => setScreen('results')}>
          {isLogin ? 'Sign In ✦' : 'Create Account ✦'}
        </button>

        {isLogin && (
          <button className="signup-skip" style={{ marginBottom: 16, fontSize: 12, color: 'var(--peach-deep)' }}>
            Forgot password?
          </button>
        )}

        <button className="signup-skip" onClick={handleSkip}>
          Skip for now
        </button>
      </div>

      <div className="signup-toggle">
        {isLogin ? (
          <>Don&apos;t have an account? <button className="signup-toggle-link" onClick={() => setIsLogin(false)}>Sign up</button></>
        ) : (
          <>Already have an account? <button className="signup-toggle-link" onClick={() => setIsLogin(true)}>Sign in</button></>
        )}
      </div>

      {!isLogin && <p className="signup-fine-print">No spam, ever. We&apos;ll only email you if you ask us to.</p>}
    </div>
  );
}
