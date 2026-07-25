import type { SessionPayload } from "@/types/auth";

import { decodeUtf8, encodeUtf8, fromBase64Url, hmacSha256, timingSafeEqual, toBase64Url } from "./crypto";

/**
 * Minimal signed-token implementation (JWT-shaped, HS256) with zero
 * dependencies. Runs in both the Node and Edge runtimes, which lets
 * `middleware.ts` verify a session without touching the data layer.
 */

const HEADER = { alg: "HS256", typ: "JWT" } as const;

export const SESSION_COOKIE_NAME = "clipmind_session";

function encodeSegment(value: unknown): string {
  return toBase64Url(encodeUtf8(JSON.stringify(value)));
}

export async function signSessionToken(
  payload: SessionPayload,
  secret: string,
): Promise<string> {
  const body = `${encodeSegment(HEADER)}.${encodeSegment(payload)}`;
  const signature = await hmacSha256(secret, body);
  return `${body}.${signature}`;
}

export async function verifySessionToken(
  token: string,
  secret: string,
): Promise<SessionPayload | null> {
  const segments = token.split(".");
  if (segments.length !== 3) return null;

  const [headerSegment, payloadSegment, signature] = segments as [string, string, string];
  const expected = await hmacSha256(secret, `${headerSegment}.${payloadSegment}`);
  if (!timingSafeEqual(signature, expected)) return null;

  try {
    const header = JSON.parse(decodeUtf8(fromBase64Url(headerSegment))) as typeof HEADER;
    if (header.alg !== HEADER.alg) return null;

    const payload = JSON.parse(decodeUtf8(fromBase64Url(payloadSegment))) as SessionPayload;
    if (typeof payload.userId !== "string" || typeof payload.exp !== "number") return null;
    if (payload.exp * 1000 <= Date.now()) return null;

    return payload;
  } catch {
    return null;
  }
}

export function createSessionPayload(
  userId: string,
  email: string,
  maxAgeSeconds: number,
): SessionPayload {
  const issuedAt = Math.floor(Date.now() / 1000);
  return { userId, email, iat: issuedAt, exp: issuedAt + maxAgeSeconds };
}
