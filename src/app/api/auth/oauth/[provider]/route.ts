import { NotFoundError } from "@/server/core/errors";
import { clientKey, enforceRateLimit } from "@/server/core/rate-limit";
import { ok, route } from "@/server/http/responses";
import { oauthService } from "@/server/services/oauth-service";

interface RouteContext {
  params: Promise<{ provider: string }>;
}

/**
 * `POST /api/auth/oauth/[provider]` — begins a social sign-in.
 *
 * Returns `503` with a human-readable reason while a provider has no
 * credentials configured; the sign-in buttons surface that message directly.
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

  return ok(await oauthService.createAuthorizationUrl(provider));
});
