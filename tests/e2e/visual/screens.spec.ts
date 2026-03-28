import { test, expect } from '@playwright/test';
import { mockSupabase } from '../fixtures/mock-supabase';
import { GOLDEN_PATH } from '../fixtures/quiz-answers';
import { injectQuizState } from '../fixtures/inject-state';

/**
 * Visual regression tests — capture screenshots of every screen.
 * First run generates baselines. Subsequent runs diff against them.
 * Run: npx playwright test tests/e2e/visual/ --update-snapshots (to update baselines)
 */

test.beforeEach(async ({ page }) => {
  await mockSupabase(page);
});

test.describe('Visual Regression: Screens', () => {
  test('landing page', async ({ page }) => {
    await page.goto('/quiz');
    await expect(page.locator('.landing')).toBeVisible();
    await expect(page).toHaveScreenshot('landing.png', { fullPage: true, maxDiffPixelRatio: 0.01 });
  });

  test('name input - empty', async ({ page }) => {
    await page.goto('/quiz');
    await page.getByRole('button', { name: 'Take the Quiz' }).click();
    await expect(page.locator('.name-screen')).toBeVisible();
    await expect(page).toHaveScreenshot('name-empty.png', { maxDiffPixelRatio: 0.01 });
  });

  test('name input - filled', async ({ page }) => {
    await page.goto('/quiz');
    await page.getByRole('button', { name: 'Take the Quiz' }).click();
    await page.locator('input.name-input').fill('Alexandra');
    await expect(page).toHaveScreenshot('name-filled.png', { maxDiffPixelRatio: 0.01 });
  });

  test('birthday picker', async ({ page }) => {
    await page.goto('/quiz');
    await page.getByRole('button', { name: 'Take the Quiz' }).click();
    await page.locator('input.name-input').fill('Test');
    await page.locator('button.nav-next').click();
    await expect(page.locator('.birthday-screen')).toBeVisible();
    await expect(page).toHaveScreenshot('birthday.png', { maxDiffPixelRatio: 0.01 });
  });

  test('birthday with star sign revealed', async ({ page }) => {
    await page.goto('/quiz');
    await page.getByRole('button', { name: 'Take the Quiz' }).click();
    await page.locator('input.name-input').fill('Test');
    await page.locator('button.nav-next').click();
    const selects = page.locator('select.birthday-select');
    await selects.first().selectOption('3');
    await selects.nth(1).selectOption('15');
    await expect(page.locator('.star-sign-name')).toBeVisible();
    await expect(page).toHaveScreenshot('birthday-sign-revealed.png', { maxDiffPixelRatio: 0.01 });
  });

  test('quiz - cognitive A/B question', async ({ page }) => {
    await page.goto('/quiz');
    await page.getByRole('button', { name: 'Take the Quiz' }).click();
    await page.locator('input.name-input').fill('Test');
    await page.locator('button.nav-next').click();
    const selects = page.locator('select.birthday-select');
    await selects.first().selectOption('3');
    await selects.nth(1).selectOption('15');
    await page.locator('button.nav-next').click();
    await expect(page.locator('.ab-card')).toHaveCount(2, { timeout: 5000 });
    await expect(page).toHaveScreenshot('quiz-cognitive.png', { maxDiffPixelRatio: 0.01 });
  });

  test('quiz - Likert question (attachment)', async ({ page }) => {
    await page.goto('/quiz');
    await page.getByRole('button', { name: 'Take the Quiz' }).click();
    await page.locator('input.name-input').fill('Test');
    await page.locator('button.nav-next').click();
    const selects = page.locator('select.birthday-select');
    await selects.first().selectOption('3');
    await selects.nth(1).selectOption('15');
    await page.locator('button.nav-next').click();
    // Answer all 15 cognitive questions to advance to attachment section
    for (let i = 0; i < 15; i++) {
      await page.locator('.ab-card').first().click();
      if (i < 14) await page.waitForTimeout(400);
    }
    // Skip mini-reveal
    await expect(page.locator('.mini-reveal')).toBeVisible({ timeout: 5000 });
    await page.locator('button.continue-btn').click({ timeout: 5000 });
    // Should now be on attachment (Likert) question
    await expect(page.locator('.scale-btn').first()).toBeVisible({ timeout: 5000 });
    await expect(page).toHaveScreenshot('quiz-likert.png', { maxDiffPixelRatio: 0.01 });
  });

  test('signup screen', async ({ page }) => {
    await injectQuizState(page, GOLDEN_PATH, 'signup');
    await expect(page.locator('.signup-screen')).toBeVisible({ timeout: 10000 });
    await expect(page).toHaveScreenshot('signup.png', { maxDiffPixelRatio: 0.01 });
  });

  test('results page', async ({ page }) => {
    await injectQuizState(page, GOLDEN_PATH, 'results');
    await expect(page.locator('.results-page')).toBeVisible({ timeout: 10000 });
    await expect(page).toHaveScreenshot('results.png', { fullPage: true, maxDiffPixelRatio: 0.01 });
  });

  test('connections page', async ({ page }) => {
    await injectQuizState(page, GOLDEN_PATH, 'connections');
    await expect(page.locator('.connections-page')).toBeVisible({ timeout: 10000 });
    await expect(page).toHaveScreenshot('connections.png', { fullPage: true, maxDiffPixelRatio: 0.01 });
  });

  test('compatibility page', async ({ page }) => {
    // Compat page requires activeConnection with results
    const mockConnection = {
      id: 'conn-1',
      name: 'Friend User',
      status: 'completed',
      results: {
        cognitiveType: 'ISTJ',
        cognitiveTypeName: 'The Inspector',
        cognitiveTypeDesc: 'Practical and fact-minded individuals.',
        attachmentStyle: 'Avoidant',
        attachmentDesc: 'Values independence in relationships.',
        anxiety: '1.5',
        avoidance: '4.0',
        connectionScores: { words: 1, acts: 1, gifts: 1, quality: 1, touch: 4 },
        connectionSorted: [['touch', 4], ['words', 1], ['acts', 1], ['gifts', 1], ['quality', 1]],
        connectionNames: { words: 'Words of Affirmation', acts: 'Acts of Service', gifts: 'Gifts', quality: 'Quality Time', touch: 'Physical Touch' },
        connectionDescs: { words: 'Desc', acts: 'Desc', gifts: 'Desc', quality: 'Desc', touch: 'Desc' },
        topConnection: 'Physical Touch',
        enneagramType: 9,
        enneagramWing: 8,
        enneagramName: 'The Peacemaker',
        enneagramDisplay: '9w8',
        starSign: { sign: 'Leo', symbol: '\u264C', emoji: '\uD83E\uDD81', dates: 'Jul 23 to Aug 22', tagline: 'Confident, dramatic, passionate', desc: '', month: [7,23,8,22] },
      },
    };
    await injectQuizState(page, GOLDEN_PATH, 'compatibility', {
      activeConnection: mockConnection,
    });
    await expect(page.locator('.compat-page')).toBeVisible({ timeout: 10000 });
    await expect(page).toHaveScreenshot('compatibility.png', { fullPage: true, maxDiffPixelRatio: 0.01 });
  });

  test('public profile page', async ({ page }) => {
    await page.goto('/profile/enfp-4w3-secure-qualitytime-pisces');
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveScreenshot('profile-public.png', { fullPage: true, maxDiffPixelRatio: 0.01 });
  });
});
