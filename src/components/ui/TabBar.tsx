'use client';

import { useState } from 'react';
import { useQuizStore } from '@/store/quiz-store';
import useAuth from '@/hooks/useAuth';
import SignupForm from '@/components/quiz/SignupForm';

export default function TabBar() {
  const screen = useQuizStore((s) => s.screen);
  const results = useQuizStore((s) => s.results);
  const activeTab = useQuizStore((s) => s.activeTab);
  const setActiveTab = useQuizStore((s) => s.setActiveTab);
  const setScreen = useQuizStore((s) => s.setScreen);
  const { user, loading } = useAuth();
  const [signInOpen, setSignInOpen] = useState(false);

  const isRealUser = !loading && !!user && !user.is_anonymous;

  function handleMyMap() {
    setActiveTab('mymap');
    if (!results) {
      setScreen('landing');
    } else {
      setScreen('results');
    }
  }

  function handleCompat() {
    setActiveTab('compat');
    setScreen('connections');
  }

  function handleProfile() {
    if (isRealUser) {
      setActiveTab('profile');
      setScreen('profile');
    } else {
      setSignInOpen(true);
    }
  }

  const myMapActive = activeTab === 'mymap' && screen !== 'profile';
  const compatActive = activeTab === 'compat' && screen !== 'profile';
  const profileActive = screen === 'profile' || activeTab === 'profile';

  return (
    <>
      <div className="tab-bar">
        <button
          className={`tab-item${myMapActive ? ' active' : ''}`}
          onClick={handleMyMap}
        >
          <span className="tab-item-icon">✦</span>
          <span className="tab-item-label">My Map</span>
        </button>
        <button
          className={`tab-item${compatActive ? ' active' : ''}`}
          onClick={handleCompat}
        >
          <span className="tab-item-icon">⟡</span>
          <span className="tab-item-label">Compatibility</span>
        </button>
        <button
          className={`tab-item${profileActive ? ' active' : ''}`}
          onClick={handleProfile}
        >
          <span className="tab-item-icon">◎</span>
          <span className="tab-item-label">Profile</span>
        </button>
      </div>

      {signInOpen && (
        <div
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 200, display: 'flex', alignItems: 'flex-end' }}
          onClick={(e) => { if (e.target === e.currentTarget) setSignInOpen(false); }}
        >
          <div style={{ width: '100%', maxWidth: 440, margin: '0 auto', background: 'var(--bg)', borderRadius: '20px 20px 0 0', maxHeight: '90vh', overflowY: 'auto' }}>
            <SignupForm intent="profile" defaultMode="login" onClose={() => setSignInOpen(false)} />
          </div>
        </div>
      )}
    </>
  );
}
