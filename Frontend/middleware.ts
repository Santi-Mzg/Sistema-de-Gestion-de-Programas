import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

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


async function fetchUser(req: NextRequest) {
  const token = req.cookies.get("jwt")?.value;
  if (!token) return null;

  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/me`, {
      method: "GET",
      headers: {
        "Accept": "application/json",
      },
      credentials: "include",
    });

    if (!res.ok) return null;

    return await res.json();
  } catch {
    return null;
  }
}


export async function middleware(req: NextRequest) {
//   const { pathname } = req.nextUrl;

//   const user = await fetchUser(req);
//   console.log("Middleware user:", user);

//   // Permitir rutas públicas sin autenticación
//   if (PUBLIC_ROUTES.some(route => pathname.startsWith(route))) {
//     return NextResponse.next();
//   }

//   // Si no está autenticado → redirigir a login
//   if (!user) {
//     const loginUrl = new URL("/login", req.url);
//     loginUrl.searchParams.set("redirect", pathname);
//     return NextResponse.redirect(loginUrl);
//   }

//   const userRole =
//     Array.isArray(user.roles) && user.roles.length > 0 ? user.roles[0] : null;


//   if (userRole === "ADMIN") {
//     return NextResponse.next();
//   }

//   const pathRoot = "/" + pathname.split("/")[1];

//   const allowedRoots = userRole ? (ROLE_ROOTS[userRole as keyof typeof ROLE_ROOTS] ?? []) : [];

//   // Si el usuario NO tiene permitido ese root → acceso denegado
//   if (!allowedRoots.includes(pathRoot)) {
//     return NextResponse.redirect(new URL("/unauthorized", req.url));
//   }

  return NextResponse.next();
}

// Rutas que debe interceptar el middleware
export const config = {
  matcher: [
    "/admin/:path*",
    "/profesor/:path*",
    "/coordinador/:path*",
    "/secretaria/:path*",
    "/administracion/:path*",
    "/((?!_next|static|favicon.ico).*)",
  ],
};
