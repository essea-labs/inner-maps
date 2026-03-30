'use client';

import { useState } from 'react';
import { useQuizStore } from '@/store/quiz-store';
import { analytics } from '@/lib/analytics';
import useAuth from '@/hooks/useAuth';

export default function FeedbackModal() {
  const feedbackModalOpen = useQuizStore((s) => s.feedbackModalOpen);
  const setFeedbackModalOpen = useQuizStore((s) => s.setFeedbackModalOpen);
  const showToast = useQuizStore((s) => s.showToast);
  const email = useQuizStore((s) => s.email);
  const screen = useQuizStore((s) => s.screen);

  const [message, setMessage] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [sending, setSending] = useState(false);
  const [emailPrefilled, setEmailPrefilled] = useState(false);

  // Pre-fill email from store when modal opens
  const { user } = useAuth();
  if (feedbackModalOpen && !emailPrefilled) {
    if (email) setContactEmail(email);
    setEmailPrefilled(true);
    analytics.feedbackModalOpened(screen);
  }

  if (!feedbackModalOpen) return null;

  function handleClose() {
    setFeedbackModalOpen(false);
    setMessage('');
    setContactEmail('');
    setEmailPrefilled(false);
  }

  async function handleSubmit() {
    if (!message.trim()) return;
    setSending(true);
    try {
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: message.trim(),
          email: contactEmail.trim() || null,
          page: screen,
        }),
      });
      if (!res.ok) throw new Error('Failed');
      analytics.feedbackSubmitted(screen, !!contactEmail.trim());
      showToast('Thanks for your feedback!');
      handleClose();
    } catch {
      showToast('Could not send feedback — please try again.');
    } finally {
      setSending(false);
    }
  }

  const overlayStyle: React.CSSProperties = {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0,0,0,0.4)',
    zIndex: 200,
    display: 'flex',
    alignItems: 'flex-end',
    justifyContent: 'center',
  };

  const sheetStyle: React.CSSProperties = {
    width: '100%',
    maxWidth: 440,
    background: 'var(--bg)',
    borderRadius: '20px 20px 0 0',
    maxHeight: '90vh',
    overflowY: 'auto',
    padding: '32px 24px 40px',
  };

  return (
    <div style={overlayStyle} onClick={handleClose}>
      <div style={sheetStyle} onClick={(e) => e.stopPropagation()}>
        <div style={{ textAlign: 'center', fontSize: 13, letterSpacing: 2, color: 'var(--text-light)', marginBottom: 16 }}>
          ✦ Inner Maps ✦
        </div>
        <h2 style={{
          fontFamily: 'var(--font-playfair-family)',
          fontSize: 24,
          fontWeight: 700,
          textAlign: 'center',
          marginBottom: 8,
          color: 'var(--text-primary)',
        }}>
          Share your <em style={{ color: 'var(--peach-deep)' }}>thoughts</em>
        </h2>
        <p style={{
          textAlign: 'center',
          fontSize: 15,
          color: 'var(--text-secondary)',
          marginBottom: 24,
          lineHeight: 1.5,
        }}>
          We&apos;d love to hear what you think — feedback, bugs, ideas, anything.
        </p>

        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="What's on your mind?"
          maxLength={2000}
          style={{
            width: '100%',
            minHeight: 120,
            padding: 16,
            border: '2px solid var(--peach-pale)',
            borderRadius: 10,
            fontFamily: 'var(--font-dm-sans-family)',
            fontSize: 15,
            color: 'var(--text-primary)',
            background: 'var(--card-bg)',
            resize: 'vertical',
            outline: 'none',
          }}
          onFocus={(e) => (e.currentTarget.style.borderColor = 'var(--peach)')}
          onBlur={(e) => (e.currentTarget.style.borderColor = 'var(--peach-pale)')}
        />

        <input
          type="email"
          value={contactEmail}
          onChange={(e) => setContactEmail(e.target.value)}
          placeholder="Email (optional — so we can follow up)"
          style={{
            width: '100%',
            padding: '14px 16px',
            border: '2px solid var(--peach-pale)',
            borderRadius: 10,
            fontFamily: 'var(--font-dm-sans-family)',
            fontSize: 15,
            color: 'var(--text-primary)',
            background: 'var(--card-bg)',
            outline: 'none',
            marginTop: 12,
          }}
          onFocus={(e) => (e.currentTarget.style.borderColor = 'var(--peach)')}
          onBlur={(e) => (e.currentTarget.style.borderColor = 'var(--peach-pale)')}
        />
        <div style={{ fontSize: 12, color: 'var(--text-light)', marginTop: 6 }}>
          Pre-filled if you&apos;re signed in
        </div>

        <button
          onClick={handleSubmit}
          disabled={sending || !message.trim()}
          style={{
            width: '100%',
            marginTop: 20,
            padding: '16px 24px',
            borderRadius: 50,
            border: 'none',
            background: 'var(--peach)',
            color: '#fff',
            fontFamily: 'var(--font-dm-sans-family)',
            fontSize: 15,
            fontWeight: 600,
            cursor: sending || !message.trim() ? 'default' : 'pointer',
            opacity: sending || !message.trim() ? 0.5 : 1,
            transition: 'opacity 0.2s',
          }}
        >
          {sending ? 'Sending…' : 'Send Feedback ✦'}
        </button>

        <button
          onClick={handleClose}
          style={{
            width: '100%',
            marginTop: 12,
            padding: 12,
            border: 'none',
            background: 'none',
            color: 'var(--text-light)',
            fontFamily: 'var(--font-dm-sans-family)',
            fontSize: 14,
            cursor: 'pointer',
          }}
        >
          Close
        </button>
      </div>
    </div>
  );
}
