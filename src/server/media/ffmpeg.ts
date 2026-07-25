import { spawn } from "node:child_process";

import ffmpegStatic from "ffmpeg-static";
import ffprobeStatic from "ffprobe-static";

/**
 * Thin wrappers around the bundled ffmpeg / ffprobe binaries.
 *
 * The binaries ship as npm packages (`ffmpeg-static`, `ffprobe-static`) so no
 * system-wide install is required and the same code runs on any developer
 * machine or CI runner. Everything here spawns a child process and never blocks
 * the event loop.
 */

export const FFMPEG_PATH: string | null = ffmpegStatic ?? null;
export const FFPROBE_PATH: string | null = ffprobeStatic?.path ?? null;

export function isFfmpegAvailable(): boolean {
  return Boolean(FFMPEG_PATH && FFPROBE_PATH);
}

export interface MediaInfo {
  /** Duration in whole seconds. */
  duration: number;
  width: number;
  height: number;
  hasAudio: boolean;
}

interface FfprobeStream {
  codec_type?: string;
  width?: number;
  height?: number;
}

interface FfprobeOutput {
  streams?: FfprobeStream[];
  format?: { duration?: string };
}

/** Runs a child process to completion, collecting stdout. Rejects on non-zero exit. */
function run(bin: string, args: string[], timeoutMs = 120_000): Promise<string> {
  return new Promise((resolve, reject) => {
    const child = spawn(bin, args, { windowsHide: true });
    let stdout = "";
    let stderr = "";

    const timer = setTimeout(() => {
      child.kill("SIGKILL");
      reject(new Error(`${bin} timed out after ${timeoutMs}ms`));
    }, timeoutMs);

    child.stdout.on("data", (chunk) => (stdout += chunk));
    child.stderr.on("data", (chunk) => (stderr += chunk));
    child.on("error", (error) => {
      clearTimeout(timer);
      reject(error);
    });
    child.on("close", (code) => {
      clearTimeout(timer);
      if (code === 0) resolve(stdout);
      else reject(new Error(`${bin} exited with code ${code}: ${stderr.slice(-500)}`));
    });
  });
}

/** Probes a media file for duration, dimensions and whether it carries audio. */
export async function probeMedia(absolutePath: string): Promise<MediaInfo> {
  if (!FFPROBE_PATH) throw new Error("ffprobe binary is not available on this platform.");

  const stdout = await run(FFPROBE_PATH, [
    "-v",
    "error",
    "-show_entries",
    "format=duration:stream=codec_type,width,height",
    "-of",
    "json",
    absolutePath,
  ]);

  const parsed = JSON.parse(stdout) as FfprobeOutput;
  const streams = parsed.streams ?? [];
  const video = streams.find((s) => s.codec_type === "video");
  const hasAudio = streams.some((s) => s.codec_type === "audio");
  const duration = Math.round(Number.parseFloat(parsed.format?.duration ?? "0")) || 0;

  return {
    duration,
    width: video?.width ?? 0,
    height: video?.height ?? 0,
    hasAudio,
  };
}

/** Runs an arbitrary ffmpeg invocation (used by the render pipeline). */
export async function runFfmpeg(args: string[], timeoutMs = 600_000): Promise<void> {
  if (!FFMPEG_PATH) throw new Error("ffmpeg binary is not available on this platform.");
  await run(FFMPEG_PATH, args, timeoutMs);
}

/**
 * Runs ffmpeg and returns its stderr. Many analysis filters (`silencedetect`,
 * `ebur128`) report their findings on stderr while exiting 0, so this collects
 * that output instead of treating it as an error.
 */
export function runFfmpegStderr(args: string[], timeoutMs = 300_000): Promise<string> {
  if (!FFMPEG_PATH) throw new Error("ffmpeg binary is not available on this platform.");
  return new Promise((resolve, reject) => {
    const child = spawn(FFMPEG_PATH, args, { windowsHide: true });
    let stderr = "";
    const timer = setTimeout(() => {
      child.kill("SIGKILL");
      reject(new Error(`ffmpeg timed out after ${timeoutMs}ms`));
    }, timeoutMs);
    child.stderr.on("data", (chunk) => (stderr += chunk));
    child.on("error", (error) => {
      clearTimeout(timer);
      reject(error);
    });
    child.on("close", () => {
      clearTimeout(timer);
      resolve(stderr);
    });
  });
}
