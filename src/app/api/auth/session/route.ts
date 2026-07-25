import { ok, route } from "@/server/http/responses";
import { getSession } from "@/server/services/session-service";
import type { Session } from "@/types/auth";

/**
 * `GET /api/auth/session` — resolves the current session, or `null` for guests.
 *
 * Never a 401: "not signed in" is a valid answer to this question.
 */
export const GET = route(async () => {
  const session = await getSession();
  return ok<Session | null>(session);
});
