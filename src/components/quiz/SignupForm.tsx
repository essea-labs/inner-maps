'use client';

import { useState } from 'react';
import type React from 'react';
import Link from 'next/link';
import { useQuizStore, saveStateToSession } from '@/store/quiz-store';
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
      'Check compatibility with the people in your life',
    ],
  },
  compatibility: {
    title: <>Check your <em>compatibility</em></>,
    subtitle: 'Save your profile first — then compare with anyone who takes the quiz.',
    benefits: [
      'See how you and your friend really click',
      'Get a breakdown across all 5 dimensions',
      'Share results and spark real conversations',
    ],
  },
  invite: {
    title: <>Invite & <em>connect</em></>,
    subtitle: 'Sign up to get your personal invite link and see compatibility with anyone who takes the quiz.',
    benefits: [],
  },
  profile: {
    title: <>Your <em>profile</em></>,
    subtitle: 'Sign in to save your results and track your compatibility.',
    benefits: [],
  },
  purchase_individual: {
    title: <>Unlock your <em>full report</em></>,
    subtitle: 'Create a free account to purchase and keep your report forever.',
    benefits: [
      'Deep dive into all 5 dimensions of your personality',
      'Personalised growth strategies and tips',
      'Access your report anytime from any device',
    ],
  },
  purchase_compatibility: {
    title: <>Unlock <em>compatibility</em></>,
    subtitle: 'Create a free account to purchase your compatibility report.',
    benefits: [
      'Full breakdown of your dynamic across all 5 dimensions',
      'Personalised tips to deepen your connection',
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

  const [isLogin, setIsLogin] = useState(defaultMode === 'login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  const isFullScreen = !onClose;

  function handleSkip() {
    if (onClose) onClose();
    else setScreen('results');
  }

  async function handleGoogle() {
    setError('');
    document.cookie = `innerMapsIntent=${intent}; path=/; max-age=600; SameSite=Lax`;
    // Persist inviterCode as a cookie so it survives the OAuth redirect
    // (sessionStorage is wiped when navigating to Google's consent screen)
    const inviterCode = sessionStorage.getItem('innerMapsInviterCode');
    if (inviterCode) {
      document.cookie = `innerMapsInviterCode=${inviterCode}; path=/; max-age=600; SameSite=Lax`;
    }
    saveStateToSession();
    const redirectTo = `${window.location.origin}/auth/callback`;
    const { data: { user: currentUser } } = await supabase.auth.getUser();
    if (currentUser?.is_anonymous) {
      const { error: e } = await supabase.auth.linkIdentity({ provider: 'google', options: { redirectTo } });
      if (e) setError(e.message);
    } else {
      const { error: e } = await supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo } });
      if (e) setError(e.message);
    }
  }

  async function handleEmailPassword() {
    const trimmedEmail = email.trim();
    if (!trimmedEmail) { setError('Please enter your email.'); return; }
    if (password.length < 6) { setError('Password must be at least 6 characters.'); return; }
    setLoading(true); setError('');

    try {
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      const inviterCode = sessionStorage.getItem('innerMapsInviterCode');

      if (isLogin) {
        // ── Sign In ──
        const { data, error: signInError } = await supabase.auth.signInWithPassword({
          email: trimmedEmail,
          password,
        });
        if (signInError) throw signInError;
        if (data.user) {
          // Force cookie sync so the session persists across refreshes
          await supabase.auth.getUser();
          await handlePostAuth(data.user.id, data.user.email ?? '', intent, inviterCode);
        }
      } else if (currentUser?.is_anonymous) {
        // ── Sign Up (anonymous → permanent) ──
        // updateUser preserves the user ID so quiz data stays linked
        const { data, error: updateError } = await supabase.auth.updateUser({
          email: trimmedEmail,
          password,
        });
        if (updateError) {
          if (updateError.message?.toLowerCase().includes('already registered')
              || updateError.message?.toLowerCase().includes('already been registered')) {
            throw new Error('This email is already in use. Try signing in instead.');
          }
          throw updateError;
        }
        if (data.user) {
          // Force session refresh after converting anonymous → permanent
          await supabase.auth.refreshSession();
          await handlePostAuth(data.user.id, data.user.email ?? trimmedEmail, intent, inviterCode);
        }
      } else {
        // ── Sign Up (fresh, no anonymous session) ──
        const { data, error: signUpError } = await supabase.auth.signUp({
          email: trimmedEmail,
          password,
        });
        if (signUpError) {
          if (signUpError.message?.toLowerCase().includes('already registered')
              || signUpError.message?.toLowerCase().includes('already been registered')) {
            throw new Error('This email is already in use. Try signing in instead.');
          }
          throw signUpError;
        }
        if (data.user) {
          // Force cookie sync so the session persists across refreshes
          await supabase.auth.getUser();
          await handlePostAuth(data.user.id, data.user.email ?? trimmedEmail, intent, inviterCode);
        }
      }
    } catch (err: any) {
      setError(err.message ?? 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  async function handleForgotPassword() {
    const trimmedEmail = email.trim();
    if (!trimmedEmail) { setError('Enter your email first, then tap "Reset password".'); return; }
    setLoading(true); setError('');

    try {
      // Set recovery intent cookie so auth callback knows to show password form
      document.cookie = `innerMapsIntent=recovery; path=/; max-age=600; SameSite=Lax`;
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(trimmedEmail, {
        redirectTo: `${window.location.origin}/auth/callback`,
      });
      if (resetError) throw resetError;
      setResetSent(true);
    } catch (err: any) {
      setError(err.message ?? 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  const content = INTENT_CONTENT[intent] ?? INTENT_CONTENT.save;

  // ── "Check your email" state (forgot password) ──────────────────────────────
  if (resetSent) {
    return (
      <div className={`signup-screen${!isFullScreen ? ' signup-screen--modal' : ''}`} style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 40, marginBottom: 16 }}>✉️</div>
        <h2>Check your <em>email</em></h2>
        <p className="signup-subtitle">
          We sent a password reset link to <strong>{email}</strong>.<br />
          Tap it to set a new password.
        </p>
        {!isFullScreen && (
          <button className="signup-skip" onClick={onClose} style={{ marginTop: 8 }}>Close</button>
        )}
      </div>
    );
  }

  // ── Main form ──────────────────────────────────────────────────────────────
  return (
    <div className={`signup-screen${!isFullScreen ? ' signup-screen--modal' : ''}`}>
      <div className="logo">✦ Inner Maps ✦</div>
      <h2>{isLogin ? <>Welcome <em>back</em></> : content.title}</h2>
      <p className="signup-subtitle">
        {isLogin
          ? 'Sign in to see your saved results and compatibility matches.'
          : content.subtitle}
      </p>

      {!isLogin && content.benefits.length > 0 && (
        <div className="signup-benefits">
          {content.benefits.map((b, i) => (
            <div key={i} className="signup-benefit">
              <span className="signup-benefit-icon">✦</span> {b}
            </div>
          ))}
        </div>
      )}

      <div className="signup-form">
        <button className="signup-social-btn google" onClick={handleGoogle} disabled={loading}>
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
          onChange={(e) => { setEmail(e.target.value); setError(''); }}
          onKeyDown={(e) => { if (e.key === 'Enter') document.getElementById('im-password')?.focus(); }}
          autoComplete="email"
          autoFocus
        />

        <input
          id="im-password"
          type="password"
          className="signup-input"
          placeholder={isLogin ? 'Password' : 'Create a password'}
          value={password}
          onChange={(e) => { setPassword(e.target.value); setError(''); }}
          onKeyDown={(e) => { if (e.key === 'Enter') handleEmailPassword(); }}
          autoComplete={isLogin ? 'current-password' : 'new-password'}
          style={{ marginTop: 8 }}
        />

        {isLogin && (
          <button
            onClick={handleForgotPassword}
            disabled={loading}
            style={{
              background: 'none', border: 'none', color: 'var(--peach-deep)',
              fontSize: 13, fontWeight: 600, cursor: 'pointer', padding: 0,
              textDecoration: 'underline', marginTop: -4, marginBottom: 8, alignSelf: 'flex-end',
            }}
          >
            Forgot password?
          </button>
        )}

        {error && (
          <p style={{ color: 'var(--peach-deep)', fontSize: 13, margin: '4px 0 8px', textAlign: 'center' }}>{error}</p>
        )}

        <button className="signup-cta" onClick={handleEmailPassword} disabled={loading}
          style={{ opacity: loading ? 0.6 : 1 }}>
          {loading ? '...' : isLogin ? 'Sign in ✦' : 'Create account ✦'}
        </button>

        <button className="signup-skip" onClick={handleSkip}>Skip for now</button>
      </div>

      <div className="signup-toggle">
        {isLogin ? (
          <>Don&apos;t have an account?{' '}
            <button className="signup-toggle-link" onClick={() => { setIsLogin(false); setError(''); setPassword(''); }}>Sign up</button>
          </>
        ) : (
          <>Already have an account?{' '}
            <button className="signup-toggle-link" onClick={() => { setIsLogin(true); setError(''); setPassword(''); }}>Sign in</button>
          </>
        )}
      </div>

      {!isLogin && isFullScreen && (
        <p className="signup-fine-print">
          By signing up, you agree to our{' '}
          <Link href="/terms" style={{ color: 'var(--peach)', textDecoration: 'underline' }}>Terms</Link>
          {' '}and{' '}
          <Link href="/privacy" style={{ color: 'var(--peach)', textDecoration: 'underline' }}>Privacy Policy</Link>.
        </p>
      )}
    </div>
  );
}
