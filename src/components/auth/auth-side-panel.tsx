import { Quote, Sparkles } from "lucide-react";
import Link from "next/link";

import { Logo } from "@/components/shared/logo";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { routes } from "@/config/routes";
import { socialProof, testimonials } from "@/data/testimonials";
import { initials } from "@/lib/utils";

const HIGHLIGHTS = [
  "18 ranked clips from a single 90-minute recording",
  "Word-level captions in 32 languages",
  "Face tracking and speaker-aware reframing",
  "4K vertical exports tuned per platform",
];

/** Left-hand brand panel of the auth split layout. Desktop only. */
export function AuthSidePanel() {
  const featured = testimonials[0];

  return (
    <aside className="relative hidden overflow-hidden border-r border-white/[0.06] lg:flex lg:flex-col lg:justify-between lg:p-10 xl:p-12">
      <div className="pointer-events-none absolute inset-0 -z-10" aria-hidden>
        <div className="absolute -left-24 -top-24 size-[30rem] rounded-full bg-primary/22 blur-[130px]" />
        <div className="absolute -bottom-32 -right-16 size-[26rem] rounded-full bg-accent/14 blur-[120px]" />
        <div className="grid-backdrop absolute inset-0 opacity-70" />
        <div className="noise absolute inset-0" />
      </div>

      <div className="flex items-center justify-between">
        <Logo />
        <Link
          href={routes.home}
          className="text-[13px] text-muted-foreground transition-colors hover:text-foreground"
        >
          Back to site
        </Link>
      </div>

      <div className="max-w-md">
        <span className="inline-flex items-center gap-2 rounded-full border border-white/[0.09] bg-white/[0.04] px-3 py-1.5 text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
          <Sparkles className="size-3 text-primary" />
          The clip studio that runs itself
        </span>

        <h2 className="mt-6 text-balance font-display text-[2.1rem] font-semibold leading-[1.12] tracking-[-0.03em]">
          Turn every long recording into a{" "}
          <span className="text-gradient-brand">month of shorts.</span>
        </h2>

        <ul className="mt-7 flex flex-col gap-3">
          {HIGHLIGHTS.map((highlight) => (
            <li key={highlight} className="flex items-start gap-3 text-[13.5px] text-foreground/80">
              <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-brand-gradient" />
              {highlight}
            </li>
          ))}
        </ul>

        {featured ? (
          <figure className="glass mt-9 rounded-2xl p-5">
            <Quote className="size-5 text-primary/70" aria-hidden />
            <blockquote className="mt-3 text-[13px] leading-relaxed text-foreground/85">
              {featured.quote}
            </blockquote>
            <figcaption className="mt-4 flex items-center gap-3">
              <Avatar className="size-8">
                <AvatarFallback style={{ background: featured.accent }}>
                  {initials(featured.name)}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <p className="truncate text-[12.5px] font-medium">{featured.name}</p>
                <p className="truncate text-[11.5px] text-muted-foreground">
                  {featured.role} · {featured.company}
                </p>
              </div>
            </figcaption>
          </figure>
        ) : null}
      </div>

      <dl className="grid grid-cols-3 gap-4 border-t border-white/[0.07] pt-6">
        {socialProof.slice(0, 3).map((item) => (
          <div key={item.label}>
            <dd className="font-display text-lg font-semibold tracking-tight">{item.display}</dd>
            <dt className="text-[11px] uppercase tracking-[0.1em] text-muted-foreground">
              {item.label}
            </dt>
          </div>
        ))}
      </dl>
    </aside>
  );
}
