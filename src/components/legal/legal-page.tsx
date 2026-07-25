import type { ReactNode } from "react";

import { Reveal } from "@/components/motion/reveal";
import { formatDate } from "@/lib/format";

export interface LegalSection {
  id: string;
  heading: string;
  body: ReactNode;
}

export interface LegalPageProps {
  title: string;
  subtitle: string;
  updatedAt: string;
  sections: LegalSection[];
}

/**
 * Shared shell for Terms and Privacy: sticky table of contents on desktop,
 * readable measure, consistent typography.
 */
export function LegalPage({ title, subtitle, updatedAt, sections }: LegalPageProps) {
  return (
    <section className="pb-24 pt-32 sm:pt-40">
      <div className="container">
        <Reveal preset="up" className="mx-auto max-w-3xl text-center">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-white/[0.09] bg-white/[0.035] px-3.5 py-1.5 text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
              Last updated {formatDate(updatedAt)}
            </span>
            <h1 className="mt-6 text-balance text-4xl font-semibold leading-[1.08] tracking-[-0.03em] sm:text-5xl">
              {title}
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-pretty text-[15px] leading-relaxed text-muted-foreground">
              {subtitle}
            </p>
          </div>
        </Reveal>

        <div className="mx-auto mt-16 grid max-w-6xl gap-10 lg:grid-cols-[16rem_1fr] lg:gap-14">
          <nav
            aria-label="On this page"
            className="hidden lg:sticky lg:top-28 lg:block lg:self-start"
          >
            <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              On this page
            </p>
            <ul className="flex flex-col gap-1 border-l border-white/[0.08]">
              {sections.map((section, index) => (
                <li key={section.id}>
                  <a
                    href={`#${section.id}`}
                    className="-ml-px block border-l border-transparent py-1.5 pl-4 text-[13px] text-muted-foreground transition-colors hover:border-primary/60 hover:text-foreground"
                  >
                    {index + 1}. {section.heading}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div className="flex max-w-3xl flex-col gap-10">
            {sections.map((section, index) => (
              <Reveal key={section.id} preset="up" delay={0.02}>
                <article id={section.id} className="scroll-mt-28">
                  <h2 className="flex items-baseline gap-3 font-display text-xl font-semibold tracking-tight">
                    <span className="text-[13px] font-medium tabular text-primary/80">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    {section.heading}
                  </h2>
                  <div className="mt-4 flex flex-col gap-3.5 text-[14px] leading-[1.75] text-muted-foreground [&_a]:text-foreground [&_a]:underline [&_a]:underline-offset-4 [&_li]:pl-1 [&_strong]:text-foreground [&_ul]:flex [&_ul]:list-disc [&_ul]:flex-col [&_ul]:gap-2 [&_ul]:pl-5">
                    {section.body}
                  </div>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
