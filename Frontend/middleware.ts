import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const PROTECTED_ROUTES = ['/dashboard', '/programas', '/usuarios'];
const AUTH_ROUTES = ['/(auth)/login', '/(auth)/registro', '/(auth)/recuperar-contraseña'];

export function middleware(request: NextRequest) {
  const tokenCookie = request.cookies.get('jwt');
  const pathname = request.nextUrl.pathname;

  if (PROTECTED_ROUTES.some(route => pathname.startsWith(route))) {
    if (!tokenCookie) {
      const url = request.nextUrl.clone();
      url.pathname = '/login';

      return NextResponse.redirect(url);
    }

    return NextResponse.next();
  }

  if (AUTH_ROUTES.includes(pathname) && tokenCookie) {
    
    const url = request.nextUrl.clone();
    url.pathname = '/';
    return NextResponse.redirect(url);
  }
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};