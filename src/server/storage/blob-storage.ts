import { createReadStream, createWriteStream } from "node:fs";
import { mkdtemp, rm, stat as fsStat } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { Readable } from "node:stream";
import { pipeline } from "node:stream/promises";

import { del, head, put } from "@vercel/blob";

import { env } from "@/server/core/env";
import type { StorageBackend } from "@/server/storage/types";

/**
 * Vercel Blob storage — used in production on Vercel, where the filesystem is
 * wiped between (and sometimes during) invocations, so nothing written to
 * disk survives. `writeStream`/`writeLocalFile` return the blob's URL as the
 * key to persist: since we always pass `addRandomSuffix: false`, the pathname
 * we chose is preserved, but callers must not assume the returned key equals
 * the pathname they passed in (it's the full `https://...` URL).
 */

const token = env.BLOB_READ_WRITE_TOKEN;

async function withTempDir<T>(fn: (dir: string) => Promise<T>): Promise<T> {
  const dir = await mkdtemp(path.join(tmpdir(), "clipmind-"));
  try {
    return await fn(dir);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
}

export const blobStorage: StorageBackend = {
  async writeStream(key, body) {
    const result = await put(key, body, { access: "public", addRandomSuffix: false, token });
    const info = await head(result.url, { token });
    return { bytes: info.size, key: result.url };
  },

  async readStream(key, options) {
    const headers: Record<string, string> = {};
    if (options?.start !== undefined) {
      const end = options.end !== undefined ? String(options.end) : "";
      headers.Range = `bytes=${options.start}-${end}`;
    }

    const response = await fetch(key, { headers });
    if (!response.ok || !response.body) {
      throw new Error(`Blob fetch failed: ${response.status}`);
    }
    return response.body;
  },

  async stat(key) {
    const info = await head(key, { token });
    return { size: info.size };
  },

  async exists(key) {
    try {
      await head(key, { token });
      return true;
    } catch {
      return false;
    }
  },

  async remove(key) {
    await del(key, { token });
  },

  async withLocalCopy(key, fn) {
    return withTempDir(async (dir) => {
      const localPath = path.join(dir, "source");
      const response = await fetch(key);
      if (!response.ok || !response.body) {
        throw new Error(`Blob fetch failed: ${response.status}`);
      }
      await pipeline(Readable.fromWeb(response.body as Parameters<typeof Readable.fromWeb>[0]), createWriteStream(localPath));
      return fn(localPath);
    });
  },

  async writeLocalFile(key, fn) {
    return withTempDir(async (dir) => {
      const localPath = path.join(dir, "out");
      await fn(localPath);
      const { size } = await fsStat(localPath);
      const result = await put(key, createReadStream(localPath), {
        access: "public",
        addRandomSuffix: false,
        token,
      });
      return { bytes: size, key: result.url };
    });
  },
};
