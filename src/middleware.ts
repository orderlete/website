import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Admin Route Protection
  if (pathname.startsWith('/admin')) {
    // Skip protection for the login page itself
    if (pathname === '/admin/login') {
      return NextResponse.next();
    }

    // Check for admin session
    // NOTE: This uses a simple cookie for demonstration. 
    // In production, use Supabase JWT validation.
    const adminSession = request.cookies.get('admin_authorized');

    if (!adminSession || adminSession.value !== 'true') {
      const url = request.nextUrl.clone();
      url.pathname = '/admin/login';
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};
