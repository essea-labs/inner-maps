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
    ],
  },
  compatibility: {
    title: <>Check your <em>compatibility</em></>,
    subtitle: 'See how your personalities actually fit together — the good, the surprising, and the hilarious.',
    benefits: [
      'See your compatibility score across all 5 dimensions',
      'Find out which personality traits draw you together',
    ],
  },
  invite: {
    title: <>Invite & <em>connect</em></>,
    subtitle: 'Sign up to get your personal invite link and see compatibility with anyone who takes the quiz.',
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

export default function SignupForm({ intent = 'save', onClose }: SignupFormProps) {
  const handlePostAuth = useQuizStore((s) => s.handlePostAuth);
  const setScreen = useQuizStore((s) => s.setScreen);

  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [magicLinkSent, setMagicLinkSent] = useState(false);

  const isFullScreen = !onClose;

  function handleSkip() {
    if (onClose) onClose();
    else setScreen('results');
  }

  async function handleMagicLink() {
    const trimmedEmail = email.trim();
    if (!trimmedEmail) { setError('Please enter your email.'); return; }
    setLoading(true); setError('');

    try {
      // Persist intent and state so they survive the magic link redirect
      document.cookie = `innerMapsIntent=${intent}; path=/; max-age=3600; SameSite=Lax`;
      const inviterCode = sessionStorage.getItem('innerMapsInviterCode');
      if (inviterCode) {
        document.cookie = `innerMapsInviterCode=${inviterCode}; path=/; max-age=3600; SameSite=Lax`;
      }
      saveStateToSession();

      const { data: { user: currentUser } } = await supabase.auth.getUser();
      const redirectTo = `${window.location.origin}/auth/callback`;

      if (currentUser?.is_anonymous) {
        // Convert anonymous user → link via magic link
        // First update the email on the anonymous user, then send OTP
        const { error: updateError } = await supabase.auth.updateUser({ email: trimmedEmail });
        if (updateError) {
          if (updateError.message?.toLowerCase().includes('already registered')
              || updateError.message?.toLowerCase().includes('already been registered')) {
            // Email exists — send a regular magic link to sign in
            const { error: otpError } = await supabase.auth.signInWithOtp({
              email: trimmedEmail,
              options: { emailRedirectTo: redirectTo },
            });
            if (otpError) throw otpError;
          } else {
            throw updateError;
          }
        }
      } else {
        // Fresh user or returning — send magic link
        const { error: otpError } = await supabase.auth.signInWithOtp({
          email: trimmedEmail,
          options: { emailRedirectTo: redirectTo },
        });
        if (otpError) throw otpError;
      }

      setMagicLinkSent(true);
    } catch (err: any) {
      setError(err.message ?? 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  const content = INTENT_CONTENT[intent] ?? INTENT_CONTENT.save;

  // ── "Check your email" state ──────────────────────────────────────────────
  if (magicLinkSent) {
    return (
      <div className={`signup-screen${!isFullScreen ? ' signup-screen--modal' : ''}`} style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 40, marginBottom: 16 }}>✉️</div>
        <h2>Check your <em>email</em></h2>
        <p className="signup-subtitle">
          We sent a sign-in link to <strong>{email}</strong>.<br />
          Tap it to access your profile.
        </p>
        <p style={{ fontSize: 12, color: 'var(--text-light)', marginTop: 12 }}>
          Don&apos;t see it? Check your spam folder.
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
          onKeyDown={(e) => { if (e.key === 'Enter') handleMagicLink(); }}
          autoComplete="email"
          autoFocus
        />

        {error && (
          <p style={{ color: 'var(--peach-deep)', fontSize: 13, margin: '4px 0 8px', textAlign: 'center' }}>{error}</p>
        )}

        <button className="signup-cta" onClick={handleMagicLink} disabled={loading}
          style={{ opacity: loading ? 0.6 : 1 }}>
          {loading ? 'Sending link…' : 'Continue with email ✦'}
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
