import { z } from "zod";

/** Validates a request to render a clip into a downloadable export. */
export const createExportSchema = z.object({
  clipId: z.string().trim().min(1, "A clip id is required"),
  resolution: z.enum(["720p", "1080p", "1440p", "4K"]).optional(),
  aspectRatio: z.enum(["9:16", "1:1", "16:9", "4:5"]).optional(),
});

export type CreateExportInput = z.infer<typeof createExportSchema>;
