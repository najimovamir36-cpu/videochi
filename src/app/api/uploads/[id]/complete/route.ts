import { completeUploadSchema } from "@/lib/validations/upload";
import { ok, parseJsonBody, route } from "@/server/http/responses";
import { analysisService } from "@/server/services/analysis-service";
import { requireSession } from "@/server/services/session-service";
import { workspaceService } from "@/server/services/workspace-service";
import { storage } from "@/server/storage";

interface RouteContext {
  params: Promise<{ id: string }>;
}

// See uploads/[id]/content/route.ts's PUT — same background pipeline, same limit.
export const maxDuration = 300;

/**
 * `POST /api/uploads/[id]/complete` — the browser calls this once its direct
 * PUT to Vercel Blob (see /api/uploads/blob-token) has finished. There's no
 * byte stream to trust here, so the size comes from asking storage what's
 * actually there rather than from the request body.
 */
export const POST = route(async (request: Request, context: RouteContext) => {
  const { user } = await requireSession();
  const { id } = await context.params;

  await workspaceService.getUpload(user.id, id);
  const { key } = await parseJsonBody(request, completeUploadSchema);
  const { size } = await storage.stat(key);

  const completed = await workspaceService.completeUpload(user.id, id, size, key);

  // Kick off analysis automatically — "upload a video, get shorts". The pipeline
  // runs in the background; the returned project starts in `analyzing`.
  const project = await analysisService.startAnalysisForUpload(completed);

  return ok({ upload: completed, projectId: project.id });
});
