import { Check } from "lucide-react";

import { Stagger, StaggerItem } from "@/components/motion/stagger";
import { SectionHeading } from "@/components/shared/section-heading";
import { workflowSteps } from "@/data/workflow";

/** Four-step pipeline explainer with a connecting rail on desktop. */
export function HowItWorksSection() {
  return (
    <section
      id="how-it-works"
      className="relative scroll-mt-24 overflow-hidden py-24 sm:py-32"
    >
      <div className="pointer-events-none absolute inset-x-0 top-1/2 -z-10 h-[28rem] -translate-y-1/2 bg-[radial-gradient(50%_50%_at_50%_50%,rgba(124,92,255,0.10),transparent_70%)]" />

      <div className="container">
        <SectionHeading
          eyebrow="How it works"
          title="From raw recording to ready-to-post in four steps"
          description="No timeline scrubbing, no keyframes, no render farm to manage. Drop the file in and review the results."
        />

        <div className="relative mt-16">
          {/* Connecting rail */}
          <div
            className="pointer-events-none absolute left-0 right-0 top-[2.65rem] hidden h-px bg-gradient-to-r from-transparent via-white/[0.14] to-transparent lg:block"
            aria-hidden
          />

          <Stagger as="ol" stagger={0.12} className="grid gap-8 lg:grid-cols-4 lg:gap-6">
            {workflowSteps.map((step) => {
              const Icon = step.icon;

              return (
                <StaggerItem as="li" key={step.id} className="relative list-none">
                  <div className="flex flex-col gap-5">
                    <div className="flex items-center gap-4 lg:flex-col lg:items-start">
                      <span className="glass-strong relative grid size-[5.3rem] shrink-0 place-items-center rounded-2xl shadow-lifted lg:size-[5.3rem]">
                        <Icon className="size-7 text-primary" />
                        <span className="absolute -right-1.5 -top-1.5 grid size-7 place-items-center rounded-full bg-brand-gradient text-[11px] font-bold text-white shadow-glow-sm">
                          {step.index}
                        </span>
                      </span>

                      <div className="lg:mt-1">
                        <h3 className="font-display text-lg font-semibold tracking-tight">
                          {step.title}
                        </h3>
                        <span className="text-[12px] font-medium uppercase tracking-[0.1em] text-primary/85">
                          {step.duration}
                        </span>
                      </div>
                    </div>

                    <p className="text-[13.5px] leading-relaxed text-muted-foreground">
                      {step.description}
                    </p>

                    <ul className="space-y-2">
                      {step.details.map((detail) => (
                        <li key={detail} className="flex items-start gap-2.5 text-[13px] text-foreground/75">
                          <span className="mt-0.5 grid size-4 shrink-0 place-items-center rounded-full bg-success/15 text-success">
                            <Check className="size-2.5" strokeWidth={3.5} />
                          </span>
                          {detail}
                        </li>
                      ))}
                    </ul>
                  </div>
                </StaggerItem>
              );
            })}
          </Stagger>
        </div>
      </div>
    </section>
  );
}
