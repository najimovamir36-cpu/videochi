import { MessageCircleQuestion } from "lucide-react";
import Link from "next/link";

import { Reveal } from "@/components/motion/reveal";
import { SectionHeading } from "@/components/shared/section-heading";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { routes } from "@/config/routes";
import { faqs } from "@/data/faq";

/** Accordion FAQ, also emitted as FAQPage structured data by the landing page. */
export function FaqSection() {
  return (
    <section id="faq" className="scroll-mt-24 py-24 sm:py-32">
      <div className="container">
        <div className="grid gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16">
          <div className="lg:sticky lg:top-28 lg:self-start">
            <SectionHeading
              align="left"
              eyebrow="FAQ"
              title="Questions, answered"
              description="Everything about formats, speed, accuracy and data handling. If something is missing, we reply within one business day."
            >
              <Button asChild variant="outline" className="mt-2">
                <Link href={routes.contact}>
                  <MessageCircleQuestion className="size-4" />
                  Contact support
                </Link>
              </Button>
            </SectionHeading>
          </div>

          <Reveal preset="up">
            <Accordion type="single" collapsible className="flex flex-col gap-3">
              {faqs.map((faq, index) => (
                <AccordionItem key={faq.question} value={`faq-${index}`}>
                  <AccordionTrigger>{faq.question}</AccordionTrigger>
                  <AccordionContent>{faq.answer}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
