import type { Metadata } from "next";
import { Clock, Headphones, Mail, MapPin, Phone } from "lucide-react";

import { ContactForm } from "@/components/contact/contact-form";
import { Reveal } from "@/components/motion/reveal";
import { SectionHeading } from "@/components/shared/section-heading";
import { Card } from "@/components/ui/card";
import { routes } from "@/config/routes";
import { siteConfig } from "@/config/site";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Contact",
  path: routes.contact,
  description:
    "Talk to the ClipMind AI team about pricing, technical support, partnerships or press. We reply within one business day.",
});

const CHANNELS = [
  {
    icon: Mail,
    title: "Email us",
    value: siteConfig.company.supportEmail,
    href: `mailto:${siteConfig.company.supportEmail}`,
    description: "Best for technical questions and account help.",
  },
  {
    icon: Headphones,
    title: "Sales",
    value: siteConfig.company.salesEmail,
    href: `mailto:${siteConfig.company.salesEmail}`,
    description: "Volume pricing, security reviews and procurement.",
  },
  {
    icon: Phone,
    title: "Call",
    value: siteConfig.company.phone,
    href: `tel:${siteConfig.company.phone.replace(/[^\d+]/g, "")}`,
    description: "Mon–Fri, 9am–6pm Pacific.",
  },
];

export default function ContactPage() {
  return (
    <section className="pb-24 pt-32 sm:pt-40">
      <div className="container">
        <SectionHeading
          eyebrow="Contact"
          title="Let's talk about your content pipeline"
          description="Tell us what you publish and how often. We will show you exactly where ClipMind fits — and where it does not."
        />

        <div className="mt-14 grid gap-8 lg:grid-cols-[1fr_1.15fr] lg:gap-12">
          <div className="flex flex-col gap-4">
            {CHANNELS.map((channel, index) => (
              <Reveal key={channel.title} preset="left" delay={index * 0.06}>
                <a
                  href={channel.href}
                  className="glass edge-light group flex items-start gap-4 rounded-2xl p-5 shadow-soft transition-all duration-300 ease-premium hover:-translate-y-0.5 hover:border-white/[0.14] hover:shadow-lifted"
                >
                  <span className="grid size-10 shrink-0 place-items-center rounded-xl border border-white/[0.08] bg-white/[0.04] text-primary">
                    <channel.icon className="size-[18px]" />
                  </span>
                  <div className="min-w-0">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                      {channel.title}
                    </p>
                    <p className="mt-1 truncate text-[14px] font-medium text-foreground">
                      {channel.value}
                    </p>
                    <p className="mt-1.5 text-[12.5px] leading-relaxed text-muted-foreground">
                      {channel.description}
                    </p>
                  </div>
                </a>
              </Reveal>
            ))}

            <Reveal preset="left" delay={0.2}>
              <Card className="p-5">
                <div className="flex items-start gap-4">
                  <span className="grid size-10 shrink-0 place-items-center rounded-xl border border-white/[0.08] bg-white/[0.04] text-accent">
                    <MapPin className="size-[18px]" />
                  </span>
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                      Headquarters
                    </p>
                    <p className="mt-1 text-[13.5px] leading-relaxed text-foreground/85">
                      {siteConfig.company.address}
                    </p>
                    <p className="mt-3 inline-flex items-center gap-2 text-[12.5px] text-muted-foreground">
                      <Clock className="size-3.5" />
                      Average first response: 3 hours
                    </p>
                  </div>
                </div>
              </Card>
            </Reveal>
          </div>

          <Reveal preset="up">
            <Card className="p-6 sm:p-8">
              <ContactForm />
            </Card>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
