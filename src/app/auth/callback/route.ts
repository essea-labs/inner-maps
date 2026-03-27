import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const token_hash = searchParams.get('token_hash');
  const type = searchParams.get('type');

  const cookieStore = await cookies();

  // Supabase may redirect with error params (e.g., expired recovery token)
  const supabaseError = searchParams.get('error_description') || searchParams.get('error');
  let authError: string | null = supabaseError || null;

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            cookieStore.set(name, value)
          );
        },
      },
    }
  );

  // Exchange recovery token for a session
  if (token_hash && type) {
    const { error } = await supabase.auth.verifyOtp({ token_hash, type: type as any });
    if (error) {
      console.error('OTP verification failed:', error.message);
      authError = error.message;
    }
  }

  // Build redirect — only recovery callbacks use this route now
  const redirectUrl = new URL('/quiz', origin);
  redirectUrl.searchParams.set('authCallback', '1');
  redirectUrl.searchParams.set('intent', 'recovery');
  if (authError) redirectUrl.searchParams.set('authError', authError);

  const response = NextResponse.redirect(redirectUrl);

  // Write session cookies onto the redirect response
  cookieStore.getAll().forEach((cookie) => {
    response.cookies.set(cookie.name, cookie.value);
  });

  return response;
}
