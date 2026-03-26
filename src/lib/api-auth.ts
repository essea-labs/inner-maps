import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

/**
 * Verify the caller's Supabase session from cookies.
 * Returns the authenticated user ID, or null if not authenticated.
 * Use in API routes to ensure only the logged-in user can access their own data.
 */
export async function getAuthUserId(): Promise<string | null> {
  try {
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll: () => cookieStore.getAll(),
          setAll() { /* read-only — no need to set cookies in API routes */ },
        },
      }
    );
    const { data: { user } } = await supabase.auth.getUser();
    return user?.id ?? null;
  } catch {
    return null;
  }
}
