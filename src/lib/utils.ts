import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/** Merge conditional class names while resolving Tailwind conflicts. */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Clamp a number into an inclusive range. */
export function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

/** Promise-based delay, used by optimistic UI and simulated transports. */
export function sleep(ms: number) {
  return new Promise<void>((resolve) => setTimeout(resolve, ms));
}
/** Unicode combining diacritical marks, built from escapes to keep this file ASCII-only. */
const COMBINING_MARKS = new RegExp("[̀-ͯ]", "g");

/** Stable, URL-safe slug from arbitrary text. */
export function slugify(input: string) {
  return input
    .toLowerCase()
    .normalize("NFKD")
    .replace(COMBINING_MARKS, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

/** Truncate text on a word boundary. */
export function truncate(input: string, max: number) {
  if (input.length <= max) return input;
  const sliced = input.slice(0, max - 1);
  const lastSpace = sliced.lastIndexOf(" ");
  return `${lastSpace > max * 0.6 ? sliced.slice(0, lastSpace) : sliced}â€¦`;
}

/** Up to two uppercase initials from a display name. */
export function initials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

/** Deterministic id generator that works on both server and client. */
export function createId(prefix = "id") {
  const random =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID().replace(/-/g, "").slice(0, 12)
      : Math.random().toString(36).slice(2, 14);
  return `${prefix}_${random}`;
}

/** Split an array into fixed-size chunks. */
export function chunk<T>(items: readonly T[], size: number): T[][] {
  if (size <= 0) return [[...items]];
  const output: T[][] = [];
  for (let i = 0; i < items.length; i += size) output.push(items.slice(i, i + size) as T[]);
  return output;
}

/** Absolute URL against the configured app origin. */
export function absoluteUrl(path = "/") {
  const base = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  return new URL(path, base).toString();
}
