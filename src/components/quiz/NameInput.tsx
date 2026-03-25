'use client';

import { useState } from 'react';
import { useQuizStore } from '@/store/quiz-store';

export default function NameInput() {
  const userName = useQuizStore((s) => s.userName);
  const setUserName = useQuizStore((s) => s.setUserName);
  const setScreen = useQuizStore((s) => s.setScreen);
  const navigateBack = useQuizStore((s) => s.navigateBack);
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
    <div className="name-screen" style={{ paddingBottom: 120 }}>
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
      <div className="nav-buttons" style={{ flexDirection: 'column', gap: 8, alignItems: 'stretch' }}>
        <button
          className="nav-next"
          onClick={handleContinue}
          disabled={!value.trim()}
        >
          Continue
        </button>
        <button className="quiz-back-bottom" onClick={navigateBack}>Back</button>
      </div>
    </div>
  );
}
