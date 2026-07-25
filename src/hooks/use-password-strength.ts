"use client";

import { useMemo } from "react";

import { scorePassword, strengthPercent, type PasswordStrength } from "@/lib/password-strength";

/** Memoised password scoring for the strength meter. */
export function usePasswordStrength(password: string): PasswordStrength & { percent: number } {
  return useMemo(() => {
    const strength = scorePassword(password);
    return { ...strength, percent: strengthPercent(strength, password.length > 0) };
  }, [password]);
}
