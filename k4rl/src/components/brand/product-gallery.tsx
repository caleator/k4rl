"use client";

import { ImageUploader } from "@/components/shared/image-uploader";
import { cn } from "@/lib/utils";

interface ProductGalleryProps {
  images: string[];
  onImagesChange: (images: string[]) => void;
  className?: string;
}

export function ProductGallery({ images, onImagesChange, className }: ProductGalleryProps) {
  return (
    <div className={cn("rounded-lg border divide-y", className)}>
      <div className="px-4 py-3 bg-muted/30 flex items-center justify-between">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
          Product images
        </p>
        <span className="text-xs text-muted-foreground">{images.length}/6</span>
      </div>
      <div className="px-4 py-4">
        <ImageUploader
          images={images}
          maxCount={6}
          onChange={onImagesChange}
          hint="First image is used as the thumbnail in the product list."
        />
      </div>
    </div>
  );
}
