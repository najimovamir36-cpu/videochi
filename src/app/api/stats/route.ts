import { ok, route } from "@/server/http/responses";
import { requireSession } from "@/server/services/session-service";
import { workspaceService } from "@/server/services/workspace-service";
import type { DashboardOverview } from "@/server/services/workspace-service";

/** `GET /api/stats` — the aggregated dashboard read-model. */
export const GET = route(async () => {
  const { user } = await requireSession();
  return ok<DashboardOverview>(await workspaceService.getOverview(user.id));
});
