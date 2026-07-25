import { ArrowRight, Clock, CreditCard, ShieldCheck } from "lucide-react";
import Link from "next/link";

import { Reveal } from "@/components/motion/reveal";
import { Button } from "@/components/ui/button";
import { routes } from "@/config/routes";

const REASSURANCE = [
  { icon: CreditCard, label: "No credit card required" },
  { icon: Clock, label: "60 free minutes every month" },
  { icon: ShieldCheck, label: "Your footage is never used for training" },
];

/** Closing conversion block. */
export function CtaSection() {
  return (
    <section className="pb-24 sm:pb-32">
      <div className="container">
        <Reveal preset="scale">
          <div className="glass-strong edge-light noise relative overflow-hidden rounded-[28px] px-6 py-16 text-center shadow-lifted sm:px-12 sm:py-20">
            <div
              className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(70%_80%_at_50%_0%,rgba(124,92,255,0.28),transparent_65%)]"
              aria-hidden
            />
            <div
              className="pointer-events-none absolute -bottom-32 left-1/2 -z-10 size-[30rem] -translate-x-1/2 rounded-full bg-accent/10 blur-[120px]"
              aria-hidden
            />

            <h2 className="mx-auto max-w-2xl text-balance text-3xl font-semibold leading-[1.1] tracking-[-0.025em] sm:text-[2.75rem]">
              Your next month of content is already{" "}
              <span className="text-gradient-brand">inside your last recording.</span>
            </h2>

            <p className="mx-auto mt-5 max-w-xl text-pretty text-[15px] leading-relaxed text-muted-foreground">
              Upload one video and see the clips ClipMind finds. Most creators publish their first
              AI-generated short within ten minutes of signing up.
            </p>

            <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button asChild variant="gradient" size="xl" className="w-full sm:w-auto">
                <Link href={routes.register}>
                  Start Free
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="xl" className="w-full sm:w-auto">
                <Link href={routes.pricing}>See pricing</Link>
              </Button>
            </div>

            <ul className="mx-auto mt-10 flex max-w-2xl flex-col items-center justify-center gap-3 text-[12.5px] text-muted-foreground sm:flex-row sm:gap-7">
              {REASSURANCE.map((item) => (
                <li key={item.label} className="inline-flex items-center gap-2">
                  <item.icon className="size-3.5 text-success" />
                  {item.label}
                </li>
              ))}
            </ul>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
