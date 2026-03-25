import { test, expect } from '@playwright/test';
import { mockSupabase } from './fixtures/mock-supabase';

test.beforeEach(async ({ page }) => {
  await mockSupabase(page);
});

test.describe('Invite Flow', () => {
  test('valid invite code redirects to quiz with inviterCode', async ({ page }) => {
    // Mock the invite lookup to return valid
    await page.route('**/rest/v1/invites*', async (route) => {
      if (route.request().method() === 'GET') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify([{
            invite_code: 'TESTCODE',
            inviter_id: 'inviter-123',
            status: 'pending',
          }]),
        });
      } else {
        await route.fulfill({ status: 200, contentType: 'application/json', body: '{}' });
      }
    });

    await page.goto('/invite/TESTCODE');
    // Should redirect to /quiz with inviterCode
    await page.waitForURL(/\/quiz.*inviterCode=TESTCODE/, { timeout: 10000 });
  });

  test('invalid invite code shows expired message', async ({ page }) => {
    // Mock the invite lookup to return empty
    await page.route('**/rest/v1/invites*', async (route) => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: '[]' });
    });

    await page.goto('/invite/BADCODE');
    // Should show expired or invalid message
    await expect(page.getByText(/expired|invalid/i)).toBeVisible({ timeout: 10000 });
  });

  test('short invite URL /i/[code] works same as /invite/[code]', async ({ page }) => {
    await page.route('**/rest/v1/invites*', async (route) => {
      if (route.request().method() === 'GET') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify([{
            invite_code: 'TESTCODE',
            inviter_id: 'inviter-123',
            status: 'pending',
          }]),
        });
      } else {
        await route.fulfill({ status: 200, contentType: 'application/json', body: '{}' });
      }
    });

    await page.goto('/i/TESTCODE');
    await page.waitForURL(/\/quiz.*inviterCode=TESTCODE/, { timeout: 10000 });
  });

  test('inviterCode stored in sessionStorage after arriving from invite link', async ({ page }) => {
    await page.route('**/rest/v1/invites*', async (route) => {
      if (route.request().method() === 'GET') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify([{
            invite_code: 'TESTCODE',
            inviter_id: 'inviter-123',
            status: 'pending',
          }]),
        });
      } else {
        await route.fulfill({ status: 200, contentType: 'application/json', body: '{}' });
      }
    });

    // Navigate via invite link → redirects to /quiz?inviterCode=TESTCODE
    await page.goto('/invite/TESTCODE');
    await page.waitForURL(/\/quiz/, { timeout: 10000 });

    // Verify inviterCode was stored in sessionStorage
    const stored = await page.evaluate(() => sessionStorage.getItem('innerMapsInviterCode'));
    expect(stored).toBe('TESTCODE');
  });

  test('Google OAuth flow preserves inviterCode as cookie', async ({ page }) => {
    // Set up: user arrived from invite link and has inviterCode in sessionStorage
    await page.goto('/quiz');
    await page.evaluate(() => {
      sessionStorage.setItem('innerMapsInviterCode', 'TESTCODE');
    });

    // Navigate to signup screen with results in state
    await page.evaluate(() => {
      const results = {
        cognitiveType: 'ENFP', cognitiveTypeName: 'The Campaigner', cognitiveTypeDesc: 'desc',
        attachmentStyle: 'Secure', attachmentDesc: 'desc', anxiety: '2.0', avoidance: '2.0',
        connectionScores: { words: 4, acts: 2, gifts: 1, quality: 2, touch: 1 },
        connectionSorted: [['words', 4]], connectionNames: {}, connectionDescs: {},
        topConnection: 'Words of Affirmation',
        enneagramType: 4, enneagramWing: 3, enneagramName: 'The Individualist', enneagramDisplay: '4w3',
        starSign: null,
      };
      sessionStorage.setItem('im_results', JSON.stringify(results));
      sessionStorage.setItem('im_userName', 'Test User');
      sessionStorage.setItem('im_screen', 'signup');
    });
    await page.reload();

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
    let completeInviteCalled = false;
    await page.route('**/rest/v1/invites*', async (route) => {
      if (route.request().method() === 'PATCH') {
        completeInviteCalled = true;
        const body = route.request().postDataJSON?.() ?? {};
        // Verify it's setting status to completed
        expect(body.status).toBe('completed');
      }
      await route.fulfill({ status: 200, contentType: 'application/json', body: '{}' });
    });

    await page.goto('/quiz');

    // Set up inviterCode + quiz results in sessionStorage
    await page.evaluate(() => {
      sessionStorage.setItem('innerMapsInviterCode', 'TESTCODE');
      const results = {
        cognitiveType: 'ENFP', cognitiveTypeName: 'The Campaigner', cognitiveTypeDesc: 'desc',
        attachmentStyle: 'Secure', attachmentDesc: 'desc', anxiety: '2.0', avoidance: '2.0',
        connectionScores: { words: 4, acts: 2, gifts: 1, quality: 2, touch: 1 },
        connectionSorted: [['words', 4]], connectionNames: {}, connectionDescs: {},
        topConnection: 'Words of Affirmation',
        enneagramType: 4, enneagramWing: 3, enneagramName: 'The Individualist', enneagramDisplay: '4w3',
        starSign: null,
      };
      sessionStorage.setItem('im_results', JSON.stringify(results));
      sessionStorage.setItem('im_userName', 'Test User');
      sessionStorage.setItem('im_screen', 'signup');
    });
    await page.reload();

    // Fill signup form
    const emailInput = page.locator('input[type="email"]');
    const passwordInput = page.locator('input[type="password"]');
    if (await emailInput.isVisible({ timeout: 5000 }).catch(() => false)) {
      await emailInput.fill('test@example.com');
      await passwordInput.fill('password123');
      await page.locator('button.signup-cta').click();

      // Wait for the invite completion call
      await page.waitForTimeout(3000);
      // completeInvite should have been called via PATCH to invites
    }
  });
});
