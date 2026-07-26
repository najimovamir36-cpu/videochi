import { createReadStream, createWriteStream } from "node:fs";
import { mkdir, rm, stat } from "node:fs/promises";
import path from "node:path";
import { Readable } from "node:stream";
import { pipeline } from "node:stream/promises";
import { Transform, type TransformCallback } from "node:stream";

import { env } from "@/server/core/env";
import type { StorageBackend } from "@/server/storage/types";

/**
 * Local filesystem storage — used when no Vercel Blob token is configured
 * (local dev, or a persistent-container host like Railway). Keys are
 * POSIX-style relative paths (`uploads/<id>.mp4`) resolved under
 * `STORAGE_DIR`. `resolvePath` refuses any key that escapes the root, so a
 * crafted id can never traverse outside the storage directory.
 */

const ROOT = path.resolve(process.cwd(), env.STORAGE_DIR);

function resolvePath(key: string): string {
  const target = path.resolve(ROOT, key);
  const rootWithSep = ROOT.endsWith(path.sep) ? ROOT : ROOT + path.sep;
  if (target !== ROOT && !target.startsWith(rootWithSep)) {
    throw new Error(`Refusing storage key that escapes the root: ${key}`);
  }
  return target;
}

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

export const localStorage: StorageBackend = {
  async writeStream(key, body) {
    const target = resolvePath(key);
    await mkdir(path.dirname(target), { recursive: true });

    let bytes = 0;
    const counter = new TransformCounter((n) => {
      bytes += n;
    });

    const source = Readable.fromWeb(body as Parameters<typeof Readable.fromWeb>[0]);
    await pipeline(source, counter, createWriteStream(target));
    return { bytes, key };
  },

  async readStream(key, options) {
    const stream = createReadStream(resolvePath(key), options);
    return Readable.toWeb(stream) as ReadableStream<Uint8Array>;
  },

  async stat(key) {
    return stat(resolvePath(key));
  },

  async exists(key) {
    try {
      await stat(resolvePath(key));
      return true;
    } catch {
      return false;
    }
  },

  async remove(key) {
    await rm(resolvePath(key), { force: true });
  },

  async withLocalCopy(key, fn) {
    return fn(resolvePath(key));
  },

  async writeLocalFile(key, fn) {
    const target = resolvePath(key);
    await mkdir(path.dirname(target), { recursive: true });
    await fn(target);
    const { size } = await stat(target);
    return { bytes: size, key };
  },
};
