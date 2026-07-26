import { registerUploadSchema } from "@/lib/validations/upload";
import { created, ok, parseJsonBody, route } from "@/server/http/responses";
import { requireSession } from "@/server/services/session-service";
import { workspaceService } from "@/server/services/workspace-service";
import { makeKey, usingBlobStorage } from "@/server/storage";
import type { VideoUpload } from "@/types/media";

/**
 * Where the client sends the bytes: on the blob backend (Vercel), a plain PUT
 * through our own route would hit the platform's ~4.5 MB request-body cap
 * before it even reached our code, so the browser uploads straight to Vercel
 * Blob instead, then tells us once it's done. The local backend (Railway,
 * dev) has no such cap, so it keeps the simple direct PUT.
 */
export type UploadTransport =
  | { kind: "stream-put"; uploadUrl: string }
  | { kind: "blob-direct"; pathname: string; handleUploadUrl: string; completeUrl: string };

export interface RegisteredUpload {
  upload: VideoUpload;
  transport: UploadTransport;
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

  const transport: UploadTransport = usingBlobStorage
    ? {
        kind: "blob-direct",
        pathname: makeKey("uploads", upload.id, upload.fileName),
        handleUploadUrl: "/api/uploads/blob-token",
        completeUrl: `/api/uploads/${upload.id}/complete`,
      }
    : { kind: "stream-put", uploadUrl: `/api/uploads/${upload.id}/content` };

  return created<RegisteredUpload>({ upload, transport });
});
