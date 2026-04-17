import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export default function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. PUBLIC ROUTES (Always accessible)
  const isPublicRoute = 
    pathname === '/auth' || 
    pathname === '/admin/login' || 
    pathname.startsWith('/api/') || // Assuming APIs have their own auth
    pathname.includes('.') ||        // Assets like logo.png, favicon.ico
    pathname.startsWith('/_next');   // Next.js internals

  // 2. ADMIN PROTECTION
  if (pathname.startsWith('/admin') && pathname !== '/admin/login') {
    const adminSession = request.cookies.get('admin_authorized');
    if (!adminSession || adminSession.value !== 'true') {
      const url = request.nextUrl.clone();
      url.pathname = '/admin/login';
      return NextResponse.redirect(url);
    }
  }

  // 3. GLOBAL USER PROTECTION (Strict Auth)
  if (!isPublicRoute && !pathname.startsWith('/admin')) {
    // Check for user session in cookie 
    // (We should update the AuthPage to set this cookie)
    const userSession = request.cookies.get('user_session');
    
    if (!userSession) {
      const url = request.nextUrl.clone();
      url.pathname = '/auth';
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
