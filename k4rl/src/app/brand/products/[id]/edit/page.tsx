"use client";

import { use, useState } from "react";
import { useRouter } from "next/navigation";
import { notFound } from "next/navigation";
import { Check, ChevronRight, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { StepBasicInfo } from "@/components/brand/product-steps/step-basic-info";
import { StepMaterials } from "@/components/brand/product-steps/step-materials";
import { StepReviewDpp } from "@/components/brand/product-steps/step-review-dpp";
import type { NewProductDraft } from "@/lib/types/product";
import { PRODUCTS } from "@/lib/mock/products";
import { MATERIALS, MATERIAL_REQUESTS } from "@/lib/mock/materials";
import { calculateEcoScore } from "@/lib/eco-score";
import { useAuth } from "@/context/auth";

const STEPS = [
  { id: 1, label: "Product details" },
  { id: 2, label: "Materials" },
  { id: 3, label: "Review & Generate DPP" },
];

export default function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { user } = useAuth();

  const product = PRODUCTS.find(p => p.id === id && p.brandId === user.brandId);
  if (!product || product.dppStatus !== "draft") notFound();

  // Resume at the step after the last completed one
  const resumeAt: 1 | 2 | 3 =
    product.composition?.length > 0 ? 3
    : product.name ? 2
    : 1;

  const [step, setStep] = useState<1 | 2 | 3>(resumeAt);

  // Resolve any approved pending materials at load time
  const resolvedComposition = (product.composition ?? []).map(entry => {
    if (entry.pendingRequestId) {
      const req = MATERIAL_REQUESTS.find(r => r.id === entry.pendingRequestId);
      if (req?.status === "approved" && req.approvedMaterialId) {
        const mat = MATERIALS.find(m => m.id === req.approvedMaterialId);
        if (mat) return { materialId: mat.id, materialName: mat.name, percentage: entry.percentage };
      }
    }
    return entry;
  });

  const [draft, setDraft] = useState<NewProductDraft>({
    name: product.name ?? "",
    sku: product.sku ?? "",
    category: product.category ?? "",
    weightGrams: product.weightGrams,
    countryOfManufacture: product.countryOfManufacture ?? "",
    composition: resolvedComposition,
    ecoScorePublic: product.ecoScorePublic ?? false,
    thumbnail: product.thumbnail,
    gallery: product.gallery ?? [],
  });

  function updateDraft(partial: Partial<NewProductDraft>) {
    setDraft(prev => ({ ...prev, ...partial }));
  }

  function handleDppGenerated(ecoScorePublic: boolean) {
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
      // eco-score optional
    }

    // Update the existing product entry in-place
    const existing = PRODUCTS.find(p => p.id === id);
    if (existing) {
      existing.name = draft.name;
      existing.sku = draft.sku;
      existing.category = draft.category;
      existing.weightGrams = draft.weightGrams ?? 0;
      existing.countryOfManufacture = draft.countryOfManufacture;
      existing.thumbnail = draft.thumbnail;
      existing.gallery = draft.gallery;
      existing.composition = draft.composition;
      existing.ecoScore = ecoScore;
      existing.ecoGrade = ecoGrade;
      existing.ecoScorePublic = ecoScorePublic;
      existing.dppStatus = "generated";
      existing.dppGeneratedAt = new Date().toISOString();
    }

    router.push(`/brand/products/${id}`);
  }

  function handleSaveAsDraft() {
    const existing = PRODUCTS.find(p => p.id === id);
    if (existing) {
      existing.name = draft.name;
      existing.sku = draft.sku;
      existing.category = draft.category;
      existing.weightGrams = draft.weightGrams ?? 0;
      existing.countryOfManufacture = draft.countryOfManufacture;
      existing.thumbnail = draft.thumbnail;
      existing.gallery = draft.gallery;
      existing.composition = draft.composition;
    }
    router.push(`/brand/products/${id}`);
  }

  const isWideStep = step === 2 || step === 3;

  return (
    <div className={cn("mx-auto space-y-8", isWideStep ? "max-w-5xl" : "max-w-2xl")}>

      {/* Back link */}
      <Link
        href="/brand/products"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Products
      </Link>

      {/* Step indicator */}
      <nav aria-label="Product creation steps">
        <ol className="flex items-center gap-0">
          {STEPS.map((s, i) => {
            const done = step > s.id;
            const active = step === s.id;
            return (
              <li key={s.id} className="flex items-center">
                <button
                  type="button"
                  onClick={() => done && setStep(s.id as 1 | 2 | 3)}
                  disabled={!done}
                  className={cn(
                    "flex items-center gap-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm",
                    done && "cursor-pointer text-primary",
                    active && "text-foreground cursor-default",
                    !done && !active && "text-muted-foreground cursor-default"
                  )}
                >
                  <span className={cn(
                    "flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-xs font-semibold",
                    done && "bg-primary border-primary text-primary-foreground",
                    active && "border-primary text-primary",
                    !done && !active && "border-muted-foreground/30 text-muted-foreground"
                  )}>
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
      </nav>

      {/* Step content */}
      <div className={cn("rounded-xl border", isWideStep ? "overflow-hidden p-0" : "p-6")}>
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
