import { NextResponse } from 'next/server';
import { SESSION_COOKIE_NAME } from '@/lib/auth';
import { isSupabaseConfigured, supabase } from '@/lib/supabase';

export async function POST() {
  try {
    if (isSupabaseConfigured && supabase) {
      await supabase.auth.signOut().catch(() => {});
    }

    const response = NextResponse.json({ success: true, message: 'Logged out successfully' });

    response.cookies.set({
      name: SESSION_COOKIE_NAME,
      value: '',
      path: '/',
      maxAge: 0,
      expires: new Date(0),
    });

    return response;
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
