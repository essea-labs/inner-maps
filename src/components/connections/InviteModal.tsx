'use client';

import { useState } from 'react';
import { useQuizStore } from '@/store/quiz-store';
import { createInvite } from '@/lib/db';
import useAuth from '@/hooks/useAuth';
import SignupForm from '@/components/quiz/SignupForm';

export default function InviteModal() {
  const inviteModalOpen = useQuizStore((s) => s.inviteModalOpen);
  const setInviteModalOpen = useQuizStore((s) => s.setInviteModalOpen);
  const userName = useQuizStore((s) => s.userName);
  const showToast = useQuizStore((s) => s.showToast);
  const { user } = useAuth();

  // Cache the invite code so multiple shares reuse the same row
  const [cachedCode, setCachedCode] = useState<string | null>(null);
  const [signupOpen, setSignupOpen] = useState(false);

  if (!inviteModalOpen) return null;

  const isRealUser = !!user && !user.is_anonymous;

  // If user is not authenticated, show signup prompt instead of invite UI
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

  async function handleShare() {
    try {
      let code = cachedCode;
      if (!code) {
        code = await createInvite(user!.id);
        setCachedCode(code);
      }
      const url = `https://innermaps.io/invite/${code}`;
      if (navigator.share) {
        await navigator.share({ title: 'Inner Maps Invite', text: message, url });
      } else {
        await navigator.clipboard?.writeText(url);
        showToast('✓ Link copied!');
      }
    } catch (err: any) {
      if (err?.name !== 'AbortError') {
        console.error('Share failed:', err);
        showToast('Could not share link — try copying manually.');
      }
    }
  }

  const displayLink = cachedCode
    ? `innermaps.io/invite/${cachedCode}`
    : 'innermaps.io/invite/…';

  return (
    <div className="invite-modal-overlay" onClick={() => setInviteModalOpen(false)}>
      <div className="invite-modal" onClick={(e) => e.stopPropagation()}>
        <div className="invite-modal-handle" />
        <h3>Invite Someone</h3>
        <p className="invite-modal-sub">Send your link so they can take the quiz and unlock your compatibility</p>
        <div className="invite-link-box">
          <span className="invite-link-text">{displayLink}</span>
        </div>
        <div className="invite-message-preview">
          &ldquo;{message}&rdquo;
        </div>
        <div className="invite-share-buttons">
          <button
            className="share-btn primary"
            onClick={handleShare}
            style={{ width: '100%', textAlign: 'center', justifyContent: 'center' }}
          >
            Invite
          </button>
        </div>
      </div>
    </div>
  );
}
