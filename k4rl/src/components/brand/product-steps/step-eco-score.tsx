"use client";

import { useMemo } from "react";
import { Leaf, Droplets, Zap, FlaskConical, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EcoScoreBadge } from "@/components/shared/eco-score-badge";
import { MATERIALS } from "@/lib/mock/materials";
import { calculateEcoScore } from "@/lib/eco-score";
import type { NewProductDraft } from "@/lib/types/product";
import { cn } from "@/lib/utils";

interface Props {
  draft: NewProductDraft;
  onBack: () => void;
  onNext: () => void;
}

const SUBSCORE_CONFIG = [
  { key: "co2" as const,        label: "Carbon footprint", icon: Leaf },
  { key: "water" as const,      label: "Water usage",      icon: Droplets },
  { key: "energy" as const,     label: "Energy use",       icon: Zap },
  { key: "chemistry" as const,  label: "Chemistry",        icon: FlaskConical },
  { key: "circularity" as const,label: "Circularity",      icon: RotateCcw },
];

function scoreColor(val: number) {
  if (val >= 80) return "text-emerald-600";
  if (val >= 60) return "text-amber-600";
  return "text-red-600";
}

function scoreBar(val: number) {
  if (val >= 80) return "bg-emerald-500";
  if (val >= 60) return "bg-amber-400";
  return "bg-red-500";
}

export function StepEcoScore({ draft, onBack, onNext }: Props) {
  const result = useMemo(() => {
    const components = draft.composition
      .filter((c) => c.materialId)
      .map((c) => {
        const material = MATERIALS.find((m) => m.id === c.materialId);
        if (!material) return null;
        return {
          material,
          percentage: c.percentage,
          isRecycled: c.isRecycled,
          isOrganic: c.isOrganic,
          hasElastane: c.hasElastane,
          hasPuCoating: c.hasPuCoating,
          hasPvcCoating: c.hasPvcCoating,
          hasHazardousFinish: c.hasHazardousFinish,
        };
      })
      .filter(Boolean) as Parameters<typeof calculateEcoScore>[0];

    if (components.length === 0) return null;

    try {
      return calculateEcoScore(components);
    } catch {
      return null;
    }
  }, [draft.composition]);

  if (!result) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-base font-semibold">Eco-score</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Unable to calculate score. Check your material composition.
          </p>
        </div>
        <div className="flex justify-between pt-2">
          <Button variant="outline" onClick={onBack}>Back</Button>
          <Button onClick={onNext}>Continue anyway</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-base font-semibold">Eco-score</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Calculated from your material composition using the K4RL methodology.
        </p>
      </div>

      {/* Score hero */}
      <div className="flex items-center gap-6 rounded-lg bg-muted/50 p-5">
        <div className="text-center">
          <div className="text-4xl font-bold tabular-nums">{result.score}</div>
          <div className="text-xs text-muted-foreground mt-1">out of 100</div>
        </div>
        <div>
          <EcoScoreBadge score={result.score} grade={result.grade} className="text-sm px-3 py-1" />
          <p className="text-xs text-muted-foreground mt-2">
            {result.grade === "A" && "Excellent — top environmental performance."}
            {result.grade === "B" && "Good — above average environmental performance."}
            {result.grade === "C" && "Average — room for improvement."}
            {result.grade === "D" && "Below average — consider material substitutions."}
            {result.grade === "E" && "Poor — significant environmental impact."}
          </p>
        </div>
      </div>

      {/* Subscores */}
      <div className="space-y-3">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Breakdown</p>
        {SUBSCORE_CONFIG.map(({ key, label, icon: Icon }) => {
          const val = Math.round(result.subscores[key]);
          return (
            <div key={key} className="flex items-center gap-3">
              <Icon className="h-4 w-4 shrink-0 text-muted-foreground" />
              <span className="text-sm w-36 shrink-0">{label}</span>
              <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
                <div
                  className={cn("h-full rounded-full transition-all", scoreBar(val))}
                  style={{ width: `${val}%` }}
                />
              </div>
              <span className={cn("text-sm font-medium tabular-nums w-8 text-right", scoreColor(val))}>
                {val}
              </span>
            </div>
          );
        })}
      </div>

      {/* Blended impacts */}
      <div className="grid grid-cols-3 gap-3 text-center">
        {[
          { label: "CO₂/kg", value: result.blendedImpacts.co2PerKg.toFixed(2) + " kg" },
          { label: "Water/kg", value: result.blendedImpacts.waterPerKg.toFixed(0) + " L" },
          { label: "Energy/kg", value: result.blendedImpacts.energyPerKg.toFixed(1) + " MJ" },
        ].map(({ label, value }) => (
          <div key={label} className="rounded-lg border p-3">
            <div className="text-sm font-semibold tabular-nums">{value}</div>
            <div className="text-xs text-muted-foreground">{label}</div>
          </div>
        ))}
      </div>

      <div className="flex justify-between pt-2">
        <Button variant="outline" onClick={onBack}>Back</Button>
        <Button onClick={onNext}>Continue to review</Button>
      </div>
    </div>
  );
}
