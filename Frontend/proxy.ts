import { NextResponse } from "next/server";
import type { NextRequest } from 'next/server'


const PUBLIC_ROUTES = [
  "/login",
  "/register",
  "/recuperar-contraseña",
];

// Rutas que requieren un rol específico
const ROLE_ROOTS = {
  ADMIN: ["/admin", "/profesor", "/coordinador", "/secretaria", "/administracion"],
  ADMINISTRATIVO: ["/administracion"],
  PROFESOR: ["/profesor"],
  COORDINADOR: ["/coordinador"],
  SECRETARIO: ["/secretaria"],
};



export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;


  let token = req.cookies.get('jwt')?.value;

  // Permitir rutas públicas sin autenticación
  if (PUBLIC_ROUTES.includes(pathname)) {
    if (token && pathname === "/login") {
      return NextResponse.redirect(new URL("/", req.url));
    }
    return NextResponse.next();
  }

  // Si no está autenticado → redirigir a login
  if (!token) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/me`, {
      method: "GET",
      headers: {
        Cookie: `jwt=${token}`,
        'Content-Type': 'application/json'
      },   
      credentials: "include",
      cache: "no-store"
    });

    console.log("Auth me status:", res.status);

    if (!res.ok) {
      // Si el backend dice 401 o 403, el token expiró o es inválido
      throw new Error("Token expirado");
    }

    return NextResponse.next();
  } catch (error) {
    console.log("Auth me status:", error);

    // const response = NextResponse.redirect(new URL("/login", req.url));
    // response.cookies.delete("jwt"); 
    // return response;
  }

  return NextResponse.next();
}

// Rutas que debe interceptar el middleware
export const config = {
  matcher: [
    /*
     * 1. Captura todas las rutas (incluida la raíz "/")
     * 2. Excluye archivos estáticos mediante una expresión regular negativa
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
