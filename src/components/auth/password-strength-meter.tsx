"use client";

import { AnimatePresence, motion } from "framer-motion";

import { usePasswordStrength } from "@/hooks/use-password-strength";
import { cn } from "@/lib/utils";

const SEGMENT_COLORS = [
  "bg-destructive",
  "bg-destructive",
  "bg-warning",
  "bg-success",
  "bg-success",
] as const;

const LABEL_COLORS = [
  "text-destructive",
  "text-destructive",
  "text-warning",
  "text-success",
  "text-success",
] as const;

/** Four-segment strength meter with contextual improvement hints. */
export function PasswordStrengthMeter({
  password,
  className,
}: {
  password: string;
  className?: string;
}) {
  const strength = usePasswordStrength(password);
  const hasValue = password.length > 0;
  const filled = hasValue ? strength.score + 1 : 0;

  return (
    <div className={cn("flex flex-col gap-2", className)} aria-live="polite">
      <div className="flex items-center gap-3">
        <div className="flex flex-1 gap-1.5">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="h-1 flex-1 overflow-hidden rounded-full bg-white/[0.08]">
              <motion.div
                initial={false}
                animate={{ scaleX: index < filled ? 1 : 0 }}
                transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                style={{ originX: 0 }}
                className={cn("h-full w-full rounded-full", SEGMENT_COLORS[strength.score])}
              />
            </div>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {hasValue ? (
            <motion.span
              key={strength.label}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.18 }}
              className={cn(
                "w-[4.5rem] shrink-0 text-right text-[11.5px] font-medium",
                LABEL_COLORS[strength.score],
              )}
            >
              {strength.label}
            </motion.span>
          ) : null}
        </AnimatePresence>
      </div>

      <AnimatePresence initial={false}>
        {hasValue && strength.suggestions.length > 0 ? (
          <motion.ul
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.22 }}
            className="overflow-hidden text-[11.5px] text-muted-foreground"
          >
            {strength.suggestions.map((suggestion) => (
              <li key={suggestion} className="flex items-center gap-1.5 py-px">
                <span className="size-1 rounded-full bg-muted-foreground/60" />
                {suggestion}
              </li>
            ))}
          </motion.ul>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
