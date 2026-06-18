"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CheckCircle2 } from "lucide-react";
import {
  MATERIAL_REQUESTS,
  type MaterialCategory,
  type MaterialRequest,
} from "@/lib/mock/materials";
import { useAuth } from "@/context/auth";

const MATERIAL_CATEGORIES: MaterialCategory[] = [
  "Natural fiber",
  "Recycled synthetic",
  "Synthetic",
  "Semi-synthetic",
  "Vegan leather",
  "Trim",
  "Coating",
];

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmitted?: (req: MaterialRequest) => void;
}

function parseOptionalFloat(s: string): number | undefined {
  const n = parseFloat(s);
  return isNaN(n) ? undefined : n;
}

export function MaterialRequestDialog({ open, onOpenChange, onSubmitted }: Props) {
  const { user } = useAuth();
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submittedReq, setSubmittedReq] = useState<MaterialRequest | null>(null);
  const [form, setForm] = useState({
    materialName: "",
    category: "" as MaterialCategory | "",
    notes: "",
    co2PerKg: "",
    waterPerKg: "",
    energyPerKg: "",
    chemistryScore: "",
    circularityScore: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  function validate() {
    const e: Record<string, string> = {};
    if (!form.materialName.trim()) e.materialName = "Material name is required.";
    if (!form.category) e.category = "Select a category.";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function handleSubmit() {
    if (!validate()) return;
    setSubmitting(true);
    setTimeout(() => {
      const req: MaterialRequest = {
        id: `req-${Date.now()}`,
        brandId: user.brandId ?? "",
        brandName: user.brandName ?? user.name,
        materialName: form.materialName.trim(),
        category: form.category as MaterialCategory,
        notes: form.notes.trim() || undefined,
        co2PerKg: parseOptionalFloat(form.co2PerKg),
        waterPerKg: parseOptionalFloat(form.waterPerKg),
        energyPerKg: parseOptionalFloat(form.energyPerKg),
        chemistryScore: parseOptionalFloat(form.chemistryScore),
        circularityScore: parseOptionalFloat(form.circularityScore),
        submittedAt: new Date().toISOString(),
        status: "pending",
      };
      MATERIAL_REQUESTS.push(req);
      setSubmittedReq(req);
      setSubmitting(false);
      setSubmitted(true);
      onSubmitted?.(req);
    }, 800);
  }

  function handleClose(open: boolean) {
    onOpenChange(open);
    if (!open) {
      setTimeout(() => {
        setSubmitted(false);
        setSubmittedReq(null);
        setForm({
          materialName: "",
          category: "",
          notes: "",
          co2PerKg: "",
          waterPerKg: "",
          energyPerKg: "",
          chemistryScore: "",
          circularityScore: "",
        });
        setErrors({});
      }, 200);
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg">
        {submitted ? (
          <div className="flex flex-col items-center gap-4 py-6 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <CheckCircle2 className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h3 className="text-base font-semibold">Request submitted</h3>
              <p className="text-sm text-muted-foreground mt-1">
                The K4RL team will review{" "}
                <span className="font-medium text-foreground">
                  {submittedReq?.materialName}
                </span>{" "}
                and add it to the approved library. Your product will remain in
                draft until all pending materials are approved.
              </p>
            </div>
            <Button onClick={() => handleClose(false)} className="mt-2">
              Done
            </Button>
          </div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>Request a material</DialogTitle>
              <DialogDescription>
                Submit a material that isn't in the approved library. Your product
                will remain in draft until the K4RL team approves the request.
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-2 max-h-[65vh] overflow-y-auto pr-1">
              {/* Required */}
              <div className="space-y-1.5">
                <Label htmlFor="materialName">Material name</Label>
                <Input
                  id="materialName"
                  placeholder="e.g. Bamboo viscose"
                  value={form.materialName}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, materialName: e.target.value }))
                  }
                />
                {errors.materialName && (
                  <p className="text-xs text-destructive">{errors.materialName}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label>Category</Label>
                <Select
                  value={form.category}
                  onValueChange={(v) =>
                    setForm((f) => ({ ...f, category: v as MaterialCategory }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {MATERIAL_CATEGORIES.map((c) => (
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
                <Label htmlFor="notes">
                  Notes{" "}
                  <span className="text-muted-foreground font-normal">
                    (optional)
                  </span>
                </Label>
                <Textarea
                  id="notes"
                  placeholder="e.g. Used in our SS26 base layer. Supplier: Litrax."
                  rows={3}
                  value={form.notes}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, notes: e.target.value }))
                  }
                  className="resize-none"
                />
              </div>

              {/* Optional LCA values */}
              <div className="space-y-3">
                <div>
                  <p className="text-sm font-medium">
                    LCA values{" "}
                    <span className="text-muted-foreground font-normal">
                      (optional)
                    </span>
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Providing estimated values helps the review team move faster.
                    If left blank, K4RL will source them independently.
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="co2" className="text-xs">
                      CO₂ (kg CO₂e/kg)
                    </Label>
                    <Input
                      id="co2"
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="e.g. 2.5"
                      value={form.co2PerKg}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, co2PerKg: e.target.value }))
                      }
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="water" className="text-xs">
                      Water (L/kg)
                    </Label>
                    <Input
                      id="water"
                      type="number"
                      step="1"
                      min="0"
                      placeholder="e.g. 2200"
                      value={form.waterPerKg}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, waterPerKg: e.target.value }))
                      }
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="energy" className="text-xs">
                      Energy (MJ/kg)
                    </Label>
                    <Input
                      id="energy"
                      type="number"
                      step="0.1"
                      min="0"
                      placeholder="e.g. 45"
                      value={form.energyPerKg}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, energyPerKg: e.target.value }))
                      }
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="chemistry" className="text-xs">
                      Chemistry score (0–10)
                    </Label>
                    <Input
                      id="chemistry"
                      type="number"
                      step="0.1"
                      min="0"
                      max="10"
                      placeholder="e.g. 3"
                      value={form.chemistryScore}
                      onChange={(e) =>
                        setForm((f) => ({
                          ...f,
                          chemistryScore: e.target.value,
                        }))
                      }
                    />
                  </div>
                  <div className="space-y-1.5 col-span-2">
                    <Label htmlFor="circularity" className="text-xs">
                      Circularity score (0–100)
                    </Label>
                    <Input
                      id="circularity"
                      type="number"
                      step="1"
                      min="0"
                      max="100"
                      placeholder="e.g. 60"
                      value={form.circularityScore}
                      onChange={(e) =>
                        setForm((f) => ({
                          ...f,
                          circularityScore: e.target.value,
                        }))
                      }
                    />
                  </div>
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => handleClose(false)}
                disabled={submitting}
              >
                Cancel
              </Button>
              <Button onClick={handleSubmit} disabled={submitting}>
                {submitting ? "Submitting…" : "Submit request"}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
