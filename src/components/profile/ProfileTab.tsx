'use client';

import { useQuizStore } from '@/store/quiz-store';
import { supabase } from '@/lib/supabase';
import useAuth from '@/hooks/useAuth';
import TabBar from '@/components/ui/TabBar';

export default function ProfileTab() {
  const results = useQuizStore((s) => s.results);
  const userName = useQuizStore((s) => s.userName);
  const resetQuiz = useQuizStore((s) => s.resetQuiz);
  const { user } = useAuth();

  async function handleSignOut() {
    await supabase.auth.signOut();
    resetQuiz();
  }

  return (
    <div style={{ paddingBottom: 80 }}>
      <div className="connections-page">
        <div className="connections-page-header">
          <div className="logo">✦ Inner Maps ✦</div>
          <h1>My <em>Profile</em></h1>
          <p style={{ fontSize: 14, color: 'var(--text-secondary)' }}>{user?.email}</p>
        </div>

        {results ? (
          <div className="share-card" style={{ marginBottom: 24 }}>
            <div className="share-card-title">✦ {userName ? `${userName}'s` : 'Your'} Inner Maps ✦</div>
            <div className="share-card-results">
              <div className="share-card-item">
                <div className="share-card-item-label">Personality</div>
                <div className="share-card-item-value">{results.cognitiveType}</div>
              </div>
              <div className="share-card-item">
                <div className="share-card-item-label">Enneagram</div>
                <div className="share-card-item-value">{results.enneagramDisplay}</div>
              </div>
              <div className="share-card-item">
                <div className="share-card-item-label">Attachment</div>
                <div className="share-card-item-value">{results.attachmentStyle}</div>
              </div>
              <div className="share-card-item">
                <div className="share-card-item-label">Connection</div>
                <div className="share-card-item-value" style={{ fontSize: results.topConnection.length > 12 ? 14 : 18 }}>
                  {results.topConnection}
                </div>
              </div>
              <div className="share-card-item-wide">
                <div className="share-card-item-label">Star Sign</div>
                <div className="share-card-item-value">{results.starSign?.sign} {results.starSign?.symbol}</div>
              </div>
            </div>
          </div>
        ) : (
          <div className="connections-empty" style={{ marginBottom: 24 }}>
            <div className="connections-empty-icon">✦</div>
            <h3>No results yet</h3>
            <p>Take the quiz to build your Inner Maps profile.</p>
          </div>
        )}

        <button
          onClick={handleSignOut}
          style={{
            width: '100%',
            padding: '14px 24px',
            borderRadius: 50,
            border: '2px solid var(--peach-pale)',
            background: 'var(--card-bg)',
            color: 'var(--text-secondary)',
            fontSize: 15,
            fontWeight: 600,
            cursor: 'pointer',
            fontFamily: 'var(--font-dm-sans-family)',
            transition: 'border-color 0.2s',
          }}
          onMouseOver={(e) => (e.currentTarget.style.borderColor = 'var(--peach)')}
          onMouseOut={(e) => (e.currentTarget.style.borderColor = 'var(--peach-pale)')}
        >
          Sign out
        </button>
      </div>
      <TabBar />
    </div>
  );
}
