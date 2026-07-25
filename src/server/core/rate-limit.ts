import { RateLimitError } from "@/server/core/errors";

/**
 * Sliding-window rate limiter.
 *
 * Counters are intentionally kept in process memory rather than the database:
 * they are ephemeral by nature and rewriting them on every request would be
 * pure write amplification. Good enough for a single instance; swap this map
 * for Redis when the app scales horizontally — the call sites do not change.
 *
 * The map is cached on `globalThis` so hot reloads in development do not reset
 * the windows on every code change.
 */
export interface RateLimitOptions {
  key: string;
  limit: number;
  windowMs: number;
}

const globalForRateLimit = globalThis as unknown as { __clipmindRateLimits?: Map<string, number[]> };
const rateLimits: Map<string, number[]> = globalForRateLimit.__clipmindRateLimits ?? new Map();
if (process.env.NODE_ENV !== "production") globalForRateLimit.__clipmindRateLimits = rateLimits;

export function enforceRateLimit({ key, limit, windowMs }: RateLimitOptions): void {
  const now = Date.now();
  const timestamps = (rateLimits.get(key) ?? []).filter((time) => now - time < windowMs);

  if (timestamps.length >= limit) {
    const oldest = timestamps[0] ?? now;
    const retryInSeconds = Math.max(1, Math.ceil((windowMs - (now - oldest)) / 1000));
    throw new RateLimitError(`Too many attempts. Try again in ${retryInSeconds}s.`);
  }

  timestamps.push(now);
  rateLimits.set(key, timestamps);
}

/** Derives a stable client identity from proxy headers. */
export function clientKey(request: Request, scope: string): string {
  const forwarded = request.headers.get("x-forwarded-for");
  const ip = forwarded?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || "local";
  return `${scope}:${ip}`;
}
