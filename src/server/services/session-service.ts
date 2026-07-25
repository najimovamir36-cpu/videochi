import { cookies } from "next/headers";

import { env } from "@/server/core/env";
import { UnauthorizedError } from "@/server/core/errors";
import { toPublicUser, userRepository } from "@/server/repositories/user-repository";
import {
  SESSION_COOKIE_NAME,
  createSessionPayload,
  signSessionToken,
  verifySessionToken,
} from "@/server/security/session-token";
import type { Session, User } from "@/types/auth";

/**
 * Owns the session cookie lifecycle. Route handlers and server components use
 * this instead of reading cookies directly.
 */

const BASE_COOKIE = {
  httpOnly: true,
  sameSite: "lax",
  path: "/",
  secure: process.env.NODE_ENV === "production",
} as const;

export async function createSession(user: User, remember: boolean): Promise<string> {
  // A non-remembered session becomes a browser-session cookie that also
  // expires server-side after 12 hours.
  const maxAge = remember ? env.AUTH_SESSION_MAX_AGE : 60 * 60 * 12;
  const payload = createSessionPayload(user.id, user.email, maxAge);
  const token = await signSessionToken(payload, env.AUTH_SECRET);

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, token, {
    ...BASE_COOKIE,
    ...(remember ? { maxAge } : {}),
  });

  return new Date(payload.exp * 1000).toISOString();
}

export async function destroySession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, "", { ...BASE_COOKIE, maxAge: 0 });
}

/** Returns the signed-in user, or `null` for guests. Never throws. */
export async function getSession(): Promise<Session | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!token) return null;

  const payload = await verifySessionToken(token, env.AUTH_SECRET);
  if (!payload) return null;

  const record = await userRepository.findById(payload.userId);
  if (!record) return null;

  return {
    user: toPublicUser(record),
    expiresAt: new Date(payload.exp * 1000).toISOString(),
  };
}

/** Same as `getSession` but throws `UnauthorizedError` for guests. */
export async function requireSession(): Promise<Session> {
  const session = await getSession();
  if (!session) throw new UnauthorizedError();
  return session;
}

export async function getCurrentUser(): Promise<User | null> {
  return (await getSession())?.user ?? null;
}
