/**
 * Redirect-target sanitising.
 *
 * `?next=` comes from the URL, so it is attacker-controlled. Passing it
 * straight to `router.replace()` would turn every sign-in link into an open
 * redirect (`/login?next=https://evil.example`). Only same-origin,
 * path-absolute targets survive this filter.
 */

/** Protocol-relative, including the backslash form browsers normalise. */
const PROTOCOL_RELATIVE = /^\/[/\\]/;

/**
 * Tabs, newlines and other C0 controls can smuggle a different target past
 * browser URL parsing, so any of them disqualifies the value.
 */
function hasControlCharacter(value: string): boolean {
  for (let index = 0; index < value.length; index += 1) {
    const code = value.charCodeAt(index);
    if (code < 0x20 || code === 0x7f) return true;
  }
  return false;
}

/** Path-absolute (`/foo`) targets only — everything else falls back. */
export function safeRedirectPath(
  value: string | null | undefined,
  fallback: string,
): string {
  if (!value) return fallback;
  if (!value.startsWith("/")) return fallback;
  if (PROTOCOL_RELATIVE.test(value)) return fallback;
  if (hasControlCharacter(value)) return fallback;
  return value;
}
