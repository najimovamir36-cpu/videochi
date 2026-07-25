"use client";

import { TrendingDown, TrendingUp } from "lucide-react";

import { StaggerItem } from "@/components/motion/stagger";
import { AnimatedNumber, type NumberFormat } from "@/components/shared/animated-number";
import { cn } from "@/lib/utils";
import type { DashboardStat } from "@/types/media";

const FORMAT_MAP: Record<DashboardStat["format"], NumberFormat> = {
  number: "number",
  compact: "compact",
  duration: "duration",
  bytes: "bytes",
};

/** Single KPI tile with an animated value and period-over-period delta. */
export function StatCard({ stat }: { stat: DashboardStat }) {
  const positive = stat.delta >= 0;
  const TrendIcon = positive ? TrendingUp : TrendingDown;

  return (
    <StaggerItem>
      <div className="glass edge-light group relative h-full overflow-hidden rounded-2xl p-5 shadow-soft transition-all duration-300 ease-premium hover:-translate-y-1 hover:border-white/[0.14] hover:shadow-lifted">
        <div
          className="pointer-events-none absolute -right-8 -top-10 size-28 rounded-full bg-primary/10 blur-[42px] transition-opacity duration-500 group-hover:opacity-160"
          aria-hidden
        />

        <div className="flex items-start justify-between gap-3">
          <p className="text-[11.5px] font-medium uppercase tracking-[0.1em] text-muted-foreground">
            {stat.label}
          </p>
          <span
            className={cn(
              "inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[11px] font-semibold tabular",
              positive ? "bg-success/12 text-success" : "bg-destructive/12 text-destructive",
            )}
          >
            <TrendIcon className="size-3" />
            {Math.abs(stat.delta).toFixed(1)}%
          </span>
        </div>

        <p className="mt-3 font-display text-[1.9rem] font-semibold leading-none tracking-tight">
          <AnimatedNumber value={stat.value} format={FORMAT_MAP[stat.format]} />
        </p>

        <p className="mt-2 text-[12px] leading-relaxed text-muted-foreground">{stat.hint}</p>
      </div>
    </StaggerItem>
  );
}
