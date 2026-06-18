"use client";

import { useState } from "react";
import { AlertTriangle, Loader2, CheckCircle2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { EcoScoreBadge } from "@/components/shared/eco-score-badge";
import type { Product } from "@/lib/mock/products";

type Stage = "confirm" | "generating" | "done";

interface GenerateDppDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: Product;
  onGenerated: (generatedAt: string) => void;
}

export function GenerateDppDialog({
  open,
  onOpenChange,
  product,
  onGenerated,
}: GenerateDppDialogProps) {
  const [stage, setStage] = useState<Stage>("confirm");

  function handleOpenChange(next: boolean) {
    if (!next) setStage("confirm");
    onOpenChange(next);
  }

  async function handleConfirm() {
    setStage("generating");
    await new Promise(r => setTimeout(r, 1800));
    const generatedAt = new Date().toISOString();
    onGenerated(generatedAt);
    setStage("done");
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Generate DPP</DialogTitle>
        </DialogHeader>

        {stage === "confirm" && (
          <div className="space-y-5 pt-1">
            {/* What will be frozen */}
            <div className="rounded-md border divide-y text-sm">
              <div className="flex items-center justify-between px-3 py-2.5">
                <span className="text-muted-foreground">Product</span>
                <span className="font-medium">{product.name}</span>
              </div>
              <div className="flex items-center justify-between px-3 py-2.5">
                <span className="text-muted-foreground">SKU</span>
                <span className="font-mono text-xs">{product.sku}</span>
              </div>
              <div className="flex items-center justify-between px-3 py-2.5">
                <span className="text-muted-foreground">Composition</span>
                <span className="font-medium">
                  {product.composition.map(c => `${c.percentage}% ${c.materialName}`).join(", ")}
                </span>
              </div>
              {product.ecoScore !== undefined && product.ecoGrade && (
                <div className="flex items-center justify-between px-3 py-2.5">
                  <span className="text-muted-foreground">Eco-score</span>
                  <EcoScoreBadge score={product.ecoScore} grade={product.ecoGrade} />
                </div>
              )}
            </div>

            {/* Immutability warning */}
            <div className="flex gap-2.5 rounded-md bg-amber-500/10 px-3 py-3">
              <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
              <p className="text-sm text-amber-700 dark:text-amber-400">
                This DPP cannot be edited after generation. Any corrections will require a new version.
              </p>
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => handleOpenChange(false)}>
                Cancel
              </Button>
              <Button onClick={handleConfirm}>
                Generate DPP
              </Button>
            </div>
          </div>
        )}

        {stage === "generating" && (
          <div className="flex flex-col items-center gap-4 py-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Generating Digital Product Passport…</p>
          </div>
        )}

        {stage === "done" && (
          <div className="space-y-5 pt-1">
            <div className="flex items-start gap-3 rounded-md bg-muted/50 px-4 py-3">
              <CheckCircle2 className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
              <div className="space-y-0.5">
                <p className="text-sm font-medium">DPP generated</p>
                <p className="text-xs text-muted-foreground">
                  {product.name} is now EU-compliant and ready for QR & claim code pair generation.
                </p>
              </div>
            </div>
            <div className="flex justify-end">
              <Button variant="outline" onClick={() => handleOpenChange(false)}>
                Close
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
