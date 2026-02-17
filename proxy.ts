import { NextRequest, NextResponse } from "next/server";

const COOKIE_NAME = "onyxtv_auth";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip the lock page itself + api routes + static files
  if (
    pathname === "/lock" ||
    pathname.startsWith("/api/") ||
    pathname.startsWith("/_next/") ||
    pathname.startsWith("/favicon")
  ) {
    return addSecurityHeaders(NextResponse.next());
  }

  const sitePassword = process.env.SITE_PASSWORD;

  // If no password is set, skip sitelock entirely
  if (!sitePassword) return addSecurityHeaders(NextResponse.next());

  // Check auth cookie
  const authCookie = request.cookies.get(COOKIE_NAME);
  if (authCookie?.value === sitePassword) {
    return addSecurityHeaders(NextResponse.next());
  }

  // Redirect to lock page
  const url = request.nextUrl.clone();
  url.pathname = "/lock";
  return NextResponse.redirect(url);
}

/**
 * Attach security headers to every response to harden against scraping
 * and information leakage.
 */
function addSecurityHeaders(response: NextResponse) {
  response.headers.set("X-Frame-Options", "SAMEORIGIN");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set("X-Robots-Tag", "noindex, nofollow");
  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
