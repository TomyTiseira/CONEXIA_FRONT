import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';

export function middleware(request) {
  const accessToken = request.cookies.get('access_token');
  const refreshToken = request.cookies.get('refresh_token');

  const isProtectedRoute = request.nextUrl.pathname.startsWith('/community');

  if (isProtectedRoute && !accessToken && !refreshToken) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('timeout', 'true');
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

// El matcher especifica qué rutas están protegidas
export const config = {
  matcher: ['/community'],
};
