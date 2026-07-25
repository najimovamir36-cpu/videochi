import type { Metadata } from "next";
import { ArrowRight, ShieldCheck, Sparkles, Zap } from "lucide-react";
import Link from "next/link";

import { FaqSection } from "@/components/marketing/faq-section";
import { Reveal } from "@/components/motion/reveal";
import { PricingTable } from "@/components/pricing/pricing-table";
import { SectionHeading } from "@/components/shared/section-heading";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { routes } from "@/config/routes";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Pricing",
  path: routes.pricing,
  description:
    "Simple, minute-based pricing for ClipMind AI. Start free with 60 minutes per month, then scale to 10,000 minutes with team seats, 4K export and priority rendering.",
});

const ADD_ONS = [
  {
    icon: Zap,
    title: "Extra minutes",
    price: "$8 / 100 minutes",
    description:
      "Top up mid-cycle without changing plans. Unused top-up minutes roll over for 12 months.",
  },
  {
    icon: Sparkles,
    title: "Priority rendering",
    price: "$29 / month",
    description:
      "Jump the GPU queue on every export. Included at no cost on Studio and Enterprise.",
  },
  {
    icon: ShieldCheck,
    title: "Extended retention",
    price: "$19 / month",
    description:
      "Keep source uploads and rendered clips for 12 months instead of the standard 30 days.",
  },
];

export default function PricingPage() {
  return (
    <>
      <section className="pb-16 pt-32 sm:pt-40">
        <div className="container">
          <SectionHeading
            eyebrow="Pricing"
            title={
              <>
                Pay for minutes, <span className="text-gradient-brand">not seats you don&apos;t use.</span>
              </>
            }
            description="Every plan runs the full pipeline — clip detection, captions, reframe, face tracking and speaker detection. Upgrade only when you need more volume."
          />

          <PricingTable className="mt-14" />
        </div>
      </section>

      <section className="py-16 sm:py-20">
        <div className="container">
          <SectionHeading
            align="left"
            eyebrow="Add-ons"
            title="Extend any plan"
            description="Optional upgrades billed alongside your subscription. Cancel them independently at any time."
            className="max-w-2xl"
          />

          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {ADD_ONS.map((addOn, index) => (
              <Reveal key={addOn.title} preset="up" delay={index * 0.06}>
                <Card interactive className="h-full p-6">
                  <span className="grid size-10 place-items-center rounded-xl border border-white/[0.08] bg-white/[0.04] text-primary">
                    <addOn.icon className="size-[18px]" />
                  </span>
                  <h3 className="mt-4 font-display text-base font-semibold tracking-tight">
                    {addOn.title}
                  </h3>
                  <p className="mt-1 text-[13px] font-medium text-primary">{addOn.price}</p>
                  <p className="mt-3 text-[13px] leading-relaxed text-muted-foreground">
                    {addOn.description}
                  </p>
                </Card>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="py-8">
        <div className="container">
          <Reveal preset="scale">
            <Card className="flex flex-col items-start justify-between gap-6 p-8 sm:flex-row sm:items-center">
              <div className="max-w-xl">
                <h3 className="font-display text-xl font-semibold tracking-tight">
                  Need a custom agreement?
                </h3>
                <p className="mt-2 text-[13.5px] leading-relaxed text-muted-foreground">
                  Enterprise plans include SSO, custom data residency, a 99.9% uptime SLA and a
                  security review. Tell us about your volume and we will size it with you.
                </p>
              </div>
              <Button asChild variant="gradient" size="lg" className="shrink-0">
                <Link href={routes.contact}>
                  Talk to sales
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
            </Card>
          </Reveal>
        </div>
      </section>

      <FaqSection />
    </>
  );
}
