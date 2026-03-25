import type { Page } from '@playwright/test';

/**
 * Intercept Stripe-related API calls so E2E tests never redirect to real Stripe.
 */
export async function mockStripe(page: Page) {
  // Mock the checkout API route
  await page.route('**/api/checkout', async (route) => {
    const body = route.request().postDataJSON?.() ?? {};
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        url: `https://checkout.stripe.com/mock-session?product=${body.product_type || 'individual_report'}`,
      }),
    });
  });
}

/**
 * Mock the checkout API to return already_purchased.
 */
export async function mockStripeAlreadyPurchased(page: Page) {
  await page.route('**/api/checkout', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ already_purchased: true }),
    });
  });
}
