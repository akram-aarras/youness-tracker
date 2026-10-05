import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { decodeSession, SESSION_COOKIE_NAME } from './lib/auth';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Allow public assets, internal Next.js paths, and authentication API routes
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api/auth') ||
    pathname === '/favicon.ico' ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  // 2. Read and decode the session cookie
  const sessionCookie = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  const session = sessionCookie ? decodeSession(sessionCookie) : null;
  const isAuthenticated = Boolean(session && session.userId && session.role);
  const isLoginPage = pathname === '/login';

  // 3. Unauthenticated access handling
  if (!isAuthenticated) {
    if (isLoginPage) {
      return NextResponse.next();
    }
    const loginUrl = new URL('/login', request.url);
    if (pathname !== '/') {
      loginUrl.searchParams.set('redirect', pathname);
    }
    return NextResponse.redirect(loginUrl);
  }

  // 4. Authenticated user visiting /login -> redirect based on role
  if (isLoginPage) {
    if (session?.role === 'technician' || session?.role === 'field_lead') {
      return NextResponse.redirect(new URL('/technician', request.url));
    }
    return NextResponse.redirect(new URL('/', request.url));
  }

  // 5. Role-based route protection:
  // Technicians and Field Leads are strictly prohibited from accessing the Admin NOC Dashboard ('/') or admin routes
  if (session?.role === 'technician' || session?.role === 'field_lead') {
    if (pathname === '/' || pathname.startsWith('/admin')) {
      return NextResponse.redirect(new URL('/technician', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api/auth|_next/static|_next/image|favicon.ico|.*\\..*).*)'],
};
