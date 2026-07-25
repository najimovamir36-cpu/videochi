import { registerUploadSchema } from "@/lib/validations/upload";
import { created, ok, parseJsonBody, route } from "@/server/http/responses";
import { requireSession } from "@/server/services/session-service";
import { workspaceService } from "@/server/services/workspace-service";
import type { VideoUpload } from "@/types/media";

export interface RegisteredUpload {
  upload: VideoUpload;
  /** Where the client should `PUT` the bytes. */
  uploadUrl: string;
}

/** `GET /api/uploads` — the signed-in user's uploads, newest first. */
export const GET = route(async () => {
  const { user } = await requireSession();
  return ok<VideoUpload[]>(await workspaceService.listUploads(user.id));
});

/**
 * `POST /api/uploads` — registers file metadata before any bytes move.
 *
 * Validating up front means an unsupported or oversized file is rejected in one
 * small request instead of after a multi-gigabyte transfer.
 */
export const POST = route(async (request: Request) => {
  const { user } = await requireSession();
  const input = await parseJsonBody(request, registerUploadSchema);

  const upload = await workspaceService.registerUpload({
    ownerId: user.id,
    fileName: input.fileName,
    size: input.size,
    mimeType: input.mimeType,
    source: input.source,
  });

  return created<RegisteredUpload>({
    upload,
    uploadUrl: `/api/uploads/${upload.id}/content`,
  });
});
