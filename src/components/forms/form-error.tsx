"use client";

import { AnimatePresence, motion } from "framer-motion";
import { AlertCircle } from "lucide-react";

import { cn } from "@/lib/utils";

/** Animated form-level error banner. Renders nothing when `message` is null. */
export function FormError({ message, className }: { message: string | null; className?: string }) {
  return (
    <AnimatePresence initial={false}>
      {message ? (
        <motion.div
          initial={{ opacity: 0, height: 0, marginTop: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0, marginTop: 0 }}
          transition={{ duration: 0.24 }}
          className="overflow-hidden"
        >
          <div
            role="alert"
            className={cn(
              "flex items-start gap-2.5 rounded-xl border border-destructive/25 bg-destructive/[0.08] px-3.5 py-3 text-[12.5px] leading-relaxed text-destructive",
              className,
            )}
          >
            <AlertCircle className="mt-px size-4 shrink-0" />
            <span>{message}</span>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
