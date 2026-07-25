import { forgotPasswordSchema } from "@/lib/validations/auth";
import { clientKey, enforceRateLimit } from "@/server/core/rate-limit";
import { ok, parseJsonBody, route } from "@/server/http/responses";
import { authService } from "@/server/services/auth-service";

/**
 * `POST /api/auth/forgot-password` — starts a password reset.
 *
 * Responds identically whether or not the email is registered, so the endpoint
 * cannot be used to enumerate accounts. Outside production the reset token is
 * returned in the payload, because there is no mail transport wired up yet.
 */
export const POST = route(async (request: Request) => {
  enforceRateLimit({
    key: clientKey(request, "auth:forgot-password"),
    limit: 5,
    windowMs: 15 * 60 * 1000,
  });

  const input = await parseJsonBody(request, forgotPasswordSchema);
  const { token } = await authService.requestPasswordReset(input);

  return ok({ sent: true as const, devToken: token });
});
