import { encodeUtf8, randomBytes, toBase64Url } from "./crypto";

/**
 * PBKDF2-SHA256 password hashing.
 *
 * Stored format: `pbkdf2$<iterations>$<saltB64Url>$<hashB64Url>`
 *
 * Only used to fill the `passwordHash` column with a random, never-surfaced
 * value for the accounts this app creates — nobody signs in with a
 * per-account password, so there is no verify/rehash path.
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
