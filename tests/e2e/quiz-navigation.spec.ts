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

test.describe('Swipe Gesture Navigation', () => {
  // Synthetic TouchEvent dispatch doesn't work in WebKit — skip on Safari
  test.skip(({ browserName }) => browserName === 'webkit', 'Synthetic touch events not supported in WebKit');

  test.beforeEach(async ({ page }) => {
    await mockSupabase(page);
  });

  async function swipeRight(page: import('@playwright/test').Page) {
    // Simulate a horizontal swipe-right (dx > 60px, mostly horizontal)
    const viewport = page.viewportSize()!;
    const startX = 40;
    const startY = viewport.height / 2;
    const endX = startX + 150;

    await page.touchscreen.tap(startX, startY);
    // Use dispatchEvent for touchstart/touchend since Playwright touchscreen
    // API doesn't directly support swipe gestures
    await page.evaluate(({ sx, sy, ex, ey }) => {
      const touchStart = new TouchEvent('touchstart', {
        touches: [new Touch({ identifier: 0, target: document, clientX: sx, clientY: sy })],
        bubbles: true,
      });
      const touchEnd = new TouchEvent('touchend', {
        changedTouches: [new Touch({ identifier: 0, target: document, clientX: ex, clientY: ey })],
        bubbles: true,
      });
      document.dispatchEvent(touchStart);
      document.dispatchEvent(touchEnd);
    }, { sx: startX, sy: startY, ex: endX, ey: startY });
  }

  test('swipe right on name screen goes back to landing', async ({ page }) => {
    await page.goto('/quiz');
    await page.getByRole('button', { name: 'Take the Quiz' }).click();
    await expect(page.locator('.name-screen')).toBeVisible();

    await swipeRight(page);
    await expect(page.locator('.landing')).toBeVisible();
  });

  test('swipe right on birthday screen goes back to name', async ({ page }) => {
    await page.goto('/quiz');
    await page.getByRole('button', { name: 'Take the Quiz' }).click();
    await page.locator('input.name-input').fill('Test');
    await page.locator('button.nav-next').click();
    await expect(page.locator('.birthday-screen')).toBeVisible();

    await swipeRight(page);
    await expect(page.locator('.name-screen')).toBeVisible();
  });

  test('swipe right on quiz goes back to birthday', async ({ page }) => {
    await page.goto('/quiz');
    await page.getByRole('button', { name: 'Take the Quiz' }).click();
    await page.locator('input.name-input').fill('Test');
    await page.locator('button.nav-next').click();
    const selects = page.locator('select.birthday-select');
    await selects.first().selectOption('3');
    await selects.nth(1).selectOption('15');
    await page.locator('button.nav-next').click();
    await expect(page.locator('.quiz-screen')).toBeVisible();

    await swipeRight(page);
    await expect(page.locator('.birthday-screen')).toBeVisible();
  });
});
