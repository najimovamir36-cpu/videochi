"use client";

import { useInView } from "framer-motion";
import { useRef } from "react";

import { useAnimatedCounter } from "@/hooks/use-animated-counter";
import { formatBytes, formatCompactNumber, formatDuration, formatNumber } from "@/lib/format";
import { cn } from "@/lib/utils";

export type NumberFormat = "number" | "compact" | "duration" | "bytes" | "percent";

export interface AnimatedNumberProps {
  value: number;
  format?: NumberFormat;
  durationMs?: number;
  className?: string;
  prefix?: string;
  suffix?: string;
  /** Decimal places for the `number` format. */
  decimals?: number;
}

function render(value: number, format: NumberFormat, decimals: number): string {
  switch (format) {
    case "compact":
      return formatCompactNumber(Math.round(value));
    case "duration":
      return formatDuration(Math.round(value));
    case "bytes":
      return formatBytes(value);
    case "percent":
      return `${value.toFixed(decimals)}%`;
    default:
      return formatNumber(Number(value.toFixed(decimals)), {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      });
  }
}

/** Counts up to `value` the first time it scrolls into view. */
export function AnimatedNumber({
  value,
  format = "number",
  durationMs = 1_400,
  className,
  prefix,
  suffix,
  decimals = 0,
}: AnimatedNumberProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const animated = useAnimatedCounter(value, durationMs, inView);

  return (
    <span ref={ref} className={cn("tabular", className)}>
      {prefix}
      {render(animated, format, decimals)}
      {suffix}
    </span>
  );
}
