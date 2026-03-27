import { test, expect } from '@playwright/test';
import { mockSupabase } from './fixtures/mock-supabase';
import { GOLDEN_PATH, CONTRASTING_PROFILE } from './fixtures/quiz-answers';
import { injectQuizState, buildMockResults } from './fixtures/inject-state';

test.beforeEach(async ({ page }) => {
  await mockSupabase(page);
});

test.describe('Results Page', () => {
  test('renders all 5 dimension cards', async ({ page }) => {
    await injectQuizState(page, GOLDEN_PATH, 'results');

    await expect(page.locator('.results-page')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('.result-card')).toHaveCount(5, { timeout: 5000 });
  });

  test('displays correct cognitive type from profile', async ({ page }) => {
    await injectQuizState(page, GOLDEN_PATH, 'results');

    await expect(page.locator('.results-page')).toBeVisible({ timeout: 10000 });
    const typeDisplay = page.locator('.result-card-type').first();
    await expect(typeDisplay).toContainText(GOLDEN_PATH.expected.cognitiveType);
  });

  test('shows upsell section with purchase CTA for free user', async ({ page }) => {
    await injectQuizState(page, GOLDEN_PATH, 'results');

    await expect(page.locator('.results-page')).toBeVisible({ timeout: 10000 });
    // Upsell section should be visible for non-purchased users
    const upsell = page.locator('.upsell-section, .report-upsell, [class*="upsell"]');
    await expect(upsell.first()).toBeVisible({ timeout: 5000 });
  });

  test('shows user name in results header', async ({ page }) => {
    await injectQuizState(page, GOLDEN_PATH, 'results');

    await expect(page.locator('.results-page')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('.results-page')).toContainText(GOLDEN_PATH.name);
  });
});

test.describe('Connections Tab', () => {
  test('shows invite card when no connections exist', async ({ page }) => {
    await injectQuizState(page, GOLDEN_PATH, 'connections');

    // Should see the connections/invite area
    const inviteCard = page.locator('.invite-card, .connections-empty, [class*="invite"]');
    await expect(inviteCard.first()).toBeVisible({ timeout: 10000 });
  });
});

test.describe('Compatibility View', () => {
  test('renders compatibility cards with scores', async ({ page }) => {
    const userResults = buildMockResults(GOLDEN_PATH);
    const connResults = buildMockResults(CONTRASTING_PROFILE);

    // Use addInitScript to inject all state before page loads
    await page.addInitScript(({ userResults, userName, connResults, connName }) => {
      sessionStorage.setItem('im_results', JSON.stringify(userResults));
      sessionStorage.setItem('im_userName', userName);
      sessionStorage.setItem('im_birthMonth', '3');
      sessionStorage.setItem('im_birthDay', '15');
      sessionStorage.setItem('im_screen', 'compatibility');
      sessionStorage.setItem('im_activeTab', 'compat');
      sessionStorage.setItem('im_activeConnection', JSON.stringify({
        id: 'test-conn-1',
        name: connName,
        status: 'completed',
        results: connResults,
      }));
    }, {
      userResults,
      userName: GOLDEN_PATH.name,
      connResults,
      connName: CONTRASTING_PROFILE.name,
    });
    await page.goto('/quiz');

    // Should see compatibility view with dimension cards
    const compatCards = page.locator('.compat-card, .compat-dimension, [class*="compat-card"]');
    await expect(compatCards.first()).toBeVisible({ timeout: 10000 });
  });

  test('displays both user names', async ({ page }) => {
    const userResults = buildMockResults(GOLDEN_PATH);
    const connResults = buildMockResults(CONTRASTING_PROFILE);

    await page.addInitScript(({ userResults, connResults }) => {
      sessionStorage.setItem('im_results', JSON.stringify(userResults));
      sessionStorage.setItem('im_userName', 'Test User');
      sessionStorage.setItem('im_birthMonth', '3');
      sessionStorage.setItem('im_birthDay', '15');
      sessionStorage.setItem('im_screen', 'compatibility');
      sessionStorage.setItem('im_activeTab', 'compat');
      sessionStorage.setItem('im_activeConnection', JSON.stringify({
        id: 'test-conn-1',
        name: 'Friend User',
        status: 'completed',
        results: connResults,
      }));
    }, { userResults, connResults });
    await page.goto('/quiz');

    // Both names should appear somewhere on the compatibility page
    const pageContent = page.locator('body');
    await expect(pageContent).toContainText('Test User', { timeout: 10000 });
    await expect(pageContent).toContainText('Friend User');
  });
});
