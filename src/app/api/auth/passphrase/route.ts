import { passphraseSchema } from "@/lib/validations/auth";
import { clientKey, enforceRateLimit } from "@/server/core/rate-limit";
import { ok, parseJsonBody, route } from "@/server/http/responses";
import { authService } from "@/server/services/auth-service";
import { createSession } from "@/server/services/session-service";
import type { AuthResponse } from "@/types/auth";

/**
 * `POST /api/auth/passphrase` — the only way into the app. Tightly
 * rate-limited: this single shared secret is now the entire attack surface
 * that used to be spread across per-account passwords.
 */
export const POST = route(async (request: Request) => {
  enforceRateLimit({
    key: clientKey(request, "auth:passphrase"),
    limit: 8,
    windowMs: 15 * 60 * 1000,
  });

  const input = await parseJsonBody(request, passphraseSchema);
  const user = await authService.enterWithPassphrase(input.passphrase);
  const expiresAt = await createSession(user, true);

  return ok<AuthResponse>({ user, expiresAt });
});
