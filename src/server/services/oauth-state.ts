/**
 * Short-lived cookie carrying the OAuth `state` value across the redirect to
 * the provider and back, so the callback route can confirm the response it
 * receives corresponds to a flow this server actually started (CSRF defense).
 */

export const OAUTH_STATE_COOKIE_NAME = "clipmind_oauth_state";

const STATE_TTL_SECONDS = 10 * 60;

export function oauthStateCookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    path: "/",
    secure: process.env.NODE_ENV === "production",
    maxAge: STATE_TTL_SECONDS,
  };
}
