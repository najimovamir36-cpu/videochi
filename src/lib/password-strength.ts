/**
 * Password strength scoring shared by the client meter and the server, so the
 * UI can never promise something the API would reject. Pure and dependency
 * free — safe to import from both bundles.
 */

export type PasswordStrengthLabel = "Very weak" | "Weak" | "Fair" | "Strong" | "Excellent";

export interface PasswordStrength {
  /** 0–4 */
  score: number;
  label: PasswordStrengthLabel;
  suggestions: string[];
}

const STRENGTH_LABELS: PasswordStrengthLabel[] = [
  "Very weak",
  "Weak",
  "Fair",
  "Strong",
  "Excellent",
];

const COMMON_PATTERNS = [
  /^(?:password|passwd|qwerty|letmein|welcome|admin|iloveyou|clipmind)/i,
  /^(.)\1+$/,
  /^(?:012|123|234|345|456|567|678|789|890)+/,
  /^(?:abc|bcd|cde|def)+/i,
];

export function scorePassword(password: string): PasswordStrength {
  if (!password) {
    return { score: 0, label: "Very weak", suggestions: ["Choose a password"] };
  }

  const suggestions: string[] = [];
  let score = 0;
  const uniqueCharacters = new Set(password).size;

  if (password.length >= 8) score += 1;
  if (password.length >= 12) score += 1;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score += 1;
  if (/\d/.test(password)) score += 1;
  if (/[^A-Za-z0-9]/.test(password)) score += 1;
  if (uniqueCharacters >= password.length * 0.6) score += 1;

  if (password.length < 8) suggestions.push("Use at least 8 characters");
  if (!/[A-Z]/.test(password)) suggestions.push("Add an uppercase letter");
  if (!/[a-z]/.test(password)) suggestions.push("Add a lowercase letter");
  if (!/\d/.test(password)) suggestions.push("Add a number");
  if (!/[^A-Za-z0-9]/.test(password)) suggestions.push("Add a symbol like ! or #");
  if (password.length >= 8 && password.length < 12) {
    suggestions.push("Longer is stronger — aim for 12+");
  }

  if (COMMON_PATTERNS.some((pattern) => pattern.test(password))) {
    score = Math.min(score, 1);
    suggestions.unshift("Avoid common words and sequences");
  }

  const normalized = Math.max(0, Math.min(4, score - 1));

  return {
    score: normalized,
    label: STRENGTH_LABELS[normalized] ?? "Very weak",
    suggestions: suggestions.slice(0, 3),
  };
}

/** Meter fill percentage for the strength bar. */
export function strengthPercent(strength: PasswordStrength, hasValue: boolean): number {
  return hasValue ? ((strength.score + 1) / 5) * 100 : 0;
}
