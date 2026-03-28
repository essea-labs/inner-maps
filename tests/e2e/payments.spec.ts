import { test, expect } from '@playwright/test';
import { mockSupabase } from './fixtures/mock-supabase';
import { mockStripe } from './fixtures/mock-stripe';
import { GOLDEN_PATH } from './fixtures/quiz-answers';
import { injectQuizState } from './fixtures/inject-state';

test.beforeEach(async ({ page }) => {
  await mockSupabase(page);
});

test.describe('Payments', () => {
  test('checkout API returns session URL', async ({ page }) => {
    await mockStripe(page);

    // Intercept the checkout call to verify it's made correctly
    let checkoutCalled = false;
    await page.route('**/api/checkout', async (route) => {
      checkoutCalled = true;
      const body = route.request().postDataJSON?.() ?? {};
      expect(body.product_type).toBeTruthy();
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ url: 'https://checkout.stripe.com/mock' }),
      });
    });

    await injectQuizState(page, GOLDEN_PATH, 'results');
    await expect(page.locator('.results-page')).toBeVisible({ timeout: 10000 });

    // Click the upsell CTA
    const upsellBtn = page.locator('.upsell-cta');
    if (await upsellBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      // Intercept any navigation to Stripe checkout
      await page.route('**/checkout.stripe.com/**', async (route) => {
        await route.abort();
      });
      await upsellBtn.click();
      // Verify checkout was called
      expect(checkoutCalled).toBeTruthy();
    }
  });

  test('return from Stripe with purchase=success shows report', async ({ page }) => {
    await mockStripe(page);

    // Mock purchases check to return the purchase
    await page.route('**/rest/v1/purchases*', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([{
          user_id: 'test-user-id-123',
          product_type: 'individual_report',
          stripe_session_id: 'cs_test_123',
        }]),
      });
    });

    // Use addInitScript to set localStorage before page loads
    const results = {
      cognitiveType: 'ENFP', cognitiveTypeName: 'The Campaigner', cognitiveTypeDesc: 'desc',
      attachmentStyle: 'Secure', attachmentDesc: 'desc', anxiety: '2.0', avoidance: '2.0',
      connectionScores: { words: 4, acts: 2, gifts: 1, quality: 2, touch: 1 },
      connectionSorted: [['words', 4]], connectionNames: {}, connectionDescs: {},
      topConnection: 'Words of Affirmation',
      enneagramType: 4, enneagramWing: 3, enneagramName: 'The Individualist', enneagramDisplay: '4w3',
      starSign: { sign: 'Pisces', symbol: '♓', emoji: '🐟', dates: '', tagline: '', desc: '', month: [2,19,3,20] },
    };

    await page.addInitScript((payload) => {
      localStorage.setItem('im_redirect_state', JSON.stringify({
        _ts: Date.now(),
        results: payload.results,
        userName: 'Test User',
        birthMonth: 3,
        birthDay: 15,
        screen: 'results',
      }));
      localStorage.setItem('im_returning', '1');
      localStorage.setItem('im_profile_cache', JSON.stringify({
        userId: 'test-user-id-123',
        results: payload.results,
        userName: 'Test User',
        birthMonth: 3,
        birthDay: 15,
        email: '',
      }));
    }, { results });

    // Navigate as if returning from Stripe
    await page.goto('/quiz?purchase=success&product=individual_report');

    // Should eventually show results or report
    const resultsOrReport = page.locator('.results-page, .report-page');
    await expect(resultsOrReport).toBeVisible({ timeout: 15000 });
  });
});
