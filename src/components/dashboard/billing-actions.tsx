"use client";

import { CreditCard, Sparkles } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { useBilling } from "@/hooks/use-billing";
import { ApiClientError } from "@/lib/api-client";
import type { PlanId } from "@/types/auth";

/**
 * Upgrade / manage-subscription controls. Redirects to Stripe-hosted pages, so
 * no card data is handled here. In demo mode (no Stripe keys) the buttons show
 * a friendly toast instead of failing silently.
 */
export function BillingActions({ plan }: { plan: PlanId }) {
  const { startCheckout, openPortal, isPending } = useBilling();

  const handle = async (fn: () => Promise<void>) => {
    try {
      await fn();
    } catch (error) {
      const message =
        error instanceof ApiClientError && error.status === 503
          ? "Billing runs in demo mode here — add Stripe keys to enable real checkout."
          : error instanceof ApiClientError
            ? error.message
            : "Something went wrong. Please try again.";
      toast.error(message);
    }
  };

  const isPaid = plan === "creator" || plan === "studio";

  if (isPaid) {
    return (
      <Button variant="outline" onClick={() => handle(openPortal)} loading={isPending}>
        <CreditCard className="size-4" />
        Manage subscription
      </Button>
    );
  }

  return (
    <div className="flex flex-wrap gap-2.5">
      <Button variant="gradient" onClick={() => handle(() => startCheckout("creator"))} loading={isPending}>
        <Sparkles className="size-4" />
        Upgrade to Creator
      </Button>
      <Button variant="outline" onClick={() => handle(() => startCheckout("studio"))} loading={isPending}>
        Upgrade to Studio
      </Button>
    </div>
  );
}
