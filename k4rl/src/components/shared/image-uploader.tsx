"use client";

import { useRef, useState, useCallback } from "react";
import { ImageIcon, X, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

interface ImageUploaderProps {
  images: string[];
  maxCount: number;
  onChange: (images: string[]) => void;
  label?: string;
  hint?: string;
  className?: string;
}

export function ImageUploader({
  images,
  maxCount,
  onChange,
  label,
  hint,
  className,
}: ImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const atCap = images.length >= maxCount;

  function openPicker() {
    if (!atCap) inputRef.current?.click();
  }

  function addFiles(files: FileList | null) {
    if (!files) return;
    const remaining = maxCount - images.length;
    const toAdd = Array.from(files)
      .slice(0, remaining)
      .filter((f) => f.type.startsWith("image/"))
      .map((f) => URL.createObjectURL(f));
    if (toAdd.length) onChange([...images, ...toAdd]);
  }

  function removeImage(index: number) {
    const next = images.filter((_, i) => i !== index);
    onChange(next);
  }

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      addFiles(e.dataTransfer.files);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [images, maxCount]
  );

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => setDragOver(false);

  return (
    <div className={cn("space-y-2", className)}>
      {label && (
        <p className="text-sm font-medium leading-none">{label}</p>
      )}

      {images.length === 0 ? (
        /* Empty drop zone */
        <button
          type="button"
          onClick={openPicker}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={cn(
            "flex w-full flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed px-4 py-8 text-muted-foreground transition-colors",
            dragOver
              ? "border-primary bg-primary/5 text-primary"
              : "hover:border-muted-foreground/40 hover:bg-muted/30"
          )}
        >
          <ImageIcon className="h-8 w-8 opacity-40" />
          <span className="text-sm">Drag & drop or click to upload</span>
        </button>
      ) : (
        /* Image grid */
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
          {images.map((src, i) => (
            <div
              key={src + i}
              className="relative aspect-square overflow-hidden rounded-lg border bg-muted group"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={src}
                alt={i === 0 ? "Thumbnail" : `Image ${i + 1}`}
                className="h-full w-full object-cover"
              />
              {/* Thumbnail badge */}
              {i === 0 && (
                <span className="absolute bottom-1 left-1 rounded bg-black/60 px-1.5 py-0.5 text-[10px] font-medium text-white leading-none">
                  Thumbnail
                </span>
              )}
              {/* Remove button */}
              <button
                type="button"
                onClick={() => removeImage(i)}
                className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-black/60 text-white opacity-0 transition-opacity group-hover:opacity-100"
                aria-label="Remove image"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}

          {/* Add more tile */}
          {!atCap && (
            <button
              type="button"
              onClick={openPicker}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              className={cn(
                "flex aspect-square items-center justify-center rounded-lg border-2 border-dashed text-muted-foreground transition-colors",
                dragOver
                  ? "border-primary bg-primary/5 text-primary"
                  : "hover:border-muted-foreground/40 hover:bg-muted/30"
              )}
              aria-label="Add image"
            >
              <Plus className="h-5 w-5" />
            </button>
          )}
        </div>
      )}

      {hint && (
        <p className="text-xs text-muted-foreground">{hint}</p>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple={maxCount > 1}
        className="sr-only"
        onChange={(e) => addFiles(e.target.files)}
        onClick={(e) => {
          // Reset so the same file can be re-selected
          (e.target as HTMLInputElement).value = "";
        }}
      />
    </div>
  );
}
