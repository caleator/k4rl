"use client";

import { useState } from "react";
import { ScanLine } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ImageUploader } from "@/components/shared/image-uploader";
import { SkuScanDialog } from "@/components/brand/sku-scan-dialog";
import type { NewProductDraft } from "@/lib/types/product";

const CATEGORIES = [
  "T-shirt", "Shirt", "Blouse", "Dress", "Skirt", "Trousers", "Jeans",
  "Shorts", "Jacket", "Coat", "Blazer", "Knitwear", "Hoodie", "Sweatshirt",
  "Activewear", "Underwear", "Swimwear", "Accessories", "Footwear", "Other",
];

const COUNTRIES = [
  "Greece", "Cyprus", "Italy", "Portugal", "Spain", "France", "Germany",
  "Turkey", "Bangladesh", "India", "China", "Vietnam", "Cambodia",
  "Morocco", "Tunisia", "Romania", "Bulgaria", "Other",
];

interface Props {
  draft: NewProductDraft;
  onChange: (partial: Partial<NewProductDraft>) => void;
  onNext: () => void;
}

export function StepBasicInfo({ draft, onChange, onNext }: Props) {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [scanOpen, setScanOpen] = useState(false);

  function validate() {
    const e: Record<string, string> = {};
    if (!draft.name.trim()) e.name = "Product name is required.";
    if (!draft.sku.trim()) e.sku = "SKU is required.";
    if (!draft.category) e.category = "Select a category.";
    if (!draft.weightGrams || draft.weightGrams <= 0)
      e.weightGrams = "Enter a valid weight.";
    if (!draft.countryOfManufacture) e.countryOfManufacture = "Select a country.";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function handleNext() {
    if (validate()) onNext();
  }

  const thumbnailImages = draft.thumbnail ? [draft.thumbnail] : [];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-base font-semibold">Basic information</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Enter the core details for this product.
        </p>
      </div>

      <div className="grid gap-4">
        {/* Product name */}
        <div className="space-y-1.5">
          <Label htmlFor="name">Product name</Label>
          <Input
            id="name"
            placeholder="e.g. Noir Oversized Tee"
            value={draft.name}
            onChange={(e) => onChange({ name: e.target.value })}
          />
          {errors.name && (
            <p className="text-xs text-destructive">{errors.name}</p>
          )}
        </div>

        {/* SKU */}
        <div className="space-y-1.5">
          <Label htmlFor="sku">SKU</Label>
          <div className="flex gap-2">
            <Input
              id="sku"
              placeholder="e.g. AN-SS26-TEE-001"
              value={draft.sku}
              onChange={(e) => onChange({ sku: e.target.value.toUpperCase() })}
              className="font-mono flex-1"
            />
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() => setScanOpen(true)}
              aria-label="Scan barcode or label photo"
            >
              <ScanLine className="h-4 w-4" />
            </Button>
          </div>
          {errors.sku && (
            <p className="text-xs text-destructive">{errors.sku}</p>
          )}
        </div>

        {/* Category + Weight */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label>Category</Label>
            <Select
              value={draft.category}
              onValueChange={(v) => onChange({ category: v })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.category && (
              <p className="text-xs text-destructive">{errors.category}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="weight">Weight (grams)</Label>
            <Input
              id="weight"
              type="number"
              min={1}
              placeholder="e.g. 200"
              value={draft.weightGrams ?? ""}
              onChange={(e) =>
                onChange({ weightGrams: parseInt(e.target.value) || undefined })
              }
            />
            {errors.weightGrams && (
              <p className="text-xs text-destructive">{errors.weightGrams}</p>
            )}
          </div>
        </div>

        {/* Country of manufacture */}
        <div className="space-y-1.5">
          <Label>Country of manufacture</Label>
          <Select
            value={draft.countryOfManufacture}
            onValueChange={(v) => onChange({ countryOfManufacture: v })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select country" />
            </SelectTrigger>
            <SelectContent>
              {COUNTRIES.map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.countryOfManufacture && (
            <p className="text-xs text-destructive">
              {errors.countryOfManufacture}
            </p>
          )}
        </div>

        {/* Thumbnail */}
        <ImageUploader
          images={thumbnailImages}
          maxCount={1}
          onChange={(imgs) => onChange({ thumbnail: imgs[0] ?? undefined })}
          label="Product thumbnail"
          hint="Shown in the product list. Drag & drop or click to upload. Optional."
        />
      </div>

      <div className="flex justify-end pt-2">
        <Button onClick={handleNext}>
          Continue to materials
        </Button>
      </div>

      <SkuScanDialog
        open={scanOpen}
        onOpenChange={setScanOpen}
        onFill={(sku) => onChange({ sku })}
      />
    </div>
  );
}
