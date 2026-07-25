import { trustedBy } from "@/data/testimonials";

/** Infinite, CSS-driven wordmark marquee used as social proof. */
export function LogoMarquee() {
  const row = [...trustedBy, ...trustedBy];

  return (
    <section className="border-y border-white/[0.05] bg-white/[0.012] py-8">
      <div className="container">
        <p className="text-center text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
          Trusted by content teams at
        </p>

        {/*
          Edge fading uses gradient overlays rather than `mask-image`: masking a
          layer that contains a compositor-driven transform animation makes
          Chromium drop its contents entirely.
        */}
        <div className="relative mt-6 overflow-hidden">
          <div className="flex w-max animate-marquee items-center gap-12 pr-12">
            {row.map((name, index) => (
              <span
                key={`${name}-${index}`}
                className="whitespace-nowrap font-display text-lg font-semibold tracking-tight text-foreground/35 transition-colors duration-300 hover:text-foreground/70"
              >
                {name}
              </span>
            ))}
          </div>

          <div
            className="pointer-events-none absolute inset-y-0 left-0 w-14 bg-gradient-to-r from-background to-transparent sm:w-20"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute inset-y-0 right-0 w-14 bg-gradient-to-l from-background to-transparent sm:w-20"
            aria-hidden
          />
        </div>
      </div>
    </section>
  );
}
