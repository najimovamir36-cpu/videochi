"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useState, type MouseEvent, type ReactNode } from "react";

import { cn } from "@/lib/utils";

interface RippleInstance {
  id: number;
  x: number;
  y: number;
  size: number;
}

export interface RippleProps {
  children: ReactNode;
  className?: string;
  /** Ripple tint; defaults to a soft white wash. */
  color?: string;
  disabled?: boolean;
}

/**
 * Material-style press ripple, positioned at the pointer.
 * Wrap any interactive element to add tactile feedback.
 */
export function Ripple({ children, className, color = "rgba(255,255,255,0.30)", disabled }: RippleProps) {
  const [ripples, setRipples] = useState<RippleInstance[]>([]);

  const onPointerDown = useCallback(
    (event: MouseEvent<HTMLSpanElement>) => {
      if (disabled) return;
      const target = event.currentTarget;
      const rect = target.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height) * 2.2;
      const instance: RippleInstance = {
        id: Date.now() + Math.random(),
        x: event.clientX - rect.left - size / 2,
        y: event.clientY - rect.top - size / 2,
        size,
      };
      setRipples((current) => [...current, instance]);
      window.setTimeout(() => {
        setRipples((current) => current.filter((entry) => entry.id !== instance.id));
      }, 640);
    },
    [disabled],
  );

  return (
    <span
      className={cn("relative inline-flex overflow-hidden", className)}
      onMouseDown={onPointerDown}
    >
      {children}
      <span className="pointer-events-none absolute inset-0 overflow-hidden rounded-[inherit]">
        <AnimatePresence>
          {ripples.map((ripple) => (
            <motion.span
              key={ripple.id}
              className="absolute rounded-full"
              style={{
                left: ripple.x,
                top: ripple.y,
                width: ripple.size,
                height: ripple.size,
                background: `radial-gradient(circle, ${color} 0%, transparent 70%)`,
              }}
              initial={{ opacity: 0.65, scale: 0 }}
              animate={{ opacity: 0, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.62, ease: "easeOut" }}
            />
          ))}
        </AnimatePresence>
      </span>
    </span>
  );
}
