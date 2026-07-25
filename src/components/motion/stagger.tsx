"use client";

import { motion, type Variants } from "framer-motion";
import type { ReactNode } from "react";

import { fadeInUp, staggerContainer, viewportOnce } from "@/lib/motion";
import { cn } from "@/lib/utils";

export interface StaggerProps {
  children: ReactNode;
  className?: string;
  /** Seconds between each child's entrance. */
  stagger?: number;
  delay?: number;
  as?: "div" | "ul" | "ol" | "section";
}

/** Container that reveals its `<StaggerItem>` children in sequence. */
export function Stagger({
  children,
  className,
  stagger = 0.08,
  delay = 0,
  as = "div",
}: StaggerProps) {
  const MotionTag = motion[as];

  return (
    <MotionTag
      className={cn(className)}
      variants={staggerContainer(stagger, delay)}
      initial="hidden"
      whileInView="visible"
      viewport={viewportOnce}
    >
      {children}
    </MotionTag>
  );
}

export interface StaggerItemProps {
  children: ReactNode;
  className?: string;
  variants?: Variants;
  as?: "div" | "li" | "article" | "span";
}

export function StaggerItem({
  children,
  className,
  variants = fadeInUp,
  as = "div",
}: StaggerItemProps) {
  const MotionTag = motion[as];

  return (
    <MotionTag className={cn(className)} variants={variants}>
      {children}
    </MotionTag>
  );
}
