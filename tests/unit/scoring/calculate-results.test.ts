import { describe, it, expect } from 'vitest';
import { calculateResults } from '@/lib/quiz-data';
import type { QuizAnswers, StarSign } from '@/lib/types';

const PISCES: StarSign = {
  sign: 'Pisces', symbol: '♓', emoji: '🐟',
  dates: 'Feb 19 to Mar 20', tagline: 'Intuitive, compassionate, artistic',
  desc: '', month: [2, 19, 3, 20],
};

function makeAnswers(overrides: Partial<QuizAnswers> = {}): QuizAnswers {
  return {
    cognitive: Array(12).fill('a'),
    attachment: Array(8).fill(3),
    connection: Array(10).fill('a'),
    enneagram: [5, 3, 3, 3, 3, 3, 3, 3, 3, 'a'],
    ...overrides,
  };
}

// ─── COGNITIVE TYPE SCORING ───

describe('Cognitive Type scoring', () => {
  it('all-A answers produce ESTJ', () => {
    const r = calculateResults(makeAnswers({ cognitive: Array(12).fill('a') }), PISCES);
    expect(r.cognitiveType).toBe('ESTJ');
  });

  it('all-B answers produce INFP', () => {
    const r = calculateResults(makeAnswers({ cognitive: Array(12).fill('b') }), PISCES);
    expect(r.cognitiveType).toBe('INFP');
  });

  it('2/3 A in E/I dimension selects E', () => {
    const cognitive = ['a', 'a', 'b', ...Array(9).fill('b')];
    const r = calculateResults(makeAnswers({ cognitive }), PISCES);
    expect(r.cognitiveType[0]).toBe('E');
  });

  it('1/3 A in E/I dimension selects I', () => {
    const cognitive = ['a', 'b', 'b', ...Array(9).fill('a')];
    const r = calculateResults(makeAnswers({ cognitive }), PISCES);
    expect(r.cognitiveType[0]).toBe('I');
  });

  it('2/3 A in S/N dimension selects S', () => {
    const cognitive = [...Array(3).fill('b'), 'a', 'a', 'b', ...Array(6).fill('b')];
    const r = calculateResults(makeAnswers({ cognitive }), PISCES);
    expect(r.cognitiveType[1]).toBe('S');
  });

  it('1/3 A in S/N dimension selects N', () => {
    const cognitive = [...Array(3).fill('a'), 'a', 'b', 'b', ...Array(6).fill('a')];
    const r = calculateResults(makeAnswers({ cognitive }), PISCES);
    expect(r.cognitiveType[1]).toBe('N');
  });

  it('2/3 A in T/F dimension selects T', () => {
    const cognitive = [...Array(6).fill('b'), 'a', 'a', 'b', ...Array(3).fill('b')];
    const r = calculateResults(makeAnswers({ cognitive }), PISCES);
    expect(r.cognitiveType[2]).toBe('T');
  });

  it('1/3 A in T/F dimension selects F', () => {
    const cognitive = [...Array(6).fill('a'), 'a', 'b', 'b', ...Array(3).fill('a')];
    const r = calculateResults(makeAnswers({ cognitive }), PISCES);
    expect(r.cognitiveType[2]).toBe('F');
  });

  it('2/3 A in J/P dimension selects J', () => {
    const cognitive = [...Array(9).fill('b'), 'a', 'a', 'b'];
    const r = calculateResults(makeAnswers({ cognitive }), PISCES);
    expect(r.cognitiveType[3]).toBe('J');
  });

  it('1/3 A in J/P dimension selects P', () => {
    const cognitive = [...Array(9).fill('a'), 'a', 'b', 'b'];
    const r = calculateResults(makeAnswers({ cognitive }), PISCES);
    expect(r.cognitiveType[3]).toBe('P');
  });

  it('produces ENFP with correct answers', () => {
    // E: 2a, I: 1a → E; S: 1a, N: 2a → N nope — a=S, b=N. So for N: need <2 a
    // E/I: indices 0-2, a=E. For E: 2+ a. 'a','a','b'
    // S/N: indices 3-5, a=S. For N: <2 a. 'b','b','b'
    // T/F: indices 6-8, a=T. For F: <2 a. 'b','b','b'
    // J/P: indices 9-11, a=J. For P: <2 a. 'b','b','b'
    const cognitive = ['a', 'a', 'b', 'b', 'b', 'b', 'b', 'b', 'b', 'b', 'b', 'b'];
    const r = calculateResults(makeAnswers({ cognitive }), PISCES);
    expect(r.cognitiveType).toBe('ENFP');
  });

  it('produces ISTJ with correct answers', () => {
    // I: <2 a in 0-2 → 'b','b','b'
    // S: ≥2 a in 3-5 → 'a','a','b'
    // T: ≥2 a in 6-8 → 'a','a','b'
    // J: ≥2 a in 9-11 → 'a','a','b'
    const cognitive = ['b', 'b', 'b', 'a', 'a', 'b', 'a', 'a', 'b', 'a', 'a', 'b'];
    const r = calculateResults(makeAnswers({ cognitive }), PISCES);
    expect(r.cognitiveType).toBe('ISTJ');
  });

  it('has a valid type name for all results', () => {
    const r = calculateResults(makeAnswers(), PISCES);
    expect(r.cognitiveTypeName).toBeTruthy();
    expect(r.cognitiveTypeName).not.toBe('Unknown');
  });

  it('has a type description for all results', () => {
    const r = calculateResults(makeAnswers(), PISCES);
    expect(r.cognitiveTypeDesc).toBeTruthy();
  });
});

// ─── ATTACHMENT STYLE SCORING ───

describe('Attachment Style scoring', () => {
  it('all 1s → Secure (low anxiety, low avoidance)', () => {
    const r = calculateResults(makeAnswers({ attachment: Array(8).fill(1) }), PISCES);
    expect(r.attachmentStyle).toBe('Secure');
  });

  it('all 5s → Fearful-Avoidant (high both)', () => {
    const r = calculateResults(makeAnswers({ attachment: Array(8).fill(5) }), PISCES);
    expect(r.attachmentStyle).toBe('Fearful-Avoidant');
  });

  it('high anxiety, low avoidance → Anxious', () => {
    // First 4 (anxiety) = 5, last 4 (avoidance) = 1
    const r = calculateResults(makeAnswers({ attachment: [5, 5, 5, 5, 1, 1, 1, 1] }), PISCES);
    expect(r.attachmentStyle).toBe('Anxious');
  });

  it('low anxiety, high avoidance → Avoidant', () => {
    const r = calculateResults(makeAnswers({ attachment: [1, 1, 1, 1, 5, 5, 5, 5] }), PISCES);
    expect(r.attachmentStyle).toBe('Avoidant');
  });

  it('boundary: avg exactly 3.0 = low (Secure when both at 3)', () => {
    const r = calculateResults(makeAnswers({ attachment: [3, 3, 3, 3, 3, 3, 3, 3] }), PISCES);
    expect(r.attachmentStyle).toBe('Secure');
  });

  it('boundary: avg 3.25 = high (Anxious when anxiety just above 3)', () => {
    // anxiety avg = 3.25 (>3), avoidance avg = 3 (<=3) → Anxious
    const r = calculateResults(makeAnswers({ attachment: [4, 3, 3, 3, 3, 3, 3, 3] }), PISCES);
    expect(r.attachmentStyle).toBe('Anxious');
  });

  it('stores anxiety as toFixed(1) string', () => {
    const r = calculateResults(makeAnswers({ attachment: [3, 3, 3, 3, 1, 1, 1, 1] }), PISCES);
    expect(r.anxiety).toBe('3.0');
  });

  it('stores avoidance as toFixed(1) string', () => {
    const r = calculateResults(makeAnswers({ attachment: [1, 1, 1, 1, 4, 4, 4, 4] }), PISCES);
    expect(r.avoidance).toBe('4.0');
  });

  it('has attachment description for all styles', () => {
    for (const att of [[1,1,1,1,1,1,1,1], [5,5,5,5,1,1,1,1], [1,1,1,1,5,5,5,5], [5,5,5,5,5,5,5,5]]) {
      const r = calculateResults(makeAnswers({ attachment: att }), PISCES);
      expect(r.attachmentDesc).toBeTruthy();
    }
  });
});

// ─── CONNECTION STYLE SCORING ───

describe('Connection Style scoring', () => {
  it('all A answers → "words" wins (most As are words type)', () => {
    // Looking at CONNECTION_QS: Q0 a=words, Q1 a=words, Q2 a=words, Q3 a=words
    // Q4 a=acts, Q5 a=acts, Q6 a=acts, Q7 a=gifts, Q8 a=gifts, Q9 a=quality
    // words: 4, acts: 3, gifts: 2, quality: 1, touch: 0
    const r = calculateResults(makeAnswers({ connection: Array(10).fill('a') }), PISCES);
    expect(r.topConnection).toBe('Words of Affirmation');
  });

  it('all B answers → touch has highest B count', () => {
    // B types: Q0=acts, Q1=gifts, Q2=quality, Q3=touch, Q4=gifts, Q5=quality, Q6=touch, Q7=quality, Q8=touch, Q9=touch
    // touch: 4, quality: 3, gifts: 2, acts: 1, words: 0
    const r = calculateResults(makeAnswers({ connection: Array(10).fill('b') }), PISCES);
    expect(r.topConnection).toBe('Physical Touch');
  });

  it('connection scores are tallied correctly', () => {
    const r = calculateResults(makeAnswers({ connection: Array(10).fill('a') }), PISCES);
    expect(r.connectionScores.words).toBe(4);
    expect(r.connectionScores.acts).toBe(3);
    expect(r.connectionScores.gifts).toBe(2);
    expect(r.connectionScores.quality).toBe(1);
    expect(r.connectionScores.touch).toBe(0);
  });

  it('connectionSorted is ordered descending by score', () => {
    const r = calculateResults(makeAnswers({ connection: Array(10).fill('a') }), PISCES);
    for (let i = 0; i < r.connectionSorted.length - 1; i++) {
      expect(r.connectionSorted[i][1]).toBeGreaterThanOrEqual(r.connectionSorted[i + 1][1]);
    }
  });

  it('returns connection names and descriptions', () => {
    const r = calculateResults(makeAnswers(), PISCES);
    expect(Object.keys(r.connectionNames)).toHaveLength(5);
    expect(Object.keys(r.connectionDescs)).toHaveLength(5);
    expect(r.connectionNames.words).toBe('Words of Affirmation');
  });
});

// ─── ENNEAGRAM SCORING ───

describe('Enneagram scoring', () => {
  it('highest Likert score wins as core type', () => {
    // Type 1 gets score 5, all others get 1
    const enneagram = [5, 1, 1, 1, 1, 1, 1, 1, 1, 'a'] as (number | string | null)[];
    const r = calculateResults(makeAnswers({ enneagram }), PISCES);
    expect(r.enneagramType).toBe(1);
  });

  it('Q10 tiebreaker "a" adds to first-highest', () => {
    // Types 1 and 2 tied at 5, rest at 1. Q10='a' boosts type 1 (sorted first)
    const enneagram = [5, 5, 1, 1, 1, 1, 1, 1, 1, 'a'] as (number | string | null)[];
    const r = calculateResults(makeAnswers({ enneagram }), PISCES);
    expect(r.enneagramType).toBe(1);
  });

  it('Q10 tiebreaker "b" adds to second-highest', () => {
    // Types 1 and 2 tied at 5, rest at 1. Q10='b' boosts type 2
    const enneagram = [5, 5, 1, 1, 1, 1, 1, 1, 1, 'b'] as (number | string | null)[];
    const r = calculateResults(makeAnswers({ enneagram }), PISCES);
    expect(r.enneagramType).toBe(2);
  });

  it('wing is adjacent type with higher score', () => {
    // Core type 5 (index 4 = highest). Adjacent: 4 and 6.
    // Type 4 score = 4, Type 6 score = 2 → wing = 4
    const enneagram = [1, 1, 1, 4, 5, 2, 1, 1, 1, 'a'] as (number | string | null)[];
    const r = calculateResults(makeAnswers({ enneagram }), PISCES);
    expect(r.enneagramType).toBe(5);
    expect(r.enneagramWing).toBe(4);
  });

  it('wing wraps: type 1 checks types 9 and 2', () => {
    // Core type 1 (index 0 = highest). Adjacent: 9 and 2.
    // Type 9 score = 3, Type 2 score = 2 → wing = 9
    const enneagram = [5, 2, 1, 1, 1, 1, 1, 1, 3, 'a'] as (number | string | null)[];
    const r = calculateResults(makeAnswers({ enneagram }), PISCES);
    expect(r.enneagramType).toBe(1);
    expect(r.enneagramWing).toBe(9);
  });

  it('wing wraps: type 9 checks types 8 and 1', () => {
    // Core type 9 (index 8 = highest). Adjacent: 8 and 1.
    // Type 8 score = 2, Type 1 score = 3 → wing = 1
    const enneagram = [3, 1, 1, 1, 1, 1, 1, 2, 5, 'a'] as (number | string | null)[];
    const r = calculateResults(makeAnswers({ enneagram }), PISCES);
    expect(r.enneagramType).toBe(9);
    expect(r.enneagramWing).toBe(1);
  });

  it('enneagramDisplay format is "Xw Y"', () => {
    const r = calculateResults(makeAnswers({ enneagram: [5, 3, 1, 1, 1, 1, 1, 1, 1, 'a'] }), PISCES);
    expect(r.enneagramDisplay).toMatch(/^\dw\d$/);
  });

  it('enneagramName corresponds to core type', () => {
    const enneagram = [1, 1, 1, 5, 1, 1, 1, 1, 1, 'a'] as (number | string | null)[];
    const r = calculateResults(makeAnswers({ enneagram }), PISCES);
    expect(r.enneagramType).toBe(4);
    expect(r.enneagramName).toBe('The Individualist');
  });

  it('all 9 types are reachable as core type', () => {
    for (let t = 1; t <= 9; t++) {
      const enn = Array(9).fill(1) as (number | string | null)[];
      enn[t - 1] = 5;
      enn.push('a');
      const r = calculateResults(makeAnswers({ enneagram: enn }), PISCES);
      expect(r.enneagramType).toBe(t);
    }
  });
});

// ─── STAR SIGN ───

describe('Star Sign in results', () => {
  it('star sign is passed through to results', () => {
    const r = calculateResults(makeAnswers(), PISCES);
    expect(r.starSign).toBe(PISCES);
    expect(r.starSign!.sign).toBe('Pisces');
  });

  it('null star sign is preserved', () => {
    const r = calculateResults(makeAnswers(), null);
    expect(r.starSign).toBeNull();
  });
});

// ─── FULL INTEGRATION ───

describe('calculateResults integration', () => {
  it('returns all required fields', () => {
    const r = calculateResults(makeAnswers(), PISCES);
    expect(r.cognitiveType).toBeTruthy();
    expect(r.cognitiveTypeName).toBeTruthy();
    expect(r.cognitiveTypeDesc).toBeTruthy();
    expect(r.attachmentStyle).toBeTruthy();
    expect(r.attachmentDesc).toBeTruthy();
    expect(r.anxiety).toBeTruthy();
    expect(r.avoidance).toBeTruthy();
    expect(r.connectionScores).toBeTruthy();
    expect(r.connectionSorted).toBeTruthy();
    expect(r.topConnection).toBeTruthy();
    expect(r.enneagramType).toBeGreaterThanOrEqual(1);
    expect(r.enneagramType).toBeLessThanOrEqual(9);
    expect(r.enneagramWing).toBeGreaterThanOrEqual(1);
    expect(r.enneagramWing).toBeLessThanOrEqual(9);
    expect(r.enneagramDisplay).toBeTruthy();
    expect(r.enneagramName).toBeTruthy();
  });
});
