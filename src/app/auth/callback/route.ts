import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const code = searchParams.get('code');
  const cookieStore = await cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: () => {
          // Session cookies are set by the browser-side client after redirect
        },
      },
    }
  );

  if (code) {
    await supabase.auth.exchangeCodeForSession(code);
  }

  // Read intent + inviter code cookies set before OAuth redirect
  const intent = cookieStore.get('innerMapsIntent')?.value ?? 'save';
  const inviterCode = cookieStore.get('innerMapsInviterCode')?.value;

  const redirectUrl = new URL('/quiz', origin);
  redirectUrl.searchParams.set('authCallback', '1');
  redirectUrl.searchParams.set('intent', intent);
  if (inviterCode) redirectUrl.searchParams.set('inviterCode', inviterCode);

  const response = NextResponse.redirect(redirectUrl);
  // Clear the cookies we just consumed
  response.cookies.delete('innerMapsIntent');
  if (inviterCode) response.cookies.delete('innerMapsInviterCode');

  return response;
}
