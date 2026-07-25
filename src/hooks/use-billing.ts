"use client";

import { useCallback, useState } from "react";

import { routes } from "@/config/routes";
import { api } from "@/lib/api-client";

/**
 * Client-side billing actions. Both calls return a Stripe-hosted URL that the
 * caller redirects to; the server enforces auth and configuration.
 */
export function useBilling() {
  const [isPending, setIsPending] = useState(false);

  const startCheckout = useCallback(async (plan: "creator" | "studio") => {
    setIsPending(true);
    try {
      const { url } = await api.post<{ url: string }>(routes.api.checkout, { plan });
      window.location.href = url;
    } finally {
      setIsPending(false);
    }
  }, []);

  const openPortal = useCallback(async () => {
    setIsPending(true);
    try {
      const { url } = await api.post<{ url: string }>(routes.api.billingPortal);
      window.location.href = url;
    } finally {
      setIsPending(false);
    }
  }, []);

  return { startCheckout, openPortal, isPending };
}
