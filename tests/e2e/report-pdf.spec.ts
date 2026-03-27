import { test, expect } from '@playwright/test';
import { mockSupabase } from './fixtures/mock-supabase';
import { GOLDEN_PATH } from './fixtures/quiz-answers';
import { buildMockResults } from './fixtures/inject-state';

test.beforeEach(async ({ page }) => {
  await mockSupabase(page);
});

test.describe('Individual Report & PDF', () => {
  /**
   * These tests require the purchasedIndividual flag to be set in the Zustand store.
   * The store only hydrates this from localStorage when checkPurchases(userId) is called
   * during restoreUserState — which requires a real or mocked auth session.
   *
   * For now, we test that the report _blocks_ access correctly (purchase gate works),
   * and that the results page upsell renders. Full report + PDF tests require the
   * E2E auth flow or store exposure (TODO when auth secrets are added to CI).
   */

  test('report screen redirects to results when not purchased', async ({ page }) => {
    const results = buildMockResults(GOLDEN_PATH);

    await page.addInitScript(({ results, name }: { results: any; name: string }) => {
      sessionStorage.setItem('im_results', JSON.stringify(results));
      sessionStorage.setItem('im_userName', name);
      sessionStorage.setItem('im_birthMonth', '3');
      sessionStorage.setItem('im_birthDay', '15');
      sessionStorage.setItem('im_screen', 'individualReport');
    }, { results, name: GOLDEN_PATH.name });

    await page.goto('/quiz');

    // Purchase gate should redirect to results since purchasedIndividual is false
    await expect(page.locator('.results-page')).toBeVisible({ timeout: 10000 });
  });

  test('results page shows upsell with report CTA', async ({ page }) => {
    const results = buildMockResults(GOLDEN_PATH);

    await page.addInitScript(({ results, name }: { results: any; name: string }) => {
      sessionStorage.setItem('im_results', JSON.stringify(results));
      sessionStorage.setItem('im_userName', name);
      sessionStorage.setItem('im_birthMonth', '3');
      sessionStorage.setItem('im_birthDay', '15');
      sessionStorage.setItem('im_screen', 'results');
    }, { results, name: GOLDEN_PATH.name });

    await page.goto('/quiz');
    await expect(page.locator('.results-page')).toBeVisible({ timeout: 10000 });

    // Upsell/lock elements should be present for unpurchased users
    const lockOrUpsell = page.locator('.lock-icon, .upsell-section, [class*="upsell"], [class*="lock"]');
    await expect(lockOrUpsell.first()).toBeVisible({ timeout: 5000 });
  });
});
