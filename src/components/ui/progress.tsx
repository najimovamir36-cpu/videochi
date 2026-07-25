"use client";

import * as ProgressPrimitive from "@radix-ui/react-progress";
import * as React from "react";

import { cn } from "@/lib/utils";

export interface ProgressProps
  extends React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root> {
  /** 0–100. */
  value?: number;
  indicatorClassName?: string;
  /** Adds a moving sheen while the bar is in flight. */
  animated?: boolean;
}

const Progress = React.forwardRef<React.ComponentRef<typeof ProgressPrimitive.Root>, ProgressProps>(
  ({ className, value = 0, indicatorClassName, animated = false, ...props }, ref) => {
    const clamped = Math.min(100, Math.max(0, value));

    return (
      <ProgressPrimitive.Root
        ref={ref}
        value={clamped}
        className={cn(
          "relative h-2 w-full overflow-hidden rounded-full bg-white/[0.07] shadow-inset",
          className,
        )}
        {...props}
      >
        <ProgressPrimitive.Indicator
          className={cn(
            "relative h-full rounded-full bg-brand-gradient transition-[width] duration-500 ease-premium",
            animated && "shimmer-line",
            indicatorClassName,
          )}
          style={{ width: `${clamped}%` }}
        />
      </ProgressPrimitive.Root>
    );
  },
);
Progress.displayName = ProgressPrimitive.Root.displayName;

export { Progress };
