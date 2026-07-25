"use client";

import { motion } from "framer-motion";
import { Check, Minus, Sparkles } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { routes } from "@/config/routes";
import { formatCurrency } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { BillingInterval, Plan } from "@/types/billing";

export interface PricingCardProps {
  plan: Plan;
  interval: BillingInterval;
  className?: string;
}

/** A single plan column, used on both the landing preview and the pricing page. */
export function PricingCard({ plan, interval, className }: PricingCardProps) {
  const isEnterprise = plan.priceMonthly === null;
  const monthlyEquivalent =
    interval === "yearly" && plan.priceYearly !== null ? plan.priceYearly / 12 : plan.priceMonthly;

  return (
    <motion.div
      whileHover={{ y: -6 }}
      transition={{ type: "spring", stiffness: 260, damping: 24 }}
      className={cn(
        "glass edge-light relative flex h-full flex-col overflow-hidden rounded-3xl p-6 shadow-soft transition-colors duration-300 hover:border-white/[0.14] sm:p-7",
        plan.featured && "gradient-ring bg-white/[0.045] shadow-lifted",
        className,
      )}
    >
      {plan.featured ? (
        <span className="absolute right-5 top-5 inline-flex items-center gap-1.5 rounded-full bg-brand-gradient px-2.5 py-1 text-[10.5px] font-semibold uppercase tracking-wider text-white shadow-glow-sm">
          <Sparkles className="size-3" />
          Most popular
        </span>
      ) : null}

      <div className="space-y-1.5">
        <h3 className="font-display text-lg font-semibold tracking-tight">{plan.name}</h3>
        <p className="min-h-[2.5rem] text-[13px] leading-relaxed text-muted-foreground">
          {plan.tagline}
        </p>
      </div>

      <div className="mt-6 flex items-end gap-1.5">
        {isEnterprise ? (
          <span className="font-display text-[2.1rem] font-semibold leading-none tracking-tight">
            Custom
          </span>
        ) : (
          <>
            <span className="font-display text-[2.6rem] font-semibold leading-none tracking-tight tabular">
              {formatCurrency(Math.round(monthlyEquivalent ?? 0))}
            </span>
            <span className="pb-1 text-[13px] text-muted-foreground">/ month</span>
          </>
        )}
      </div>

      <p className="mt-2 text-[12px] text-muted-foreground">
        {isEnterprise
          ? "Volume pricing and annual agreements"
          : interval === "yearly" && plan.priceYearly
            ? `${formatCurrency(plan.priceYearly)} billed annually`
            : plan.priceMonthly === 0
              ? "Free forever, no card required"
              : "Billed monthly, cancel any time"}
      </p>

      <div className="mt-5">
        <Button
          asChild
          variant={plan.featured ? "gradient" : "outline"}
          size="lg"
          fullWidth
        >
          <Link href={isEnterprise ? routes.contact : routes.register}>{plan.ctaLabel}</Link>
        </Button>
      </div>

      <p className="mt-6 text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
        {plan.credits}
      </p>

      <ul className="mt-4 space-y-2.5 border-t border-white/[0.06] pt-5">
        {plan.features.map((feature) => (
          <li
            key={feature.label}
            className={cn(
              "flex items-start gap-2.5 text-[13px]",
              feature.included ? "text-foreground/80" : "text-muted-foreground/55",
            )}
          >
            <span
              className={cn(
                "mt-[3px] grid size-4 shrink-0 place-items-center rounded-full",
                feature.included
                  ? feature.highlight
                    ? "bg-primary/20 text-primary"
                    : "bg-success/15 text-success"
                  : "bg-white/[0.05] text-muted-foreground/60",
              )}
            >
              {feature.included ? (
                <Check className="size-2.5" strokeWidth={3.5} />
              ) : (
                <Minus className="size-2.5" strokeWidth={3.5} />
              )}
            </span>
            <span className={cn(feature.highlight && feature.included && "text-foreground")}>
              {feature.label}
            </span>
          </li>
        ))}
      </ul>
    </motion.div>
  );
}
