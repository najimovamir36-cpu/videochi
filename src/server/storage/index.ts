import { env } from "@/server/core/env";
import { blobStorage } from "@/server/storage/blob-storage";
import { localStorage } from "@/server/storage/local-storage";
import type { StorageBackend } from "@/server/storage/types";

export { makeKey, STORAGE_BUCKETS } from "@/server/storage/types";
export type { StorageBackend } from "@/server/storage/types";

/**
 * Vercel Blob when configured (production on Vercel — no persistent disk),
 * otherwise the local filesystem (local dev, or a persistent-container host
 * like Railway). Mirrors the app's existing keyless-fallback pattern for the
 * AI pipeline and email.
 */
export const storage: StorageBackend = env.BLOB_READ_WRITE_TOKEN ? blobStorage : localStorage;
