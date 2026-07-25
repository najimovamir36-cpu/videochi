"use client";

import { motion, type Transition, type Variants } from "framer-motion";
import { useMemo, type ReactNode } from "react";

import {
  fadeIn,
  fadeInScale,
  fadeInUp,
  slideInLeft,
  slideInRight,
  viewportOnce,
} from "@/lib/motion";
import { cn } from "@/lib/utils";

const PRESETS = {
  fade: fadeIn,
  up: fadeInUp,
  scale: fadeInScale,
  left: slideInLeft,
  right: slideInRight,
} satisfies Record<string, Variants>;

export type RevealPreset = keyof typeof PRESETS;

export interface RevealProps {
  children: ReactNode;
  className?: string;
  preset?: RevealPreset;
  /** Seconds to wait before animating in. */
  delay?: number;
  as?: "div" | "section" | "li" | "span" | "article" | "header" | "footer";
}

/** Applies a delay to a preset without discarding its own easing. */
function withDelay(variants: Variants, delay: number): Variants {
  if (!delay) return variants;
  const visible = variants.visible as { transition?: Transition } | undefined;
  return {
    ...variants,
    visible: { ...visible, transition: { ...visible?.transition, delay } },
  };
}

/**
 * Scroll-triggered entrance animation. Fires once, slightly before the element
 * enters the viewport; reduced-motion is handled globally in the CSS layer.
 */
export function Reveal({ children, className, preset = "up", delay = 0, as = "div" }: RevealProps) {
  const MotionTag = motion[as];
  const variants = useMemo(() => withDelay(PRESETS[preset], delay), [preset, delay]);

  return (
    <MotionTag
      className={cn(className)}
      variants={variants}
      initial="hidden"
      whileInView="visible"
      viewport={viewportOnce}
    >
      {children}
    </MotionTag>
  );
}
