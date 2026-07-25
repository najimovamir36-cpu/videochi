import Link from "next/link";
import type { ReactNode } from "react";

import { Reveal } from "@/components/motion/reveal";
import { Logo } from "@/components/shared/logo";
import { routes } from "@/config/routes";

export interface AuthShellProps {
  title: string;
  description: ReactNode;
  children: ReactNode;
  /** Secondary line under the card, e.g. "Don't have an account?". */
  footer?: ReactNode;
}

/** Centred card used by every auth screen, paired with the split brand panel. */
export function AuthShell({ title, description, children, footer }: AuthShellProps) {
  return (
    <div className="flex w-full max-w-md flex-col">
      <div className="mb-8 flex items-center justify-between lg:hidden">
        <Logo />
        <Link
          href={routes.home}
          className="text-[13px] text-muted-foreground transition-colors hover:text-foreground"
        >
          Back to site
        </Link>
      </div>

      <Reveal preset="up">
        <div className="glass-strong edge-light noise relative overflow-hidden rounded-3xl p-7 shadow-lifted sm:p-8">
          <div
            className="pointer-events-none absolute -top-24 left-1/2 size-64 -translate-x-1/2 rounded-full bg-primary/18 blur-[90px]"
            aria-hidden
          />

          <div className="relative space-y-2">
            <h1 className="font-display text-2xl font-semibold tracking-tight">{title}</h1>
            <p className="text-[13.5px] leading-relaxed text-muted-foreground">{description}</p>
          </div>

          <div className="relative mt-7">{children}</div>
        </div>
      </Reveal>

      {footer ? (
        <p className="mt-6 text-center text-[13px] text-muted-foreground">{footer}</p>
      ) : null}
    </div>
  );
}
