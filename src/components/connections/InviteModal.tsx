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

  // Cache the invite code so multiple shares reuse the same row
  const [cachedCode, setCachedCode] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);

  const isRealUser = !!user && !user.is_anonymous;

  // Auto-generate the invite code as soon as the modal opens for a real user
  useEffect(() => {
    if (!inviteModalOpen || !isRealUser || cachedCode || generating) return;
    setGenerating(true);
    createInvite(user!.id)
      .then((code) => setCachedCode(code))
      .catch(() => showToast('Could not generate link — please try again.'))
      .finally(() => setGenerating(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inviteModalOpen, isRealUser]);

  if (!inviteModalOpen) return null;

  // Wait for auth to resolve before deciding which UI to show (prevents flash)
  if (authLoading) return null;

  // Not authenticated → show signup prompt
  if (!isRealUser) {
    return (
      <div className="invite-modal-overlay" onClick={() => setInviteModalOpen(false)}>
        <div className="invite-modal" onClick={(e) => e.stopPropagation()}>
          <div className="invite-modal-handle" />
          <SignupForm intent="invite" onClose={() => setInviteModalOpen(false)} />
        </div>
      </div>
    );
  }

  const message = `${userName ? userName + ' here! ' : ''}I just mapped my inner world — personality, attachment, enneagram and more. Take the quiz and let's see how we connect ✦`;
  const inviteUrl = cachedCode ? `https://innermaps.io/i/${cachedCode}` : null;
  const displayLink = cachedCode ? `innermaps.io/i/${cachedCode}` : generating ? 'Generating link…' : 'innermaps.io/i/…';

  async function handleCopyLink() {
    if (!inviteUrl) return;
    try {
      await navigator.clipboard.writeText(inviteUrl);
      showToast('✓ Link copied!');
    } catch {
      showToast('Could not copy — try selecting the link manually.');
    }
  }

  async function handleShare() {
    if (!inviteUrl) return;
    try {
      if (navigator.share) {
        await navigator.share({ title: 'Inner Maps Invite', text: message, url: inviteUrl });
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
    <div className="invite-modal-overlay" onClick={() => setInviteModalOpen(false)}>
      <div className="invite-modal" onClick={(e) => e.stopPropagation()}>
        <div className="invite-modal-handle" />
        <h3>Invite Someone</h3>
        <p className="invite-modal-sub">Send your link so they can take the quiz and unlock your compatibility</p>
        <div className="invite-link-box">
          <span className="invite-link-text">{displayLink}</span>
          <button
            className="invite-link-copy"
            onClick={handleCopyLink}
            disabled={!cachedCode}
            style={{ opacity: !cachedCode ? 0.4 : 1 }}
          >
            Copy
          </button>
        </div>
        <div className="invite-message-preview">
          &ldquo;{message}&rdquo;
        </div>
        <div className="invite-share-buttons">
          <button
            className="share-btn primary"
            onClick={handleShare}
            disabled={!cachedCode}
            style={{ width: '100%', textAlign: 'center', justifyContent: 'center', opacity: !cachedCode ? 0.6 : 1 }}
          >
            {generating ? 'Getting your link…' : 'Invite'}
          </button>
        </div>
      </div>
    </div>
  );
}
