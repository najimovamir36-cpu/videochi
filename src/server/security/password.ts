import { encodeUtf8, fromBase64Url, randomBytes, timingSafeEqual, toBase64Url } from "./crypto";

export { scorePassword, strengthPercent } from "@/lib/password-strength";
export type { PasswordStrength } from "@/lib/password-strength";

/**
 * PBKDF2-SHA256 password hashing.
 *
 * Stored format: `pbkdf2$<iterations>$<saltB64Url>$<hashB64Url>`
 *
 * PBKDF2 is used (rather than Argon2 or bcrypt) because it is available through
 * Web Crypto in every runtime this app targets, with no native dependency and
 * no cold-start cost.
 */

const ALGORITHM = "pbkdf2";
const ITERATIONS = 210_000;
const SALT_BYTES = 16;
const KEY_BITS = 256;

async function deriveKey(password: string, salt: Uint8Array, iterations: number): Promise<string> {
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    encodeUtf8(password.normalize("NFKC")),
    "PBKDF2",
    false,
    ["deriveBits"],
  );

  const bits = await crypto.subtle.deriveBits(
    { name: "PBKDF2", salt: salt as unknown as BufferSource, iterations, hash: "SHA-256" },
    keyMaterial,
    KEY_BITS,
  );

  return toBase64Url(bits);
}

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(SALT_BYTES);
  const hash = await deriveKey(password, salt, ITERATIONS);
  return `${ALGORITHM}$${ITERATIONS}$${toBase64Url(salt)}$${hash}`;
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const parts = stored.split("$");
  if (parts.length !== 4) return false;

  const [algorithm, iterationsRaw, saltRaw, expectedHash] = parts as [string, string, string, string];
  if (algorithm !== ALGORITHM) return false;

  const iterations = Number.parseInt(iterationsRaw, 10);
  if (!Number.isFinite(iterations) || iterations <= 0) return false;

  const candidate = await deriveKey(password, fromBase64Url(saltRaw), iterations);
  return timingSafeEqual(candidate, expectedHash);
}

/** True when a stored hash used weaker parameters and should be upgraded on next login. */
export function needsRehash(stored: string): boolean {
  const [algorithm, iterationsRaw] = stored.split("$");
  if (algorithm !== ALGORITHM) return true;
  return Number.parseInt(iterationsRaw ?? "0", 10) < ITERATIONS;
}
