import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";

import { runFfmpeg } from "@/server/media/ffmpeg";
import { transcriptionProvider } from "@/server/pipeline/providers";

/**
 * Speech-to-text via Whisper.
 *
 * Uses whichever provider is configured — Groq (free) or OpenAI (paid), both
 * OpenAI-compatible. The video's audio is extracted to a compact mono MP3 first
 * (Whisper doesn't need video and the upload cap is 25 MB), then sent with
 * word/segment timestamps so the clip selector can map text back to time ranges.
 */

export interface TranscriptSegment {
  start: number;
  end: number;
  text: string;
}

export function isTranscriptionConfigured(): boolean {
  return transcriptionProvider() !== null;
}

interface WhisperResponse {
  text: string;
  segments?: Array<{ start: number; end: number; text: string }>;
}

/** `sourcePath` is a local filesystem path to the source video (see `withLocalCopy`). */
export async function transcribeUpload(
  sourcePath: string,
): Promise<{ text: string; segments: TranscriptSegment[] }> {
  const provider = transcriptionProvider();
  if (!provider) throw new Error("No transcription provider is configured (set GROQ_API_KEY).");

  const dir = await mkdtemp(path.join(tmpdir(), "clipmind-audio-"));
  const audioPath = path.join(dir, "audio.mp3");

  try {
    // Downmix to 16 kHz mono MP3 — small, and all Whisper uses.
    await runFfmpeg([
      "-y",
      "-i",
      sourcePath,
      "-vn",
      "-ac",
      "1",
      "-ar",
      "16000",
      "-b:a",
      "64k",
      audioPath,
    ]);

    const bytes = await readFile(audioPath);
    const form = new FormData();
    form.append("file", new Blob([bytes], { type: "audio/mpeg" }), "audio.mp3");
    form.append("model", provider.model);
    form.append("response_format", "verbose_json");

    const response = await fetch(`${provider.baseUrl}/audio/transcriptions`, {
      method: "POST",
      headers: { Authorization: `Bearer ${provider.apiKey}` },
      body: form,
    });

    if (!response.ok) {
      throw new Error(`Whisper request failed: ${response.status} ${await response.text()}`);
    }

    const data = (await response.json()) as WhisperResponse;
    const segments: TranscriptSegment[] = (data.segments ?? []).map((s) => ({
      start: s.start,
      end: s.end,
      text: s.text.trim(),
    }));

    return { text: data.text ?? segments.map((s) => s.text).join(" "), segments };
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
}
