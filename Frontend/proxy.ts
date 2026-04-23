  import { NextResponse } from "next/server";
  import type { NextRequest } from 'next/server'


  const PUBLIC_ROUTES = [
    "/login",
    "/reset-password",
    "/set-password",
  ];


  export async function proxy(req: NextRequest) {
    const { pathname } = req.nextUrl;

    let token = req.cookies.get('jwt')?.value;

    // Rutas públicas
    if (PUBLIC_ROUTES.some(route => pathname.startsWith(route))) {
      if (token) { // Si estoy autenticado redirigir a home
        return NextResponse.redirect(new URL("/", req.url));
      }
      return NextResponse.next();
    }

    // Si no está autenticado → redirigir a login
    if (!token) {
      return NextResponse.redirect(new URL("/login", req.url));
    }
  }

  // Rutas que debe interceptar el middleware
  export const config = {
    matcher: [
      '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
  };
