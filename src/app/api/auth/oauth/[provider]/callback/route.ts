import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { routes } from "@/config/routes";
import { clientKey, enforceRateLimit } from "@/server/core/rate-limit";
import { createSession } from "@/server/services/session-service";
import { authService } from "@/server/services/auth-service";
import { OAUTH_STATE_COOKIE_NAME, oauthStateCookieOptions } from "@/server/services/oauth-state";
import { oauthService } from "@/server/services/oauth-service";

interface RouteContext {
  params: Promise<{ provider: string }>;
}

/**
 * `GET /api/auth/oauth/[provider]/callback` — where the provider redirects
 * the browser back to after the user approves the sign-in.
 *
 * This is a full-page navigation, not a fetch call, so unlike the rest of the
 * API it never returns a JSON error envelope — every path here ends in a
 * redirect, with failures routed to `/login?error=...` so the login page can
 * surface a toast instead of the browser rendering raw JSON.
 */
export const GET = async (request: Request, context: RouteContext) => {
  const { provider } = await context.params;
  const url = new URL(request.url);
  const loginError = (reason: string) =>
    NextResponse.redirect(new URL(`${routes.login}?error=${encodeURIComponent(reason)}`, url.origin));

  try {
    enforceRateLimit({
      key: clientKey(request, "auth:oauth:callback"),
      limit: 30,
      windowMs: 5 * 60 * 1000,
    });

    if (!oauthService.isSupported(provider)) {
      return loginError("Unknown sign-in provider.");
    }

    const providerError = url.searchParams.get("error");
    if (providerError) {
      return loginError(`Sign-in was cancelled or denied (${providerError}).`);
    }

    const code = url.searchParams.get("code");
    const state = url.searchParams.get("state");
    if (!code || !state) {
      return loginError("Sign-in response was missing required parameters.");
    }

    const cookieStore = await cookies();
    const expectedState = cookieStore.get(OAUTH_STATE_COOKIE_NAME)?.value;
    cookieStore.set(OAUTH_STATE_COOKIE_NAME, "", { ...oauthStateCookieOptions(), maxAge: 0 });

    if (!expectedState || expectedState !== `${provider}:${state}`) {
      return loginError("Sign-in session expired. Please try again.");
    }

    const profile = await oauthService.exchangeCodeForProfile(provider, code);
    const user = await authService.continueWithOAuthProfile(profile);
    await createSession(user, true);

    return NextResponse.redirect(new URL(routes.dashboard, url.origin));
  } catch (error) {
    console.error(`[oauth] ${provider} callback failed`, error);
    const message = error instanceof Error ? error.message : "Sign-in failed. Please try again.";
    return loginError(message);
  }
};
