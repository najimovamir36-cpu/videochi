"use client";

import { AnimatePresence, motion } from "framer-motion";
import { FileVideo, FolderOpen, UploadCloud } from "lucide-react";
import { useRef } from "react";

import { Button } from "@/components/ui/button";
import { ACCEPTED_VIDEO_FORMATS, FILE_INPUT_ACCEPT, UPLOAD_LIMITS } from "@/config/uploads";
import { useDropzone } from "@/hooks/use-dropzone";
import { formatBytes } from "@/lib/format";
import { cn } from "@/lib/utils";

export interface UploadDropzoneProps {
  onFiles: (files: File[]) => void;
  disabled?: boolean;
  className?: string;
}

/** Drag-and-drop target with keyboard and click-to-browse fallbacks. */
export function UploadDropzone({ onFiles, disabled = false, className }: UploadDropzoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const { isDragging, dropzoneProps } = useDropzone({ onFiles, disabled });

  const openPicker = () => inputRef.current?.click();

  return (
    <div
      {...dropzoneProps}
      onClick={openPicker}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          openPicker();
        }
      }}
      role="button"
      tabIndex={disabled ? -1 : 0}
      aria-disabled={disabled}
      aria-label="Upload videos by dropping files here or browsing your device"
      className={cn(
        "group relative flex cursor-pointer flex-col items-center justify-center gap-5 overflow-hidden rounded-3xl border-2 border-dashed px-6 py-14 text-center outline-none transition-all duration-300 ease-premium sm:py-20",
        isDragging
          ? "border-primary/70 bg-primary/[0.07] scale-[1.005]"
          : "border-white/[0.10] bg-white/[0.015] hover:border-white/25 hover:bg-white/[0.03]",
        disabled && "pointer-events-none opacity-55",
        "focus-visible:ring-2 focus-visible:ring-ring/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        className,
      )}
    >
      <input
        ref={inputRef}
        type="file"
        multiple
        accept={FILE_INPUT_ACCEPT}
        className="sr-only"
        tabIndex={-1}
        onClick={(event) => event.stopPropagation()}
        onChange={(event) => {
          const files = Array.from(event.target.files ?? []);
          if (files.length > 0) onFiles(files);
          event.target.value = "";
        }}
      />

      <AnimatePresence>
        {isDragging ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_60%_at_50%_40%,rgba(124,92,255,0.22),transparent_70%)]"
            aria-hidden
          />
        ) : null}
      </AnimatePresence>

      <motion.span
        animate={isDragging ? { scale: 1.08, y: -4 } : { scale: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 320, damping: 22 }}
        className="relative grid size-16 place-items-center rounded-2xl border border-white/[0.10] bg-white/[0.04] text-primary shadow-glow-sm"
      >
        {isDragging ? (
          <FolderOpen className="size-7" />
        ) : (
          <UploadCloud className="size-7 transition-transform duration-500 ease-premium group-hover:-translate-y-0.5" />
        )}
        <span className="absolute inset-0 -z-10 animate-pulse-ring rounded-2xl ring-1 ring-primary/40" />
      </motion.span>

      <div className="relative space-y-2">
        <p className="font-display text-lg font-semibold tracking-tight">
          {isDragging ? "Drop to start uploading" : "Drag and drop your video"}
        </p>
        <p className="mx-auto max-w-md text-[13px] leading-relaxed text-muted-foreground">
          Or browse your device. Up to {UPLOAD_LIMITS.maxFilesPerBatch} files at once, {" "}
          {formatBytes(UPLOAD_LIMITS.maxFileSize, 0)} per file.
        </p>
      </div>

      <div className="relative flex flex-wrap items-center justify-center gap-2">
        {ACCEPTED_VIDEO_FORMATS.map((format) => (
          <span
            key={format.extension}
            className="inline-flex items-center gap-1.5 rounded-lg border border-white/[0.08] bg-white/[0.03] px-2 py-1 text-[10.5px] font-medium tracking-wide text-muted-foreground"
          >
            <FileVideo className="size-3" />
            {format.label}
          </span>
        ))}
      </div>

      <Button
        variant="outline"
        size="lg"
        className="relative"
        onClick={(event) => {
          event.stopPropagation();
          openPicker();
        }}
      >
        Browse files
      </Button>
    </div>
  );
}
