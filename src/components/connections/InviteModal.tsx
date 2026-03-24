'use client';

import { useQuizStore } from '@/store/quiz-store';

export default function InviteModal() {
  const inviteModalOpen = useQuizStore((s) => s.inviteModalOpen);
  const setInviteModalOpen = useQuizStore((s) => s.setInviteModalOpen);
  const userName = useQuizStore((s) => s.userName);
  const showToast = useQuizStore((s) => s.showToast);

  if (!inviteModalOpen) return null;

  const slug = userName ? userName.toLowerCase().replace(/\s+/g, '') : 'user';
  const inviteLink = `innermaps.io/invite/${slug}`;
  const message = `${userName ? userName + ' here! ' : ''}I just mapped my inner world — personality, attachment, enneagram and more. Take the quiz and let's see how we connect ✦`;

  function handleCopy() {
    navigator.clipboard?.writeText(inviteLink).then(() => {
      showToast('✓ Link copied!');
    });
  }

  function handleShare() {
    if (navigator.share) {
      navigator.share({ title: 'Inner Maps Invite', text: message, url: `https://${inviteLink}` });
    } else {
      handleCopy();
    }
  }

  return (
    <div className="invite-modal-overlay" onClick={() => setInviteModalOpen(false)}>
      <div className="invite-modal" onClick={(e) => e.stopPropagation()}>
        <div className="invite-modal-handle" />
        <h3>Share Your Map</h3>
        <p className="invite-modal-sub">Send your link so they can take the quiz and unlock your compatibility</p>
        <div className="invite-link-box">
          <span className="invite-link-text">{inviteLink}</span>
          <button className="invite-link-copy" onClick={handleCopy}>Copy</button>
        </div>
        <div className="invite-message-preview">
          &ldquo;{message}&rdquo;
        </div>
        <div className="invite-share-buttons">
          <button className="share-btn primary" onClick={handleShare}>↗ Share</button>
          <button className="share-btn" onClick={handleCopy}>🔗 Copy</button>
        </div>
      </div>
    </div>
  );
}
