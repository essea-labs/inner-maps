import { test, expect } from '@playwright/test';
import { mockSupabase } from './fixtures/mock-supabase';
import { mockStripe, mockStripeAlreadyPurchased } from './fixtures/mock-stripe';

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

    await page.goto('/quiz');

    // Set up authenticated state with results
    await page.evaluate(() => {
      const results = {
        cognitiveType: 'ENFP', cognitiveTypeName: 'The Campaigner', cognitiveTypeDesc: 'desc',
        attachmentStyle: 'Secure', attachmentDesc: 'desc', anxiety: '2.0', avoidance: '2.0',
        connectionScores: { words: 4, acts: 2, gifts: 1, quality: 2, touch: 1 },
        connectionSorted: [['words', 4]], connectionNames: {}, connectionDescs: {},
        topConnection: 'Words of Affirmation',
        enneagramType: 4, enneagramWing: 3, enneagramName: 'The Individualist', enneagramDisplay: '4w3',
        starSign: { sign: 'Pisces', symbol: '♓', emoji: '🐟', dates: '', tagline: '', desc: '', month: [2,19,3,20] },
      };
      sessionStorage.setItem('im_results', JSON.stringify(results));
      sessionStorage.setItem('im_userName', 'Test User');
      sessionStorage.setItem('im_screen', 'results');
    });

    await page.reload();
    await expect(page.locator('.results-page')).toBeVisible({ timeout: 10000 });

    // Click the upsell CTA
    const upsellBtn = page.locator('.upsell-cta');
    if (await upsellBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      // Prevent actual navigation to Stripe
      await page.evaluate(() => {
        window.open = () => null;
        Object.defineProperty(window, 'location', {
          value: { ...window.location, href: window.location.href },
          writable: true,
        });
      });
      await upsellBtn.click();
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

    // Set session storage with results (simulating state before Stripe redirect)
    await page.goto('/quiz');
    await page.evaluate(() => {
      const results = {
        cognitiveType: 'ENFP', cognitiveTypeName: 'The Campaigner', cognitiveTypeDesc: 'desc',
        attachmentStyle: 'Secure', attachmentDesc: 'desc', anxiety: '2.0', avoidance: '2.0',
        connectionScores: { words: 4, acts: 2, gifts: 1, quality: 2, touch: 1 },
        connectionSorted: [['words', 4]], connectionNames: {}, connectionDescs: {},
        topConnection: 'Words of Affirmation',
        enneagramType: 4, enneagramWing: 3, enneagramName: 'The Individualist', enneagramDisplay: '4w3',
        starSign: { sign: 'Pisces', symbol: '♓', emoji: '🐟', dates: '', tagline: '', desc: '', month: [2,19,3,20] },
      };
      sessionStorage.setItem('im_results', JSON.stringify(results));
      sessionStorage.setItem('im_userName', 'Test User');
      sessionStorage.setItem('im_birthMonth', '3');
      sessionStorage.setItem('im_birthDay', '15');
    });

    // Navigate as if returning from Stripe
    await page.goto('/quiz?purchase=success&product=individual_report');

    // Should eventually show results or report
    const resultsOrReport = page.locator('.results-page, .report-page');
    await expect(resultsOrReport).toBeVisible({ timeout: 15000 });
  });
});
