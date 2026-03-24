'use client';

import { useState, useEffect } from 'react';
import { useQuizStore } from '@/store/quiz-store';

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

export default function BirthdayInput() {
  const birthMonth = useQuizStore((s) => s.birthMonth);
  const birthDay = useQuizStore((s) => s.birthDay);
  const starSign = useQuizStore((s) => s.starSign);
  const setBirthday = useQuizStore((s) => s.setBirthday);
  const setScreen = useQuizStore((s) => s.setScreen);

  const [month, setMonth] = useState<number>(birthMonth ?? 0);
  const [day, setDay] = useState<number>(birthDay ?? 0);

  useEffect(() => {
    if (month > 0 && day > 0) {
      setBirthday(month, day);
    }
  }, [month, day, setBirthday]);

  function handleContinue() {
    if (!month || !day) return;
    setScreen('quiz');
  }

  const canContinue = month > 0 && day > 0;

  return (
    <div className="birthday-screen">
      <div className="logo">✦ Inner Maps ✦</div>
      <h2>When&apos;s your <em>birthday?</em></h2>
      <p className="birthday-subtitle">We&apos;ll use this to reveal your star sign.</p>

      <div className="birthday-selects">
        <select
          className="birthday-select"
          value={month}
          onChange={(e) => setMonth(Number(e.target.value))}
        >
          <option value={0} disabled>Month</option>
          {MONTHS.map((m, i) => (
            <option key={m} value={i + 1}>{m}</option>
          ))}
        </select>
        <select
          className="birthday-select"
          value={day}
          onChange={(e) => setDay(Number(e.target.value))}
        >
          <option value={0} disabled>Day</option>
          {Array.from({ length: 31 }, (_, i) => (
            <option key={i + 1} value={i + 1}>{i + 1}</option>
          ))}
        </select>
      </div>

      {starSign && (
        <div className="star-sign-reveal">
          <span className="star-sign-emoji">{starSign.emoji}</span>
          <div className="star-sign-name">{starSign.sign} {starSign.symbol}</div>
          <div className="star-sign-tagline">{starSign.tagline}</div>
          <div style={{ fontSize: 14, color: 'var(--text-secondary)', marginTop: 12, lineHeight: 1.6, maxWidth: 320, textAlign: 'center' }}>
            {starSign.desc}
          </div>
        </div>
      )}

      <button
        className="cta-button"
        onClick={handleContinue}
        style={{ animation: 'none', opacity: canContinue ? 1 : 0.4, cursor: canContinue ? 'pointer' : 'not-allowed' }}
      >
        Continue
      </button>
    </div>
  );
}
