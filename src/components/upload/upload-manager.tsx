"use client";

import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, ListX, Loader2, XCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback } from "react";
import { toast } from "sonner";

import { UploadDropzone } from "@/components/upload/upload-dropzone";
import { UploadTaskItem } from "@/components/upload/upload-task-item";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useUploadQueue } from "@/hooks/use-upload-queue";
import { formatBytes } from "@/lib/format";
import type { UploadRejection } from "@/types/upload";

/**
 * Complete upload experience: dropzone, live queue, aggregate progress and
 * bulk controls. All transfer logic lives in `useUploadQueue`.
 */
export function UploadManager() {
  const router = useRouter();

  const onRejected = useCallback((rejections: UploadRejection[]) => {
    for (const rejection of rejections.slice(0, 3)) {
      toast.error(rejection.fileName, { description: rejection.reason });
    }
    if (rejections.length > 3) {
      toast.error(`${rejections.length - 3} more files were skipped`);
    }
  }, []);

  const { tasks, summary, isUploading, addFiles, cancel, cancelAll, retry, remove, clearFinished } =
    useUploadQueue({
      onRejected,
      onUploaded: (upload) => {
        toast.success("Upload complete", {
          description: `${upload.fileName} is queued for AI analysis.`,
        });
        // Refresh server components so the new upload appears in the library.
        router.refresh();
      },
      onError: (message) => toast.error("Upload failed", { description: message }),
    });

  const hasFinished = tasks.some(
    (task) => task.status === "ready" || task.status === "failed" || task.status === "cancelled",
  );

  return (
    <div className="flex flex-col gap-5">
      <UploadDropzone onFiles={addFiles} />

      <AnimatePresence>
        {tasks.length > 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3 }}
          >
            <Card>
              <CardHeader className="flex-row items-start justify-between gap-3">
                <div className="space-y-1">
                  <CardTitle className="flex items-center gap-2 text-base">
                    {isUploading ? (
                      <Loader2 className="size-4 animate-spin text-primary" />
                    ) : (
                      <CheckCircle2 className="size-4 text-success" />
                    )}
                    Upload queue
                  </CardTitle>
                  <p className="text-[12px] tabular text-muted-foreground">
                    {summary.completed} of {summary.total} complete ·{" "}
                    {formatBytes(summary.uploadedBytes)} of {formatBytes(summary.totalBytes)}
                    {summary.failed > 0 ? ` · ${summary.failed} failed` : ""}
                  </p>
                </div>

                <div className="flex shrink-0 items-center gap-2">
                  {isUploading ? (
                    <Button variant="outline" size="sm" onClick={cancelAll}>
                      <XCircle className="size-3.5" />
                      Cancel all
                    </Button>
                  ) : null}
                  {hasFinished ? (
                    <Button variant="ghost" size="sm" onClick={clearFinished}>
                      <ListX className="size-3.5" />
                      Clear
                    </Button>
                  ) : null}
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {summary.total > 1 ? (
                  <div className="space-y-1.5">
                    <Progress value={summary.progress} animated={isUploading} />
                    <p className="text-[11.5px] tabular text-muted-foreground">
                      {summary.progress.toFixed(1)}% of the batch transferred
                    </p>
                  </div>
                ) : null}

                <ul className="flex flex-col gap-2.5">
                  <AnimatePresence initial={false}>
                    {tasks.map((task) => (
                      <UploadTaskItem
                        key={task.id}
                        task={task}
                        onCancel={cancel}
                        onRetry={retry}
                        onRemove={remove}
                      />
                    ))}
                  </AnimatePresence>
                </ul>
              </CardContent>
            </Card>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
