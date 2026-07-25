import { NextResponse, type NextRequest } from "next/server";

import { isGuestOnlyPath, isProtectedPath, routes } from "@/config/routes";
import { env } from "@/server/core/env";
import { SESSION_COOKIE_NAME, verifySessionToken } from "@/server/security/session-token";

/**
 * Edge-side route protection.
 *
 * Only the cookie signature is checked here — the Edge runtime has no access to
 * the data layer, and re-reading the user on every navigation would not be
 * worth the latency. Pages still call `requireSession()`, which resolves the
 * user for real, so a token signed for a since-deleted account is rejected
 * there. This middleware is the fast path, not the authority.
 */
export async function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  const session = token ? await verifySessionToken(token, env.AUTH_SECRET) : null;

  if (!session && isProtectedPath(pathname)) {
    const url = request.nextUrl.clone();
    url.pathname = routes.login;
    url.search = "";
    url.searchParams.set("next", `${pathname}${search}`);

    const response = NextResponse.redirect(url);
    // Drop an expired or tampered cookie so the browser stops resending it.
    if (token) response.cookies.delete(SESSION_COOKIE_NAME);
    return response;
  }

  if (session && isGuestOnlyPath(pathname)) {
    const url = request.nextUrl.clone();
    url.pathname = routes.dashboard;
    url.search = "";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  // Route handlers do their own authorisation and return JSON rather than
  // redirects, so `/api` is excluded along with build output.
  matcher: ["/((?!api/|_next/).*)"],
};
