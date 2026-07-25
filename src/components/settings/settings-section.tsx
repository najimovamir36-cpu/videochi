import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

export interface SettingsSectionProps {
  title: string;
  description: string;
  children: ReactNode;
  /** Rendered in a muted strip along the bottom of the card. */
  footer?: ReactNode;
  className?: string;
}

/** Titled card used for every block on the settings screen. */
export function SettingsSection({
  title,
  description,
  children,
  footer,
  className,
}: SettingsSectionProps) {
  return (
    <section className={cn("glass overflow-hidden rounded-2xl shadow-soft", className)}>
      <div className="border-b border-white/[0.05] px-5 py-4 sm:px-6">
        <h2 className="font-display text-[15px] font-semibold tracking-tight">{title}</h2>
        <p className="mt-1 text-[13px] leading-relaxed text-muted-foreground">{description}</p>
      </div>

      <div className="px-5 py-5 sm:px-6">{children}</div>

      {footer ? (
        <div className="border-t border-white/[0.05] bg-white/[0.015] px-5 py-3.5 text-[12.5px] text-muted-foreground sm:px-6">
          {footer}
        </div>
      ) : null}
    </section>
  );
}
