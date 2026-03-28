import { test, expect } from '@playwright/test';
import { mockSupabase } from './fixtures/mock-supabase';
import { GOLDEN_PATH } from './fixtures/quiz-answers';
import { injectQuizState } from './fixtures/inject-state';

test.beforeEach(async ({ page }) => {
  await mockSupabase(page);
});

test.describe('Individual Report & PDF', () => {
  test('report screen redirects to results when not purchased', async ({ page }) => {
    await injectQuizState(page, GOLDEN_PATH, 'individualReport');

    // Purchase gate should redirect to results since purchasedIndividual is false
    await expect(page.locator('.results-page')).toBeVisible({ timeout: 10000 });
  });

  test('results page shows upsell with report CTA', async ({ page }) => {
    await injectQuizState(page, GOLDEN_PATH, 'results');
    await expect(page.locator('.results-page')).toBeVisible({ timeout: 10000 });

    // Upsell/lock elements should be present for unpurchased users
    const lockOrUpsell = page.locator('.lock-icon, .upsell-section, [class*="upsell"], [class*="lock"]');
    await expect(lockOrUpsell.first()).toBeVisible({ timeout: 5000 });
  });
});
