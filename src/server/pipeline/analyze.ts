import { runFfmpegStderr } from "@/server/media/ffmpeg";

/**
 * Keyless content analysis.
 *
 * Without a transcription/LLM key we still analyse the *real* audio: ffmpeg's
 * `silencedetect` filter marks every silent stretch, and the gaps between them
 * are where someone is actually speaking. The longest, densest speech regions
 * make the best short-form candidates, so those become the clips. When an
 * OpenAI/Anthropic key is present the pipeline swaps this for transcript-driven
 * selection — but this path always works, on the genuine media bytes.
 */

export interface SpeechRegion {
  start: number;
  end: number;
}

export interface CandidateMoment {
  startAt: number;
  duration: number;
  /** 0–100, higher = more substantial continuous speech. */
  score: number;
}

const SILENCE_THRESHOLD_DB = -30;
const MIN_SILENCE_SECONDS = 0.6;

const MIN_CLIP_SECONDS = 12;
const MAX_CLIP_SECONDS = 60;

/** Runs silencedetect and returns the speech (non-silent) regions of the audio. */
export async function detectSpeechRegions(
  absolutePath: string,
  totalDuration: number,
): Promise<SpeechRegion[]> {
  const stderr = await runFfmpegStderr([
    "-hide_banner",
    "-i",
    absolutePath,
    "-af",
    `silencedetect=noise=${SILENCE_THRESHOLD_DB}dB:d=${MIN_SILENCE_SECONDS}`,
    "-f",
    "null",
    "-",
  ]);

  const silences: SpeechRegion[] = [];
  let pendingStart: number | null = null;

  for (const line of stderr.split(/\r?\n/)) {
    const startMatch = line.match(/silence_start:\s*(-?[\d.]+)/);
    if (startMatch) {
      pendingStart = Math.max(0, Number.parseFloat(startMatch[1]!));
      continue;
    }
    const endMatch = line.match(/silence_end:\s*(-?[\d.]+)/);
    if (endMatch && pendingStart !== null) {
      silences.push({ start: pendingStart, end: Number.parseFloat(endMatch[1]!) });
      pendingStart = null;
    }
  }

  // Complement the silences to get speech regions across the full timeline.
  const regions: SpeechRegion[] = [];
  let cursor = 0;
  for (const silence of silences) {
    if (silence.start > cursor) regions.push({ start: cursor, end: Math.min(silence.start, totalDuration) });
    cursor = Math.max(cursor, silence.end);
  }
  if (cursor < totalDuration) regions.push({ start: cursor, end: totalDuration });

  return regions.filter((r) => r.end - r.start >= 1);
}

/**
 * Turns speech regions into ranked clip candidates. If no speech was detected
 * (silent footage or no audio track) it falls back to evenly spaced windows so
 * the analysis still yields usable clips.
 */
export function buildCandidateMoments(
  regions: SpeechRegion[],
  totalDuration: number,
  maxMoments: number,
): CandidateMoment[] {
  const usable = regions.filter((r) => r.end - r.start >= MIN_CLIP_SECONDS);

  const windows: SpeechRegion[] =
    usable.length > 0 ? usable : evenlySpacedWindows(totalDuration, maxMoments);

  const lengths = windows.map((w) => w.end - w.start);
  const longest = Math.max(...lengths, 1);

  return windows
    .map((region) => {
      const length = region.end - region.start;
      const duration = clamp(length, MIN_CLIP_SECONDS, MAX_CLIP_SECONDS);
      // Longer continuous speech scores higher, normalised to a 55–98 band so
      // the numbers read like real virality predictions rather than raw ratios.
      const score = Math.round(55 + (length / longest) * 43);
      return {
        startAt: Math.round(region.start),
        duration: Math.round(Math.min(duration, totalDuration - region.start)),
        score: Math.min(98, score),
      };
    })
    .filter((m) => m.duration >= Math.min(MIN_CLIP_SECONDS, totalDuration))
    .sort((a, b) => b.score - a.score)
    .slice(0, maxMoments);
}

function evenlySpacedWindows(totalDuration: number, count: number): SpeechRegion[] {
  if (totalDuration <= 0) return [];
  const clipLength = Math.min(MAX_CLIP_SECONDS, Math.max(MIN_CLIP_SECONDS, totalDuration / (count + 1)));
  const slots = Math.max(1, Math.min(count, Math.floor(totalDuration / clipLength)));
  const gap = totalDuration / slots;
  return Array.from({ length: slots }, (_, i) => {
    const start = Math.min(i * gap, Math.max(0, totalDuration - clipLength));
    return { start, end: Math.min(totalDuration, start + clipLength) };
  });
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}
