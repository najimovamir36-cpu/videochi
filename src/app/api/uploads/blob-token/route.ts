import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { NextResponse } from "next/server";

import { ACCEPTED_MIME_TYPES, UPLOAD_LIMITS } from "@/config/uploads";
import { env } from "@/server/core/env";
import { requireSession } from "@/server/services/session-service";
import { workspaceService } from "@/server/services/workspace-service";

/**
 * `POST /api/uploads/blob-token` — issues the short-lived token the browser
 * needs to PUT a video straight to Vercel Blob (see `@vercel/blob/client`'s
 * two-step client-upload protocol). Bytes never pass through this route or
 * any other function, which is what makes multi-GB uploads possible on
 * Vercel's otherwise ~4.5 MB function body cap.
 */
export const POST = async (request: Request) => {
  const body = (await request.json()) as HandleUploadBody;

  try {
    const jsonResponse = await handleUpload({
      body,
      request,
      token: env.BLOB_READ_WRITE_TOKEN,
      onBeforeGenerateToken: async (_pathname, clientPayload) => {
        const { user } = await requireSession();

        const payload = clientPayload ? (JSON.parse(clientPayload) as { uploadId: string }) : null;
        if (!payload?.uploadId) throw new Error("Missing upload id.");

        // Confirms the caller owns this upload before minting a token that can
        // write to its pathname — the same 404-not-403 check every other route uses.
        await workspaceService.getUpload(user.id, payload.uploadId);

        return {
          allowedContentTypes: ACCEPTED_MIME_TYPES,
          maximumSizeInBytes: UPLOAD_LIMITS.maxFileSize,
          addRandomSuffix: false,
        };
      },
    });

    return NextResponse.json(jsonResponse);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not start the upload.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
};
