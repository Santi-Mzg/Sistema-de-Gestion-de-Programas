import { NextResponse } from "next/server";
import type { NextRequest } from 'next/server'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://sistema-de-gestion-de-programas-backend.onrender.com';


const PUBLIC_ROUTES = [
  "/login",
  "/recuperar-password",
];

// Rutas que requieren un rol específico
const ADMIN_ROUTES = [
  "/system_admin", "/docente", "/coordinador", "/secretaria", "/administracion"
];



export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  let token = req.cookies.get('jwt')?.value;

  console.log("Token in middleware:", req.cookies.get('jwt'));

  // Rutas públicas
  if (PUBLIC_ROUTES.includes(pathname)) {
    if (token) { // Si estoy autenticado redirigir a home
      return NextResponse.redirect(new URL("/", req.url));
    }
    return NextResponse.next();
  }

  // Si no está autenticado → redirigir a login
  if (!token) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  try {
    const res = await fetch(`${API_URL}/api/auth/me`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        Cookie: `jwt=${token}`,
      },   
      cache: "no-store"
    });

    console.log("Auth me status:", res.status);

    if (!res.ok) throw new Error("Token inválido");

    return NextResponse.next();
  } catch (error) {
    const response = NextResponse.redirect(new URL("/login", req.url));
    response.cookies.delete("jwt"); 
    return response;
  }
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
