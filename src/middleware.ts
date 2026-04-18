import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  const { pathname } = request.nextUrl;
  const response = NextResponse.next();

  // ==========================================
  // SECURITY: Content Security Policy
  // ==========================================
  response.headers.set(
    "X-DNS-Prefetch-Control",
    "on"
  );

  // Rutas públicas que no requieren autenticación
  const publicPaths = ["/login", "/api/auth"];
  const isPublicPath = publicPaths.some((path) => pathname.startsWith(path));

  // Si no hay token y no es una ruta pública, redirigir al login
  if (!token && !isPublicPath) {
    const loginUrl = new URL("/login", request.url);
    // Sanitizar callbackUrl para prevenir open redirect
    const safeCallback = pathname.startsWith("/") ? pathname : "/";
    loginUrl.searchParams.set("callbackUrl", safeCallback);
    return NextResponse.redirect(loginUrl);
  }

  // Si hay token y está en login, redirigir al dashboard
  if (token && pathname === "/login") {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
