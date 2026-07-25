"use client";

import { motion } from "framer-motion";
import { useState, type CSSProperties, type MouseEvent, type ReactNode } from "react";

import { StaggerItem } from "@/components/motion/stagger";
import { cardHover } from "@/lib/motion";
import { cn } from "@/lib/utils";

export interface FeatureCardProps {
  title: string;
  description: string;
  /** Short qualifier shown in the top-right chip. */
  meta: string;
  /** Tailwind gradient classes for the icon tile. */
  accent: string;
  /**
   * Pre-rendered icon element. Icon *components* cannot be passed from a
   * server component to a client component, so the parent renders it.
   */
  icon: ReactNode;
}

/**
 * Feature card with a pointer-following spotlight and lift-on-hover.
 * The spotlight position is fed through CSS custom properties.
 */
export function FeatureCard({ title, description, meta, accent, icon }: FeatureCardProps) {
  const [spotlight, setSpotlight] = useState({ x: 50, y: 0, active: false });

  const onMouseMove = (event: MouseEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    setSpotlight({
      x: ((event.clientX - rect.left) / rect.width) * 100,
      y: ((event.clientY - rect.top) / rect.height) * 100,
      active: true,
    });
  };

  return (
    <StaggerItem as="li" className="list-none">
      <motion.div
        variants={cardHover}
        initial="rest"
        whileHover="hover"
        whileTap="tap"
        onMouseMove={onMouseMove}
        onMouseLeave={() => setSpotlight((current) => ({ ...current, active: false }))}
        style={{ "--spot-x": `${spotlight.x}%`, "--spot-y": `${spotlight.y}%` } as CSSProperties}
        className="glass edge-light group relative h-full overflow-hidden rounded-2xl p-6 shadow-soft transition-colors duration-300 hover:border-white/[0.14]"
      >
        <div
          aria-hidden
          className={cn(
            "pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500",
            spotlight.active && "opacity-100",
          )}
          style={{
            background:
              "radial-gradient(320px circle at var(--spot-x) var(--spot-y), hsl(var(--primary) / 0.14), transparent 65%)",
          }}
        />

        <div className="relative flex flex-col gap-4">
          <div className="flex items-start justify-between gap-3">
            <span
              className={cn(
                "grid size-11 place-items-center rounded-xl bg-gradient-to-br text-white shadow-[0_8px_24px_-10px_rgba(0,0,0,0.9)] ring-1 ring-white/15 transition-transform duration-500 ease-premium group-hover:scale-105",
                accent,
              )}
            >
              {icon}
            </span>
            <span className="rounded-full border border-white/[0.08] bg-white/[0.03] px-2.5 py-1 text-[10.5px] font-medium tracking-wide text-muted-foreground">
              {meta}
            </span>
          </div>

          <div className="space-y-2">
            <h3 className="font-display text-[17px] font-semibold tracking-tight">{title}</h3>
            <p className="text-[13.5px] leading-relaxed text-muted-foreground">{description}</p>
          </div>
        </div>
      </motion.div>
    </StaggerItem>
  );
}
