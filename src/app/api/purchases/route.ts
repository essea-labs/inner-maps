import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get('user_id');

  if (!userId) {
    return NextResponse.json({ error: 'Missing user_id' }, { status: 400 });
  }

  const { data, error } = await supabaseAdmin
    .from('purchases')
    .select('product_type, connection_id')
    .eq('user_id', userId);

  if (error) {
    console.error('Failed to fetch purchases:', error.message);
    return NextResponse.json({ error: 'Failed to fetch purchases' }, { status: 500 });
  }

  return NextResponse.json({ purchases: data ?? [] });
}
