"use client";

import { useCallback, useRef, useState, type DragEvent } from "react";

import { filesFromDataTransfer } from "@/lib/upload/validate-files";

export interface UseDropzoneOptions {
  onFiles: (files: File[]) => void;
  disabled?: boolean;
}

/**
 * Drag-and-drop state machine. Uses a depth counter so dragging over child
 * elements does not flicker the active state.
 */
export function useDropzone({ onFiles, disabled = false }: UseDropzoneOptions) {
  const [isDragging, setIsDragging] = useState(false);
  const depth = useRef(0);

  const reset = useCallback(() => {
    depth.current = 0;
    setIsDragging(false);
  }, []);

  const onDragEnter = useCallback(
    (event: DragEvent<HTMLElement>) => {
      if (disabled) return;
      event.preventDefault();
      depth.current += 1;
      if (Array.from(event.dataTransfer.types).includes("Files")) setIsDragging(true);
    },
    [disabled],
  );

  const onDragOver = useCallback(
    (event: DragEvent<HTMLElement>) => {
      if (disabled) return;
      event.preventDefault();
      event.dataTransfer.dropEffect = "copy";
    },
    [disabled],
  );

  const onDragLeave = useCallback(
    (event: DragEvent<HTMLElement>) => {
      if (disabled) return;
      event.preventDefault();
      depth.current = Math.max(0, depth.current - 1);
      if (depth.current === 0) setIsDragging(false);
    },
    [disabled],
  );

  const onDrop = useCallback(
    (event: DragEvent<HTMLElement>) => {
      if (disabled) return;
      event.preventDefault();
      reset();
      const files = filesFromDataTransfer(event.dataTransfer);
      if (files.length > 0) onFiles(files);
    },
    [disabled, onFiles, reset],
  );

  return {
    isDragging,
    /** Spread onto the drop target element. */
    dropzoneProps: { onDragEnter, onDragOver, onDragLeave, onDrop },
  } as const;
}
