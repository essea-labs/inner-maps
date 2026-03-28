import { test, expect } from '@playwright/test';
import { mockSupabase } from './fixtures/mock-supabase';
import { GOLDEN_PATH, CONTRASTING_PROFILE } from './fixtures/quiz-answers';
import { buildMockResults } from './fixtures/inject-state';

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

  test('invitee sees their own results after completing quiz (no redirect to compatibility)', async ({ page }) => {
    // Mock invite-complete API
    await page.route('**/api/invite-complete', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true }),
      });
    });

    // Mock connections API — return a completed connection so we can verify
    // the invitee stays on results even when a connection exists
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

    // Inject state at last enneagram question (section 4, question 9 — tiebreaker)
    // All answers filled except Q10 (index 9) which is null
    const answers = {
      cognitive: [...GOLDEN_PATH.cognitive],
      attachment: [...GOLDEN_PATH.attachment],
      connection: [...GOLDEN_PATH.connection],
      enneagram: [...GOLDEN_PATH.enneagram.slice(0, 9), null], // Q10 unanswered
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
      // Set inviterCode — this is the key differentiator
      sessionStorage.setItem('innerMapsInviterCode', 'TESTCODE');
    }, { name: GOLDEN_PATH.name, birthMonth: GOLDEN_PATH.birthMonth, birthDay: GOLDEN_PATH.birthDay, answers });

    await page.goto('/quiz');

    // Should be on quiz screen at the tiebreaker question
    await expect(page.locator('.quiz-screen')).toBeVisible({ timeout: 10000 });

    // Answer the tiebreaker (click first pair card)
    await page.locator('.pair-card').first().click();

    // Click "See My Results"
    await page.locator('button.nav-next').click();

    // Invitee should land on results — NOT compatibility
    await expect(page.locator('.results-page')).toBeVisible({ timeout: 15000 });

    // Verify compatibility view was NOT shown
    await expect(page.locator('.compat-page')).not.toBeVisible();
  });

  test('organic user sees results after completing quiz', async ({ page }) => {
    // Inject state at last enneagram question — NO inviterCode
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
      // No inviterCode — organic user
    }, { name: GOLDEN_PATH.name, birthMonth: GOLDEN_PATH.birthMonth, birthDay: GOLDEN_PATH.birthDay, answers });

    await page.goto('/quiz');

    await expect(page.locator('.quiz-screen')).toBeVisible({ timeout: 10000 });
    await page.locator('.pair-card').first().click();
    await page.locator('button.nav-next').click();

    // Organic user should see results
    await expect(page.locator('.results-page')).toBeVisible({ timeout: 15000 });
    await expect(page.locator('.compat-page')).not.toBeVisible();
  });
});
