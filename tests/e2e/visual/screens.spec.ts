import { test, expect } from '@playwright/test';
import { mockSupabase } from '../fixtures/mock-supabase';

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
    await expect(page).toHaveScreenshot('landing.png', { fullPage: true });
  });

  test('name input - empty', async ({ page }) => {
    await page.goto('/quiz');
    await page.getByText('Take the Quiz').click();
    await expect(page.locator('.name-screen')).toBeVisible();
    await expect(page).toHaveScreenshot('name-empty.png');
  });

  test('name input - filled', async ({ page }) => {
    await page.goto('/quiz');
    await page.getByText('Take the Quiz').click();
    await page.locator('input.name-input').fill('Alexandra');
    await expect(page).toHaveScreenshot('name-filled.png');
  });

  test('birthday picker', async ({ page }) => {
    await page.goto('/quiz');
    await page.getByText('Take the Quiz').click();
    await page.locator('input.name-input').fill('Test');
    await page.locator('button.nav-next').click();
    await expect(page.locator('.birthday-screen')).toBeVisible();
    await expect(page).toHaveScreenshot('birthday.png');
  });

  test('birthday with star sign revealed', async ({ page }) => {
    await page.goto('/quiz');
    await page.getByText('Take the Quiz').click();
    await page.locator('input.name-input').fill('Test');
    await page.locator('button.nav-next').click();
    const selects = page.locator('select.birthday-select');
    await selects.first().selectOption('3');
    await selects.nth(1).selectOption('15');
    await expect(page.locator('.star-sign-name')).toBeVisible();
    await expect(page).toHaveScreenshot('birthday-sign-revealed.png');
  });

  test('quiz - cognitive A/B question', async ({ page }) => {
    await page.goto('/quiz');
    await page.getByText('Take the Quiz').click();
    await page.locator('input.name-input').fill('Test');
    await page.locator('button.nav-next').click();
    const selects = page.locator('select.birthday-select');
    await selects.first().selectOption('3');
    await selects.nth(1).selectOption('15');
    await page.locator('button.nav-next').click();
    await expect(page.locator('.ab-card')).toHaveCount(2, { timeout: 5000 });
    await expect(page).toHaveScreenshot('quiz-cognitive.png');
  });

  test('public profile page', async ({ page }) => {
    await page.goto('/profile/enfp-4w3-secure-qualitytime-pisces');
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveScreenshot('profile-public.png', { fullPage: true });
  });
});
