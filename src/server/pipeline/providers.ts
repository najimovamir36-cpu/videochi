import { env } from "@/server/core/env";

/**
 * AI provider selection.
 *
 * Groq is preferred because its free tier serves both Whisper (speech-to-text)
 * and fast LLMs through an OpenAI-compatible API — so a single free key powers
 * the whole pipeline at $0. OpenAI (transcription) and Anthropic (selection)
 * remain supported as paid alternatives if their keys are set instead.
 */

const GROQ_BASE = "https://api.groq.com/openai/v1";
const OPENAI_BASE = "https://api.openai.com/v1";

export interface TranscriptionProvider {
  baseUrl: string;
  apiKey: string;
  model: string;
}

export function transcriptionProvider(): TranscriptionProvider | null {
  if (env.GROQ_API_KEY) {
    return { baseUrl: GROQ_BASE, apiKey: env.GROQ_API_KEY, model: "whisper-large-v3-turbo" };
  }
  if (env.OPENAI_API_KEY) {
    return { baseUrl: OPENAI_BASE, apiKey: env.OPENAI_API_KEY, model: "whisper-1" };
  }
  return null;
}

export type ChatProvider =
  | { kind: "openai-compatible"; baseUrl: string; apiKey: string; model: string }
  | { kind: "anthropic"; apiKey: string; model: string };

export function chatProvider(): ChatProvider | null {
  if (env.GROQ_API_KEY) {
    return {
      kind: "openai-compatible",
      baseUrl: GROQ_BASE,
      apiKey: env.GROQ_API_KEY,
      model: "llama-3.3-70b-versatile",
    };
  }
  if (env.ANTHROPIC_API_KEY) {
    return { kind: "anthropic", apiKey: env.ANTHROPIC_API_KEY, model: "claude-opus-4-8" };
  }
  return null;
}
