import { cn } from "@/lib/utils";

/** "or continue with" rule between social buttons and the credential form. */
export function AuthDivider({ label = "or", className }: { label?: string; className?: string }) {
  return (
    <div className={cn("relative flex items-center gap-4", className)}>
      <span className="h-px flex-1 bg-gradient-to-r from-transparent via-white/[0.12] to-white/[0.12]" />
      <span className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground">{label}</span>
      <span className="h-px flex-1 bg-gradient-to-l from-transparent via-white/[0.12] to-white/[0.12]" />
    </div>
  );
}
