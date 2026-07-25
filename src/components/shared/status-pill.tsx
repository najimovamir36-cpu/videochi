import { CheckCircle2, CircleDashed, Clock, Loader2, XCircle } from "lucide-react";

import { Badge, type BadgeProps } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { ExportStatus, ProjectStatus, UploadStatus } from "@/types/media";

type AnyStatus = UploadStatus | ProjectStatus | ExportStatus;

const STATUS_MAP: Record<
  AnyStatus,
  { label: string; variant: BadgeProps["variant"]; icon: typeof CheckCircle2; spin?: boolean }
> = {
  queued: { label: "Queued", variant: "secondary", icon: Clock },
  uploading: { label: "Uploading", variant: "default", icon: Loader2, spin: true },
  paused: { label: "Paused", variant: "warning", icon: CircleDashed },
  processing: { label: "Processing", variant: "accent", icon: Loader2, spin: true },
  analyzing: { label: "Analyzing", variant: "accent", icon: Loader2, spin: true },
  rendering: { label: "Rendering", variant: "default", icon: Loader2, spin: true },
  ready: { label: "Ready", variant: "success", icon: CheckCircle2 },
  completed: { label: "Completed", variant: "success", icon: CheckCircle2 },
  draft: { label: "Draft", variant: "secondary", icon: CircleDashed },
  failed: { label: "Failed", variant: "destructive", icon: XCircle },
  cancelled: { label: "Cancelled", variant: "secondary", icon: XCircle },
};

/** Uniform status badge for uploads, projects and export jobs. */
export function StatusPill({ status, className }: { status: AnyStatus; className?: string }) {
  const config = STATUS_MAP[status];
  const Icon = config.icon;

  return (
    <Badge variant={config.variant} className={cn("py-1", className)}>
      <Icon className={cn(config.spin && "animate-spin")} />
      {config.label}
    </Badge>
  );
}
