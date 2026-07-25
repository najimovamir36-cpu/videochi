import { updateProfileSchema } from "@/lib/validations/settings";
import { ok, parseJsonBody, route } from "@/server/http/responses";
import { requireSession } from "@/server/services/session-service";
import { settingsService } from "@/server/services/settings-service";
import type { User } from "@/types/auth";

/** `PATCH /api/settings/profile` — updates the signed-in user's display name. */
export const PATCH = route(async (request: Request) => {
  const { user } = await requireSession();
  const input = await parseJsonBody(request, updateProfileSchema);

  return ok<User>(await settingsService.updateProfile(user.id, input));
});
