'use client';

import { useQuizStore } from '@/store/quiz-store';
import { SECTIONS, CONNECTION_QS, TYPE_NAMES } from '@/lib/quiz-data';

export default function MiniReveal() {
  const currentSection = useQuizStore((s) => s.currentSection);
  const answers = useQuizStore((s) => s.answers);
  const userName = useQuizStore((s) => s.userName);
  const continueMini = useQuizStore((s) => s.continueMini);

  // currentSection is already incremented to the NEXT section
  // 2 = just finished cognitive (1), 3 = just finished attachment (2), 4 = just finished connection (3)
  let emoji = '';
  let title = '';
  let result = '';
  let name = '';

  if (currentSection === 2) {
    // Just finished cognitive
    const dims = [
      { letters: ['E', 'I'], range: [0, 3] },
      { letters: ['S', 'N'], range: [3, 6] },
      { letters: ['T', 'F'], range: [6, 9] },
      { letters: ['J', 'P'], range: [9, 12] },
    ];
    let type = '';
    dims.forEach((d) => {
      let aCount = 0;
      for (let i = d.range[0]; i < d.range[1]; i++) {
        if (answers.cognitive[i] === 'a') aCount++;
      }
      type += aCount >= 2 ? d.letters[0] : d.letters[1];
    });
    emoji = '🧠';
    title = 'Personality Type';
    result = type;
    name = TYPE_NAMES[type] || '';
  } else if (currentSection === 3) {
    // Just finished attachment
    const anxietyScores = answers.attachment.slice(0, 4).map(Number);
    const avoidanceScores = answers.attachment.slice(4, 8).map(Number);
    const anxiety = anxietyScores.reduce((a, b) => a + b, 0) / 4;
    const avoidance = avoidanceScores.reduce((a, b) => a + b, 0) / 4;
    let style = '';
    if (anxiety <= 3 && avoidance <= 3) style = 'Secure';
    else if (anxiety > 3 && avoidance <= 3) style = 'Anxious';
    else if (anxiety <= 3 && avoidance > 3) style = 'Avoidant';
    else style = 'Fearful-Avoidant';
    emoji = '💛';
    title = 'Attachment Style';
    result = style;
    name = '';
  } else if (currentSection === 4) {
    // Just finished connection
    const scores: Record<string, number> = { words: 0, acts: 0, gifts: 0, quality: 0, touch: 0 };
    CONNECTION_QS.forEach((q, i) => {
      const answer = answers.connection[i];
      if (answer === 'a') scores[q.aType] = (scores[q.aType] || 0) + 1;
      else if (answer === 'b') scores[q.bType] = (scores[q.bType] || 0) + 1;
    });
    const connectionNames: Record<string, string> = {
      words: 'Words of Affirmation',
      acts: 'Acts of Service',
      gifts: 'Gifts',
      quality: 'Quality Time',
      touch: 'Physical Touch',
    };
    const top = Object.entries(scores).sort((a, b) => b[1] - a[1])[0];
    emoji = '🤝';
    title = 'Connection Style';
    result = connectionNames[top[0]];
    name = '';
  }

  const nextSection = SECTIONS[currentSection];
  const sectionTimes: Record<string, string> = {
    attachment: '~1 min',
    connection: '~2 min',
    enneagram: '~1 min',
  };
  const nextTime = sectionTimes[nextSection?.id] || '~1 min';
  const completedCount = currentSection - 1; // sections completed (not counting starsign)
  const totalSections = SECTIONS.length - 1; // exclude starsign section

  return (
    <div className="mini-reveal">
      <div className="mini-reveal-emoji">{emoji}</div>
      <h2>{userName ? `${userName}, your` : 'Your'} {title}</h2>
      <div className="mini-result">{result}</div>
      {name && <div className="mini-name">{name}</div>}
      {nextSection && (
        <div style={{ margin: '32px 0 24px', padding: '16px 20px', background: 'var(--cream)', borderRadius: 'var(--radius-sm)', textAlign: 'center' }}>
          <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: 1, textTransform: 'uppercase', color: 'var(--peach-deep)', marginBottom: 6 }}>
            ✓ Section {completedCount} of {totalSections} complete
          </div>
          <div style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 4 }}>
            Next up: <strong>{nextSection.icon} {nextSection.name}</strong>
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-light)' }}>
            {nextSection.questions} questions · {nextTime}
          </div>
        </div>
      )}
      <button className="continue-btn" onClick={continueMini}>Continue</button>
    </div>
  );
}
