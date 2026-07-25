import type { ReactNode } from "react";

import { Reveal } from "@/components/motion/reveal";
import { cn } from "@/lib/utils";

export interface SectionHeadingProps {
  eyebrow?: string;
  title: ReactNode;
  description?: ReactNode;
  align?: "left" | "center";
  className?: string;
  /** Rendered under the description, e.g. a pair of buttons. */
  children?: ReactNode;
}

/** Consistent eyebrow + title + description block for marketing sections. */
export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "center",
  className,
  children,
}: SectionHeadingProps) {
  return (
    <div
      className={cn(
        "flex max-w-3xl flex-col gap-4",
        align === "center" && "mx-auto items-center text-center",
        className,
      )}
    >
      {eyebrow ? (
        <Reveal preset="fade">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/[0.09] bg-white/[0.035] px-3.5 py-1.5 text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
            <span className="size-1.5 rounded-full bg-primary shadow-[0_0_10px_2px_hsl(var(--primary)/0.6)]" />
            {eyebrow}
          </span>
        </Reveal>
      ) : null}

      <Reveal preset="up" delay={0.05}>
        <h2 className="text-balance text-3xl font-semibold leading-[1.1] tracking-[-0.02em] sm:text-4xl lg:text-[2.75rem]">
          {title}
        </h2>
      </Reveal>

      {description ? (
        <Reveal preset="up" delay={0.1}>
          <p className="text-pretty text-[15px] leading-relaxed text-muted-foreground sm:text-base">
            {description}
          </p>
        </Reveal>
      ) : null}

      {children ? (
        <Reveal preset="up" delay={0.16}>
          {children}
        </Reveal>
      ) : null}
    </div>
  );
}
