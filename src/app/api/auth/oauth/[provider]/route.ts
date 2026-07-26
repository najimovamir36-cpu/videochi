import { cookies } from "next/headers";

import { NotFoundError } from "@/server/core/errors";
import { clientKey, enforceRateLimit } from "@/server/core/rate-limit";
import { ok, route } from "@/server/http/responses";
import { OAUTH_STATE_COOKIE_NAME, oauthStateCookieOptions } from "@/server/services/oauth-state";
import { oauthService } from "@/server/services/oauth-service";
import { randomToken } from "@/server/security/crypto";

interface RouteContext {
  params: Promise<{ provider: string }>;
}

/**
 * `POST /api/auth/oauth/[provider]` — begins a social sign-in.
 *
 * Returns `503` with a human-readable reason while a provider has no
 * credentials configured; the sign-in buttons surface that message directly.
 * On success, a random `state` value goes both into the authorization URL and
 * a short-lived httpOnly cookie — the callback route checks they match as a
 * CSRF defense before trusting anything Google sends back.
 */
export const POST = route(async (request: Request, context: RouteContext) => {
  enforceRateLimit({
    key: clientKey(request, "auth:oauth"),
    limit: 20,
    windowMs: 5 * 60 * 1000,
  });

  const { provider } = await context.params;

  if (!oauthService.isSupported(provider)) {
    throw new NotFoundError(`Unknown sign-in provider "${provider}".`);
  }

  const state = randomToken(24);
  const result = await oauthService.createAuthorizationUrl(provider, state);

  const cookieStore = await cookies();
  cookieStore.set(OAUTH_STATE_COOKIE_NAME, `${provider}:${state}`, oauthStateCookieOptions());

  return ok(result);
});
