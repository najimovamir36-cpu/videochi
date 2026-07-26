import { z } from "zod";

import { ACCEPTED_EXTENSIONS, ACCEPTED_MIME_TYPES, UPLOAD_LIMITS } from "@/config/uploads";

/**
 * Validates the metadata the client registers before streaming bytes.
 * The API is intentionally metadata-first so the server can reject a file
 * before a multi-gigabyte transfer starts.
 */
export const registerUploadSchema = z.object({
  fileName: z
    .string()
    .trim()
    .min(1, "File name is required")
    .max(255, "File name is too long")
    .refine(
      (name) => ACCEPTED_EXTENSIONS.some((ext) => name.toLowerCase().endsWith(ext)),
      `Supported formats: ${ACCEPTED_EXTENSIONS.join(", ")}`,
    ),
  size: z
    .number()
    .int("Size must be a whole number of bytes")
    .min(UPLOAD_LIMITS.minFileSize, "This file looks incomplete")
    .max(UPLOAD_LIMITS.maxFileSize, "This file exceeds the 8 GB limit"),
  mimeType: z
    .string()
    .trim()
    .refine(
      (type) => type === "" || ACCEPTED_MIME_TYPES.includes(type.toLowerCase()),
      "Unsupported media type",
    ),
  source: z.enum(["device", "youtube", "drive", "url"]).default("device"),
});

/** Body for `/api/uploads/[id]/complete` once the browser's direct-to-Blob PUT finishes. */
export const completeUploadSchema = z.object({
  key: z.string().min(1, "Missing storage key"),
});

export const importFromUrlSchema = z.object({
  url: z
    .string()
    .trim()
    .url("Enter a valid URL")
    .refine((value) => /^https:\/\//i.test(value), "Only https links are supported"),
});

export type RegisterUploadInput = z.infer<typeof registerUploadSchema>;
export type CompleteUploadInput = z.infer<typeof completeUploadSchema>;
export type ImportFromUrlInput = z.infer<typeof importFromUrlSchema>;
