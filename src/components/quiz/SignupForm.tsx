'use client';

import { useState } from 'react';
import type React from 'react';
import { useQuizStore } from '@/store/quiz-store';
import { supabase } from '@/lib/supabase';
import { completeInvite } from '@/lib/db';

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
    subtitle: 'Save your profile to get your personal invite link and start comparing.',
    benefits: [
      'Get a unique link to share with friends',
      'See who\'s taken the quiz and how you match',
      'Unlock compatibility insights for each connection',
    ],
  },
};

interface SignupFormProps {
  /** What the user was trying to do — drives context copy + post-auth routing */
  intent?: string;
  /** Called when the modal should be dismissed (Skip / after email/password success) */
  onClose?: () => void;
}

export default function SignupForm({ intent = 'save', onClose }: SignupFormProps) {
  const handlePostAuth = useQuizStore((s) => s.handlePostAuth);
  const setScreen = useQuizStore((s) => s.setScreen);

  const [isLogin, setIsLogin] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Used when SignupForm is rendered as a full screen (legacy 'signup' route)
  const isFullScreen = !onClose;

  function handleSkip() {
    if (onClose) onClose();
    else setScreen('results');
  }

  async function handleGoogle() {
    setError('');
    // Store intent in cookie so auth callback can route correctly after redirect
    document.cookie = `innerMapsIntent=${intent}; path=/; max-age=600; SameSite=Lax`;
    const redirectTo = `${window.location.origin}/auth/callback`;

    // If there's an active anonymous session, link Google to it (preserves user ID + quiz data).
    // Otherwise fall back to a regular OAuth sign-in.
    const { data: { user: currentUser } } = await supabase.auth.getUser();
    if (currentUser?.is_anonymous) {
      const { error: oauthError } = await supabase.auth.linkIdentity({
        provider: 'google',
        options: { redirectTo },
      });
      if (oauthError) setError(oauthError.message);
    } else {
      const { error: oauthError } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo },
      });
      if (oauthError) setError(oauthError.message);
    }
  }

  async function handleEmailPassword() {
    if (!email.trim() || !password.trim()) {
      setError('Please enter your email and password.');
      return;
    }
    setLoading(true);
    setError('');

    try {
      const afterAuth = async (userId: string, userEmail: string) => {
        await handlePostAuth(userId, userEmail, intent);
        // Complete invite if user arrived via an invite link
        const inviterCode = sessionStorage.getItem('innerMapsInviterCode');
        if (inviterCode) {
          await completeInvite(inviterCode, userId).catch(console.warn);
          sessionStorage.removeItem('innerMapsInviterCode');
        }
        // For 'invite' intent, handlePostAuth already manages modal state via
        // setInviteModalOpen. Calling onClose here would close it again.
        if (onClose && intent !== 'invite') onClose();
      };

      if (isLogin) {
        // Sign in existing user
        const { data, error: signInError } = await supabase.auth.signInWithPassword({ email, password });
        if (signInError) throw signInError;
        if (data.user) await afterAuth(data.user.id, data.user.email ?? email);
      } else {
        // Upgrade anonymous account → real account (email + password)
        const { data, error: updateError } = await supabase.auth.updateUser({ email, password });
        if (updateError) throw updateError;
        if (data.user) await afterAuth(data.user.id, data.user.email ?? email);
      }
    } catch (err: any) {
      setError(err.message ?? 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  const content = INTENT_CONTENT[intent] ?? INTENT_CONTENT.save;

  return (
    <div className={`signup-screen${!isFullScreen ? ' signup-screen--modal' : ''}`}>
      <div className="logo">✦ Inner Maps ✦</div>
      <h2>{isLogin ? <>Welcome <em>back</em></> : content.title}</h2>
      <p className="signup-subtitle">
        {isLogin
          ? 'Sign in to see your saved results and compatibility matches.'
          : content.subtitle}
      </p>

      {!isLogin && (
        <div className="signup-benefits">
          {content.benefits.map((b, i) => (
            <div key={i} className="signup-benefit">
              <span className="signup-benefit-icon">✦</span> {b}
            </div>
          ))}
        </div>
      )}

      <div className="signup-form">
        {/* Google OAuth */}
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
          autoComplete="email"
        />
        <input
          type="password"
          className="signup-input"
          placeholder={isLogin ? 'Password' : 'Create a password'}
          value={password}
          onChange={(e) => { setPassword(e.target.value); setError(''); }}
          autoComplete={isLogin ? 'current-password' : 'new-password'}
        />

        {error && (
          <p style={{ color: 'var(--peach-deep)', fontSize: 13, margin: '4px 0 8px', textAlign: 'center' }}>
            {error}
          </p>
        )}

        <button
          className="signup-cta"
          onClick={handleEmailPassword}
          disabled={loading}
          style={{ opacity: loading ? 0.6 : 1 }}
        >
          {loading ? '...' : isLogin ? 'Sign In ✦' : 'Create Account ✦'}
        </button>

        <button className="signup-skip" onClick={handleSkip}>
          Skip for now
        </button>
      </div>

      <div className="signup-toggle">
        {isLogin ? (
          <>Don&apos;t have an account? <button className="signup-toggle-link" onClick={() => { setIsLogin(false); setError(''); }}>Sign up</button></>
        ) : (
          <>Already have an account? <button className="signup-toggle-link" onClick={() => { setIsLogin(true); setError(''); }}>Sign in</button></>
        )}
      </div>

      {!isLogin && isFullScreen && (
        <p className="signup-fine-print">No spam, ever. We&apos;ll only email you if you ask us to.</p>
      )}
    </div>
  );
}
