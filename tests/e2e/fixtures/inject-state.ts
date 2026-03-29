import type { Page } from '@playwright/test';
import type { QuizAnswerSet } from './quiz-answers';

/**
 * Mock QuizResults object matching the QuizResults interface.
 * Use this to inject state via sessionStorage without running through the full quiz.
 */
export function buildMockResults(profile: QuizAnswerSet) {
  const connectionScores: Record<string, number> = { words: 0, acts: 0, gifts: 0, quality: 0, touch: 0 };
  // Simplified tally — good enough for E2E state injection
  const connectionNames: Record<string, string> = {
    words: 'Words of Affirmation', acts: 'Acts of Service',
    gifts: 'Gifts', quality: 'Quality Time', touch: 'Physical Touch',
  };

  // Build approximate connection scores from answers
  const connTypes = [
    ['words','acts'],['words','gifts'],['words','quality'],['words','touch'],
    ['acts','gifts'],['acts','quality'],['acts','touch'],['gifts','quality'],
    ['gifts','touch'],['quality','touch'],
  ];
  profile.connection.forEach((ans, i) => {
    if (i < connTypes.length) {
      connectionScores[connTypes[i][ans === 'a' ? 0 : 1]]++;
    }
  });
  const connectionSorted = Object.entries(connectionScores).sort((a, b) => b[1] - a[1]);

  const starSigns: Record<string, any> = {
    Pisces: { sign: 'Pisces', symbol: '\u2653', emoji: '\uD83D\uDC1F', dates: 'Feb 19 to Mar 20', tagline: 'Intuitive, compassionate, artistic', desc: '', month: [2,19,3,20] },
    Leo: { sign: 'Leo', symbol: '\u264C', emoji: '\uD83E\uDD81', dates: 'Jul 23 to Aug 22', tagline: 'Confident, dramatic, passionate', desc: '', month: [7,23,8,22] },
  };

  const enneagramNames: Record<number, string> = {
    1: 'The Reformer', 2: 'The Helper', 3: 'The Achiever', 4: 'The Individualist',
    5: 'The Investigator', 6: 'The Loyalist', 7: 'The Enthusiast', 8: 'The Challenger', 9: 'The Peacemaker',
  };

  return {
    cognitiveType: profile.expected.cognitiveType,
    cognitiveTypeName: 'The Campaigner',
    cognitiveTypeDesc: 'Creative, enthusiastic, and sociable free spirits.',
    attachmentStyle: profile.expected.attachmentStyle,
    attachmentDesc: 'Comfortable with closeness and confident in relationships.',
    anxiety: '2.0',
    avoidance: '2.0',
    connectionScores,
    connectionSorted,
    connectionNames,
    connectionDescs: {
      words: 'Desc', acts: 'Desc', gifts: 'Desc', quality: 'Desc', touch: 'Desc',
    },
    topConnection: profile.expected.topConnection,
    enneagramType: profile.expected.enneagramType,
    enneagramWing: profile.expected.enneagramType === 1 ? 9 : profile.expected.enneagramType - 1,
    enneagramName: enneagramNames[profile.expected.enneagramType] || 'Unknown',
    enneagramDisplay: `${profile.expected.enneagramType}w${profile.expected.enneagramType === 1 ? 9 : profile.expected.enneagramType - 1}`,
    starSign: starSigns[profile.expectedStarSign] || null,
  };
}

/**
 * Inject completed quiz state into sessionStorage so the page
 * restores directly to a given screen without running through the quiz.
 * Uses addInitScript to set state BEFORE the app JS runs on page load.
 */
export async function injectQuizState(
  page: Page,
  profile: QuizAnswerSet,
  screen: string = 'results',
  extras: Record<string, any> = {},
) {
  const results = buildMockResults(profile);
  const statePayload = {
    results,
    name: profile.name,
    birthMonth: profile.birthMonth,
    birthDay: profile.birthDay,
    screen,
    extras,
  };

  // addInitScript runs before any page JS — localStorage is ready before React hydrates.
  // The app reads from localStorage key 'im_redirect_state' via restoreStateFromSession().
  await page.addInitScript((payload) => {
    // Write the redirect-state format that the Zustand store reads on load
    const redirectState: Record<string, any> = {
      _ts: Date.now(),
      results: payload.results,
      userName: payload.name,
      birthMonth: payload.birthMonth,
      birthDay: payload.birthDay,
      screen: payload.screen,
    };
    for (const [k, v] of Object.entries(payload.extras)) {
      redirectState[k] = v;
    }
    localStorage.setItem('im_redirect_state', JSON.stringify(redirectState));

    // Also write to profile cache so the results page can read it without DB
    localStorage.setItem('im_profile_cache', JSON.stringify({
      userId: 'test-user-id-123',
      results: payload.results,
      userName: payload.name,
      birthMonth: payload.birthMonth,
      birthDay: payload.birthDay,
      email: '',
    }));
  }, statePayload);

  await page.goto('/quiz');
}
