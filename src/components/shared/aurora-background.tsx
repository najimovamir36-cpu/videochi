import { cn } from "@/lib/utils";

/**
 * Layered ambient background: grid, aurora blooms and film grain.
 * Purely decorative and pointer-events-none, so it never blocks interaction.
 */
export function AuroraBackground({ className }: { className?: string }) {
  return (
    <div
      className={cn("pointer-events-none absolute inset-0 -z-10 overflow-hidden", className)}
      aria-hidden
    >
      <div className="grid-backdrop absolute inset-x-0 top-0 h-[42rem]" />

      <div className="absolute -left-40 -top-52 size-[38rem] rounded-full bg-primary/22 blur-[130px]" />
      <div className="absolute -right-32 -top-24 size-[30rem] rounded-full bg-accent/16 blur-[120px]" />
      <div className="absolute left-1/2 top-[26rem] size-[34rem] -translate-x-1/2 rounded-full bg-fuchsia-500/12 blur-[140px]" />

      <div className="noise absolute inset-0" />
      <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-background to-transparent" />
    </div>
  );
}

/** Compact ambient glow for auth and dashboard shells. */
export function AmbientGlow({ className }: { className?: string }) {
  return (
    <div className={cn("pointer-events-none absolute inset-0 -z-10", className)} aria-hidden>
      <div className="absolute -left-24 top-0 size-[26rem] rounded-full bg-primary/18 blur-[120px]" />
      <div className="absolute -right-24 bottom-0 size-[22rem] rounded-full bg-accent/12 blur-[110px]" />
    </div>
  );
}
