import { ok, route } from "@/server/http/responses";
import { destroySession } from "@/server/services/session-service";

/**
 * `POST /api/auth/logout` — clears the session cookie.
 *
 * POST rather than GET so a cross-site image or link cannot sign the user out.
 */
export const POST = route(async () => {
  await destroySession();
  return ok({ signedOut: true });
});
