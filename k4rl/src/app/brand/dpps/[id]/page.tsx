"use client";

import { use } from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft, Lock, QrCode,
  Leaf, RotateCcw, Zap, FlaskConical, Shield, Scissors, Layers,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatusDot } from "@/components/shared/status-dot";
import { EcoScoreBadge } from "@/components/shared/eco-score-badge";
import { MonoId } from "@/components/shared/mono-id";
import { PRODUCTS, BATCHES } from "@/lib/mock/products";
import { MATERIALS } from "@/lib/mock/materials";
import type { MaterialCategory } from "@/lib/mock/materials";
import { useAuth } from "@/context/auth";
import { cn } from "@/lib/utils";

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

function getCategoryStyle(category: string): CategoryStyle {
  return CATEGORY_CONFIG[category as MaterialCategory] ?? {
    icon: Layers, color: "text-muted-foreground", bg: "bg-muted", label: category,
  };
}

export default function DppDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { user } = useAuth();

  const product = PRODUCTS.find(p => p.id === id && p.brandId === user.brandId);
  if (!product || product.dppStatus !== "generated") notFound();

  const batches = BATCHES.filter(b => b.productId === product.id);
  const totalQr = batches.filter(b => b.status !== "cancelled").reduce((sum, b) => sum + b.quantity, 0);

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-12">

      {/* Back */}
      <div className="flex items-center justify-between pt-2">
        <Link
          href="/brand/dpps"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          DPPs
        </Link>
        <Link
          href={`/brand/products/${product.id}`}
          className="text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          View product
        </Link>
      </div>

      {/* Document header */}
      <div className="rounded-xl border bg-card overflow-hidden">
        <div className="bg-muted/40 border-b px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Lock className="h-3 w-3" />
            <span>Immutable record</span>
            <span>·</span>
            <span className="font-mono">v1</span>
          </div>
          <StatusDot status="generated" />
        </div>

        <div className="px-6 py-6 space-y-1">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Digital product passport
          </p>
          <h1 className="text-2xl font-semibold">{product.name}</h1>
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <MonoId value={product.sku} />
            <span className="inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
              {product.category}
            </span>
          </div>
          <div className="flex flex-wrap gap-x-3 text-sm text-muted-foreground pt-0.5">
            <span>Made in {product.countryOfManufacture}</span>
            <span>{product.weightGrams}g</span>
            {product.dppGeneratedAt && (
              <span>
                Generated {new Date(product.dppGeneratedAt).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Composition */}
      <div className="rounded-xl border bg-card overflow-hidden">
        <div className="px-6 py-4 border-b">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Composition</p>
          <p className="text-xs text-primary font-medium mt-0.5">100% declared</p>
        </div>
        <div className="px-6 py-5 space-y-5">
          {product.composition.map((c, i) => {
            const material = MATERIALS.find(m => m.id === c.materialId);
            const style = getCategoryStyle(material?.category ?? "");
            const Icon = style.icon;
            return (
              <div key={i} className="space-y-2">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <span className={cn("inline-flex items-center justify-center h-6 w-6 rounded shrink-0", style.bg)}>
                      <Icon className={cn("h-3.5 w-3.5", style.color)} />
                    </span>
                    <span className="text-sm font-medium">{c.materialName}</span>
                  </div>
                  <span className="text-sm font-semibold tabular-nums">{c.percentage}%</span>
                </div>
                <div className="ml-[34px] space-y-1">
                  <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                    <div className="h-full rounded-full bg-primary/60" style={{ width: `${c.percentage}%` }} />
                  </div>
                  <p className={cn("text-[10px] font-medium uppercase tracking-wide", style.color)}>{style.label}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Eco-score */}
      {product.ecoScore !== undefined && product.ecoGrade && (
        <div className="rounded-xl border bg-card overflow-hidden">
          <div className="px-6 py-4 border-b">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Eco-score</p>
          </div>
          <div className="px-6 py-5 flex items-center justify-between">
            <div className="space-y-1">
              <EcoScoreBadge score={product.ecoScore} grade={product.ecoGrade} />
              <p className="text-xs text-muted-foreground">
                {product.ecoScorePublic ? "Visible on public DPP page" : "Hidden from public DPP page"}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* QR batches */}
      <div className="rounded-xl border bg-card overflow-hidden">
        <div className="px-6 py-4 border-b flex items-center justify-between">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">QR & claim code pairs</p>
          {totalQr > 0 && (
            <span className="text-xs text-muted-foreground tabular-nums">{totalQr.toLocaleString()} items total</span>
          )}
        </div>
        <div className="px-6 py-5 space-y-4">
          {batches.length === 0 ? (
            <p className="text-sm text-muted-foreground">No batches generated yet.</p>
          ) : (
            <div className="space-y-3">
              {batches.map(batch => (
                <div key={batch.id} className={cn(
                  "flex items-center justify-between text-sm",
                  batch.status === "cancelled" && "opacity-40"
                )}>
                  <div className="flex items-center gap-2.5">
                    <MonoId value={batch.id} />
                    <StatusDot status={batch.status} />
                  </div>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="tabular-nums">{batch.quantity.toLocaleString()} items</span>
                    <span>{new Date(batch.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
          <Button size="sm" variant="outline" asChild className="w-full">
            <Link href={`/brand/products/${product.id}`}>
              <QrCode className="h-3.5 w-3.5" />
              Manage batches
            </Link>
          </Button>
        </div>
      </div>

    </div>
  );
}
