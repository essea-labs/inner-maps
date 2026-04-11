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

test.describe('Anonymous user — results survive reload + Compat tab works', () => {
  // Regression for a bug pair where (1) an unsigned-in user clicking the
  // Compatibility tab after finishing the quiz got stuck on an infinite
  // "Loading connections…" spinner because connectionsFetched defaulted to
  // false and loadConnections was gated on !is_anonymous, and (2) a page
  // reload dropped the user back on the landing screen because the auto-
  // restore path in quiz/page.tsx excluded anonymous users. The fix writes
  // an im_anon_profile_cache synchronously in nextQuestion() and restores
  // from it on mount in quiz/page.tsx.

  test('reload restores results from anon cache and Compat tab renders immediately', async ({ page }) => {
    await mockSupabase(page);

    const results = buildMockResults(GOLDEN_PATH);

    // Seed the exact localStorage state that nextQuestion() writes when an
    // anonymous user finishes the quiz: im_anon_profile_cache + im_returning.
    // Crucially we do NOT write im_redirect_state (Stripe path) or
    // im_profile_cache (real-user path) — this test exercises only the new
    // anonymous-user restore branch.
    await page.addInitScript((payload) => {
      localStorage.setItem('im_anon_profile_cache', JSON.stringify({
        results: payload.results,
        userName: payload.name,
        birthMonth: payload.birthMonth,
        birthDay: payload.birthDay,
        starSign: payload.results.starSign,
        answers: {
          cognitive: Array(15).fill('a'),
          attachment: Array(8).fill(3),
          connection: Array(10).fill('a'),
          enneagram: Array(10).fill(3),
        },
      }));
      localStorage.setItem('im_returning', '1');
    }, { results, name: GOLDEN_PATH.name, birthMonth: GOLDEN_PATH.birthMonth, birthDay: GOLDEN_PATH.birthDay });

    await page.goto('/quiz');

    // Bug B regression: the page should land on Results, NOT the landing page.
    await expect(page.locator('.results-page')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('.results-page')).toContainText(GOLDEN_PATH.name);

    // Bug A regression: clicking the Compatibility tab must NOT get stuck on
    // the "Loading connections…" spinner. Because nextQuestion() sets
    // connectionsFetched: true at completion and the anon cache restore path
    // does the same, the Compat screen should render synchronously.
    await page.locator('button.tab-item', { hasText: 'Compatibility' }).click();

    // The Compatibility header should appear immediately
    await expect(page.locator('h1', { hasText: 'Compatibility' })).toBeVisible({ timeout: 3000 });

    // And the loading spinner should NOT be visible
    await expect(page.locator('p:has-text("Loading connections")')).not.toBeVisible();
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
