import { createReadStream, createWriteStream } from "node:fs";
import { mkdir, rm, stat } from "node:fs/promises";
import path from "node:path";
import { Readable } from "node:stream";
import { pipeline } from "node:stream/promises";

import { env } from "@/server/core/env";

/**
 * Local filesystem storage.
 *
 * This is the single seam between the app and where bytes actually live. Every
 * route that stores or serves media goes through here, so swapping in S3 (or
 * any object store) later means reimplementing this one module — the call sites
 * keep passing a storage key and a stream.
 *
 * Keys are POSIX-style relative paths (`uploads/<id>.mp4`) resolved under
 * `STORAGE_DIR`. `resolvePath` refuses any key that escapes the root, so a
 * crafted id can never traverse outside the storage directory.
 */

const ROOT = path.resolve(process.cwd(), env.STORAGE_DIR);

export const STORAGE_BUCKETS = {
  uploads: "uploads",
  exports: "exports",
} as const;

function resolvePath(key: string): string {
  const target = path.resolve(ROOT, key);
  const rootWithSep = ROOT.endsWith(path.sep) ? ROOT : ROOT + path.sep;
  if (target !== ROOT && !target.startsWith(rootWithSep)) {
    throw new Error(`Refusing storage key that escapes the root: ${key}`);
  }
  return target;
}

/** Builds a storage key that preserves the source file extension. */
export function makeKey(bucket: keyof typeof STORAGE_BUCKETS, id: string, fileName: string): string {
  const ext = path.extname(fileName).toLowerCase().replace(/[^.a-z0-9]/g, "");
  return `${STORAGE_BUCKETS[bucket]}/${id}${ext}`;
}

export const storage = {
  root: ROOT,

  absolutePath(key: string): string {
    return resolvePath(key);
  },

  /**
   * Streams a web `ReadableStream` to disk without buffering it in memory, so a
   * multi-gigabyte upload costs a constant, tiny amount of RAM. Returns the
   * number of bytes actually written.
   */
  async writeStream(key: string, body: ReadableStream<Uint8Array>): Promise<number> {
    const target = resolvePath(key);
    await mkdir(path.dirname(target), { recursive: true });

    let bytes = 0;
    const counter = new TransformCounter((n) => {
      bytes += n;
    });

    const source = Readable.fromWeb(body as Parameters<typeof Readable.fromWeb>[0]);
    await pipeline(source, counter, createWriteStream(target));
    return bytes;
  },

  createReadStream(key: string, options?: { start?: number; end?: number }) {
    return createReadStream(resolvePath(key), options);
  },

  async stat(key: string) {
    return stat(resolvePath(key));
  },

  async exists(key: string): Promise<boolean> {
    try {
      await stat(resolvePath(key));
      return true;
    } catch {
      return false;
    }
  },

  async remove(key: string): Promise<void> {
    await rm(resolvePath(key), { force: true });
  },
};

import { Transform, type TransformCallback } from "node:stream";

/** Passthrough stream that reports each chunk's size as bytes flow through. */
class TransformCounter extends Transform {
  constructor(private readonly onChunk: (bytes: number) => void) {
    super();
  }

  override _transform(chunk: Buffer, _encoding: BufferEncoding, callback: TransformCallback): void {
    this.onChunk(chunk.length);
    callback(null, chunk);
  }
}
