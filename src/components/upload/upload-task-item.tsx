"use client";

import { motion } from "framer-motion";
import { CheckCircle2, RotateCcw, Trash2, X } from "lucide-react";

import { StatusPill } from "@/components/shared/status-pill";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { formatBitrate, formatBytes, formatTimeRemaining } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { UploadTask } from "@/types/upload";

export interface UploadTaskItemProps {
  task: UploadTask;
  onCancel: (id: string) => void;
  onRetry: (id: string) => void;
  onRemove: (id: string) => void;
}

/** One row of the upload queue: progress, speed, ETA, remaining size, actions. */
export function UploadTaskItem({ task, onCancel, onRetry, onRemove }: UploadTaskItemProps) {
  const inFlight = task.status === "uploading" || task.status === "queued";
  const remainingBytes = Math.max(0, task.size - task.uploadedBytes);

  return (
    <motion.li
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, height: 0, marginBottom: 0 }}
      transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        "overflow-hidden rounded-2xl border bg-white/[0.02] p-4 transition-colors",
        task.status === "failed"
          ? "border-destructive/30 bg-destructive/[0.04]"
          : task.status === "ready"
            ? "border-success/25 bg-success/[0.035]"
            : "border-white/[0.07]",
      )}
    >
      <div className="flex items-start gap-3">
        <span
          className={cn(
            "grid size-10 shrink-0 place-items-center rounded-xl text-[10.5px] font-bold uppercase tracking-wide",
            task.status === "ready"
              ? "bg-success/15 text-success"
              : task.status === "failed"
                ? "bg-destructive/15 text-destructive"
                : "bg-white/[0.05] text-muted-foreground",
          )}
        >
          {task.status === "ready" ? (
            <CheckCircle2 className="size-5" />
          ) : (
            task.extension.replace(".", "")
          )}
        </span>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="truncate text-[13px] font-medium">{task.fileName}</p>
              <p className="mt-0.5 text-[11.5px] tabular text-muted-foreground">
                {formatBytes(task.uploadedBytes)} of {formatBytes(task.size)}
                {task.status === "uploading" && task.speed > 0 ? (
                  <> · {formatBitrate(task.speed)}</>
                ) : null}
              </p>
            </div>

            <div className="flex shrink-0 items-center gap-1">
              {inFlight ? (
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => onCancel(task.id)}
                  aria-label={`Cancel upload of ${task.fileName}`}
                >
                  <X />
                </Button>
              ) : null}

              {task.status === "failed" || task.status === "cancelled" ? (
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => onRetry(task.id)}
                  aria-label={`Retry upload of ${task.fileName}`}
                >
                  <RotateCcw />
                </Button>
              ) : null}

              {!inFlight ? (
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => onRemove(task.id)}
                  aria-label={`Remove ${task.fileName} from the queue`}
                  className="text-muted-foreground hover:text-destructive"
                >
                  <Trash2 />
                </Button>
              ) : null}
            </div>
          </div>

          {inFlight ? (
            <div className="mt-2.5 space-y-1.5">
              <Progress value={task.progress} animated={task.status === "uploading"} className="h-1.5" />
              <div className="flex items-center justify-between text-[11px] tabular text-muted-foreground">
                <span>{task.progress.toFixed(task.progress < 100 ? 1 : 0)}%</span>
                <span>
                  {formatBytes(remainingBytes)} left
                  {task.status === "uploading" ? (
                    <> · {formatTimeRemaining(task.etaSeconds)}</>
                  ) : null}
                </span>
              </div>
            </div>
          ) : (
            <div className="mt-2 flex flex-wrap items-center gap-2.5">
              <StatusPill status={task.status} />
              {task.error ? (
                <span className="text-[11.5px] text-destructive">{task.error}</span>
              ) : null}
            </div>
          )}
        </div>
      </div>
    </motion.li>
  );
}
