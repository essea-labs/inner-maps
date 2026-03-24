'use client';

import { useState } from 'react';
import { useQuizStore } from '@/store/quiz-store';

export default function NameInput() {
  const userName = useQuizStore((s) => s.userName);
  const setUserName = useQuizStore((s) => s.setUserName);
  const setScreen = useQuizStore((s) => s.setScreen);
  const [value, setValue] = useState(userName);

  function handleContinue() {
    const trimmed = value.trim();
    if (!trimmed) return;
    setUserName(trimmed);
    setScreen('birthday');
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' && value.trim()) handleContinue();
  }

  return (
    <div className="name-screen">
      <div className="logo">✦ Inner Maps ✦</div>
      <h2>First, <em>what&apos;s your name?</em></h2>
      <p className="name-subtitle">So your results feel personal to you.</p>
      <input
        type="text"
        className="name-input"
        placeholder="Your first name"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        autoComplete="given-name"
        autoCorrect="off"
        autoCapitalize="words"
        autoFocus
      />
      <button
        className="cta-button"
        onClick={handleContinue}
        style={{ animation: 'none', opacity: value.trim() ? 1 : 0.4, cursor: value.trim() ? 'pointer' : 'not-allowed' }}
      >
        Continue
      </button>
    </div>
  );
}
