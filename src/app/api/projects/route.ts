import { ok, route } from "@/server/http/responses";
import { requireSession } from "@/server/services/session-service";
import { workspaceService } from "@/server/services/workspace-service";
import type { Project } from "@/types/media";

/** `GET /api/projects` — the signed-in user's projects, newest first. */
export const GET = route(async () => {
  const { user } = await requireSession();
  return ok<Project[]>(await workspaceService.listProjects(user.id));
});
