import Link from "next/link";

import { routes } from "@/config/routes";
import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  /** Hide the wordmark and render the mark only. */
  markOnly?: boolean;
  href?: string;
}

/** The ClipMind mark: a play triangle carved out of a rounded gradient tile. */
export function LogoMark({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "relative grid size-9 shrink-0 place-items-center overflow-hidden rounded-[11px] bg-brand-gradient shadow-[0_6px_18px_-6px_rgba(124,92,255,0.9)]",
        className,
      )}
      aria-hidden
    >
      <span className="absolute inset-0 bg-sheen opacity-60" />
      <svg viewBox="0 0 24 24" className="relative size-[18px]" fill="none">
        <path
          d="M9.5 7.8v8.4a.9.9 0 0 0 1.36.77l6.3-3.9a.9.9 0 0 0 0-1.54l-6.3-4.1a.9.9 0 0 0-1.36.77Z"
          fill="white"
          fillOpacity="0.96"
        />
        <path
          d="M6.2 8.6v6.8"
          stroke="white"
          strokeOpacity="0.65"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
      </svg>
    </span>
  );
}

export function Logo({ className, markOnly = false, href = routes.home }: LogoProps) {
  return (
    <Link
      href={href}
      className={cn(
        "group inline-flex items-center gap-2.5 rounded-xl outline-none transition-opacity focus-visible:ring-2 focus-visible:ring-ring/70 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        className,
      )}
      aria-label={`${siteConfig.name} home`}
    >
      <LogoMark className="transition-transform duration-500 ease-premium group-hover:scale-[1.06] group-hover:rotate-[-3deg]" />
      {markOnly ? null : (
        <span className="font-display text-[17px] font-semibold tracking-tight text-foreground">
          Clip<span className="text-gradient-brand">Mind</span>
        </span>
      )}
    </Link>
  );
}
