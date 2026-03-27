'use client';

import { useState } from 'react';
import type React from 'react';
import Link from 'next/link';
import { useQuizStore } from '@/store/quiz-store';
import { supabase } from '@/lib/supabase';

interface IntentContent {
  title: React.ReactNode;
  subtitle: string;
  benefits: string[];
}

const INTENT_CONTENT: Record<string, IntentContent> = {
  save: {
    title: <>Keep your <em>results</em></>,
    subtitle: 'Free account — takes 10 seconds. Your profile stays yours forever.',
    benefits: [
      'Revisit your full 5-dimension profile anytime',
      'Track how you grow and change over time',
    ],
  },
  compatibility: {
    title: <>Discover your <em>compatibility</em></>,
    subtitle: 'Sign up to get your invite link and see how you match with anyone who takes the quiz.',
    benefits: [
      'Both get a free compatibility score instantly',
      'Every new connection reveals a different side of your personality',
    ],
  },
  invite: {
    title: <>Discover your <em>compatibility</em></>,
    subtitle: 'Sign up to get your invite link and see how you match with anyone who takes the quiz.',
    benefits: [
      'Both get a free compatibility score instantly',
      'Every new connection reveals a different side of your personality',
    ],
  },
  profile: {
    title: <>Your <em>profile</em></>,
    subtitle: 'Sign in to save your results and track your compatibility.',
    benefits: [],
  },
  save_after_purchase: {
    title: <>Save your <em>report</em></>,
    subtitle: 'Keep your report forever — and find out how you match with anyone.',
    benefits: [
      'Access your full report anytime from any device',
      'Invite friends to discover your compatibility',
    ],
  },
  purchase_individual: {
    title: <>Unlock your <em>full report</em></>,
    subtitle: 'Create a free account to purchase and keep your report forever.',
    benefits: [
      'Deep dive into all 5 dimensions of your personality',
      'Personalised growth strategies and tips',
    ],
  },
  purchase_compatibility: {
    title: <>Unlock <em>compatibility</em></>,
    subtitle: 'Create a free account to purchase your compatibility report.',
    benefits: [
      'Full breakdown of your dynamic across all 5 dimensions',
      'Communication guide based on both your styles',
    ],
  },
};

interface SignupFormProps {
  intent?: string;
  onClose?: () => void;
  defaultMode?: 'login' | 'signup';
}

export default function SignupForm({ intent = 'save', onClose, defaultMode = 'signup' }: SignupFormProps) {
  const handlePostAuth = useQuizStore((s) => s.handlePostAuth);
  const setScreen = useQuizStore((s) => s.setScreen);
  const showToast = useQuizStore((s) => s.showToast);

  const [mode, setMode] = useState<'signup' | 'login' | 'forgot' | 'resetSent'>(defaultMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const isFullScreen = !onClose;

  function handleSkip() {
    if (onClose) onClose();
    else setScreen('results');
  }

  async function handleSubmit() {
    const trimmedEmail = email.trim();
    if (!trimmedEmail) { setError('Please enter your email.'); return; }
    if (mode !== 'forgot' && password.length < 6) { setError('Password must be at least 6 characters.'); return; }
    setLoading(true); setError('');

    try {
      if (mode === 'signup') {
        const { data, error: signUpError } = await supabase.auth.signUp({
          email: trimmedEmail,
          password,
        });
        if (signUpError) {
          if (signUpError.message?.includes('already registered')) {
            setError('An account with this email already exists. Try signing in instead.');
          } else {
            throw signUpError;
          }
          return;
        }
        if (!data.user) { setError('Something went wrong. Please try again.'); return; }

        const inviterCode = sessionStorage.getItem('innerMapsInviterCode') ?? undefined;
        await handlePostAuth(data.user.id, trimmedEmail, intent, inviterCode);
        if (onClose) onClose();

      } else if (mode === 'login') {
        const { data, error: signInError } = await supabase.auth.signInWithPassword({
          email: trimmedEmail,
          password,
        });
        if (signInError) {
          if (signInError.message?.includes('Invalid login')) {
            setError('Incorrect email or password.');
          } else {
            throw signInError;
          }
          return;
        }
        if (!data.user) { setError('Something went wrong. Please try again.'); return; }

        const inviterCode = sessionStorage.getItem('innerMapsInviterCode') ?? undefined;
        await handlePostAuth(data.user.id, trimmedEmail, intent, inviterCode);
        if (onClose) onClose();

      } else if (mode === 'forgot') {
        const redirectTo = `${window.location.origin}/auth/callback`;
        const { error: resetError } = await supabase.auth.resetPasswordForEmail(trimmedEmail, {
          redirectTo,
        });
        if (resetError) throw resetError;
        try { localStorage.setItem('im_recovery_pending', '1'); } catch { /* */ }
        setMode('resetSent');
      }
    } catch (err: any) {
      setError(err.message ?? 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  const content = INTENT_CONTENT[intent] ?? INTENT_CONTENT.save;

  // ── "Check your email" after forgot password ─────────────────────────────
  if (mode === 'resetSent') {
    return (
      <div className={`signup-screen${!isFullScreen ? ' signup-screen--modal' : ''}`} style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 40, marginBottom: 16 }}>✉️</div>
        <h2>Check your <em>email</em></h2>
        <p className="signup-subtitle">
          We sent a password reset link to <strong>{email}</strong>.<br />
          Click it to set a new password.
        </p>
        <p style={{ fontSize: 12, color: 'var(--text-light)', marginTop: 12 }}>
          Don&apos;t see it? Check your spam folder.
        </p>
        <button
          onClick={() => { setMode('login'); setError(''); }}
          style={{
            background: 'none', border: 'none', color: 'var(--peach)',
            fontSize: 13, fontWeight: 600, cursor: 'pointer', marginTop: 12,
            textDecoration: 'underline',
          }}
        >
          Back to sign in
        </button>
        {!isFullScreen && (
          <button className="signup-skip" onClick={onClose} style={{ marginTop: 8 }}>Close</button>
        )}
      </div>
    );
  }

  // ── Forgot password form ─────────────────────────────────────────────────
  if (mode === 'forgot') {
    return (
      <div className={`signup-screen${!isFullScreen ? ' signup-screen--modal' : ''}`}>
        <div className="logo">✦ Inner Maps ✦</div>
        <h2>Reset your <em>password</em></h2>
        <p className="signup-subtitle">Enter your email and we&apos;ll send you a reset link.</p>

        <div className="signup-form">
          <input
            type="email"
            className="signup-input"
            placeholder="Email address"
            value={email}
            onChange={(e) => { setEmail(e.target.value); setError(''); }}
            onKeyDown={(e) => { if (e.key === 'Enter') handleSubmit(); }}
            autoComplete="email"
            autoFocus
          />

          {error && (
            <p style={{ color: 'var(--peach-deep)', fontSize: 13, margin: '4px 0 8px', textAlign: 'center' }}>{error}</p>
          )}

          <button className="signup-cta" onClick={handleSubmit} disabled={loading}
            style={{ opacity: loading ? 0.6 : 1 }}>
            {loading ? 'Sending…' : 'Send reset link ✦'}
          </button>

          <button className="signup-skip" onClick={() => { setMode('login'); setError(''); }}>
            Back to sign in
          </button>
        </div>
      </div>
    );
  }

  // ── Main signup / login form ─────────────────────────────────────────────
  return (
    <div className={`signup-screen${!isFullScreen ? ' signup-screen--modal' : ''}`}>
      <div className="logo">✦ Inner Maps ✦</div>
      <h2>{content.title}</h2>
      <p className="signup-subtitle">{content.subtitle}</p>

      {content.benefits.length > 0 && (
        <div className="signup-benefits">
          {content.benefits.map((b, i) => (
            <div key={i} className="signup-benefit">
              <span className="signup-benefit-icon">✦</span> {b}
            </div>
          ))}
        </div>
      )}

      <div className="signup-form">
        <input
          type="email"
          className="signup-input"
          placeholder="Email address"
          value={email}
          onChange={(e) => { setEmail(e.target.value); setError(''); }}
          onKeyDown={(e) => { if (e.key === 'Enter') handleSubmit(); }}
          autoComplete="email"
          autoFocus
        />

        <input
          type="password"
          className="signup-input"
          placeholder="Password"
          value={password}
          onChange={(e) => { setPassword(e.target.value); setError(''); }}
          onKeyDown={(e) => { if (e.key === 'Enter') handleSubmit(); }}
          autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
          style={{ marginTop: 8 }}
        />

        {error && (
          <p style={{ color: 'var(--peach-deep)', fontSize: 13, margin: '4px 0 8px', textAlign: 'center' }}>{error}</p>
        )}

        <button className="signup-cta" onClick={handleSubmit} disabled={loading}
          style={{ opacity: loading ? 0.6 : 1 }}>
          {loading ? '...' : mode === 'login' ? 'Sign in ✦' : 'Create account ✦'}
        </button>

        {mode === 'login' && (
          <button
            onClick={() => { setMode('forgot'); setError(''); }}
            style={{
              background: 'none', border: 'none', color: 'var(--peach)',
              fontSize: 13, fontWeight: 500, cursor: 'pointer', marginTop: 12,
              textDecoration: 'underline',
            }}
          >
            Forgot password?
          </button>
        )}

        <button
          onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setError(''); setPassword(''); }}
          style={{
            background: 'none', border: 'none', color: 'var(--text-light)',
            fontSize: 13, cursor: 'pointer', marginTop: 12,
          }}
        >
          {mode === 'login' ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
        </button>

        <button className="signup-skip" onClick={handleSkip}>Skip for now</button>
      </div>

      {isFullScreen && (
        <p className="signup-fine-print">
          By continuing, you agree to our{' '}
          <Link href="/terms" style={{ color: 'var(--peach)', textDecoration: 'underline' }}>Terms</Link>
          {' '}and{' '}
          <Link href="/privacy" style={{ color: 'var(--peach)', textDecoration: 'underline' }}>Privacy Policy</Link>.
        </p>
      )}
    </div>
  );
}
