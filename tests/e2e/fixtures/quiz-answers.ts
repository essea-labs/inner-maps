/**
 * Deterministic quiz answer sets that produce known personality profiles.
 * Used by E2E tests to click through the quiz with predictable outcomes.
 */

export interface QuizAnswerSet {
  /** Name to enter */
  name: string;
  /** Birthday month (1-12) */
  birthMonth: number;
  /** Birthday day (1-31) */
  birthDay: number;
  /** Expected star sign */
  expectedStarSign: string;
  /** 12 cognitive answers: 'a' or 'b' */
  cognitive: ('a' | 'b')[];
  /** 8 attachment answers: 1-5 */
  attachment: number[];
  /** 10 connection answers: 'a' or 'b' */
  connection: ('a' | 'b')[];
  /** 9 enneagram Likert (1-5) + 1 tiebreaker ('a' or 'b') */
  enneagram: (number | 'a' | 'b')[];
  /** Expected results */
  expected: {
    cognitiveType: string;
    attachmentStyle: string;
    topConnection: string;
    enneagramType: number;
  };
}

/** ENFP, Secure, Words of Affirmation, Type 1, Pisces */
export const GOLDEN_PATH: QuizAnswerSet = {
  name: 'Test User',
  birthMonth: 3,
  birthDay: 15,
  expectedStarSign: 'Pisces',
  // E: Q0-2 → a,a,b (2a=E), N: Q3-5 → b,b,b (0a=N), F: Q6-8 → b,b,b (0a=F), P: Q9-11 → b,b,b (0a=P)
  cognitive: ['a', 'a', 'b', 'b', 'b', 'b', 'b', 'b', 'b', 'b', 'b', 'b'],
  // All low → Secure
  attachment: [1, 2, 1, 2, 1, 2, 1, 2],
  // All A → Words of Affirmation wins (4 tallies)
  connection: ['a', 'a', 'a', 'a', 'a', 'a', 'a', 'a', 'a', 'a'],
  // Type 1 gets 5, rest get 1-2, tiebreaker confirms
  enneagram: [5, 2, 1, 2, 1, 2, 1, 2, 1, 'a'],
  expected: {
    cognitiveType: 'ENFP',
    attachmentStyle: 'Secure',
    topConnection: 'Words of Affirmation',
    enneagramType: 1,
  },
};

/** ISTJ, Avoidant, Physical Touch, Type 9, Leo */
export const CONTRASTING_PROFILE: QuizAnswerSet = {
  name: 'Friend User',
  birthMonth: 8,
  birthDay: 10,
  expectedStarSign: 'Leo',
  // I: Q0-2 → b,b,b (0a=I), S: Q3-5 → a,a,a (3a=S), T: Q6-8 → a,a,a (3a=T), J: Q9-11 → a,a,a (3a=J)
  cognitive: ['b', 'b', 'b', 'a', 'a', 'a', 'a', 'a', 'a', 'a', 'a', 'a'],
  // Low anxiety, high avoidance → Avoidant
  attachment: [1, 1, 1, 1, 5, 5, 5, 5],
  // All B → Physical Touch wins (4 tallies)
  connection: ['b', 'b', 'b', 'b', 'b', 'b', 'b', 'b', 'b', 'b'],
  // Type 9 gets 5, rest get low
  enneagram: [1, 1, 1, 1, 1, 1, 1, 1, 5, 'a'],
  expected: {
    cognitiveType: 'ISTJ',
    attachmentStyle: 'Avoidant',
    topConnection: 'Physical Touch',
    enneagramType: 9,
  },
};
