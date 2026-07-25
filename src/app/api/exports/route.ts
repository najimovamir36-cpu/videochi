import { createExportSchema } from "@/lib/validations/export";
import { created, ok, parseJsonBody, route } from "@/server/http/responses";
import { exportService } from "@/server/services/export-service";
import { requireSession } from "@/server/services/session-service";
import { workspaceService } from "@/server/services/workspace-service";
import type { ExportJob } from "@/types/media";

/** `GET /api/exports` — render jobs for the signed-in user, newest first. */
export const GET = route(async () => {
  const { user } = await requireSession();
  return ok<ExportJob[]>(await workspaceService.listExports(user.id));
});

/**
 * `POST /api/exports` — queues a real ffmpeg render of a clip. Returns the job
 * immediately (status `queued`); the render runs in the background.
 */
export const POST = route(async (request: Request) => {
  const { user } = await requireSession();
  const input = await parseJsonBody(request, createExportSchema);

  const job = await exportService.createExport({
    ownerId: user.id,
    clipId: input.clipId,
    resolution: input.resolution,
    aspectRatio: input.aspectRatio,
  });

  return created<ExportJob>(job);
});
