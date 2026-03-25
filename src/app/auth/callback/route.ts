import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const code = searchParams.get('code');           // Google OAuth (PKCE)
  const token_hash = searchParams.get('token_hash'); // OTP / password reset
  const type = searchParams.get('type');             // e.g. "email" | "magiclink" | "recovery"

  const cookieStore = await cookies();

  // Read intent + inviter code cookies set before the auth redirect
  // For password reset, override intent to 'recovery' so the client shows the new-password form
  const isRecovery = type === 'recovery';
  const intent = isRecovery ? 'recovery' : (cookieStore.get('innerMapsIntent')?.value ?? 'save');
  const inviterCode = cookieStore.get('innerMapsInviterCode')?.value;

  const redirectUrl = new URL('/quiz', origin);
  redirectUrl.searchParams.set('authCallback', '1');
  redirectUrl.searchParams.set('intent', intent);
  if (inviterCode) redirectUrl.searchParams.set('inviterCode', inviterCode);

  const response = NextResponse.redirect(redirectUrl);

  // Clear the one-time cookies we just consumed
  response.cookies.delete('innerMapsIntent');
  if (inviterCode) response.cookies.delete('innerMapsInviterCode');

  // Exchange the token and write session cookies onto the redirect response
  if (code || (token_hash && type)) {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll: () => cookieStore.getAll(),
          // Write session cookies directly onto the redirect response
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) =>
              response.cookies.set(name, value, options)
            );
          },
        },
      }
    );

    if (code) {
      await supabase.auth.exchangeCodeForSession(code);
    } else if (token_hash && type) {
      await supabase.auth.verifyOtp({ token_hash, type: type as any });
    }
  }

  return response;
}
