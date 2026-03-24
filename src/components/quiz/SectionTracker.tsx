'use client';

import { useQuizStore } from '@/store/quiz-store';
import { SECTIONS } from '@/lib/quiz-data';

export default function SectionTracker() {
  const currentSection = useQuizStore((s) => s.currentSection);
  const currentQuestion = useQuizStore((s) => s.currentQuestion);

  const section = SECTIONS[currentSection];
  const sectionQ = currentQuestion + 1;
  const sectionTotal = section.questions;
  const sectionPct = sectionTotal > 0 ? Math.round((sectionQ / sectionTotal) * 100) : 0;

  return (
    <>
      <div className="section-tracker">
        {SECTIONS.map((s, i) => {
          let cls = 'section-dot';
          if (i < currentSection) cls += ' completed';
          if (i === currentSection) cls += ' active';
          return <div key={s.id} className={cls} title={s.name} />;
        })}
      </div>
      <div className="section-label" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '4px 0 2px', gap: 2 }}>
        <span style={{ textTransform: 'none', fontSize: 10 }}>
          Section {currentSection + 1} of {SECTIONS.length} · {section.icon} {section.name}{sectionTotal > 0 ? ` · Q${sectionQ} of ${sectionTotal}` : ''}
        </span>
      </div>
      {sectionTotal > 0 && (
        <div className="progress-container" style={{ margin: '0 0 4px' }}>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${sectionPct}%` }} />
          </div>
        </div>
      )}
    </>
  );
}
