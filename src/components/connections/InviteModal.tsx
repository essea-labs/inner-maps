'use client';

import { useState, useEffect } from 'react';
import { useQuizStore } from '@/store/quiz-store';
import { createInvite } from '@/lib/db';
import useAuth from '@/hooks/useAuth';
import SignupForm from '@/components/quiz/SignupForm';

export default function InviteModal() {
  const inviteModalOpen = useQuizStore((s) => s.inviteModalOpen);
  const setInviteModalOpen = useQuizStore((s) => s.setInviteModalOpen);
  const userName = useQuizStore((s) => s.userName);
  const showToast = useQuizStore((s) => s.showToast);
  const { user, loading: authLoading } = useAuth();

  const [cachedCode, setCachedCode] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  const isRealUser = !!user && !user.is_anonymous;

  useEffect(() => {
    if (!inviteModalOpen || !isRealUser || cachedCode || generating) return;
    setGenerating(true);
    createInvite(user!.id)
      .then((code) => setCachedCode(code))
      .catch(() => showToast('Could not generate link — please try again.'))
      .finally(() => setGenerating(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inviteModalOpen, isRealUser, user?.id]);

  if (!inviteModalOpen) return null;
  if (authLoading) return null;

  const overlayStyle: React.CSSProperties = {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0,0,0,0.4)',
    zIndex: 200,
    display: 'flex',
    alignItems: 'flex-end',
  };

  const sheetStyle: React.CSSProperties = {
    width: '100%',
    maxWidth: 440,
    margin: '0 auto',
    background: 'var(--bg)',
    borderRadius: '20px 20px 0 0',
    maxHeight: '90vh',
    overflowY: 'auto',
  };

  // ── Logged-out: reuse the same bottom-sheet sign-in pattern as TabBar ──────
  if (!isRealUser) {
    return (
      <div
        style={overlayStyle}
        onClick={() => setInviteModalOpen(false)}
      >
        <div style={sheetStyle} onClick={(e) => e.stopPropagation()}>
          <SignupForm intent="invite" onClose={() => setInviteModalOpen(false)} />
        </div>
      </div>
    );
  }

  // ── Logged-in: simple link + share ─────────────────────────────────────────
  const inviteUrl = cachedCode ? `https://innermaps.io/i/${cachedCode}` : null;
  const displayLink = cachedCode
    ? `innermaps.io/i/${cachedCode}`
    : generating
    ? 'Generating link…'
    : 'innermaps.io/i/…';

  const shareText = `${userName ? userName + ' here! ' : ''}I just mapped my inner world — personality, attachment, enneagram and more. Take the quiz and let's see how we connect ✦`;

  async function handleCopyLink() {
    if (!inviteUrl) return;
    try {
      await navigator.clipboard.writeText(inviteUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      showToast('Could not copy — try selecting the link manually.');
    }
  }

  async function handleShare() {
    if (!inviteUrl) return;
    try {
      if (navigator.share) {
        await navigator.share({ title: 'Inner Maps Invite', text: shareText, url: inviteUrl });
      } else {
        await handleCopyLink();
      }
    } catch (err: any) {
      if (err?.name !== 'AbortError') {
        showToast('Could not share link — try copying manually.');
      }
    }
  }

  return (
    <div style={overlayStyle} onClick={() => setInviteModalOpen(false)}>
      <div style={sheetStyle} onClick={(e) => e.stopPropagation()}>
        <div className="signup-screen signup-screen--modal">
          <div className="logo">✦ Inner Maps ✦</div>
          <h2>Invite & <em>connect</em></h2>
          <p className="signup-subtitle">
            Share your link and see compatibility with anyone who takes the quiz.
          </p>

          <div className="signup-form">
            <div className="invite-link-box">
              <span className="invite-link-text">{displayLink}</span>
              <button
                className="invite-link-copy"
                onClick={handleCopyLink}
                disabled={!cachedCode}
                style={{
                  opacity: !cachedCode ? 0.4 : 1,
                  background: copied ? 'var(--peach)' : undefined,
                  color: copied ? '#fff' : undefined,
                  transition: 'background 0.2s, color 0.2s',
                  flexShrink: 0,
                }}
              >
                {copied ? '✓ Copied!' : 'Copy'}
              </button>
            </div>

            <button
              className="signup-cta"
              onClick={handleShare}
              disabled={!cachedCode}
              style={{ opacity: !cachedCode ? 0.6 : 1 }}
            >
              {generating ? 'Getting your link…' : 'Share invite ✦'}
            </button>

            <button className="signup-skip" onClick={() => setInviteModalOpen(false)}>Close</button>
          </div>
        </div>
      </div>
    </div>
  );
}
