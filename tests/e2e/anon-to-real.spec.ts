import { test, expect } from '@playwright/test';
import { mockSupabase } from './fixtures/mock-supabase';
import { GOLDEN_PATH, CONTRASTING_PROFILE } from './fixtures/quiz-answers';
import { buildMockResults, injectQuizState } from './fixtures/inject-state';

/**
 * Tests for the anonymous → real user transition.
 *
 * Bug: Referee completes quiz via invite (anon), sees referrer on compat tab,
 * signs up (new real user ID), then referrer disappears on tab switch.
 *
 * Root cause: invite-complete API didn't reassign invitee_id from anon→real,
 * and sessionStorage was cleaned up before the claim fallback could run.
 */

const REAL_USER_ID = 'real-user-id-456';

test.describe('Anon → Real User Transition', () => {
  test('connections persist across tab switches (dev mock connections)', async ({ page }) => {
    await mockSupabase(page);

    // Inject quiz state to results screen (dev mode auto-populates MOCK_CONNECTIONS)
    await injectQuizState(page, GOLDEN_PATH, 'results');
    await expect(page.locator('.results-page')).toBeVisible({ timeout: 10000 });

    // Navigate to Compatibility tab — dev mock connections should be visible
    await page.locator('.tab-item').filter({ hasText: 'Compatibility' }).click();
    await page.waitForTimeout(500);

    // Record which connections are visible
    const initialNames = await page.locator('.connection-person-name').allTextContents();
    expect(initialNames.length).toBeGreaterThan(0);

    // Switch tabs 3 times — connections should never disappear
    for (let i = 0; i < 3; i++) {
      await page.locator('.tab-item').filter({ hasText: 'My Map' }).click();
      await page.waitForTimeout(300);
      await page.locator('.tab-item').filter({ hasText: 'Compatibility' }).click();
      await page.waitForTimeout(500);

      const currentNames = await page.locator('.connection-person-name').allTextContents();
      expect(currentNames.length).toBeGreaterThan(0);
      expect(currentNames).toEqual(initialNames);
    }
  });

  test('invite-complete quiz flow loads connections for invitee', async ({ page }) => {
    await mockSupabase(page);

    // Mock invite-complete API — simulates successful completion
    await page.route('**/api/invite-complete', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true }),
      });
    });

    // Mock connections API — returns referrer after invite is completed
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

    // Inject state at last enneagram question with inviterCode
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

    // Answer the tiebreaker (click first pair card)
    await page.locator('.pair-card').first().click();
    // Click "See My Results"
    await page.locator('button.nav-next').click();

    // Should land on results page
    await expect(page.locator('.results-page')).toBeVisible({ timeout: 15000 });

    // Navigate to Compatibility tab — should see referrer loaded from API
    await page.locator('.tab-item').filter({ hasText: 'Compatibility' }).click();
    await expect(page.getByText('Inviter Person')).toBeVisible({ timeout: 5000 });
  });

  test('sessionStorage inviterCode not deleted before claim block', async ({ page }) => {
    await mockSupabase(page);

    // Override auth to return a real user
    await page.route('**/auth/v1/user', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          id: REAL_USER_ID,
          aud: 'authenticated',
          email: 'test@example.com',
          is_anonymous: false,
        }),
      });
    });

    // Override signup to return real user
    await page.route('**/auth/v1/signup*', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          access_token: 'mock-access-token',
          token_type: 'bearer',
          expires_in: 3600,
          refresh_token: 'mock-refresh-token',
          user: {
            id: REAL_USER_ID,
            aud: 'authenticated',
            email: 'test@example.com',
            is_anonymous: false,
            created_at: new Date().toISOString(),
          },
        }),
      });
    });

    // Track API calls
    let inviteClaimCalled = false;
    await page.route('**/api/invite-complete', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true, already_completed: true }),
      });
    });

    await page.route('**/api/invites/claim', async (route) => {
      inviteClaimCalled = true;
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ claimed: true }),
      });
    });

    await page.route('**/api/connections*', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([]),
      });
    });

    // Inject state: on signup screen with results and inviterCode
    const results = buildMockResults(GOLDEN_PATH);
    await page.addInitScript((payload) => {
      localStorage.setItem('im_redirect_state', JSON.stringify({
        _ts: Date.now(),
        results: payload.results,
        userName: 'Test User',
        birthMonth: 3,
        birthDay: 5,
        screen: 'signup',
      }));
      sessionStorage.setItem('innerMapsInviterCode', 'TESTCODE');
      sessionStorage.setItem('innerMapsInviterName', 'Inviter Person');
    }, { results });

    await page.goto('/quiz');

    // Fill signup form
    const emailInput = page.locator('input[type="email"]');
    await expect(emailInput).toBeVisible({ timeout: 10000 });
    await emailInput.fill('test@example.com');
    await page.locator('input[type="password"]').fill('password123');
    await page.locator('button.signup-cta').click();

    // Wait for handlePostAuth to complete
    await page.waitForTimeout(3000);

    // The claim API should have been called (sessionStorage wasn't deleted early)
    expect(inviteClaimCalled).toBe(true);

    // After signup, inviterCode should be cleaned up
    const remaining = await page.evaluate(() => sessionStorage.getItem('innerMapsInviterCode'));
    expect(remaining).toBeNull();
  });
});
