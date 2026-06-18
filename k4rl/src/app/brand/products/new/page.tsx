"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, ChevronRight, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { StepBasicInfo } from "@/components/brand/product-steps/step-basic-info";
import { StepMaterials } from "@/components/brand/product-steps/step-materials";
import { StepReviewDpp } from "@/components/brand/product-steps/step-review-dpp";
import type { NewProductDraft } from "@/lib/types/product";
import { PRODUCTS } from "@/lib/mock/products";
import { MATERIALS } from "@/lib/mock/materials";
import { calculateEcoScore } from "@/lib/eco-score";
import { useAuth } from "@/context/auth";

const STEPS = [
  { id: 1, label: "Product details" },
  { id: 2, label: "Materials" },
  { id: 3, label: "Review & Generate DPP" },
];

const EMPTY_DRAFT: NewProductDraft = {
  name: "",
  sku: "",
  category: "",
  weightGrams: undefined,
  countryOfManufacture: "",
  composition: [],
  ecoScorePublic: false,
  thumbnail: undefined,
  gallery: [],
};

export default function NewProductPage() {
  const router = useRouter();
  const { user } = useAuth();
  const effectiveBrandId = user.brandId ?? "brand-001";
  const [step, setStep] = useState(1);
  const [draft, setDraft] = useState<NewProductDraft>(EMPTY_DRAFT);

  function updateDraft(partial: Partial<NewProductDraft>) {
    setDraft((prev) => ({ ...prev, ...partial }));
  }

  function handleSaveAsDraft() {
    const id = `prod-${Date.now()}`;
    PRODUCTS.push({
      id,
      brandId: effectiveBrandId,
      name: draft.name,
      sku: draft.sku,
      category: draft.category,
      weightGrams: draft.weightGrams ?? 0,
      countryOfManufacture: draft.countryOfManufacture,
      thumbnail: draft.thumbnail,
      gallery: draft.gallery,
      composition: draft.composition,
      ecoScore: undefined,
      ecoGrade: undefined,
      ecoScorePublic: false,
      dppStatus: "draft",
      createdAt: new Date().toISOString(),
    });
    router.push(`/brand/products/${id}`);
  }

  function handleDppGenerated(ecoScorePublic: boolean) {
    const id = `prod-${Date.now()}`;
    const components = draft.composition
      .filter(c => c.materialId)
      .map(c => {
        const material = MATERIALS.find(m => m.id === c.materialId);
        if (!material) return null;
        return { material, percentage: c.percentage };
      })
      .filter(Boolean) as Parameters<typeof calculateEcoScore>[0];

    let ecoScore: number | undefined;
    let ecoGrade: "A" | "B" | "C" | "D" | "E" | undefined;
    try {
      if (components.length > 0) {
        const result = calculateEcoScore(components);
        ecoScore = result.score;
        ecoGrade = result.grade as "A" | "B" | "C" | "D" | "E";
      }
    } catch {
      // eco-score is optional
    }

    PRODUCTS.push({
      id,
      brandId: effectiveBrandId,
      name: draft.name,
      sku: draft.sku,
      category: draft.category,
      weightGrams: draft.weightGrams ?? 0,
      countryOfManufacture: draft.countryOfManufacture,
      thumbnail: draft.thumbnail,
      gallery: draft.gallery,
      composition: draft.composition,
      ecoScore,
      ecoGrade,
      ecoScorePublic,
      dppStatus: "generated",
      dppGeneratedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    });

    router.push(`/brand/products/${id}`);
  }

  // Steps 2 and 3 use the full-width split layout — no card padding
  const isWideStep = step === 2 || step === 3;

  return (
    <div className={cn("mx-auto space-y-8", isWideStep ? "max-w-5xl" : "max-w-2xl")}>
      {/* Step indicator */}
      <nav aria-label="Product creation steps" className="flex items-center justify-between gap-4">
        <ol className="flex items-center gap-0 flex-1">
          {STEPS.map((s, i) => {
            const done = step > s.id;
            const active = step === s.id;
            return (
              <li key={s.id} className="flex items-center">
                <button
                  type="button"
                  onClick={() => done && setStep(s.id)}
                  className={cn(
                    "flex items-center gap-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm",
                    done && "cursor-pointer text-primary",
                    active && "text-foreground cursor-default",
                    !done && !active && "text-muted-foreground cursor-default"
                  )}
                  disabled={!done}
                >
                  <span
                    className={cn(
                      "flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-xs font-semibold",
                      done && "bg-primary border-primary text-primary-foreground",
                      active && "border-primary text-primary",
                      !done && !active && "border-muted-foreground/30 text-muted-foreground"
                    )}
                  >
                    {done ? <Check className="h-3.5 w-3.5" /> : s.id}
                  </span>
                  <span className="hidden sm:inline">{s.label}</span>
                </button>
                {i < STEPS.length - 1 && (
                  <ChevronRight className="mx-2 h-4 w-4 shrink-0 text-muted-foreground/40" />
                )}
              </li>
            );
          })}
        </ol>
        {step >= 2 && (
          <Button
            variant="ghost"
            size="sm"
            className="shrink-0 text-muted-foreground"
            onClick={handleSaveAsDraft}
          >
            <Save className="h-3.5 w-3.5" />
            Save as draft
          </Button>
        )}
      </nav>

      {/* Step content */}
      <div
        className={cn(
          "rounded-xl border",
          isWideStep ? "overflow-hidden p-0" : "p-6"
        )}
      >
        {step === 1 && (
          <StepBasicInfo draft={draft} onChange={updateDraft} onNext={() => setStep(2)} />
        )}
        {step === 2 && (
          <StepMaterials
            draft={draft}
            onChange={updateDraft}
            onBack={() => setStep(1)}
            onNext={() => setStep(3)}
          />
        )}
        {step === 3 && (
          <StepReviewDpp
            draft={draft}
            onBack={() => setStep(2)}
            onGenerated={handleDppGenerated}
            onSavedAsDraft={handleSaveAsDraft}
          />
        )}
      </div>
    </div>
  );
}
