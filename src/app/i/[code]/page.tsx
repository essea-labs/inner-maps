import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { createServerClient } from '@supabase/ssr';

interface Props {
  params: Promise<{ code: string }>;
}

export default async function ShortInvitePage({ params }: Props) {
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
    return (
      <div style={{
        minHeight: '100vh',
        background: '#FFF8F5',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '32px 24px',
        fontFamily: 'sans-serif',
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

  redirect(`/quiz?inviterCode=${encodeURIComponent(code)}`);
}
