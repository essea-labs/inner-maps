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

test.describe('Connections Tab — Returning User', () => {
  test('shows loading indicator when connections not yet fetched (prevents empty flash)', async ({ page }) => {
    await mockSupabase(page);

    // Inject state to connections screen with connections=[] and connectionsFetched=false
    // to simulate production initial state (no dev-mode MOCK_CONNECTIONS).
    await injectQuizState(page, GOLDEN_PATH, 'connections', {
      connections: [],
      connectionsFetched: false,
    });

    // Should see "Loading connections…" instead of the empty invite-only state.
    // This is the critical assertion: before loadConnections resolves, the tab
    // shows a loading indicator — not the confusing empty state.
    const loadingIndicator = page.locator('p:has-text("Loading connections")');
    await expect(loadingIndicator).toBeVisible({ timeout: 5000 });

    // Verify the empty invite-only state is NOT visible
    const inviteOnlyCard = page.locator('.invite-card button:has-text("Invite")');
    await expect(inviteOnlyCard).not.toBeVisible();
  });

  test('shows connections after fetch completes (dev mock data)', async ({ page }) => {
    await mockSupabase(page);

    // Inject state with dev mock connections present (connectionsFetched=true)
    // to verify the normal loaded state renders correctly
    await injectQuizState(page, GOLDEN_PATH, 'connections');

    // Should see connection cards (dev mock data: Maya, Jordan)
    await expect(page.locator('.connection-person-name').first()).toBeVisible({ timeout: 5000 });
  });
});

test.describe('Compatibility View', () => {
  test('renders compatibility cards with scores', async ({ page }) => {
    const connResults = buildMockResults(CONTRASTING_PROFILE);

    await injectQuizState(page, GOLDEN_PATH, 'compatibility', {
      activeTab: 'compat',
      activeConnection: {
        id: 'test-conn-1',
        name: CONTRASTING_PROFILE.name,
        status: 'completed',
        results: connResults,
      },
    });

    // Should see compatibility view with dimension cards
    const compatCards = page.locator('.compat-card, .compat-dimension, [class*="compat-card"]');
    await expect(compatCards.first()).toBeVisible({ timeout: 10000 });
  });

  test('displays both user names', async ({ page }) => {
    const connResults = buildMockResults(CONTRASTING_PROFILE);

    await injectQuizState(page, GOLDEN_PATH, 'compatibility', {
      activeTab: 'compat',
      activeConnection: {
        id: 'test-conn-1',
        name: 'Friend User',
        status: 'completed',
        results: connResults,
      },
    });

    // Both names should appear somewhere on the compatibility page
    const pageContent = page.locator('body');
    await expect(pageContent).toContainText(GOLDEN_PATH.name, { timeout: 10000 });
    await expect(pageContent).toContainText('Friend User');
  });
});
