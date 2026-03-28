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

// Content shown when the form is in signup mode
const SIGNUP_CONTENT: Record<string, IntentContent> = {
  save: {
    title: <>Keep your <em>results</em></>,
    subtitle: 'Save your profile so you never lose it — and see how you match with others.',
    benefits: [],
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
    title: <>Keep your <em>results</em></>,
    subtitle: 'Save your profile so you never lose it — and see how you match with others.',
    benefits: [],
  },
  save_after_purchase: {
    title: <>Save your <em>report</em></>,
    subtitle: 'Create a free account to keep your report and see how you match with anyone.',
    benefits: [
      'Deep dive into all 5 dimensions of your personality',
      'Invite friends and family to discover your compatibility',
    ],
  },
  purchase_individual: {
    title: <>Unlock your <em>full report</em></>,
    subtitle: 'Create a free account to purchase your full personality report.',
    benefits: [
      'Deep dive into all 5 dimensions of your personality',
      'Personalised growth strategies and tips',
    ],
  },
  purchase_compatibility: {
    title: <>Keep your results — unlock <em>compatibility</em></>,
    subtitle: 'Create a free account to save your results and purchase your full compatibility report.',
    benefits: [
      'Full breakdown of your dynamic across all 5 dimensions',
      'Invite friends and family to discover your compatibility',
    ],
  },
};

// Content shown when the form is in login mode
const LOGIN_CONTENT: Record<string, IntentContent> = {
  save: {
    title: <>Welcome <em>back</em></>,
    subtitle: 'Sign in to access your profile and discover your compatibility with others.',
    benefits: [],
  },
  compatibility: {
    title: <>Welcome <em>back</em></>,
    subtitle: 'Sign in to see your compatibility and invite others to take the quiz.',
    benefits: [],
  },
  invite: {
    title: <>Welcome <em>back</em></>,
    subtitle: 'Sign in to see your compatibility and invite others to take the quiz.',
    benefits: [],
  },
  profile: {
    title: <>Welcome <em>back</em></>,
    subtitle: 'Sign in to access your profile and discover your compatibility with others.',
    benefits: [],
  },
  save_after_purchase: {
    title: <>Welcome <em>back</em></>,
    subtitle: 'Sign in to access your report and saved results.',
    benefits: [],
  },
  purchase_individual: {
    title: <>Welcome <em>back</em></>,
    subtitle: 'Sign in to purchase and access your full personality report.',
    benefits: [],
  },
  purchase_compatibility: {
    title: <>Welcome <em>back</em></>,
    subtitle: 'Sign in to purchase your compatibility report.',
    benefits: [],
  },
};

interface SignupFormProps {
  intent?: string;
  onClose?: () => void;
  defaultMode?: 'login' | 'signup';
}

export default function SignupForm({ intent = 'save', onClose, defaultMode = 'signup' }: SignupFormProps) {
  const handlePostAuth = useQuizStore((s) => s.handlePostAuth);
  const restoreUserState = useQuizStore((s) => s.restoreUserState);
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
          if (signInError.message?.includes('Invalid login') || signInError.message?.includes('invalid')) {
            setError('Incorrect email or password.');
          } else if (signInError.message?.includes('Email not confirmed')) {
            setError('Please check your email to confirm your account first.');
          } else {
            setError(signInError.message ?? 'Something went wrong. Please try again.');
          }
          return;
        }
        if (!data.user) { setError('Something went wrong. Please try again.'); return; }

        // Use restoreUserState for login — it checks the profile cache first
        // (instant if cached) and only hits the DB as fallback. Much faster
        // than handlePostAuth which does multiple sequential DB writes.
        await restoreUserState(data.user.id, trimmedEmail);
        if (onClose) onClose();

      } else if (mode === 'forgot') {
        // Show confirmation immediately — don't wait for the API call.
        // This prevents leaking whether an email exists (always shows success).
        try { localStorage.setItem('im_recovery_pending', '1'); } catch { /* */ }
        setMode('resetSent');
        const redirectTo = `${window.location.origin}/auth/callback`;
        supabase.auth.resetPasswordForEmail(trimmedEmail, { redirectTo }).catch(() => { /* non-fatal */ });
      }
    } catch (err: any) {
      setError(err.message ?? 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  const signupContent = SIGNUP_CONTENT[intent] ?? SIGNUP_CONTENT.save;
  const loginContent = LOGIN_CONTENT[intent] ?? LOGIN_CONTENT.save;
  const content = mode === 'login' ? loginContent : signupContent;

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
        <p className="signup-subtitle">We&apos;ll email you a secure link to create a new password.</p>

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
              display: 'block', width: '100%', background: 'none', border: 'none',
              color: 'var(--peach)', fontSize: 13, fontWeight: 500, cursor: 'pointer',
              marginTop: 12, textDecoration: 'underline', textAlign: 'center',
            }}
          >
            Forgot password?
          </button>
        )}

        <p style={{ fontSize: 13, color: 'var(--text-light)', marginTop: 8, textAlign: 'center' }}>
          {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
          <button
            onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setError(''); setPassword(''); }}
            style={{
              background: 'none', border: 'none', color: 'var(--peach)',
              fontSize: 13, fontWeight: 600, cursor: 'pointer', textDecoration: 'underline',
              padding: 0,
            }}
          >
            {mode === 'login' ? 'Sign up' : 'Sign in'}
          </button>
        </p>

        <button className="signup-skip" onClick={handleSkip} style={{ marginTop: 16 }}>
          {intent.startsWith('purchase_') ? 'Maybe later' : 'Skip for now'}
        </button>
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
