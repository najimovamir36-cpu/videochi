import { ok, route } from "@/server/http/responses";
import { requireSession } from "@/server/services/session-service";
import { workspaceService } from "@/server/services/workspace-service";
import type { Clip, Project } from "@/types/media";

interface RouteContext {
  params: Promise<{ id: string }>;
}

/** `GET /api/projects/[id]` — a project and its clips, ranked by score. */
export const GET = route(async (_request: Request, context: RouteContext) => {
  const { user } = await requireSession();
  const { id } = await context.params;
  const detail = await workspaceService.getProjectDetail(user.id, id);
  return ok<{ project: Project; clips: Clip[] }>(detail);
});
