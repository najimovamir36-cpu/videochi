"use client";

import { useState } from "react";

import { BillingIntervalToggle } from "@/components/pricing/billing-interval-toggle";
import { PricingCard } from "@/components/pricing/pricing-card";
import { Stagger, StaggerItem } from "@/components/motion/stagger";
import { plans } from "@/data/plans";
import { cn } from "@/lib/utils";
import type { BillingInterval, Plan } from "@/types/billing";

export interface PricingTableProps {
  /** Restrict to a subset of plans, e.g. for the landing preview. */
  planIds?: ReadonlyArray<Plan["id"]>;
  className?: string;
  showToggle?: boolean;
}

/** Plan grid with a shared billing-interval control. */
export function PricingTable({ planIds, className, showToggle = true }: PricingTableProps) {
  const [interval, setInterval] = useState<BillingInterval>("monthly");
  const visiblePlans = planIds ? plans.filter((plan) => planIds.includes(plan.id)) : plans;

  return (
    <div className={cn("flex flex-col gap-10", className)}>
      {showToggle ? <BillingIntervalToggle value={interval} onChange={setInterval} /> : null}

      <Stagger
        stagger={0.08}
        className={cn(
          "grid gap-4 sm:grid-cols-2",
          visiblePlans.length === 3 ? "lg:grid-cols-3" : "xl:grid-cols-4",
        )}
      >
        {visiblePlans.map((plan) => (
          <StaggerItem key={plan.id} className="h-full">
            <PricingCard plan={plan} interval={interval} />
          </StaggerItem>
        ))}
      </Stagger>
    </div>
  );
}
