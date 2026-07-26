"use client";

import { upload as uploadToBlob } from "@vercel/blob/client";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { routes } from "@/config/routes";
import { UPLOAD_ERROR_MESSAGES, UPLOAD_LIMITS, getFileExtension } from "@/config/uploads";
import { api, ApiClientError } from "@/lib/api-client";
import { createId } from "@/lib/utils";
import {
  UploadAbortedError,
  smoothRate,
  uploadFile,
} from "@/lib/upload/upload-transport";
import { resolveMimeType, validateFiles } from "@/lib/upload/validate-files";
import type { VideoUpload } from "@/types/media";
import type { UploadQueueSummary, UploadRejection, UploadTask, UploadTaskPatch } from "@/types/upload";

type UploadTransport =
  | { kind: "stream-put"; uploadUrl: string }
  | { kind: "blob-direct"; pathname: string; handleUploadUrl: string; completeUrl: string };

interface RegisteredUpload {
  upload: VideoUpload;
  transport: UploadTransport;
}

export interface UseUploadQueueOptions {
  /** Called once per file when the server confirms the transfer. */
  onUploaded?: (upload: VideoUpload) => void;
  onRejected?: (rejections: UploadRejection[]) => void;
  onError?: (message: string) => void;
  maxConcurrent?: number;
}

export interface UseUploadQueue {
  tasks: UploadTask[];
  summary: UploadQueueSummary;
  isUploading: boolean;
  addFiles: (files: readonly File[]) => void;
  cancel: (taskId: string) => void;
  cancelAll: () => void;
  retry: (taskId: string) => void;
  remove: (taskId: string) => void;
  clearFinished: () => void;
}

/**
 * Owns the upload queue: validation, concurrency, live progress, speed/ETA
 * estimation, cancellation and retry. The UI layer stays presentational.
 */
export function useUploadQueue({
  onUploaded,
  onRejected,
  onError,
  maxConcurrent = UPLOAD_LIMITS.maxConcurrentUploads,
}: UseUploadQueueOptions = {}): UseUploadQueue {
  const [tasks, setTasks] = useState<UploadTask[]>([]);

  const controllers = useRef(new Map<string, AbortController>());
  const activeCount = useRef(0);
  const rateSamples = useRef(new Map<string, { time: number; loaded: number; rate: number }>());
  const unmounted = useRef(false);

  useEffect(() => {
    return () => {
      unmounted.current = true;
      for (const controller of controllers.current.values()) controller.abort();
      controllers.current.clear();
    };
  }, []);

  const patchTask = useCallback((id: string, patch: UploadTaskPatch) => {
    if (unmounted.current) return;
    setTasks((current) => current.map((task) => (task.id === id ? { ...task, ...patch } : task)));
  }, []);

  const runTask = useCallback(
    async (task: UploadTask) => {
      const controller = new AbortController();
      controllers.current.set(task.id, controller);
      activeCount.current += 1;

      patchTask(task.id, {
        status: "uploading",
        error: null,
        startedAt: Date.now(),
        progress: 0,
        uploadedBytes: 0,
      });
      rateSamples.current.set(task.id, { time: Date.now(), loaded: 0, rate: 0 });

      const reportProgress = (loaded: number, total: number) => {
        const now = Date.now();
        const previous = rateSamples.current.get(task.id);
        let rate = previous?.rate ?? 0;

        if (previous && now > previous.time) {
          const instant = ((loaded - previous.loaded) * 1000) / (now - previous.time);
          rate = smoothRate(previous.rate, Math.max(instant, 0));
        }

        rateSamples.current.set(task.id, { time: now, loaded, rate });

        patchTask(task.id, {
          progress: total === 0 ? 0 : Math.min(99.5, (loaded / total) * 100),
          uploadedBytes: loaded,
          speed: rate,
          etaSeconds: rate > 0 ? Math.max(0, (total - loaded) / rate) : 0,
        });
      };

      try {
        // 1. Register metadata so the server can reject the file before transfer.
        const registered = await api.post<RegisteredUpload>(routes.api.uploads, {
          fileName: task.fileName,
          size: task.size,
          mimeType: task.mimeType,
          source: "device",
        });

        // 2. Move the bytes with progress reporting. Vercel's serverless
        // functions reject request bodies over ~4.5 MB before your code even
        // runs, so on that backend the browser PUTs straight to Vercel Blob
        // instead of through our own route (see /api/uploads/route.ts).
        if (registered.transport.kind === "blob-direct") {
          const { pathname, handleUploadUrl, completeUrl } = registered.transport;

          const blob = await uploadToBlob(pathname, task.file, {
            access: "public",
            handleUploadUrl,
            clientPayload: JSON.stringify({ uploadId: registered.upload.id }),
            multipart: task.size > UPLOAD_LIMITS.chunkSize,
            abortSignal: controller.signal,
            onUploadProgress: ({ loaded, total }) => reportProgress(loaded, total),
          });

          await api.post(completeUrl, { key: blob.url });
        } else {
          await uploadFile<VideoUpload>({
            url: registered.transport.uploadUrl,
            file: task.file,
            method: "PUT",
            headers: { "Content-Type": task.mimeType },
            signal: controller.signal,
            onProgress: ({ loaded, total }) => reportProgress(loaded, total),
          });
        }

        patchTask(task.id, {
          status: "ready",
          progress: 100,
          uploadedBytes: task.size,
          etaSeconds: 0,
          completedAt: Date.now(),
        });

        onUploaded?.(registered.upload);
      } catch (error) {
        if (error instanceof UploadAbortedError || controller.signal.aborted) {
          patchTask(task.id, {
            status: "cancelled",
            error: UPLOAD_ERROR_MESSAGES.cancelled,
            speed: 0,
            etaSeconds: 0,
          });
        } else {
          const message =
            error instanceof ApiClientError || error instanceof Error
              ? error.message
              : UPLOAD_ERROR_MESSAGES.network;
          patchTask(task.id, { status: "failed", error: message, speed: 0, etaSeconds: 0 });
          onError?.(message);
        }
      } finally {
        controllers.current.delete(task.id);
        rateSamples.current.delete(task.id);
        activeCount.current = Math.max(0, activeCount.current - 1);
      }
    },
    [onError, onUploaded, patchTask],
  );

  // Pump the queue whenever a slot frees up.
  useEffect(() => {
    if (unmounted.current) return;

    const startable = tasks.filter((task) => task.status === "queued");
    if (startable.length === 0) return;

    const slots = Math.max(0, maxConcurrent - activeCount.current);
    for (const task of startable.slice(0, slots)) {
      void runTask(task);
    }
  }, [tasks, maxConcurrent, runTask]);

  const addFiles = useCallback(
    (files: readonly File[]) => {
      if (files.length === 0) return;

      const pending = tasks.filter(
        (task) => task.status === "queued" || task.status === "uploading",
      ).length;
      const { accepted, rejected } = validateFiles(files, pending);

      if (rejected.length > 0) onRejected?.(rejected);
      if (accepted.length === 0) return;

      const newTasks: UploadTask[] = accepted.map((file) => ({
        id: createId("task"),
        file,
        fileName: file.name,
        size: file.size,
        mimeType: resolveMimeType(file),
        extension: getFileExtension(file.name),
        status: "queued",
        progress: 0,
        uploadedBytes: 0,
        speed: 0,
        etaSeconds: 0,
        error: null,
        startedAt: null,
        completedAt: null,
      }));

      setTasks((current) => [...newTasks, ...current]);
    },
    [onRejected, tasks],
  );

  const cancel = useCallback((taskId: string) => {
    controllers.current.get(taskId)?.abort();
    setTasks((current) =>
      current.map((task) =>
        task.id === taskId && (task.status === "queued" || task.status === "uploading")
          ? { ...task, status: "cancelled", error: UPLOAD_ERROR_MESSAGES.cancelled, speed: 0 }
          : task,
      ),
    );
  }, []);

  const cancelAll = useCallback(() => {
    for (const controller of controllers.current.values()) controller.abort();
    setTasks((current) =>
      current.map((task) =>
        task.status === "queued" || task.status === "uploading"
          ? { ...task, status: "cancelled", error: UPLOAD_ERROR_MESSAGES.cancelled, speed: 0 }
          : task,
      ),
    );
  }, []);

  const retry = useCallback((taskId: string) => {
    setTasks((current) =>
      current.map((task) =>
        task.id === taskId && (task.status === "failed" || task.status === "cancelled")
          ? {
              ...task,
              status: "queued",
              error: null,
              progress: 0,
              uploadedBytes: 0,
              speed: 0,
              etaSeconds: 0,
            }
          : task,
      ),
    );
  }, []);

  const remove = useCallback(
    (taskId: string) => {
      controllers.current.get(taskId)?.abort();
      setTasks((current) => current.filter((task) => task.id !== taskId));
    },
    [],
  );

  const clearFinished = useCallback(() => {
    setTasks((current) =>
      current.filter((task) => task.status === "queued" || task.status === "uploading"),
    );
  }, []);

  const summary = useMemo<UploadQueueSummary>(() => {
    const totalBytes = tasks.reduce((sum, task) => sum + task.size, 0);
    const uploadedBytes = tasks.reduce((sum, task) => sum + task.uploadedBytes, 0);
    return {
      total: tasks.length,
      active: tasks.filter((task) => task.status === "uploading" || task.status === "queued").length,
      completed: tasks.filter((task) => task.status === "ready").length,
      failed: tasks.filter((task) => task.status === "failed").length,
      totalBytes,
      uploadedBytes,
      progress: totalBytes === 0 ? 0 : (uploadedBytes / totalBytes) * 100,
    };
  }, [tasks]);

  return {
    tasks,
    summary,
    isUploading: summary.active > 0,
    addFiles,
    cancel,
    cancelAll,
    retry,
    remove,
    clearFinished,
  };
}
