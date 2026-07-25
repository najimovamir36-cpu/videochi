import { registerSchema } from "@/lib/validations/auth";
import { clientKey, enforceRateLimit } from "@/server/core/rate-limit";
import { created, parseJsonBody, route } from "@/server/http/responses";
import { authService } from "@/server/services/auth-service";
import { createSession } from "@/server/services/session-service";
import type { AuthResponse } from "@/types/auth";

/** `POST /api/auth/register` — creates an account and signs the user straight in. */
export const POST = route(async (request: Request) => {
  enforceRateLimit({
    key: clientKey(request, "auth:register"),
    limit: 5,
    windowMs: 10 * 60 * 1000,
  });

  const input = await parseJsonBody(request, registerSchema);
  const user = await authService.register(input);

  // New accounts get a long-lived session — they just proved ownership of the
  // password, and bouncing them to the sign-in screen would be hostile.
  const expiresAt = await createSession(user, true);

  return created<AuthResponse>({ user, expiresAt });
});
