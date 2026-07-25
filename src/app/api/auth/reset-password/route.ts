import { resetPasswordSchema } from "@/lib/validations/auth";
import { clientKey, enforceRateLimit } from "@/server/core/rate-limit";
import { ok, parseJsonBody, route } from "@/server/http/responses";
import { authService } from "@/server/services/auth-service";
import { createSession } from "@/server/services/session-service";
import type { AuthResponse } from "@/types/auth";

/**
 * `POST /api/auth/reset-password` — consumes a reset token and sets a new
 * password, then signs the user straight in so they land in the app rather than
 * back on the login screen.
 */
export const POST = route(async (request: Request) => {
  enforceRateLimit({
    key: clientKey(request, "auth:reset-password"),
    limit: 10,
    windowMs: 15 * 60 * 1000,
  });

  const input = await parseJsonBody(request, resetPasswordSchema);
  const user = await authService.resetPassword(input.token, input.password);
  const expiresAt = await createSession(user, true);

  return ok<AuthResponse>({ user, expiresAt });
});
