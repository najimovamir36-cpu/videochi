import { loginSchema } from "@/lib/validations/auth";
import { clientKey, enforceRateLimit } from "@/server/core/rate-limit";
import { ok, parseJsonBody, route } from "@/server/http/responses";
import { authService } from "@/server/services/auth-service";
import { createSession } from "@/server/services/session-service";
import type { AuthResponse } from "@/types/auth";

/** `POST /api/auth/login` — verifies credentials and issues the session cookie. */
export const POST = route(async (request: Request) => {
  enforceRateLimit({
    key: clientKey(request, "auth:login"),
    limit: 10,
    windowMs: 5 * 60 * 1000,
  });

  const input = await parseJsonBody(request, loginSchema);
  const user = await authService.login(input);
  const expiresAt = await createSession(user, input.remember);

  return ok<AuthResponse>({ user, expiresAt });
});
