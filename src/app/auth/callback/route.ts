import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const code = searchParams.get('code');           // Google OAuth or PKCE recovery
  const token_hash = searchParams.get('token_hash'); // OTP / legacy password reset
  const type = searchParams.get('type');             // e.g. "email" | "magiclink" | "recovery"

  const cookieStore = await cookies();

  // Read intent + inviter code cookies set before the auth redirect
  // For password reset, override intent to 'recovery' so the client shows the new-password form
  const isRecovery = type === 'recovery';
  let intent = isRecovery ? 'recovery' : (cookieStore.get('innerMapsIntent')?.value ?? 'save');
  const inviterCode = cookieStore.get('innerMapsInviterCode')?.value;

  // Exchange the token first so we can detect recovery from the session event
  let authError: string | null = null;

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll(cookiesToSet) {
          // Will be written onto the redirect response below
          cookiesToSet.forEach(({ name, value }) =>
            cookieStore.set(name, value)
          );
        },
      },
    }
  );

  if (code) {
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) {
      console.error('Auth code exchange failed:', error.message);
      authError = error.message;
    }
    // Supabase PKCE recovery: the session event type is PASSWORD_RECOVERY
    // but we can also detect it from the session's aal or amr
    // Simplest: check if the exchange returned a recovery session
    if (data?.session?.user && !error) {
      // Check if this was a password recovery by looking at the amr claim
      const amr = (data.session as any).amr;
      if (amr?.some((a: any) => a.method === 'recovery' || a.method === 'otp')) {
        intent = 'recovery';
      }
    }
  } else if (token_hash && type) {
    const { error } = await supabase.auth.verifyOtp({ token_hash, type: type as any });
    if (error) {
      console.error('OTP verification failed:', error.message);
      authError = error.message;
    }
  }

  // Build redirect URL with all params
  const redirectUrl = new URL('/quiz', origin);
  redirectUrl.searchParams.set('authCallback', '1');
  redirectUrl.searchParams.set('intent', intent);
  if (inviterCode) redirectUrl.searchParams.set('inviterCode', inviterCode);
  if (authError) redirectUrl.searchParams.set('authError', authError);

  const response = NextResponse.redirect(redirectUrl);

  // Write session cookies onto the redirect response
  cookieStore.getAll().forEach((cookie) => {
    response.cookies.set(cookie.name, cookie.value);
  });

  // Clear the one-time cookies we just consumed
  response.cookies.delete('innerMapsIntent');
  if (inviterCode) response.cookies.delete('innerMapsInviterCode');

  return response;
}
