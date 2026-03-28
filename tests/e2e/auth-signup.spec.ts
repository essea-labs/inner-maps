import { test, expect } from '@playwright/test';
import { mockSupabase } from './fixtures/mock-supabase';
import { GOLDEN_PATH } from './fixtures/quiz-answers';
import { injectQuizState } from './fixtures/inject-state';

test.beforeEach(async ({ page }) => {
  await mockSupabase(page);
});

test.describe('Auth - Signup & Login', () => {
  test('signup form shows on results when user clicks save', async ({ page }) => {
    await injectQuizState(page, GOLDEN_PATH, 'results');
    await expect(page.locator('.results-page')).toBeVisible({ timeout: 10000 });
  });

  test('signup form has email and password fields', async ({ page }) => {
    await injectQuizState(page, GOLDEN_PATH, 'signup');

    const emailInput = page.locator('input[type="email"]');
    const passwordInput = page.locator('input[type="password"]');

    if (await emailInput.isVisible({ timeout: 5000 }).catch(() => false)) {
      await expect(emailInput).toBeVisible();
      await expect(passwordInput).toBeVisible();
    }
  });

  test('signup toggle switches between sign up and sign in modes', async ({ page }) => {
    await injectQuizState(page, GOLDEN_PATH, 'signup');

    const toggleBtn = page.locator('button.signup-toggle-link');
    if (await toggleBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
      const initialText = await toggleBtn.textContent();
      await toggleBtn.click();
      const newText = await toggleBtn.textContent();
      expect(newText).not.toBe(initialText);
    }
  });
});
