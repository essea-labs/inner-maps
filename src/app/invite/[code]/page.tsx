import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { createServerClient } from '@supabase/ssr';

interface Props {
  params: Promise<{ code: string }>;
}

export default async function InvitePage({ params }: Props) {
  const { code } = await params;

  // Validate the invite code via Supabase
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: () => {},
      },
    }
  );

  const { data: invite } = await supabase
    .from('invites')
    .select('inviter_id, status')
    .eq('invite_code', code)
    .single();

  if (!invite) {
    // Invalid or expired invite
    return (
      <div style={{
        minHeight: '100vh',
        background: 'var(--bg, #FFF8F5)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '32px 24px',
        fontFamily: 'var(--font-dm-sans-family, sans-serif)',
        textAlign: 'center',
      }}>
        <div style={{ fontSize: 40, marginBottom: 16 }}>✦</div>
        <h2 style={{ fontSize: 24, fontWeight: 700, color: '#2D2217', marginBottom: 8 }}>
          This invite has expired
        </h2>
        <p style={{ fontSize: 15, color: '#8B7355', maxWidth: 280 }}>
          Ask your friend to share a fresh link from their Inner Maps profile.
        </p>
        <a
          href="/quiz"
          style={{
            display: 'inline-block',
            marginTop: 32,
            padding: '14px 32px',
            background: '#E8A87C',
            color: '#fff',
            borderRadius: 100,
            fontWeight: 600,
            fontSize: 15,
            textDecoration: 'none',
          }}
        >
          Take the Quiz anyway
        </a>
      </div>
    );
  }

  // Valid invite — set a cookie so the auth callback can link invitee to inviter
  // We redirect server-side; the cookie needs to be on the response
  const response = new Response(null, {
    status: 302,
    headers: {
      Location: '/quiz',
      'Set-Cookie': `innerMapsInviterCode=${code}; Path=/; Max-Age=604800; SameSite=Lax`,
    },
  });

  // next/navigation redirect doesn't support setting cookies; use redirect() after
  // setting the cookie via the response headers pattern isn't possible in Server Components.
  // Instead: redirect to /quiz with the code as a URL param, then quiz/page.tsx reads it.
  redirect(`/quiz?inviterCode=${encodeURIComponent(code)}`);
}
