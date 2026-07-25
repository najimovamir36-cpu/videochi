import Anthropic from "@anthropic-ai/sdk";

import { chatProvider } from "@/server/pipeline/providers";
import type { TranscriptSegment } from "@/server/pipeline/transcribe";

/**
 * Viral-moment selection with an LLM.
 *
 * Uses whichever chat provider is configured — Groq's free Llama (OpenAI-
 * compatible) or Anthropic's Claude. Given a timestamped transcript, the model
 * picks the segments most likely to work as standalone shorts and titles them.
 * When no provider is set, the pipeline falls back to audio-based heuristics.
 */

export interface SelectedMoment {
  startAt: number;
  duration: number;
  title: string;
  /** 0–100 predicted virality. */
  score: number;
  reason: string;
}

export function isClipSelectionConfigured(): boolean {
  return chatProvider() !== null;
}

interface RawMoment {
  startAt?: number;
  duration?: number;
  title?: string;
  score?: number;
  reason?: string;
}

const SYSTEM =
  "You are a short-form video producer. You find the moments in a long recording " +
  "that would perform best as standalone vertical clips (15–60s): strong hooks, " +
  "surprising claims, emotional beats, crisp takeaways. You output only JSON.";

function buildPrompt(transcript: string, totalDuration: number, maxMoments: number): string {
  return (
    `The transcript below is timestamped in seconds (the video is ${Math.round(totalDuration)}s long).\n\n` +
    `Pick up to ${maxMoments} of the most clip-worthy moments. For each, return an object with:\n` +
    `- startAt: integer second to start the clip (a few seconds before the hook)\n` +
    `- duration: integer clip length in seconds, between 15 and 60\n` +
    `- title: a punchy caption-style title (max 60 chars)\n` +
    `- score: integer 0-100 predicted virality\n` +
    `- reason: one short sentence on why it works\n\n` +
    `Respond with ONLY a JSON object of the form {"moments": [ ... ]} (no prose, no markdown fences). ` +
    `Clamp every clip to the video length.\n\n` +
    `TRANSCRIPT:\n${transcript}`
  );
}

export async function selectViralMoments(
  segments: TranscriptSegment[],
  totalDuration: number,
  maxMoments: number,
): Promise<SelectedMoment[]> {
  const provider = chatProvider();
  if (!provider) throw new Error("No clip-selection provider is configured (set GROQ_API_KEY).");
  if (segments.length === 0) return [];

  const transcript = segments
    .map((s) => `[${Math.round(s.start)}-${Math.round(s.end)}] ${s.text}`)
    .join("\n");
  const prompt = buildPrompt(transcript, totalDuration, maxMoments);

  const text =
    provider.kind === "anthropic"
      ? await runAnthropic(provider.apiKey, provider.model, prompt)
      : await runOpenAICompatible(provider.baseUrl, provider.apiKey, provider.model, prompt);

  return parseMoments(text, totalDuration, maxMoments);
}

async function runAnthropic(apiKey: string, model: string, prompt: string): Promise<string> {
  const client = new Anthropic({ apiKey });
  const response = await client.messages.create({
    model,
    max_tokens: 4096,
    system: SYSTEM,
    messages: [{ role: "user", content: prompt }],
  });
  return response.content
    .filter((block): block is Anthropic.TextBlock => block.type === "text")
    .map((block) => block.text)
    .join("");
}

interface OpenAIChatResponse {
  choices?: Array<{ message?: { content?: string } }>;
}

async function runOpenAICompatible(
  baseUrl: string,
  apiKey: string,
  model: string,
  prompt: string,
): Promise<string> {
  const response = await fetch(`${baseUrl}/chat/completions`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({
      model,
      temperature: 0.4,
      max_tokens: 4096,
      // Force syntactically valid JSON so the response can't be truncated or
      // wrapped in prose the parser then chokes on.
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: SYSTEM },
        { role: "user", content: prompt },
      ],
    }),
  });

  if (!response.ok) {
    throw new Error(`Chat request failed: ${response.status} ${await response.text()}`);
  }

  const data = (await response.json()) as OpenAIChatResponse;
  return data.choices?.[0]?.message?.content ?? "";
}

/** Extracts the moment list from the model's reply and normalises each entry. */
function parseMoments(text: string, totalDuration: number, maxMoments: number): SelectedMoment[] {
  const raw = extractMomentArray(text);
  if (!raw) return [];

  return raw
    .map((m): SelectedMoment | null => {
      const startAt = clampInt(m.startAt ?? 0, 0, Math.max(0, totalDuration - 1));
      const maxLen = Math.min(60, totalDuration - startAt);
      const duration = clampInt(m.duration ?? 30, Math.min(15, Math.floor(maxLen)), Math.floor(maxLen));
      if (duration < 1) return null;
      return {
        startAt,
        duration,
        title: (m.title ?? "Untitled clip").slice(0, 80),
        score: clampInt(m.score ?? 70, 0, 100),
        reason: (m.reason ?? "").slice(0, 200),
      };
    })
    .filter((m): m is SelectedMoment => m !== null)
    .sort((a, b) => b.score - a.score)
    .slice(0, maxMoments);
}

/**
 * Pulls the moment array out of the reply, tolerating both a bare array and an
 * object wrapper (`{"moments": [...]}`, `{"clips": [...]}`) as well as prose or
 * markdown fences around the JSON.
 */
function extractMomentArray(text: string): RawMoment[] | null {
  const tryParse = (s: string): unknown => {
    try {
      return JSON.parse(s);
    } catch {
      return undefined;
    }
  };

  const fromValue = (value: unknown): RawMoment[] | null => {
    if (Array.isArray(value)) return value as RawMoment[];
    if (value && typeof value === "object") {
      for (const v of Object.values(value as Record<string, unknown>)) {
        if (Array.isArray(v)) return v as RawMoment[];
      }
    }
    return null;
  };

  // Whole reply as JSON (the json_object path).
  const whole = fromValue(tryParse(text.trim()));
  if (whole) return whole;

  // Otherwise grab the first bracketed span and parse that.
  const objStart = text.indexOf("{");
  const arrStart = text.indexOf("[");
  if (arrStart !== -1) {
    const arr = fromValue(tryParse(text.slice(arrStart, text.lastIndexOf("]") + 1)));
    if (arr) return arr;
  }
  if (objStart !== -1) {
    const obj = fromValue(tryParse(text.slice(objStart, text.lastIndexOf("}") + 1)));
    if (obj) return obj;
  }
  return null;
}

function clampInt(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, Math.round(value)));
}
