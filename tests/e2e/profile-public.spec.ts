import { test, expect } from '@playwright/test';

test.describe('Public Profile Page', () => {
  test('valid profile slug renders profile card', async ({ page }) => {
    await page.goto('/profile/enfp-4w3-secure-qualitytime-pisces');

    // Should show profile with the decoded dimensions
    await expect(page.getByText('ENFP')).toBeVisible({ timeout: 10000 });
    await expect(page.getByText(/4w3/)).toBeVisible();
    await expect(page.getByText(/Secure/)).toBeVisible();
    await expect(page.getByText(/Pisces/)).toBeVisible();
  });

  test('invalid slug shows fallback with quiz CTA', async ({ page }) => {
    await page.goto('/profile/invalid-slug');

    // Should show some kind of fallback or error
    const quizCta = page.getByText(/Take the Quiz/i);
    await expect(quizCta).toBeVisible({ timeout: 10000 });
  });

  test('profile page has correct meta title', async ({ page }) => {
    await page.goto('/profile/enfp-4w3-secure-qualitytime-pisces');
    const title = await page.title();
    expect(title).toContain('Inner Map');
  });
});
