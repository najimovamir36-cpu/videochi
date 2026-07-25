import { z } from "zod";

/**
 * Validated server environment. Import `env` instead of touching
 * `process.env` so a missing secret fails fast with a readable message.
 */
const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  NEXT_PUBLIC_APP_URL: z.string().url().default("http://localhost:3000"),
  AUTH_SECRET: z.string().min(32).default("clipmind-development-secret-change-me-please-32"),
  AUTH_SESSION_MAX_AGE: z.coerce.number().int().positive().default(60 * 60 * 24 * 7),
  DATABASE_URL: z.string().min(1).default("file:./dev.db"),
  STORAGE_DIR: z.string().min(1).default("./storage"),
  // Optional until the AI pipeline is exercised; empty string means "not configured".
  // GROQ is the recommended free option (free Whisper + free LLM, OpenAI-compatible).
  GROQ_API_KEY: z.string().default(""),
  ANTHROPIC_API_KEY: z.string().default(""),
  OPENAI_API_KEY: z.string().default(""),
  // SMTP email. When unset, the mailer falls back to writing .eml files to disk.
  SMTP_HOST: z.string().default(""),
  SMTP_PORT: z.coerce.number().int().positive().default(587),
  SMTP_USER: z.string().default(""),
  SMTP_PASSWORD: z.string().default(""),
  SMTP_FROM: z.string().default("ClipMind AI <no-reply@clipmind.ai>"),
  // Stripe billing. When unset, billing runs in display-only mode.
  STRIPE_SECRET_KEY: z.string().default(""),
  STRIPE_WEBHOOK_SECRET: z.string().default(""),
  STRIPE_PRICE_CREATOR: z.string().default(""),
  STRIPE_PRICE_STUDIO: z.string().default(""),
});

function loadEnv() {
  const parsed = envSchema.safeParse({
    NODE_ENV: process.env.NODE_ENV,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    AUTH_SECRET: process.env.AUTH_SECRET,
    AUTH_SESSION_MAX_AGE: process.env.AUTH_SESSION_MAX_AGE,
    DATABASE_URL: process.env.DATABASE_URL,
    STORAGE_DIR: process.env.STORAGE_DIR,
    GROQ_API_KEY: process.env.GROQ_API_KEY,
    ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY,
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
    SMTP_HOST: process.env.SMTP_HOST,
    SMTP_PORT: process.env.SMTP_PORT,
    SMTP_USER: process.env.SMTP_USER,
    SMTP_PASSWORD: process.env.SMTP_PASSWORD,
    SMTP_FROM: process.env.SMTP_FROM,
    STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
    STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET,
    STRIPE_PRICE_CREATOR: process.env.STRIPE_PRICE_CREATOR,
    STRIPE_PRICE_STUDIO: process.env.STRIPE_PRICE_STUDIO,
  });

  if (!parsed.success) {
    const details = parsed.error.issues
      .map((issue) => `  • ${issue.path.join(".")}: ${issue.message}`)
      .join("\n");
    throw new Error(`Invalid environment configuration:\n${details}`);
  }

  if (parsed.data.NODE_ENV === "production" && !process.env.AUTH_SECRET) {
    throw new Error("AUTH_SECRET must be set in production. See .env.example.");
  }

  return parsed.data;
}

export const env = loadEnv();
export type Env = typeof env;
