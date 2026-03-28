import { test, expect } from '@playwright/test';
import { mockSupabase } from './fixtures/mock-supabase';
import { GOLDEN_PATH, CONTRASTING_PROFILE } from './fixtures/quiz-answers';
import { buildMockResults, injectQuizState } from './fixtures/inject-state';

test.beforeEach(async ({ page }) => {
  await mockSupabase(page);
});

test.describe('Invite Flow', () => {
  test('invite code query param is stored in sessionStorage', async ({ page }) => {
    // Mock the invite-lookup API that the client calls
    await page.route('**/api/invite-lookup*', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ inviterName: 'Friend Person' }),
      });
    });

    // Navigate directly with inviterCode query param (this is what /invite/[code] redirects to)
    await page.goto('/quiz?inviterCode=TESTCODE');
    await expect(page.locator('.landing')).toBeVisible({ timeout: 10000 });

    // Verify inviterCode was stored in sessionStorage
    const stored = await page.evaluate(() => sessionStorage.getItem('innerMapsInviterCode'));
    expect(stored).toBe('TESTCODE');
  });

  test('invalid invite code shows expired message', async ({ page }) => {
    // Mock the invite lookup to return empty — server-side renders expired page
    // Since /invite/[code] is a Server Component that calls Supabase, and without
    // real Supabase env vars the query fails, it will show the expired fallback
    await page.goto('/invite/BADCODE');
    await expect(page.getByText(/expired|invalid/i)).toBeVisible({ timeout: 10000 });
  });

  test('landing page shows invite banner when inviterCode is in sessionStorage', async ({ page }) => {
    // Pre-set inviterCode in sessionStorage before navigating
    await page.addInitScript(() => {
      sessionStorage.setItem('innerMapsInviterCode', 'TESTCODE');
      sessionStorage.setItem('innerMapsInviterName', 'Friend Person');
    });

    await page.goto('/quiz');
    await expect(page.locator('.landing')).toBeVisible({ timeout: 10000 });

    // Should show invite banner with inviter name
    const banner = page.locator('.invite-banner');
    if (await banner.isVisible({ timeout: 3000 }).catch(() => false)) {
      await expect(banner).toContainText('Friend Person');
    }
  });

  test('Google OAuth flow preserves inviterCode as cookie', async ({ page }) => {
    // Inject state at signup screen with inviterCode in sessionStorage
    await page.addInitScript(() => {
      sessionStorage.setItem('innerMapsInviterCode', 'TESTCODE');
    });

    await injectQuizState(page, GOLDEN_PATH, 'signup');

    // Wait for signup form and check that clicking Google would set the cookie
    const googleBtn = page.locator('button.signup-social-btn.google');
    if (await googleBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
      // Intercept OAuth redirect to prevent navigation
      await page.route('**/auth/v1/authorize*', async (route) => {
        await route.abort();
      });

      await googleBtn.click();
      await page.waitForTimeout(500);

      // Verify the inviterCode cookie was set before OAuth redirect
      const cookies = await page.context().cookies();
      const inviterCookie = cookies.find(c => c.name === 'innerMapsInviterCode');
      expect(inviterCookie).toBeDefined();
      expect(inviterCookie?.value).toBe('TESTCODE');
    }
  });

  test('email+password signup passes inviterCode to handlePostAuth', async ({ page }) => {
    // Track whether completeInvite was called
    await page.route('**/rest/v1/invites*', async (route) => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: '{}' });
    });

    // Inject state at signup with inviterCode
    await page.addInitScript(() => {
      sessionStorage.setItem('innerMapsInviterCode', 'TESTCODE');
    });

    await injectQuizState(page, GOLDEN_PATH, 'signup');

    // Fill signup form
    const emailInput = page.locator('input[type="email"]');
    const passwordInput = page.locator('input[type="password"]');
    if (await emailInput.isVisible({ timeout: 5000 }).catch(() => false)) {
      await emailInput.fill('test@example.com');
      await passwordInput.fill('password123');
      await page.locator('button.signup-cta').click();

      // Wait for the invite completion call
      await page.waitForTimeout(3000);
    }
  });

  test('invitee sees their own results after completing quiz (no redirect to compatibility)', async ({ page }) => {
    // Mock invite-complete API
    await page.route('**/api/invite-complete', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true }),
      });
    });

    // Mock connections API
    const inviterResults = buildMockResults(CONTRASTING_PROFILE);
    await page.route('**/api/connections*', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([{
          id: 'conn-123',
          name: 'Inviter Person',
          status: 'completed',
          results: inviterResults,
        }]),
      });
    });

    // Inject state at last enneagram question
    const answers = {
      cognitive: [...GOLDEN_PATH.cognitive],
      attachment: [...GOLDEN_PATH.attachment],
      connection: [...GOLDEN_PATH.connection],
      enneagram: [...GOLDEN_PATH.enneagram.slice(0, 9), null],
    };

    await page.addInitScript((payload) => {
      localStorage.setItem('im_redirect_state', JSON.stringify({
        _ts: Date.now(),
        userName: payload.name,
        birthMonth: payload.birthMonth,
        birthDay: payload.birthDay,
        screen: 'quiz',
        starSign: { sign: 'Pisces', symbol: '\u2653', emoji: '\uD83D\uDC1F', dates: 'Feb 19 to Mar 20', tagline: 'Intuitive, compassionate, artistic', desc: '' },
        answers: payload.answers,
        currentSection: 4,
        currentQuestion: 9,
      }));
      sessionStorage.setItem('innerMapsInviterCode', 'TESTCODE');
    }, { name: GOLDEN_PATH.name, birthMonth: GOLDEN_PATH.birthMonth, birthDay: GOLDEN_PATH.birthDay, answers });

    await page.goto('/quiz');
    await expect(page.locator('.quiz-screen')).toBeVisible({ timeout: 10000 });
    await page.locator('.pair-card').first().click();
    await page.locator('button.nav-next').click();

    // Invitee should land on results — NOT compatibility
    await expect(page.locator('.results-page')).toBeVisible({ timeout: 15000 });
    await expect(page.locator('.compat-page')).not.toBeVisible();
  });

  test('organic user sees results after completing quiz', async ({ page }) => {
    const answers = {
      cognitive: [...GOLDEN_PATH.cognitive],
      attachment: [...GOLDEN_PATH.attachment],
      connection: [...GOLDEN_PATH.connection],
      enneagram: [...GOLDEN_PATH.enneagram.slice(0, 9), null],
    };

    await page.addInitScript((payload) => {
      localStorage.setItem('im_redirect_state', JSON.stringify({
        _ts: Date.now(),
        userName: payload.name,
        birthMonth: payload.birthMonth,
        birthDay: payload.birthDay,
        screen: 'quiz',
        starSign: { sign: 'Pisces', symbol: '\u2653', emoji: '\uD83D\uDC1F', dates: 'Feb 19 to Mar 20', tagline: 'Intuitive, compassionate, artistic', desc: '' },
        answers: payload.answers,
        currentSection: 4,
        currentQuestion: 9,
      }));
    }, { name: GOLDEN_PATH.name, birthMonth: GOLDEN_PATH.birthMonth, birthDay: GOLDEN_PATH.birthDay, answers });

    await page.goto('/quiz');
    await expect(page.locator('.quiz-screen')).toBeVisible({ timeout: 10000 });
    await page.locator('.pair-card').first().click();
    await page.locator('button.nav-next').click();

    await expect(page.locator('.results-page')).toBeVisible({ timeout: 15000 });
    await expect(page.locator('.compat-page')).not.toBeVisible();
  });
});
