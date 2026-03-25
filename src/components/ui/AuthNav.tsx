'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useQuizStore } from '@/store/quiz-store';
import useAuth from '@/hooks/useAuth';
import SignupForm from '@/components/quiz/SignupForm';

export default function AuthNav() {
  const { user, loading } = useAuth();
  const resetQuiz = useQuizStore((s) => s.resetQuiz);
  const [signInOpen, setSignInOpen] = useState(false);

  if (loading) return null;

  const isRealUser = !!user && !user.is_anonymous;

  async function handleSignOut() {
    await supabase.auth.signOut();
    resetQuiz();
  }

  return (
    <>
      <div style={{
        position: 'fixed',
        top: 14,
        right: 16,
        zIndex: 100,
      }}>
        {isRealUser ? (
          <button
            onClick={handleSignOut}
            style={{
              background: 'var(--peach-pale)',
              border: 'none',
              borderRadius: 20,
              padding: '6px 14px',
              fontSize: 12,
              fontWeight: 600,
              color: 'var(--peach-deep)',
              cursor: 'pointer',
              letterSpacing: 0.3,
            }}
          >
            Sign out
          </button>
        ) : (
          <button
            onClick={() => setSignInOpen(true)}
            style={{
              background: 'var(--peach-pale)',
              border: 'none',
              borderRadius: 20,
              padding: '6px 14px',
              fontSize: 12,
              fontWeight: 600,
              color: 'var(--peach-deep)',
              cursor: 'pointer',
              letterSpacing: 0.3,
            }}
          >
            Sign in
          </button>
        )}
      </div>

      {signInOpen && (
        <div
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 200, display: 'flex', alignItems: 'flex-end' }}
          onClick={(e) => { if (e.target === e.currentTarget) setSignInOpen(false); }}
        >
          <div style={{ width: '100%', maxWidth: 440, margin: '0 auto', background: 'var(--bg)', borderRadius: '20px 20px 0 0', maxHeight: '90vh', overflowY: 'auto' }}>
            <SignupForm defaultMode="login" onClose={() => setSignInOpen(false)} />
          </div>
        </div>
      )}
    </>
  );
}
