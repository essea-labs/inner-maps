import type { Page } from '@playwright/test';

/**
 * Intercept Supabase API calls so E2E tests don't need a real backend.
 * Call this in test setup before navigating to the app.
 */
export async function mockSupabase(page: Page) {
  // Mock anonymous sign-in
  await page.route('**/auth/v1/signup*', async (route) => {
    const body = route.request().postDataJSON?.() ?? {};
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        access_token: 'mock-access-token',
        token_type: 'bearer',
        expires_in: 3600,
        refresh_token: 'mock-refresh-token',
        user: {
          id: 'test-user-id-123',
          aud: 'authenticated',
          email: body?.email || null,
          is_anonymous: !body?.email,
          created_at: new Date().toISOString(),
        },
      }),
    });
  });

  // Mock sign-in with password
  await page.route('**/auth/v1/token?grant_type=password', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        access_token: 'mock-access-token',
        token_type: 'bearer',
        expires_in: 3600,
        refresh_token: 'mock-refresh-token',
        user: {
          id: 'test-user-id-123',
          aud: 'authenticated',
          email: 'test@example.com',
          is_anonymous: false,
        },
      }),
    });
  });

  // Mock get user (session check)
  await page.route('**/auth/v1/user', async (route) => {
    if (route.request().method() === 'GET') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          id: 'test-user-id-123',
          aud: 'authenticated',
          email: null,
          is_anonymous: true,
        }),
      });
    } else {
      // PUT = updateUser (anonymous → permanent)
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          id: 'test-user-id-123',
          aud: 'authenticated',
          email: 'test@example.com',
          is_anonymous: false,
        }),
      });
    }
  });

  // Mock DB operations (REST API)
  await page.route('**/rest/v1/users*', async (route) => {
    if (route.request().method() === 'POST' || route.request().method() === 'PATCH') {
      await route.fulfill({ status: 200, contentType: 'application/json', body: '{}' });
    } else {
      await route.fulfill({ status: 200, contentType: 'application/json', body: '[]' });
    }
  });

  await page.route('**/rest/v1/quiz_results*', async (route) => {
    if (route.request().method() === 'POST' || route.request().method() === 'PATCH') {
      await route.fulfill({ status: 200, contentType: 'application/json', body: '{}' });
    } else {
      await route.fulfill({ status: 200, contentType: 'application/json', body: '[]' });
    }
  });

  await page.route('**/rest/v1/invites*', async (route) => {
    if (route.request().method() === 'POST') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ invite_code: 'TESTCODE', status: 'pending' }),
      });
    } else {
      await route.fulfill({ status: 200, contentType: 'application/json', body: '[]' });
    }
  });

  await page.route('**/rest/v1/purchases*', async (route) => {
    await route.fulfill({ status: 200, contentType: 'application/json', body: '[]' });
  });

  // Mock session refresh (middleware)
  await page.route('**/auth/v1/token?grant_type=refresh_token', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        access_token: 'mock-access-token',
        token_type: 'bearer',
        expires_in: 3600,
        refresh_token: 'mock-refresh-token',
        user: { id: 'test-user-id-123', is_anonymous: true },
      }),
    });
  });
}
