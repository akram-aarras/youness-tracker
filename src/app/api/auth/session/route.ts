import { NextResponse } from 'next/server';
import { decodeSession, SESSION_COOKIE_NAME } from '@/lib/auth';
import { cookies } from 'next/headers';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;

    if (!token) {
      return NextResponse.json({ authenticated: false, user: null });
    }

    const payload = decodeSession(token);
    if (!payload) {
      return NextResponse.json({ authenticated: false, user: null });
    }

    return NextResponse.json({
      authenticated: true,
      user: {
        id: payload.userId,
        email: payload.email,
        username: payload.username,
        name: payload.name,
        role: payload.role,
        technicianId: payload.technicianId,
      },
    });
  } catch (error) {
    console.error('Session check error:', error);
    return NextResponse.json({ authenticated: false, user: null }, { status: 500 });
  }
}
