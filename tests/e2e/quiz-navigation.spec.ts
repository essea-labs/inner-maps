import { test, expect } from '@playwright/test';
import { mockSupabase } from './fixtures/mock-supabase';

test.beforeEach(async ({ page }) => {
  await mockSupabase(page);
});

test.describe('Quiz Navigation', () => {
  async function navigateToQuiz(page: import('@playwright/test').Page) {
    await page.goto('/quiz');
    await page.getByRole('button', { name: 'Take the Quiz' }).click();
    await page.locator('input.name-input').fill('Test');
    await page.locator('button.nav-next').click();
    const selects = page.locator('select.birthday-select');
    await selects.first().selectOption('3');
    await selects.nth(1).selectOption('15');
    await page.locator('button.nav-next').click();
    await expect(page.locator('.quiz-screen')).toBeVisible();
  }

  test('back button from first question goes to birthday', async ({ page }) => {
    await navigateToQuiz(page);
    await page.locator('button.quiz-back-bottom').click();
    await expect(page.locator('.birthday-screen')).toBeVisible();
  });

  test('back button from name goes to landing', async ({ page }) => {
    await page.goto('/quiz');
    await page.getByRole('button', { name: 'Take the Quiz' }).click();
    await expect(page.locator('.name-screen')).toBeVisible();
    await page.locator('button.quiz-back-bottom').click();
    await expect(page.locator('.landing')).toBeVisible();
  });

  test('answer selection shows selected state', async ({ page }) => {
    await navigateToQuiz(page);
    const firstCard = page.locator('.ab-card').first();
    await firstCard.click();
    await expect(firstCard).toHaveClass(/selected/);
  });

  test('can navigate back through questions', async ({ page }) => {
    await navigateToQuiz(page);

    // Answer first question
    await page.locator('.ab-card').first().click();
    await page.waitForTimeout(600);

    // Now on question 2 — go back
    await page.locator('button.quiz-back-bottom').click();

    // Should be back on question with our previous answer visible
    await expect(page.locator('.quiz-screen')).toBeVisible();
  });

  test('birthday shows star sign on selection', async ({ page }) => {
    await page.goto('/quiz');
    await page.getByRole('button', { name: 'Take the Quiz' }).click();
    await page.locator('input.name-input').fill('Test');
    await page.locator('button.nav-next').click();

    const selects = page.locator('select.birthday-select');
    await selects.first().selectOption('8'); // August
    await selects.nth(1).selectOption('15'); // 15th

    await expect(page.locator('.star-sign-name')).toContainText('Leo');
  });

  test('continue button is disabled until name entered', async ({ page }) => {
    await page.goto('/quiz');
    await page.getByRole('button', { name: 'Take the Quiz' }).click();
    await expect(page.locator('button.nav-next')).toBeDisabled();
    await page.locator('input.name-input').fill('A');
    await expect(page.locator('button.nav-next')).toBeEnabled();
  });

  test('continue button is disabled until birthday selected', async ({ page }) => {
    await page.goto('/quiz');
    await page.getByRole('button', { name: 'Take the Quiz' }).click();
    await page.locator('input.name-input').fill('Test');
    await page.locator('button.nav-next').click();
    await expect(page.locator('button.nav-next')).toBeDisabled();
  });
});
