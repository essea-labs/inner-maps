'use client';

import { useEffect } from 'react';
import { useQuizStore } from '@/store/quiz-store';
import useAuth from '@/hooks/useAuth';
import TabBar from '@/components/ui/TabBar';

export default function ConnectionsTab() {
  const results = useQuizStore((s) => s.results);
  const connections = useQuizStore((s) => s.connections);
  const loadConnections = useQuizStore((s) => s.loadConnections);
  const restoreUserState = useQuizStore((s) => s.restoreUserState);
  const restoringState = useQuizStore((s) => s.restoringState);
  const setInviteModalOpen = useQuizStore((s) => s.setInviteModalOpen);
  const setActiveConnection = useQuizStore((s) => s.setActiveConnection);
  const setScreen = useQuizStore((s) => s.setScreen);
  const setActiveTab = useQuizStore((s) => s.setActiveTab);
  const { user } = useAuth();

  // Refresh connections from DB each time this tab mounts
  // Also restore results if store is empty (e.g. user navigated directly to this tab)
  useEffect(() => {
    if (user && !user.is_anonymous) {
      if (!results) {
        restoreUserState(user.id);
      } else {
        loadConnections(user.id);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  function handleViewCompat(index: number) {
    setActiveConnection(connections[index]);
    setScreen('compatibility');
    setActiveTab('compat');
  }

  // Still loading user data from DB
  if (!results && (restoringState || (user && !user.is_anonymous))) {
    return (
      <div style={{ paddingBottom: 80 }}>
        <div className="connections-page">
          <div className="connections-page-header">
            <div className="logo">✦ Inner Maps ✦</div>
            <h1>Compatibility</h1>
          </div>
          <div className="connections-empty">
            <div className="connections-empty-icon" style={{ animation: 'pulseGlow 1.5s ease-in-out infinite' }}>✦</div>
            <h3>Loading…</h3>
          </div>
        </div>
        <TabBar />
      </div>
    );
  }

  // User hasn't taken the quiz yet (truly no results)
  if (!results) {
    return (
      <div style={{ paddingBottom: 80 }}>
        <div className="connections-page">
          <div className="connections-page-header">
            <div className="logo">✦ Inner Maps ✦</div>
            <h1>Compatibility</h1>
          </div>
          <div className="connections-empty">
            <div className="connections-empty-icon">✦</div>
            <h3>Take the quiz first</h3>
            <p>Complete your Inner Maps profile to see compatibility with others.</p>
          </div>
        </div>
        <TabBar />
      </div>
    );
  }

  return (
    <div style={{ paddingBottom: 80 }}>
      <div className="connections-page">
        <div className="connections-page-header">
          <div className="logo">✦ Inner Maps ✦</div>
          <h1>Compatibility</h1>
          <p>See how your worlds align</p>
        </div>

        {connections.map((c, i) => (
          c.status === 'completed' ? (
            <div
              key={c.id ?? i}
              className="connection-person-card"
              onClick={() => handleViewCompat(i)}
              style={{ cursor: 'pointer' }}
            >
              <div className="connection-person-avatar">{c.name?.[0] ?? '?'}</div>
              <div className="connection-person-info">
                <div className="connection-person-name">{c.name}</div>
                <div className="connection-person-detail">
                  {c.results?.starSign?.sign} · {c.results?.cognitiveType} · {c.results?.enneagramDisplay}
                </div>
              </div>
              <div className="connection-person-status completed">View →</div>
            </div>
          ) : (
            <div key={c.id ?? i} className="connection-person-card">
              <div className="connection-person-avatar" style={{ background: 'var(--peach-pale)', color: 'var(--peach)' }}>⏳</div>
              <div className="connection-person-info">
                <div className="connection-person-name">{c.name}</div>
                <div className="connection-person-detail">
                  Invited {c.invitedDaysAgo} day{(c.invitedDaysAgo ?? 0) > 1 ? 's' : ''} ago
                </div>
              </div>
              <div className="connection-person-status pending">Pending</div>
            </div>
          )
        ))}

        <div
          className="connection-invite-card"
          onClick={() => setInviteModalOpen(true)}
          style={{ marginTop: connections.length > 0 ? 16 : 0, cursor: 'pointer' }}
        >
          <div className="connection-invite-icon">✦</div>
          <div className="connection-invite-text">Invite Someone</div>
          <div className="connection-invite-sub">Share your link and discover your compatibility</div>
          <button
            className="share-btn"
            onClick={(e) => { e.stopPropagation(); setInviteModalOpen(true); }}
            style={{ marginTop: 16, display: 'block', margin: '16px auto 0' }}
          >
            Invite
          </button>
        </div>
      </div>
      <TabBar />
    </div>
  );
}
