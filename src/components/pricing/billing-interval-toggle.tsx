"use client";

import { motion } from "framer-motion";

import { Badge } from "@/components/ui/badge";
import { YEARLY_DISCOUNT_PERCENT } from "@/data/plans";
import { cn } from "@/lib/utils";
import type { BillingInterval } from "@/types/billing";

export interface BillingIntervalToggleProps {
  value: BillingInterval;
  onChange: (value: BillingInterval) => void;
  className?: string;
}

const OPTIONS: Array<{ id: BillingInterval; label: string }> = [
  { id: "monthly", label: "Monthly" },
  { id: "yearly", label: "Yearly" },
];

/** Segmented monthly/yearly switch with a sliding highlight. */
export function BillingIntervalToggle({ value, onChange, className }: BillingIntervalToggleProps) {
  return (
    <div className={cn("flex flex-wrap items-center justify-center gap-3", className)}>
      <div
        role="radiogroup"
        aria-label="Billing interval"
        className="relative inline-flex items-center rounded-full border border-white/[0.08] bg-white/[0.03] p-1"
      >
        {OPTIONS.map((option) => {
          const active = value === option.id;
          return (
            <button
              key={option.id}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => onChange(option.id)}
              className={cn(
                "relative rounded-full px-4 py-1.5 text-[13px] font-medium transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60",
                active ? "text-foreground" : "text-muted-foreground hover:text-foreground/80",
              )}
            >
              {active ? (
                <motion.span
                  layoutId="billing-interval-pill"
                  className="absolute inset-0 rounded-full bg-white/[0.09] shadow-inset"
                  transition={{ type: "spring", stiffness: 380, damping: 32 }}
                />
              ) : null}
              <span className="relative">{option.label}</span>
            </button>
          );
        })}
      </div>

      <Badge variant="success">Save {YEARLY_DISCOUNT_PERCENT}% yearly</Badge>
    </div>
  );
}
