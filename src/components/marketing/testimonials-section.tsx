import { Quote } from "lucide-react";

import { Stagger, StaggerItem } from "@/components/motion/stagger";
import { SectionHeading } from "@/components/shared/section-heading";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { testimonials } from "@/data/testimonials";
import { initials } from "@/lib/utils";

/** Masonry-style testimonial wall. */
export function TestimonialsSection() {
  return (
    <section id="testimonials" className="scroll-mt-24 py-24 sm:py-32">
      <div className="container">
        <SectionHeading
          eyebrow="Testimonials"
          title="Teams ship more, edit less"
          description="38,000 creator teams use ClipMind to turn one long recording into a month of short-form output."
        />

        <Stagger
          stagger={0.07}
          className="mt-14 gap-4 sm:mt-16 sm:columns-2 lg:columns-3 [&>*]:mb-4"
        >
          {testimonials.map((testimonial) => (
            <StaggerItem key={testimonial.id} className="break-inside-avoid">
              <figure className="glass edge-light group relative overflow-hidden rounded-2xl p-6 shadow-soft transition-all duration-300 ease-premium hover:-translate-y-1 hover:border-white/[0.14] hover:shadow-lifted">
                <Quote
                  className="absolute -right-2 -top-2 size-16 text-white/[0.035] transition-colors duration-500 group-hover:text-white/[0.06]"
                  aria-hidden
                />

                <Badge variant="secondary" className="relative mb-4">
                  {testimonial.metric}
                </Badge>

                <blockquote className="relative text-[13.5px] leading-relaxed text-foreground/85">
                  {testimonial.quote}
                </blockquote>

                <figcaption className="relative mt-5 flex items-center gap-3 border-t border-white/[0.06] pt-4">
                  <Avatar className="size-9">
                    <AvatarFallback style={{ background: testimonial.accent }}>
                      {initials(testimonial.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <p className="truncate text-[13px] font-medium">{testimonial.name}</p>
                    <p className="truncate text-[12px] text-muted-foreground">
                      {testimonial.role} · {testimonial.company}
                    </p>
                  </div>
                </figcaption>
              </figure>
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </section>
  );
}
