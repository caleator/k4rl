"use client";

import { useState, useMemo } from "react";
import {
  Leaf, RotateCcw, Zap, FlaskConical, Shield, Scissors, Layers,
  ImageIcon,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { MonoId } from "@/components/shared/mono-id";
import { EcoScoreBadge } from "@/components/shared/eco-score-badge";
import { MATERIALS, type MaterialCategory } from "@/lib/mock/materials";
import { calculateEcoScore } from "@/lib/eco-score";
import type { NewProductDraft, CompositionEntry } from "@/lib/types/product";
import { cn } from "@/lib/utils";

// ─── Category config ──────────────────────────────────────────────────────────

interface CategoryStyle {
  icon: LucideIcon;
  color: string;
  bg: string;
  label: string;
}

const CATEGORY_CONFIG: Record<MaterialCategory, CategoryStyle> = {
  "Natural fiber":      { icon: Leaf,         color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-500/10", label: "Natural fiber" },
  "Recycled synthetic": { icon: RotateCcw,    color: "text-blue-600 dark:text-blue-400",       bg: "bg-blue-500/10",    label: "Recycled synthetic" },
  "Synthetic":          { icon: Zap,          color: "text-amber-600 dark:text-amber-400",     bg: "bg-amber-500/10",   label: "Synthetic" },
  "Semi-synthetic":     { icon: FlaskConical, color: "text-violet-600 dark:text-violet-400",   bg: "bg-violet-500/10",  label: "Semi-synthetic" },
  "Vegan leather":      { icon: Shield,       color: "text-slate-600 dark:text-slate-400",     bg: "bg-slate-500/10",   label: "Vegan leather" },
  "Trim":               { icon: Scissors,     color: "text-muted-foreground",                  bg: "bg-muted",          label: "Trim" },
  "Coating":            { icon: Layers,       color: "text-muted-foreground",                  bg: "bg-muted",          label: "Coating" },
};

function getCategoryStyle(cat: string): CategoryStyle {
  return CATEGORY_CONFIG[cat as MaterialCategory] ?? { icon: Layers, color: "text-muted-foreground", bg: "bg-muted", label: cat };
}

// ─── Composition ring ─────────────────────────────────────────────────────────

function CompositionRing({ total }: { total: number }) {
  const r = 22; const size = 56; const cx = size / 2; const cy = size / 2;
  const circumference = 2 * Math.PI * r;
  const dash = (Math.min(total, 100) / 100) * circumference;
  const isComplete = total === 100;
  return (
    <div className="relative flex items-center justify-center shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90" style={{ position: "absolute" }}>
        <circle cx={cx} cy={cy} r={r} fill="none" strokeWidth={3.5} className="stroke-muted" />
        <circle cx={cx} cy={cy} r={r} fill="none" strokeWidth={3.5} strokeLinecap="round"
          strokeDasharray={`${dash} ${circumference}`}
          className={cn("transition-all duration-300", isComplete ? "stroke-primary" : "stroke-primary/60")}
        />
      </svg>
      <span className={cn("text-xs font-bold tabular-nums leading-none", isComplete ? "text-primary" : "text-foreground")}
        style={{ fontFamily: "var(--font-mono)" }}>
        {total}%
      </span>
    </div>
  );
}

// ─── Composition visual row ───────────────────────────────────────────────────

function CompositionRow({ entry }: { entry: CompositionEntry }) {
  const material = MATERIALS.find(m => m.id === entry.materialId);
  const style = getCategoryStyle(material?.category ?? "");
  const Icon = style.icon;
  const pct = entry.percentage || 0;
  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-2.5">
        <span className={cn("flex h-6 w-6 shrink-0 items-center justify-center rounded-md", style.bg)}>
          <Icon className={cn("h-3.5 w-3.5", style.color)} />
        </span>
        <span className="flex-1 text-sm font-medium leading-tight">{entry.materialName || "—"}</span>
        <span className="text-sm font-bold tabular-nums shrink-0" style={{ fontFamily: "var(--font-mono)" }}>
          {pct}%
        </span>
      </div>
      <div className="flex items-center gap-2 pl-8">
        <div className="flex-1 h-1 rounded-full bg-muted overflow-hidden">
          <div className="h-full rounded-full bg-primary/60 transition-all duration-500" style={{ width: `${Math.min(pct, 100)}%` }} />
        </div>
        <span className="text-[10px] text-muted-foreground shrink-0 leading-none">{style.label}</span>
      </div>
    </div>
  );
}

// ─── Section label ────────────────────────────────────────────────────────────

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-muted-foreground">
      {children}
    </p>
  );
}

// ─── Image preview panel ──────────────────────────────────────────────────────

function ImagePreviewPanel({ draft }: { draft: NewProductDraft }) {
  const images = [draft.thumbnail, ...(draft.gallery ?? [])].filter(Boolean) as string[];
  const [selectedIdx, setSelectedIdx] = useState(0);
  const mainImage = images[selectedIdx] ?? images[0] ?? null;

  return (
    <div className="flex flex-col h-full bg-muted/20">
      {/* Main image */}
      <div className="relative flex-1 bg-muted/30 overflow-hidden" style={{ minHeight: 320 }}>
        {mainImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={mainImage} alt="Product" className="h-full w-full object-contain" />
        ) : (
          <div className="flex h-full min-h-[320px] flex-col items-center justify-center gap-3 text-muted-foreground">
            <div className="flex h-14 w-14 items-center justify-center rounded-full border-2 border-dashed border-muted-foreground/20">
              <ImageIcon className="h-6 w-6 opacity-30" />
            </div>
            <p className="text-sm text-muted-foreground/60">No photos added</p>
          </div>
        )}
        {mainImage && selectedIdx === 0 && (
          <span className="absolute top-3 left-3 rounded-md bg-black/50 px-2 py-1 text-[10px] font-semibold uppercase tracking-widest text-white">
            Thumbnail
          </span>
        )}
      </div>

      {/* Thumbnail strip */}
      {images.length > 1 && (
        <div className="flex items-center gap-2 border-t bg-background/60 px-4 py-3 overflow-x-auto shrink-0">
          {images.map((src, i) => (
            <button
              key={src + i}
              type="button"
              onClick={() => setSelectedIdx(i)}
              className={cn(
                "relative h-14 w-14 shrink-0 overflow-hidden rounded-md border-2 transition-all",
                selectedIdx === i ? "border-primary shadow-sm" : "border-transparent opacity-50 hover:opacity-100"
              )}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={src} alt={`Photo ${i + 1}`} className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Review step ──────────────────────────────────────────────────────────────

interface Props {
  draft: NewProductDraft;
  onBack: () => void;
  onSubmit: () => void;
}

export function StepReview({ draft, onBack, onSubmit }: Props) {
  const [ecoScorePublic, setEcoScorePublic] = useState(draft.ecoScorePublic);
  const [submitting, setSubmitting] = useState(false);

  const ecoResult = useMemo(() => {
    const components = draft.composition
      .filter(c => c.materialId)
      .map(c => {
        const material = MATERIALS.find(m => m.id === c.materialId);
        if (!material) return null;
        return { material, percentage: c.percentage };
      })
      .filter(Boolean) as Parameters<typeof calculateEcoScore>[0];
    try { return calculateEcoScore(components); } catch { return null; }
  }, [draft.composition]);

  const filled = draft.composition.filter(c => c.materialId && c.percentage > 0);
  const compositionTotal = filled.reduce((s, c) => s + (c.percentage || 0), 0);

  function handleSubmit() {
    setSubmitting(true);
    setTimeout(() => { setSubmitting(false); onSubmit(); }, 800);
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[400px_1fr] min-h-[600px]">

      {/* ── Left: DNA preview panel ── */}
      <div className="flex flex-col border-r bg-card overflow-y-auto">

        {/* Preview badge + product identity */}
        <div className="px-6 pt-5 pb-5 border-b shrink-0">
          <SectionLabel>Product DNA · Preview</SectionLabel>
          {draft.name ? (
            <h2 className="mt-2 text-lg font-semibold leading-snug">{draft.name}</h2>
          ) : (
            <h2 className="mt-2 text-lg font-semibold text-muted-foreground/40 italic">Untitled product</h2>
          )}
          <div className="mt-1.5 flex flex-wrap items-center gap-2">
            {draft.sku && <MonoId value={draft.sku} />}
            {draft.category && (
              <span className="inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
                {draft.category}
              </span>
            )}
          </div>
          {(draft.countryOfManufacture || draft.weightGrams) && (
            <div className="mt-1 flex flex-wrap gap-x-2 text-xs text-muted-foreground">
              {draft.countryOfManufacture && <span>Made in {draft.countryOfManufacture}</span>}
              {draft.countryOfManufacture && draft.weightGrams && <span>·</span>}
              {draft.weightGrams && <span>{draft.weightGrams}g</span>}
            </div>
          )}
        </div>

        {/* Composition */}
        {filled.length > 0 && (
          <div className="px-6 py-5 border-b shrink-0 space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <SectionLabel>Composition</SectionLabel>
                <p className="mt-1 text-xs text-primary font-medium">
                  {compositionTotal === 100 ? "100% · Complete" : `${compositionTotal}%`}
                </p>
              </div>
              <CompositionRing total={compositionTotal} />
            </div>
            <div className="space-y-4">
              {filled.map((entry, i) => (
                <CompositionRow key={i} entry={entry} />
              ))}
            </div>
          </div>
        )}

        {/* Eco-score */}
        {ecoResult && (
          <div className="px-6 py-5 border-b shrink-0 space-y-3">
            <SectionLabel>Eco-score</SectionLabel>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Score</span>
              <EcoScoreBadge score={ecoResult.score} grade={ecoResult.grade} />
            </div>
            <div className="flex items-center justify-between py-2">
              <div>
                <Label htmlFor="eco-public" className="text-sm font-medium cursor-pointer">
                  Make eco-score public
                </Label>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Once made public, this cannot be undone.
                </p>
              </div>
              <Switch
                id="eco-public"
                checked={ecoScorePublic}
                onCheckedChange={setEcoScorePublic}
              />
            </div>
          </div>
        )}

        {/* Spacer */}
        <div className="flex-1" />

        {/* Navigation */}
        <div className="px-6 py-4 border-t shrink-0 flex gap-2">
          <Button variant="outline" onClick={onBack} disabled={submitting} className="flex-1">
            Back
          </Button>
          <Button onClick={handleSubmit} disabled={submitting} className="flex-1">
            {submitting ? "Creating…" : "Create product"}
          </Button>
        </div>
      </div>

      {/* ── Right: image preview ── */}
      <ImagePreviewPanel draft={draft} />
    </div>
  );
}
