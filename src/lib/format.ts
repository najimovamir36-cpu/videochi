/**
 * Locale-aware formatting helpers.
 * Every formatter is pure so it renders identically on server and client.
 */

const BYTE_UNITS = ["B", "KB", "MB", "GB", "TB"] as const;

/** Human readable file size, e.g. `1.4 GB`. */
export function formatBytes(bytes: number, fractionDigits = 1): string {
  if (!Number.isFinite(bytes) || bytes <= 0) return "0 B";
  const exponent = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), BYTE_UNITS.length - 1);
  const value = bytes / 1024 ** exponent;
  const digits = exponent === 0 ? 0 : fractionDigits;
  return `${value.toFixed(digits)} ${BYTE_UNITS[exponent]}`;
}

/** Transfer rate, e.g. `8.2 MB/s`. */
export function formatBitrate(bytesPerSecond: number): string {
  return `${formatBytes(bytesPerSecond)}/s`;
}

/** Clock-style duration from seconds, e.g. `1:04:09` or `4:09`. */
export function formatDuration(totalSeconds: number): string {
  if (!Number.isFinite(totalSeconds) || totalSeconds < 0) return "0:00";
  const seconds = Math.floor(totalSeconds % 60);
  const minutes = Math.floor((totalSeconds / 60) % 60);
  const hours = Math.floor(totalSeconds / 3600);
  const paddedSeconds = String(seconds).padStart(2, "0");
  if (hours > 0) return `${hours}:${String(minutes).padStart(2, "0")}:${paddedSeconds}`;
  return `${minutes}:${paddedSeconds}`;
}

/** Coarse "time remaining" copy for progress UI, e.g. `about 2 min left`. */
export function formatTimeRemaining(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds <= 0) return "almost done";
  if (seconds < 10) return "a few seconds left";
  if (seconds < 60) return `${Math.round(seconds / 5) * 5}s left`;
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `about ${minutes} min left`;
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return rest === 0 ? `about ${hours} h left` : `about ${hours} h ${rest} min left`;
}

/** Compact number, e.g. `12.4K`. */
export function formatCompactNumber(value: number): string {
  return new Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 1 }).format(
    value,
  );
}

/** Grouped number, e.g. `1,284`. */
export function formatNumber(value: number, options?: Intl.NumberFormatOptions): string {
  return new Intl.NumberFormat("en-US", options).format(value);
}

/** Currency, defaults to whole-dollar USD. */
export function formatCurrency(value: number, currency = "USD"): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: Number.isInteger(value) ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(value);
}

/** Percentage from a 0–1 ratio, e.g. `64%`. */
export function formatPercent(ratio: number, fractionDigits = 0): string {
  return `${(clampRatio(ratio) * 100).toFixed(fractionDigits)}%`;
}

function clampRatio(ratio: number) {
  if (!Number.isFinite(ratio)) return 0;
  return Math.min(Math.max(ratio, 0), 1);
}

/** Medium date, e.g. `Jul 25, 2026`. */
export function formatDate(input: Date | string | number): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(input));
}

/** Date and time, e.g. `Jul 25, 2026, 4:12 PM`. */
export function formatDateTime(input: Date | string | number): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(input));
}

const RELATIVE_DIVISIONS: Array<{ amount: number; unit: Intl.RelativeTimeFormatUnit }> = [
  { amount: 60, unit: "second" },
  { amount: 60, unit: "minute" },
  { amount: 24, unit: "hour" },
  { amount: 7, unit: "day" },
  { amount: 4.34524, unit: "week" },
  { amount: 12, unit: "month" },
  { amount: Number.POSITIVE_INFINITY, unit: "year" },
];

/** Relative time, e.g. `3 hours ago`. */
export function formatRelativeTime(input: Date | string | number, now: Date = new Date()): string {
  const formatter = new Intl.RelativeTimeFormat("en-US", { numeric: "auto" });
  let duration = (new Date(input).getTime() - now.getTime()) / 1000;

  for (const division of RELATIVE_DIVISIONS) {
    if (Math.abs(duration) < division.amount) {
      return formatter.format(Math.round(duration), division.unit);
    }
    duration /= division.amount;
  }

  return formatter.format(Math.round(duration), "year");
}

/** Aspect ratio label from width/height, e.g. `9:16`. */
export function formatAspectRatio(width: number, height: number): string {
  const divisor = greatestCommonDivisor(width, height);
  return `${width / divisor}:${height / divisor}`;
}

function greatestCommonDivisor(a: number, b: number): number {
  return b === 0 ? a : greatestCommonDivisor(b, a % b);
}
