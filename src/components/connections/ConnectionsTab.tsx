'use client';

import { useEffect } from 'react';
import { useQuizStore } from '@/store/quiz-store';
import { analytics } from '@/lib/analytics';
import useAuth from '@/hooks/useAuth';
import TabBar from '@/components/ui/TabBar';

export default function ConnectionsTab() {
  const results = useQuizStore((s) => s.results);
  const restoringState = useQuizStore((s) => s.restoringState);
  const connections = useQuizStore((s) => s.connections);
  const connectionsLoading = useQuizStore((s) => s.connectionsLoading);
  const connectionsFetched = useQuizStore((s) => s.connectionsFetched);
  const loadConnections = useQuizStore((s) => s.loadConnections);
  const setInviteModalOpen = useQuizStore((s) => s.setInviteModalOpen);
  const setActiveConnection = useQuizStore((s) => s.setActiveConnection);
  const setScreen = useQuizStore((s) => s.setScreen);
  const setActiveTab = useQuizStore((s) => s.setActiveTab);
  const { user } = useAuth();

  // Refresh connections from DB each time this tab mounts
  useEffect(() => {
    if (user && !user.is_anonymous && results) {
      loadConnections(user.id);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, !!results]);

  function handleViewCompat(index: number) {
    analytics.connectionViewed();
    setActiveConnection(connections[index]);
    setScreen('compatibility');
    setActiveTab('compat');
  }

  // Only show loading while quiz/page.tsx is actively restoring state
  if (!results && restoringState) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
        <div style={{ fontSize: 32, animation: 'pulseGlow 1.5s ease-in-out infinite' }}>✦</div>
        <p style={{ fontSize: 14, color: 'var(--text-light)' }}>Loading your profile…</p>
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

  // Connections are being fetched or haven't been loaded yet — show loading
  // instead of flashing the empty invite-only state. This covers:
  //   1. Cached restore path: loadConnections fires before tab mounts (connectionsLoading=true)
  //   2. Direct mount: tab mounts before any fetch (connectionsFetched=false)
  if ((connectionsLoading || !connectionsFetched) && connections.length === 0) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
        <div style={{ fontSize: 32, animation: 'pulseGlow 1.5s ease-in-out infinite' }}>✦</div>
        <p style={{ fontSize: 14, color: 'var(--text-light)' }}>Loading connections…</p>
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
