import path from "node:path";

/**
 * The seam between the app and where media bytes actually live. Two
 * interchangeable implementations exist — `local-storage` (disk, for
 * persistent-container hosts like Railway) and `blob-storage` (Vercel Blob,
 * for serverless hosts where nothing written to disk survives past the
 * request). `index.ts` picks one at startup; every caller goes through this
 * interface and never assumes which backend is active.
 *
 * ffmpeg needs a real filesystem path to read from and write to, so the
 * interface exposes `withLocalCopy`/`writeLocalFile` instead of raw paths:
 * the local backend hands back its real path directly (no copy), the blob
 * backend downloads to / uploads from a temp file under the hood.
 */
export interface StorageBackend {
  /** Streams a request body to storage under `key`. Returns the byte count and
   *  the key to persist — for the blob backend this is the resulting URL, which
   *  may differ from the pathname passed in. */
  writeStream(key: string, body: ReadableStream<Uint8Array>): Promise<{ bytes: number; key: string }>;

  /** A readable stream of the stored bytes, optionally restricted to a byte range. */
  readStream(key: string, options?: { start?: number; end?: number }): Promise<ReadableStream<Uint8Array>>;

  stat(key: string): Promise<{ size: number }>;
  exists(key: string): Promise<boolean>;
  remove(key: string): Promise<void>;

  /** Gives `fn` a local filesystem path to an existing stored file (read-only). */
  withLocalCopy<T>(key: string, fn: (localPath: string) => Promise<T>): Promise<T>;

  /** Gives `fn` a local filesystem path to write to, then commits it to storage
   *  under `key`. Returns the byte count and the key to persist. */
  writeLocalFile(key: string, fn: (localPath: string) => Promise<void>): Promise<{ bytes: number; key: string }>;
}

export const STORAGE_BUCKETS = {
  uploads: "uploads",
  exports: "exports",
} as const;

/** Builds a storage key that preserves the source file extension. */
export function makeKey(bucket: keyof typeof STORAGE_BUCKETS, id: string, fileName: string): string {
  const ext = path.extname(fileName).toLowerCase().replace(/[^.a-z0-9]/g, "");
  return `${STORAGE_BUCKETS[bucket]}/${id}${ext}`;
}
