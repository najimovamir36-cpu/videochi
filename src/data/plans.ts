import type { Plan } from "@/types/billing";

export const plans: Plan[] = [
  {
    id: "free",
    name: "Free",
    tagline: "Try the full pipeline on your own footage.",
    priceMonthly: 0,
    priceYearly: 0,
    credits: "60 minutes / month",
    featured: false,
    ctaLabel: "Start free",
    features: [
      { label: "60 upload minutes per month", included: true },
      { label: "Up to 10 clips per video", included: true },
      { label: "1080p export", included: true },
      { label: "AI captions in 8 languages", included: true },
      { label: "Auto reframe to 9:16", included: true },
      { label: "ClipMind watermark", included: true },
      { label: "Face tracking", included: false },
      { label: "4K export", included: false },
      { label: "Team seats", included: false },
    ],
  },
  {
    id: "creator",
    name: "Creator",
    tagline: "For solo creators shipping every week.",
    priceMonthly: 39,
    priceYearly: 372,
    credits: "2,000 minutes / month",
    featured: true,
    ctaLabel: "Start 14-day trial",
    features: [
      { label: "2,000 upload minutes per month", included: true, highlight: true },
      { label: "Unlimited clips per video", included: true },
      { label: "4K export", included: true, highlight: true },
      { label: "AI captions in 32 languages", included: true },
      { label: "All aspect ratios (9:16, 1:1, 4:5, 16:9)", included: true },
      { label: "Face tracking and speaker detection", included: true, highlight: true },
      { label: "No watermark", included: true },
      { label: "500 GB storage", included: true },
      { label: "Priority render queue", included: false },
    ],
  },
  {
    id: "studio",
    name: "Studio",
    tagline: "For teams and agencies with real volume.",
    priceMonthly: 129,
    priceYearly: 1_236,
    credits: "10,000 minutes / month",
    featured: false,
    ctaLabel: "Start 14-day trial",
    features: [
      { label: "10,000 upload minutes per month", included: true, highlight: true },
      { label: "Everything in Creator", included: true },
      { label: "5 team seats included", included: true, highlight: true },
      { label: "Brand kits and caption presets", included: true },
      { label: "Priority GPU render queue", included: true, highlight: true },
      { label: "Scheduled publishing", included: true },
      { label: "2 TB storage", included: true },
      { label: "API access", included: true },
      { label: "Dedicated success manager", included: false },
    ],
  },
  {
    id: "enterprise",
    name: "Enterprise",
    tagline: "Custom scale, security reviews and SLAs.",
    priceMonthly: null,
    priceYearly: null,
    credits: "Unlimited",
    featured: false,
    ctaLabel: "Talk to sales",
    features: [
      { label: "Unlimited processing minutes", included: true },
      { label: "Everything in Studio", included: true },
      { label: "Unlimited seats and workspaces", included: true },
      { label: "SSO / SAML and SCIM", included: true, highlight: true },
      { label: "Custom data retention and region", included: true },
      { label: "99.9% uptime SLA", included: true, highlight: true },
      { label: "Dedicated success manager", included: true },
      { label: "Security review and DPA", included: true },
      { label: "On-prem render option", included: true },
    ],
  },
];

/** Percentage saved when paying yearly, derived from the featured plan. */
export const YEARLY_DISCOUNT_PERCENT = 20;

export function getPlan(id: Plan["id"]): Plan {
  const plan = plans.find((candidate) => candidate.id === id);
  if (!plan) throw new Error(`Unknown plan: ${id}`);
  return plan;
}
