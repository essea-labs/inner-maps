'use client';

import { useState } from 'react';
import { useQuizStore } from '@/store/quiz-store';
import { supabase } from '@/lib/supabase';

export default function ResetPasswordForm() {
  const setScreen = useQuizStore((s) => s.setScreen);
  const showToast = useQuizStore((s) => s.showToast);

  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [expired, setExpired] = useState(false);

  async function handleSubmit() {
    if (password.length < 6) { setError('Password must be at least 6 characters.'); return; }
    setLoading(true); setError('');

    try {
      const { error: updateError } = await supabase.auth.updateUser({ password });
      if (updateError) throw updateError;

      showToast('Password updated ✓');
      try { localStorage.removeItem('im_recovery_pending'); } catch { /* non-fatal */ }

      // Load quiz data then navigate explicitly
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        // Fetch results without letting restoreUserState control navigation
        const { fetchUserQuizResults } = await import('@/lib/db');
        const data = await fetchUserQuizResults(user.id);
        if (data) {
          useQuizStore.setState({
            results: data.results,
            userName: data.name,
            birthMonth: data.birthMonth,
            birthDay: data.birthDay,
            starSign: data.results.starSign,
          });
          setScreen('results');
        } else {
          setScreen('landing');
        }
      } else {
        setScreen('landing');
      }
    } catch (err: any) {
      const msg = err.message ?? 'Something went wrong. Please try again.';
      if (msg.toLowerCase().includes('expired') || msg.toLowerCase().includes('invalid')) {
        setExpired(true);
      }
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="signup-screen" style={{ textAlign: 'center' }}>
      <div className="logo">✦ Inner Maps ✦</div>
      <h2>Set new <em>password</em></h2>
      <p className="signup-subtitle">Choose a new password for your account.</p>

      <div className="signup-form">
        <input
          type="password"
          className="signup-input"
          placeholder="New password"
          value={password}
          onChange={(e) => { setPassword(e.target.value); setError(''); }}
          onKeyDown={(e) => { if (e.key === 'Enter') handleSubmit(); }}
          autoComplete="new-password"
          autoFocus
        />

        {error && (
          <p style={{ color: 'var(--peach-deep)', fontSize: 13, margin: '4px 0 8px', textAlign: 'center' }}>{error}</p>
        )}

        <button className="signup-cta" onClick={handleSubmit} disabled={loading}
          style={{ opacity: loading ? 0.6 : 1 }}>
          {loading ? '...' : 'Save password ✦'}
        </button>

        {expired && (
          <button
            onClick={() => { setScreen('signup'); }}
            style={{
              background: 'none', border: 'none', color: 'var(--peach-deep)',
              fontSize: 14, fontWeight: 600, cursor: 'pointer', padding: '12px 0',
              textDecoration: 'underline',
            }}
          >
            Request a new reset link →
          </button>
        )}
      </div>
    </div>
  );
}
