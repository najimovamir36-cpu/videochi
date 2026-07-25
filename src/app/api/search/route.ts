import { ok, route } from "@/server/http/responses";
import { requireSession } from "@/server/services/session-service";
import { workspaceService } from "@/server/services/workspace-service";
import type { SearchResult } from "@/types";

/**
 * `GET /api/search?q=` — powers the top-bar search.
 *
 * A short or missing term returns an empty list rather than an error: the input
 * fires on every keystroke, and 400s would be noise.
 */
export const GET = route(async (request: Request) => {
  const { user } = await requireSession();

  const query = new URL(request.url).searchParams.get("q") ?? "";
  return ok<SearchResult[]>(await workspaceService.search(user.id, query));
});
