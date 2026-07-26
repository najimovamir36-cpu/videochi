import { NotFoundError } from "@/server/core/errors";
import { ok, route } from "@/server/http/responses";
import { analysisService } from "@/server/services/analysis-service";
import { requireSession } from "@/server/services/session-service";
import { workspaceService } from "@/server/services/workspace-service";
import { makeKey, storage } from "@/server/storage";

interface RouteContext {
  params: Promise<{ id: string }>;
}

// The analysis pipeline (transcription + ffmpeg) runs in the background via
// `after()` once the upload response is sent, so this invocation needs to stay
// alive for the whole pipeline, not just the upload transfer. Vercel caps this
// per plan (Hobby: 60s max, Pro/Fluid: up to 800s) — see DEPLOY-VERCEL.md.
export const maxDuration = 300;

/**
 * `PUT /api/uploads/[id]/content` — receives and stores the bytes for a
 * registered upload.
 *
 * The body is streamed straight to disk chunk-by-chunk, so an 8 GB upload
 * costs a constant few kilobytes of RAM. The transfer is real end to end:
 * progress, speed, ETA and cancellation in the UI are driven by this request,
 * a truncated body is rejected, and the stored file is probed for its true
 * duration before the upload is marked ready.
 */
export const PUT = route(async (request: Request, context: RouteContext) => {
  const { user } = await requireSession();
  const { id } = await context.params;

  // Resolve before reading the body so an unauthorised request is rejected
  // without transferring gigabytes first.
  const upload = await workspaceService.getUpload(user.id, id);
  const pathname = makeKey("uploads", upload.id, upload.fileName);

  const { bytes, key } = request.body
    ? await storage.writeStream(pathname, request.body)
    : { bytes: 0, key: pathname };

  const completed = await workspaceService.completeUpload(user.id, id, bytes, key);

  // Kick off analysis automatically — "upload a video, get shorts". The pipeline
  // runs in the background; the returned project starts in `analyzing`.
  const project = await analysisService.startAnalysisForUpload(completed);

  return ok({ upload: completed, projectId: project.id });
});

const RANGE_PREFIX = "bytes=";

/**
 * `GET /api/uploads/[id]/content` — streams the stored video back, with HTTP
 * range support so the browser's `<video>` element can seek without downloading
 * the whole file.
 */
export const GET = route(async (request: Request, context: RouteContext) => {
  const { user } = await requireSession();
  const { id } = await context.params;

  const upload = await workspaceService.getUpload(user.id, id);
  const key = await workspaceService.getUploadStorageKey(user.id, id);
  if (!key || !(await storage.exists(key))) {
    throw new NotFoundError("No stored file for this upload yet.");
  }

  const { size } = await storage.stat(key);
  const rangeHeader = request.headers.get("range");

  const baseHeaders: Record<string, string> = {
    "Content-Type": upload.mimeType || "application/octet-stream",
    "Accept-Ranges": "bytes",
    "Cache-Control": "private, max-age=0, must-revalidate",
  };

  if (rangeHeader?.startsWith(RANGE_PREFIX)) {
    const [startRaw, endRaw] = rangeHeader.slice(RANGE_PREFIX.length).split("-");
    const start = Number.parseInt(startRaw ?? "0", 10) || 0;
    const end = endRaw ? Number.parseInt(endRaw, 10) : size - 1;

    if (start >= size || end >= size || start > end) {
      return new Response(null, {
        status: 416,
        headers: { "Content-Range": `bytes */${size}`, "Accept-Ranges": "bytes" },
      });
    }

    const stream = await storage.readStream(key, { start, end });
    return new Response(stream, {
      status: 206,
      headers: {
        ...baseHeaders,
        "Content-Range": `bytes ${start}-${end}/${size}`,
        "Content-Length": String(end - start + 1),
      },
    });
  }

  const stream = await storage.readStream(key);
  return new Response(stream, {
    status: 200,
    headers: { ...baseHeaders, "Content-Length": String(size) },
  });
});
