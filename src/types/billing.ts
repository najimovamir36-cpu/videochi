import type { PlanId } from "@/types/auth";

export type BillingInterval = "monthly" | "yearly";

export interface PlanFeature {
  label: string;
  included: boolean;
  highlight?: boolean;
}

export interface Plan {
  id: PlanId;
  name: string;
  tagline: string;
  /** Monthly price in USD; `null` means "talk to sales". */
  priceMonthly: number | null;
  /** Yearly price in USD, billed annually. */
  priceYearly: number | null;
  credits: string;
  featured: boolean;
  ctaLabel: string;
  features: PlanFeature[];
}

export interface Invoice {
  id: string;
  number: string;
  amount: number;
  status: "paid" | "open" | "void";
  issuedAt: string;
  periodLabel: string;
  downloadUrl: string;
}

export interface PaymentMethod {
  id: string;
  brand: "visa" | "mastercard" | "amex";
  last4: string;
  expMonth: number;
  expYear: number;
  isDefault: boolean;
}
