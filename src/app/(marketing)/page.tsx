import type { Metadata } from "next";

import { CtaSection } from "@/components/marketing/cta-section";
import { FaqSection } from "@/components/marketing/faq-section";
import { FeaturesSection } from "@/components/marketing/features-section";
import { HeroSection } from "@/components/marketing/hero-section";
import { HowItWorksSection } from "@/components/marketing/how-it-works-section";
import { LogoMarquee } from "@/components/marketing/logo-marquee";
import { PricingPreviewSection } from "@/components/marketing/pricing-preview-section";
import { TestimonialsSection } from "@/components/marketing/testimonials-section";
import { faqs } from "@/data/faq";
import { buildMetadata, faqJsonLd, organizationJsonLd, softwareApplicationJsonLd } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({ path: "/" });

export default function LandingPage() {
  const structuredData = [softwareApplicationJsonLd(), organizationJsonLd(), faqJsonLd(faqs)];

  return (
    <>
      <script
        type="application/ld+json"
        // Structured data is generated server-side from local config, never user input.
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      <HeroSection />
      <LogoMarquee />
      <FeaturesSection />
      <HowItWorksSection />
      <TestimonialsSection />
      <PricingPreviewSection />
      <FaqSection />
      <CtaSection />
    </>
  );
}
