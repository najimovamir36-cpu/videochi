import { Readable } from "node:stream";

import { NotFoundError } from "@/server/core/errors";
import { route } from "@/server/http/responses";
import { exportService } from "@/server/services/export-service";
import { requireSession } from "@/server/services/session-service";
import { storage } from "@/server/storage/local-storage";

interface RouteContext {
  params: Promise<{ id: string }>;
}

/** `GET /api/exports/[id]/content` — downloads the rendered clip as an MP4. */
export const GET = route(async (_request: Request, context: RouteContext) => {
  const { user } = await requireSession();
  const { id } = await context.params;

  const key = await exportService.getExportStorageKey(user.id, id);
  if (!key || !(await storage.exists(key))) {
    throw new NotFoundError("This export is not ready yet.");
  }

  const { size } = await storage.stat(key);
  const stream = storage.createReadStream(key);

  return new Response(Readable.toWeb(stream) as ReadableStream, {
    status: 200,
    headers: {
      "Content-Type": "video/mp4",
      "Content-Length": String(size),
      "Content-Disposition": `attachment; filename="clip-${id}.mp4"`,
      "Cache-Control": "private, max-age=0, must-revalidate",
    },
  });
});
