'use client';

import { useEffect, useRef } from 'react';
import { useQuizStore } from '@/store/quiz-store';
import { SECTIONS, COGNITIVE_QS, ATTACHMENT_QS, CONNECTION_QS, ENNEAGRAM_QS } from '@/lib/quiz-data';
import SectionTracker from './SectionTracker';

// ===== A/B (Cognitive) Question =====
function CognitiveQuestion() {
  const currentQuestion = useQuizStore((s) => s.currentQuestion);
  const answers = useQuizStore((s) => s.answers);
  const answerCognitive = useQuizStore((s) => s.answerCognitive);
  const nextQuestion = useQuizStore((s) => s.nextQuestion);
  const autoAdvanceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const q = COGNITIVE_QS[currentQuestion];
  const sel = answers.cognitive[currentQuestion];

  function handleAnswer(value: string) {
    answerCognitive(currentQuestion, value);
    if (autoAdvanceRef.current) clearTimeout(autoAdvanceRef.current);
    autoAdvanceRef.current = setTimeout(() => nextQuestion(), 400);
  }

  useEffect(() => {
    return () => { if (autoAdvanceRef.current) clearTimeout(autoAdvanceRef.current); };
  }, []);

  return (
    <>
      <div className="question-text">{q.q}</div>
      <div className="ab-options">
        <div className={`ab-card${sel === 'a' ? ' selected' : ''}`} onClick={() => handleAnswer('a')}>
          <div className="ab-card-label">A</div>
          <div className="ab-card-text">{q.a}</div>
        </div>
        <div className={`ab-card${sel === 'b' ? ' selected' : ''}`} onClick={() => handleAnswer('b')}>
          <div className="ab-card-label">B</div>
          <div className="ab-card-text">{q.b}</div>
        </div>
      </div>
    </>
  );
}

// ===== Likert Scale (Attachment) Question =====
function AttachmentQuestion() {
  const currentQuestion = useQuizStore((s) => s.currentQuestion);
  const answers = useQuizStore((s) => s.answers);
  const answerAttachment = useQuizStore((s) => s.answerAttachment);
  const nextQuestion = useQuizStore((s) => s.nextQuestion);
  const autoAdvanceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const q = ATTACHMENT_QS[currentQuestion];
  const sel = answers.attachment[currentQuestion];

  function handleAnswer(value: number) {
    answerAttachment(currentQuestion, value);
    if (autoAdvanceRef.current) clearTimeout(autoAdvanceRef.current);
    autoAdvanceRef.current = setTimeout(() => nextQuestion(), 400);
  }

  useEffect(() => {
    return () => { if (autoAdvanceRef.current) clearTimeout(autoAdvanceRef.current); };
  }, []);

  return (
    <>
      <div className="question-instruction">How much does this sound like you?</div>
      <div className="scale-statement">&ldquo;{q.q}&rdquo;</div>
      <div className="scale-options">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            className={`scale-btn${sel === n ? ' selected' : ''}`}
            onClick={() => handleAnswer(n)}
          >
            {n}
          </button>
        ))}
      </div>
      <div className="scale-labels">
        <span>Not me at all</span>
        <span>This is exactly me</span>
      </div>
    </>
  );
}

// ===== Pair (Connection) Question =====
function ConnectionQuestion() {
  const currentQuestion = useQuizStore((s) => s.currentQuestion);
  const answers = useQuizStore((s) => s.answers);
  const answerConnection = useQuizStore((s) => s.answerConnection);
  const nextQuestion = useQuizStore((s) => s.nextQuestion);
  const autoAdvanceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const q = CONNECTION_QS[currentQuestion];
  const sel = answers.connection[currentQuestion];

  function handleAnswer(value: string) {
    answerConnection(currentQuestion, value);
    if (autoAdvanceRef.current) clearTimeout(autoAdvanceRef.current);
    autoAdvanceRef.current = setTimeout(() => nextQuestion(), 400);
  }

  useEffect(() => {
    return () => { if (autoAdvanceRef.current) clearTimeout(autoAdvanceRef.current); };
  }, []);

  return (
    <>
      <div className="question-text">{q.q}</div>
      <div className="pair-options">
        <div className={`pair-card${sel === 'a' ? ' selected' : ''}`} onClick={() => handleAnswer('a')}>
          <div className="pair-card-text">{q.a}</div>
        </div>
        <div className="pair-divider">or</div>
        <div className={`pair-card${sel === 'b' ? ' selected' : ''}`} onClick={() => handleAnswer('b')}>
          <div className="pair-card-text">{q.b}</div>
        </div>
      </div>
    </>
  );
}

// ===== Enneagram Question (Likert Q1-9 + tiebreaker Q10) =====
function EnneagramQuestion({ isLastQ }: { isLastQ: boolean }) {
  const currentQuestion = useQuizStore((s) => s.currentQuestion);
  const answers = useQuizStore((s) => s.answers);
  const answerEnneagram = useQuizStore((s) => s.answerEnneagram);
  const nextQuestion = useQuizStore((s) => s.nextQuestion);
  const autoAdvanceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => { if (autoAdvanceRef.current) clearTimeout(autoAdvanceRef.current); };
  }, []);

  if (currentQuestion < 9) {
    // Q1-9: Likert scale (1-7)
    const q = ENNEAGRAM_QS[currentQuestion];
    const sel = answers.enneagram[currentQuestion];

    function handleAnswer(value: number) {
      answerEnneagram(currentQuestion, value);
      if (isLastQ) return; // last Q: let the button handle advance
      if (autoAdvanceRef.current) clearTimeout(autoAdvanceRef.current);
      autoAdvanceRef.current = setTimeout(() => nextQuestion(), 400);
    }

    return (
      <>
        <div className="question-instruction">How much does this resonate with who you naturally are?</div>
        <div className="enneagram-statement">&ldquo;{q.q}&rdquo;</div>
        <div className="scale-options">
          {[1, 2, 3, 4, 5, 6, 7].map((n) => (
            <button
              key={n}
              className={`scale-btn${sel === n ? ' selected' : ''}`}
              onClick={() => handleAnswer(n)}
            >
              {n}
            </button>
          ))}
        </div>
        <div className="scale-labels">
          <span>Not me at all</span>
          <span>This IS me</span>
        </div>
      </>
    );
  }

  // Q10: Dynamic 3-way tiebreaker — compare top 3 types with ipsative normalization
  const rawEnn = Array(10).fill(0);
  answers.enneagram.slice(0, 9).forEach((v, i) => { rawEnn[i + 1] = Number(v) || 0; });
  const ennMean = rawEnn.slice(1).reduce((a, b) => a + b, 0) / 9;
  const ennNorm = Array(10).fill(0);
  for (let t = 1; t <= 9; t++) { ennNorm[t] = rawEnn[t] - ennMean; }
  const top3 = [1, 2, 3, 4, 5, 6, 7, 8, 9]
    .sort((a, b) => ennNorm[b] - ennNorm[a])
    .slice(0, 3);
  const typeA = top3[0];
  const typeB = top3[1];
  const typeC = top3[2];
  const sel = answers.enneagram[9];

  function handleTiebreaker(value: string) {
    answerEnneagram(9, value);
    if (isLastQ) return; // let the "See My Results" button handle advance
    if (autoAdvanceRef.current) clearTimeout(autoAdvanceRef.current);
    autoAdvanceRef.current = setTimeout(() => nextQuestion(), 400);
  }

  return (
    <>
      <div className="question-instruction">Last one — which of these feels most like your home base?</div>
      <div className="pair-options">
        <div className={`pair-card${sel === 'a' ? ' selected' : ''}`} onClick={() => handleTiebreaker('a')}>
          <div className="pair-card-text">{ENNEAGRAM_QS[typeA - 1].q}</div>
        </div>
        <div className="pair-divider">or</div>
        <div className={`pair-card${sel === 'b' ? ' selected' : ''}`} onClick={() => handleTiebreaker('b')}>
          <div className="pair-card-text">{ENNEAGRAM_QS[typeB - 1].q}</div>
        </div>
        <div className="pair-divider">or</div>
        <div className={`pair-card${sel === 'c' ? ' selected' : ''}`} onClick={() => handleTiebreaker('c')}>
          <div className="pair-card-text">{ENNEAGRAM_QS[typeC - 1].q}</div>
        </div>
      </div>
    </>
  );
}

// ===== Main QuizScreen =====
export default function QuizScreen() {
  const currentSection = useQuizStore((s) => s.currentSection);
  const currentQuestion = useQuizStore((s) => s.currentQuestion);
  const answers = useQuizStore((s) => s.answers);
  const nextQuestion = useQuizStore((s) => s.nextQuestion);
  const navigateBack = useQuizStore((s) => s.navigateBack);

  // Scroll to top on every question change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [currentSection, currentQuestion]);

  const section = SECTIONS[currentSection];
  // currentSection: 1=cognitive, 2=attachment, 3=connection, 4=enneagram
  const isLastSection = currentSection === SECTIONS.length - 1;
  const isLastQ = isLastSection && currentQuestion === section.questions - 1;
  // Get current answer
  const sectionKey = section.id as keyof typeof answers;
  const currentAnswer = answers[sectionKey]?.[currentQuestion] ?? null;
  // Always show back — navigateBack handles returning to birthday from Q1
  const showBack = true;

  let questionContent: React.ReactNode;
  if (section.id === 'cognitive') {
    questionContent = <CognitiveQuestion />;
  } else if (section.id === 'attachment') {
    questionContent = <AttachmentQuestion />;
  } else if (section.id === 'connection') {
    questionContent = <ConnectionQuestion />;
  } else {
    questionContent = <EnneagramQuestion isLastQ={isLastQ} />;
  }

  return (
    <div className="quiz-screen">
      <div className="quiz-top-row">
        <div />
        <div className="quiz-tracker-wrap">
          <SectionTracker />
        </div>
        <div />
      </div>
      <div className="question-area" key={`${currentSection}-${currentQuestion}`}>
        {questionContent}
      </div>
      {isLastQ ? (
        <div className="nav-buttons" style={{ flexDirection: 'column', gap: 8, alignItems: 'stretch' }}>
          <button
            className="nav-next"
            onClick={nextQuestion}
            disabled={currentAnswer === null}
          >
            See My Results ✦
          </button>
          <button className="quiz-back-bottom" onClick={navigateBack}>Back</button>
        </div>
      ) : (
        <div className="nav-buttons">
          {showBack && (
            <button className="quiz-back-bottom" onClick={navigateBack}>Back</button>
          )}
        </div>
      )}
    </div>
  );
}
