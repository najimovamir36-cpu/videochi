import { changePasswordSchema } from "@/lib/validations/settings";
import { clientKey, enforceRateLimit } from "@/server/core/rate-limit";
import { ok, parseJsonBody, route } from "@/server/http/responses";
import { createSession, requireSession } from "@/server/services/session-service";
import { settingsService } from "@/server/services/settings-service";

/**
 * `PATCH /api/settings/password` — rotates the password.
 *
 * Requires the current password, so a stolen session cookie alone cannot lock
 * the real owner out.
 */
export const PATCH = route(async (request: Request) => {
  const { user } = await requireSession();

  enforceRateLimit({
    key: clientKey(request, `settings:password:${user.id}`),
    limit: 5,
    windowMs: 15 * 60 * 1000,
  });

  const input = await parseJsonBody(request, changePasswordSchema);
  const updated = await settingsService.changePassword(user.id, input);

  // Re-issue the cookie so the session outlives the credential change.
  const expiresAt = await createSession(updated, true);

  return ok({ user: updated, expiresAt });
});
