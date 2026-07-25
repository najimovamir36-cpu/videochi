import { ArrowRight } from "lucide-react";
import Link from "next/link";

import { Reveal } from "@/components/motion/reveal";
import { PricingTable } from "@/components/pricing/pricing-table";
import { SectionHeading } from "@/components/shared/section-heading";
import { Button } from "@/components/ui/button";
import { routes } from "@/config/routes";

/** Landing-page pricing preview — three plans plus a link to the full page. */
export function PricingPreviewSection() {
  return (
    <section id="pricing" className="scroll-mt-24 py-24 sm:py-32">
      <div className="container">
        <SectionHeading
          eyebrow="Pricing"
          title="Start free. Scale when it works."
          description="Every plan includes the full AI pipeline. You are only ever choosing how many minutes you need."
        />

        <PricingTable planIds={["free", "creator", "studio"]} className="mt-12" />

        <Reveal preset="fade" className="mt-10 text-center">
          <Button asChild variant="ghost">
            <Link href={routes.pricing}>
              Compare all plans and add-ons
              <ArrowRight className="size-4" />
            </Link>
          </Button>
        </Reveal>
      </div>
    </section>
  );
}
