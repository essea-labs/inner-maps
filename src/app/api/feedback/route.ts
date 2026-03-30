import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase-admin';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { message, email, page } = body;

    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    if (message.length > 2000) {
      return NextResponse.json({ error: 'Message too long (max 2000 characters)' }, { status: 400 });
    }

    const admin = getSupabaseAdmin();
    const { error } = await admin.from('feedback').insert({
      message: message.trim(),
      email: email?.trim() || null,
      page: page || null,
    });

    if (error) {
      console.error('feedback insert error:', error.message);
      return NextResponse.json({ error: 'Could not save feedback' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('feedback error:', err?.message);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
