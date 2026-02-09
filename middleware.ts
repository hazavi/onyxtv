import { NextRequest, NextResponse } from "next/server";

const COOKIE_NAME = "onyxtv_auth";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip the lock page itself + api routes + static files
  if (
    pathname === "/lock" ||
    pathname.startsWith("/api/") ||
    pathname.startsWith("/_next/") ||
    pathname.startsWith("/favicon")
  ) {
    return NextResponse.next();
  }

  const sitePassword = process.env.SITE_PASSWORD;

  // If no password is set, skip sitelock entirely
  if (!sitePassword) return NextResponse.next();

  // Check auth cookie
  const authCookie = request.cookies.get(COOKIE_NAME);
  if (authCookie?.value === sitePassword) {
    return NextResponse.next();
  }

  // Redirect to lock page
  const url = request.nextUrl.clone();
  url.pathname = "/lock";
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
