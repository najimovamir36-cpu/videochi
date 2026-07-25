import { mkdir } from "node:fs/promises";
import path from "node:path";

import { runFfmpeg } from "@/server/media/ffmpeg";
import { storage } from "@/server/storage/local-storage";
import type { AspectRatio, ExportResolution } from "@/types/media";

/**
 * Renders a single clip out of a source video with ffmpeg: seek to the clip's
 * start, cut its duration, then scale-and-crop to the requested aspect ratio
 * and resolution (center-weighted, the standard reframe for short-form). The
 * result is a real, downloadable MP4.
 */

export interface RenderClipInput {
  sourceKey: string;
  outKey: string;
  startAt: number;
  duration: number;
  resolution: ExportResolution;
  aspectRatio: AspectRatio;
}

/** Base dimension (the shorter side for portrait, the taller side for landscape). */
const RESOLUTION_BASE: Record<ExportResolution, number> = {
  "720p": 720,
  "1080p": 1080,
  "1440p": 1440,
  "4K": 2160,
};

const ASPECT_RATIO: Record<AspectRatio, [number, number]> = {
  "9:16": [9, 16],
  "1:1": [1, 1],
  "4:5": [4, 5],
  "16:9": [16, 9],
};

function targetDimensions(resolution: ExportResolution, aspectRatio: AspectRatio): [number, number] {
  const base = RESOLUTION_BASE[resolution];
  const [w, h] = ASPECT_RATIO[aspectRatio];
  // Anchor the base to the shorter side, derive the longer side from the ratio.
  const width = w <= h ? base : Math.round((base * w) / h);
  const height = w <= h ? Math.round((base * h) / w) : base;
  return [makeEven(width), makeEven(height)];
}

function makeEven(n: number): number {
  return n % 2 === 0 ? n : n + 1;
}

/** Renders the clip and returns the rendered file size in bytes. */
export async function renderClip(input: RenderClipInput): Promise<number> {
  const source = storage.absolutePath(input.sourceKey);
  const target = storage.absolutePath(input.outKey);
  await mkdir(path.dirname(target), { recursive: true });

  const [width, height] = targetDimensions(input.resolution, input.aspectRatio);
  const filter = `scale=${width}:${height}:force_original_aspect_ratio=increase,crop=${width}:${height},setsar=1`;

  await runFfmpeg([
    "-y",
    "-ss",
    String(input.startAt),
    "-i",
    source,
    "-t",
    String(input.duration),
    "-vf",
    filter,
    "-c:v",
    "libx264",
    "-preset",
    "veryfast",
    "-crf",
    "20",
    "-c:a",
    "aac",
    "-b:a",
    "128k",
    "-movflags",
    "+faststart",
    target,
  ]);

  const { size } = await storage.stat(input.outKey);
  return size;
}
