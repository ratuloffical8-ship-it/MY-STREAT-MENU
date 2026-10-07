// apps/rider/src/middleware.ts
import { NextResponse, type NextRequest } from "next/server";
import { PUBLIC_ROUTES, ROUTES, SESSION_COOKIE } from "@/config/constants";

function isPublicPath(pathname: string): boolean {
  return PUBLIC_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );
}

/**
 * Logged-out rider  -> any page except login  => sent to /login
 * Logged-in rider   -> /login                 => sent to Home
 *
 * This only checks that the login cookie exists (a convenience gate).
 * The backend must still verify the token on every API request.
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hasSession = Boolean(request.cookies.get(SESSION_COOKIE)?.value);
  const isPublic = isPublicPath(pathname);

  if (!hasSession && !isPublic) {
    const url = request.nextUrl.clone();
    url.pathname = ROUTES.login;
    url.search = "";
    // Remember where the rider wanted to go, so login can return there
    if (pathname !== ROUTES.root) url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  if (hasSession && isPublic) {
    const url = request.nextUrl.clone();
    url.pathname = ROUTES.home;
    url.search = "";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  // Skip API routes, Next.js internals and static files
  matcher: [
    "/((?!api/|_next/static/|_next/image|favicon.ico|sw.js|manifest.json|icons/|logo/|images/).*)",
  ],
};
