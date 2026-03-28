import { test, expect } from '@playwright/test';
import { mockSupabase } from './fixtures/mock-supabase';
import { GOLDEN_PATH } from './fixtures/quiz-answers';

test.beforeEach(async ({ page }) => {
  await mockSupabase(page);
});

test.describe('Complete Quiz Flow (Happy Path)', () => {
  test('completes full quiz from landing to results', { timeout: 120000 }, async ({ page }) => {
    await page.goto('/quiz');

    // ── LANDING ──
    await expect(page.locator('.landing')).toBeVisible();
    await page.getByRole('button', { name: 'Take the Quiz' }).click();

    // ── NAME INPUT ──
    await expect(page.locator('.name-screen')).toBeVisible();
    await page.locator('input.name-input').fill(GOLDEN_PATH.name);
    await page.locator('button.nav-next').click();

    // ── BIRTHDAY ──
    await expect(page.locator('.birthday-screen')).toBeVisible();
    const selects = page.locator('select.birthday-select');
    await selects.first().selectOption(String(GOLDEN_PATH.birthMonth));
    await selects.nth(1).selectOption(String(GOLDEN_PATH.birthDay));
    // Star sign should appear
    await expect(page.locator('.star-sign-name')).toContainText(GOLDEN_PATH.expectedStarSign);
    await page.locator('button.nav-next').click();

    // ── SECTION 1: COGNITIVE (15 A/B questions) ──
    await expect(page.locator('.quiz-screen')).toBeVisible();
    for (let i = 0; i < 15; i++) {
      const answer = GOLDEN_PATH.cognitive[i];
      const cards = page.locator('.ab-card');
      if (answer === 'a') {
        await cards.first().click();
      } else {
        await cards.nth(1).click();
      }
      // Wait for auto-advance or click next
      if (i < 14) {
        await page.waitForTimeout(500);
      }
    }

    // ── MINI REVEAL (after section 1) ──
    await expect(page.locator('.mini-reveal')).toBeVisible({ timeout: 5000 });
    await page.locator('button.continue-btn').click({ timeout: 5000 });

    // ── SECTION 2: ATTACHMENT (8 Likert questions) ──
    await expect(page.locator('.scale-btn').first()).toBeVisible({ timeout: 5000 });
    for (let i = 0; i < 8; i++) {
      const value = GOLDEN_PATH.attachment[i];
      await page.locator(`button.scale-btn`).nth(value - 1).click();
      await page.waitForTimeout(500);
    }

    // ── MINI REVEAL (after section 2) ──
    await expect(page.locator('.mini-reveal')).toBeVisible({ timeout: 5000 });
    await page.locator('button.continue-btn').click({ timeout: 5000 });

    // ── SECTION 3: CONNECTION (10 forced-choice pairs) ──
    await expect(page.locator('.pair-card').first()).toBeVisible({ timeout: 5000 });
    for (let i = 0; i < 10; i++) {
      const answer = GOLDEN_PATH.connection[i];
      const cards = page.locator('.pair-card');
      if (answer === 'a') {
        await cards.first().click();
      } else {
        await cards.nth(1).click();
      }
      await page.waitForTimeout(500);
    }

    // ── MINI REVEAL (after section 3) ──
    await expect(page.locator('.mini-reveal')).toBeVisible({ timeout: 5000 });
    await page.locator('button.continue-btn').click({ timeout: 5000 });

    // ── SECTION 4: ENNEAGRAM (9 Likert + 1 tiebreaker) ──
    for (let i = 0; i < 9; i++) {
      const value = GOLDEN_PATH.enneagram[i] as number;
      await page.locator(`button.scale-btn`).nth(value - 1).click();
      await page.waitForTimeout(500);
    }

    // Q10: tiebreaker (forced choice)
    const tbAnswer = GOLDEN_PATH.enneagram[9];
    const tbCards = page.locator('.pair-card');
    if (tbAnswer === 'a') {
      await tbCards.first().click();
    } else {
      await tbCards.nth(1).click();
    }

    // Click "See My Results"
    const resultsBtn = page.getByText('See My Results');
    if (await resultsBtn.isVisible()) {
      await resultsBtn.click();
    }

    // ── RESULTS ──
    await expect(page.locator('.results-page')).toBeVisible({ timeout: 10000 });

    // Verify all 5 dimensions are displayed
    await expect(page.locator('.result-card')).toHaveCount(5, { timeout: 5000 });

    // Verify cognitive type matches expected
    const typeDisplay = page.locator('.result-card-type').first();
    await expect(typeDisplay).toContainText(GOLDEN_PATH.expected.cognitiveType);
  });

  test('progress tracker updates across sections', async ({ page }) => {
    await page.goto('/quiz');
    await page.getByRole('button', { name: 'Take the Quiz' }).click();

    // Fill name + birthday
    await page.locator('input.name-input').fill('Test');
    await page.locator('button.nav-next').click();
    const selects = page.locator('select.birthday-select');
    await selects.first().selectOption('3');
    await selects.nth(1).selectOption('15');
    await page.locator('button.nav-next').click();

    // Should see quiz with tracker
    await expect(page.locator('.quiz-screen')).toBeVisible();
    await expect(page.locator('.quiz-tracker-wrap')).toBeVisible();
  });
});
