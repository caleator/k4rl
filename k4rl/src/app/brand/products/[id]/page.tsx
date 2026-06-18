"use client";

import { use, useState } from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft, QrCode, Eye, EyeOff, Send, Lock, Clock, XCircle, Pencil,
  Leaf, RotateCcw, Zap, FlaskConical, Shield, Scissors, Layers,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { StatusDot } from "@/components/shared/status-dot";
import { EcoScoreBadge } from "@/components/shared/eco-score-badge";
import { MonoId } from "@/components/shared/mono-id";
import { GenerateBatchDialog } from "@/components/brand/generate-batch-dialog";
import { GenerateDppDialog } from "@/components/brand/generate-dpp-dialog";
import { PRODUCTS, BATCHES, QR_ITEMS } from "@/lib/mock/products";
import type { Batch } from "@/lib/mock/products";
import { FRAUD_REPORTS } from "@/lib/mock/disputes";
import { FACTORIES } from "@/lib/mock/factories";
import { MATERIALS, MATERIAL_REQUESTS } from "@/lib/mock/materials";
import type { MaterialCategory } from "@/lib/mock/materials";
import type { CompositionEntry } from "@/lib/types/product";
import { useAuth } from "@/context/auth";
import { cn } from "@/lib/utils";

// ─── Category config (mirrors step-materials) ─────────────────────────────────

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

// ─── Material visual row ──────────────────────────────────────────────────────

function MaterialVisualRow({ materialId, materialName, percentage }: { materialId: string; materialName: string; percentage: number }) {
  const material = MATERIALS.find(m => m.id === materialId);
  const style = getCategoryStyle(material?.category ?? "");
  const Icon = style.icon;

  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-2.5">
        <span className={cn("flex h-6 w-6 shrink-0 items-center justify-center rounded-md", style.bg)}>
          <Icon className={cn("h-3.5 w-3.5", style.color)} />
        </span>
        <span className="flex-1 text-sm font-medium leading-tight truncate">{materialName}</span>
        <span className="text-sm font-bold tabular-nums shrink-0" style={{ fontFamily: "var(--font-mono)" }}>
          {percentage}%
        </span>
      </div>
      <div className="flex items-center gap-2 pl-8">
        <div className="flex-1 h-1 rounded-full bg-muted overflow-hidden">
          <div className="h-full rounded-full bg-primary/60 transition-all duration-500" style={{ width: `${percentage}%` }} />
        </div>
        <span className="text-[10px] text-muted-foreground uppercase tracking-wide shrink-0 leading-none">
          {style.label}
        </span>
      </div>
    </div>
  );
}

// ─── Draft composition row (handles pending / rejected status) ────────────────

function DraftCompositionRow({ entry }: { entry: CompositionEntry }) {
  if (entry.pendingRequestId) {
    const req = MATERIAL_REQUESTS.find(r => r.id === entry.pendingRequestId);
    const isRejected = req?.status === "rejected";
    const Icon = isRejected ? XCircle : Clock;
    const iconColor = isRejected ? "text-destructive" : "text-amber-500";
    const iconBg = isRejected ? "bg-destructive/10" : "bg-amber-500/10";
    const barColor = isRejected ? "bg-destructive/50" : "bg-amber-500/50";
    const badgeColor = isRejected
      ? "text-destructive bg-destructive/10"
      : "text-amber-600 dark:text-amber-400 bg-amber-500/10";
    const note = isRejected
      ? (req?.rejectionReason ? `Rejected: ${req.rejectionReason}` : "Rejected — must be replaced")
      : "Awaiting K4RL approval";

    return (
      <div className="space-y-1.5">
        <div className="flex items-center gap-2.5">
          <span className={cn("flex h-6 w-6 shrink-0 items-center justify-center rounded-md", iconBg)}>
            <Icon className={cn("h-3.5 w-3.5", iconColor)} />
          </span>
          <span className="flex-1 text-sm font-medium leading-tight truncate">{entry.materialName || "—"}</span>
          <span className={cn("text-[10px] font-medium px-1.5 py-0.5 rounded-full shrink-0", badgeColor)}>
            {isRejected ? "Rejected" : "Pending"}
          </span>
          <span className="text-sm font-bold tabular-nums shrink-0" style={{ fontFamily: "var(--font-mono)" }}>
            {entry.percentage}%
          </span>
        </div>
        <div className="flex items-center gap-2 pl-8">
          <div className="flex-1 h-1 rounded-full bg-muted overflow-hidden">
            <div className={cn("h-full rounded-full", barColor)} style={{ width: `${Math.min(entry.percentage, 100)}%` }} />
          </div>
          <span className={cn("text-[10px] shrink-0 leading-none", isRejected ? "text-destructive/80" : "text-amber-600 dark:text-amber-400")}>
            {note}
          </span>
        </div>
      </div>
    );
  }

  return <MaterialVisualRow materialId={entry.materialId} materialName={entry.materialName} percentage={entry.percentage} />;
}

// ─── Section label ────────────────────────────────────────────────────────────

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-muted-foreground">
      {children}
    </p>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { user, can } = useAuth();

  const effectiveBrandId = user.brandId ?? "brand-001";
  const product = PRODUCTS.find(p => p.id === id && p.brandId === effectiveBrandId);
  if (!product) notFound();

  const [batches, setBatches] = useState<Batch[]>(
    BATCHES.filter(b => b.productId === product.id)
  );
  const [dppDialogOpen, setDppDialogOpen] = useState(false);
  const [dppGeneratedAt, setDppGeneratedAt] = useState<string | undefined>(product.dppGeneratedAt);
  const [dppStatus, setDppStatus] = useState(product.dppStatus);
  const [batchDialogOpen, setBatchDialogOpen] = useState(false);
  const [dispatchingBatchId, setDispatchingBatchId] = useState<string | null>(null);
  const [dispatchFactoryId, setDispatchFactoryId] = useState<string | null>(null);
  const [dispatchFactoryOpen, setDispatchFactoryOpen] = useState(false);

  // ── Draft product view ──────────────────────────────────────────────────────
  if (product.dppStatus === "draft") {
    const draftComposition = product.composition ?? [];
    const pendingEntries = draftComposition
      .filter(c => c.pendingRequestId)
      .map(c => ({ entry: c, req: MATERIAL_REQUESTS.find(r => r.id === c.pendingRequestId) }));
    const hasPending = pendingEntries.some(p => !p.req || p.req.status === "pending");
    const hasRejected = pendingEntries.some(p => p.req?.status === "rejected");
    const compositionTotalDraft = draftComposition.reduce((s, c) => s + (c.percentage || 0), 0);
    const allImages = [...(product.gallery?.length ? product.gallery : product.thumbnail ? [product.thumbnail] : [])];

    return (
      <div className="space-y-0">
        <div className="rounded-xl border bg-card">
          {/* Back + status */}
          <div className="flex items-center justify-between px-6 pt-5 pb-4">
            <Link href="/brand/products"
              className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="h-3.5 w-3.5" />
              Products
            </Link>
            <StatusDot status="draft" />
          </div>

          {/* Product identity */}
          <div className="px-6 pb-5 border-b">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <SectionLabel>Product DNA · Draft</SectionLabel>
                <h1 className="mt-2 text-lg font-semibold leading-snug">{product.name || "Untitled product"}</h1>
                <div className="mt-1.5 flex flex-wrap items-center gap-2">
                  {product.sku && <MonoId value={product.sku} />}
                  {product.category && (
                    <span className="inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
                      {product.category}
                    </span>
                  )}
                </div>
                {(product.countryOfManufacture || product.weightGrams) && (
                  <div className="mt-1 flex flex-wrap gap-x-2 text-xs text-muted-foreground">
                    {product.countryOfManufacture && <span>Made in {product.countryOfManufacture}</span>}
                    {product.countryOfManufacture && product.weightGrams ? <span>·</span> : null}
                    {product.weightGrams ? <span>{product.weightGrams}g</span> : null}
                  </div>
                )}
              </div>
              {allImages.length > 0 && (
                <div className="flex gap-1.5 shrink-0">
                  {allImages.slice(0, 4).map((src, i) => (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img key={i} src={src} alt="" className="h-16 w-16 rounded-md object-cover bg-muted" />
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Blocking banner */}
          {(hasPending || hasRejected) && (
            <div className="px-6 py-4 border-b">
              <div className={cn(
                "rounded-md border px-3 py-3 flex items-start gap-2.5",
                hasRejected ? "border-destructive/30 bg-destructive/5" : "border-amber-500/30 bg-amber-500/5"
              )}>
                {hasRejected
                  ? <XCircle className="h-4 w-4 text-destructive mt-0.5 shrink-0" />
                  : <Clock className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
                }
                <div>
                  <p className={cn("text-sm font-medium", hasRejected ? "text-destructive" : "text-amber-700 dark:text-amber-300")}>
                    {hasRejected ? "DPP generation permanently blocked" : "DPP generation blocked — awaiting approval"}
                  </p>
                  <p className={cn("text-xs mt-0.5 leading-relaxed", hasRejected ? "text-destructive/80" : "text-amber-600 dark:text-amber-400")}>
                    {hasRejected
                      ? "One or more materials were rejected. Open the product editor and replace them with approved materials."
                      : "Some materials are pending K4RL review. The DPP will be unlocked once all materials are approved."
                    }
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Composition */}
          {draftComposition.length > 0 && (
            <div className="px-6 py-5 border-b space-y-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <SectionLabel>Composition</SectionLabel>
                  <p className="mt-1 text-xs text-muted-foreground font-medium">
                    {compositionTotalDraft === 100 ? "100% · Complete" : `${compositionTotalDraft}%`}
                  </p>
                </div>
                <CompositionRing total={compositionTotalDraft} />
              </div>
              <div className="space-y-4">
                {draftComposition.map((c, i) => (
                  <DraftCompositionRow key={i} entry={c} />
                ))}
              </div>
            </div>
          )}

          {/* Details */}
          <div className="px-6 py-5 border-b space-y-3">
            <SectionLabel>Details</SectionLabel>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Created</span>
              <span className="font-medium">
                {new Date(product.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="px-6 py-5 space-y-3">
            <Link
              href={`/brand/products/${product.id}/edit`}
              className={cn(
                "inline-flex items-center justify-center gap-2 h-9 px-4 rounded-md text-sm font-medium transition-colors",
                "bg-primary text-primary-foreground hover:bg-primary/90"
              )}
            >
              <Pencil className="h-3.5 w-3.5" />
              Continue editing
            </Link>
            {(hasPending || hasRejected) && (
              <div className="flex items-center gap-1.5">
                <Link href="/brand/materials"
                  className="text-sm text-muted-foreground hover:text-foreground underline underline-offset-2 transition-colors">
                  View material requests
                </Link>
                {hasPending && (
                  <span className="text-[10px] font-medium text-amber-600 dark:text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded-full">
                    {pendingEntries.filter(p => !p.req || p.req.status === "pending").length} pending
                  </span>
                )}
                {hasRejected && (
                  <span className="text-[10px] font-medium text-destructive bg-destructive/10 px-1.5 py-0.5 rounded-full">
                    {pendingEntries.filter(p => p.req?.status === "rejected").length} rejected
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  const brandFactories = FACTORIES.filter(f => f.brandId === product.brandId);
  const totalQr = batches.filter(b => b.status !== "cancelled").reduce((sum, b) => sum + b.quantity, 0);

  // Ownership stats
  const productItems = QR_ITEMS.filter(i => i.productId === product.id);
  const totalClaimed = productItems.filter(i => i.claimedAt).length;
  const totalFlagged = FRAUD_REPORTS.filter(r =>
    productItems.some(i => i.id === r.itemId)
  ).length;

  function handleBatchCreated(batch: Batch) {
    setBatches(prev => {
      const exists = prev.find(b => b.id === batch.id);
      if (exists) return prev.map(b => b.id === batch.id ? batch : b);
      return [...prev, batch];
    });
  }

  function openDispatch(batchId: string) {
    if (dispatchingBatchId === batchId) {
      setDispatchingBatchId(null);
      setDispatchFactoryId(null);
    } else {
      setDispatchingBatchId(batchId);
      setDispatchFactoryId(null);
    }
  }

  function handleDispatchBatch(batchId: string, factoryId: string) {
    setBatches(prev => prev.map(b =>
      b.id === batchId
        ? { ...b, status: "dispatched" as const, factoryLinkSentAt: new Date().toISOString() }
        : b
    ));
    setDispatchingBatchId(null);
    setDispatchFactoryId(null);
  }
  const compositionTotal = product.composition.reduce((s, c) => s + c.percentage, 0);

  const allImages = [
    ...(product.gallery?.length ? product.gallery : product.thumbnail ? [product.thumbnail] : []),
  ];

  return (
    <div className="space-y-0">
      <div className="rounded-xl border bg-card">

        {/* Back + status row */}
        <div className="flex items-center justify-between px-6 pt-5 pb-4">
          <Link
            href="/brand/products"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Products
          </Link>
          <StatusDot status={dppStatus} />
        </div>

        {/* Product identity + compact thumbnails */}
        <div className="px-6 pb-5 border-b">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <SectionLabel>Product DNA</SectionLabel>
              <h1 className="mt-2 text-lg font-semibold leading-snug">{product.name}</h1>
              <div className="mt-1.5 flex flex-wrap items-center gap-2">
                <MonoId value={product.sku} />
                <span className="inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
                  {product.category}
                </span>
              </div>
              <div className="mt-1 flex flex-wrap gap-x-2 text-xs text-muted-foreground">
                <span>Made in {product.countryOfManufacture}</span>
                <span>·</span>
                <span>{product.weightGrams}g</span>
              </div>
            </div>
            {allImages.length > 0 && (
              <div className="flex gap-1.5 shrink-0">
                {allImages.slice(0, 4).map((src, i) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    key={i}
                    src={src}
                    alt=""
                    className="h-16 w-16 rounded-md object-cover bg-muted"
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Composition visualization */}
        <div className="px-6 py-5 border-b space-y-4 shrink-0">
          <div className="flex items-start justify-between gap-3">
            <div>
              <SectionLabel>Composition</SectionLabel>
              <p className="mt-1 text-xs text-primary font-medium">
                {compositionTotal === 100 ? "100% complete" : `${compositionTotal}%`}
              </p>
            </div>
            <CompositionRing total={compositionTotal} />
          </div>

          {/* Visual rows */}
          <div className="space-y-4">
            {product.composition.map((c, i) => (
              <MaterialVisualRow
                key={i}
                materialId={c.materialId}
                materialName={c.materialName}
                percentage={c.percentage}
              />
            ))}
          </div>

        </div>

        {/* Eco-score */}
        <div className="px-6 py-5 border-b shrink-0 space-y-3">
          <SectionLabel>Eco-score</SectionLabel>
          {product.ecoScore !== undefined && product.ecoGrade ? (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Score</span>
                <EcoScoreBadge score={product.ecoScore} grade={product.ecoGrade} />
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Visibility</span>
                <span className="flex items-center gap-1.5">
                  {product.ecoScorePublic ? (
                    <><Eye className="h-3.5 w-3.5 text-emerald-500" />Public</>
                  ) : (
                    <><EyeOff className="h-3.5 w-3.5 text-muted-foreground" />Hidden</>
                  )}
                </span>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              {dppStatus === "draft"
                ? "Generate a DPP to calculate the eco-score."
                : "Score will appear after DPP generation."}
            </p>
          )}
        </div>

        {/* DPP */}
        <div className="px-6 py-5 border-b shrink-0 space-y-3">
          <SectionLabel>Digital product passport</SectionLabel>
          {dppStatus === "generated" ? (
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Lock className="h-3 w-3" />
                  <span>Immutable record · v1</span>
                </div>
                <StatusDot status="generated" />
              </div>
              {dppGeneratedAt && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Generated</span>
                  <span className="font-medium">
                    {new Date(dppGeneratedAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                  </span>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <StatusDot status="draft" />
              </div>
              <p className="text-sm text-muted-foreground">
                Generate a DPP to lock this product's composition and eco-score as an immutable record.
              </p>
              {can("generate:dpp") && (
                <Button size="sm" onClick={() => setDppDialogOpen(true)}>
                  Generate DPP
                </Button>
              )}
            </div>
          )}
        </div>

        {/* Details */}
        <div className="px-6 py-5 border-b shrink-0 space-y-3">
          <SectionLabel>Details</SectionLabel>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Created</span>
              <span className="font-medium">
                {new Date(product.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
              </span>
            </div>
          </div>
        </div>

        {/* Ownership stats */}
        {totalQr > 0 && (
          <div className="px-6 py-5 border-b shrink-0 space-y-3">
            <SectionLabel>Ownership</SectionLabel>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-lg border bg-muted/30 px-4 py-3 space-y-0.5">
                <p className="text-2xl font-bold tabular-nums text-foreground" style={{ fontFamily: "var(--font-mono)" }}>
                  {totalClaimed}
                </p>
                <p className="text-xs text-muted-foreground">Items claimed</p>
              </div>
              <div className={`rounded-lg border px-4 py-3 space-y-0.5 ${totalFlagged > 0 ? "border-destructive/30 bg-destructive/5" : "bg-muted/30"}`}>
                <p className={`text-2xl font-bold tabular-nums ${totalFlagged > 0 ? "text-destructive" : "text-foreground"}`} style={{ fontFamily: "var(--font-mono)" }}>
                  {totalFlagged}
                </p>
                <p className="text-xs text-muted-foreground">Fraud flags</p>
              </div>
            </div>
          </div>
        )}

        {/* QR Batches */}
        <div className="px-6 py-5 shrink-0 space-y-3">
          <div className="flex items-center justify-between">
            <SectionLabel>QR & claim code pairs</SectionLabel>
            <div className="flex items-center gap-3">
              {totalQr > 0 && (
                <span className="text-xs text-muted-foreground tabular-nums">{totalQr.toLocaleString()} items</span>
              )}
              {dppStatus === "generated" && can("generate:batch") && batches.length > 0 && (
                <Button size="sm" variant="outline" onClick={() => setBatchDialogOpen(true)}>
                  <QrCode className="h-3.5 w-3.5" />
                  New batch
                </Button>
              )}
            </div>
          </div>

          {dppStatus !== "generated" ? (
            <p className="text-sm text-muted-foreground">
              Generate a DPP first to enable pair generation.
            </p>
          ) : batches.length === 0 ? (
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">No batches generated yet.</p>
              {can("generate:batch") && (
                <Button size="sm" variant="outline" onClick={() => setBatchDialogOpen(true)}>
                  <QrCode className="h-4 w-4" />
                  Generate batch
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {batches.map(batch => (
                <div key={batch.id} className={cn(
                  "rounded-md border px-3 py-2.5 space-y-2",
                  batch.status === "cancelled" && "opacity-50"
                )}>
                  <div className="flex items-center justify-between gap-2">
                    <MonoId value={batch.id} />
                    <StatusDot status={batch.status} />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground tabular-nums">
                      {batch.quantity.toLocaleString()} items
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {new Date(batch.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                    </span>
                  </div>
                  {batch.status === "ready" && can("generate:batch") && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="w-full h-7 text-xs"
                      onClick={() => openDispatch(batch.id)}
                    >
                      <Send className="h-3 w-3" />
                      Send to factory
                    </Button>
                  )}
                  {dispatchingBatchId === batch.id && (
                    <div className="pt-1 space-y-2">
                      {brandFactories.length === 0 ? (
                        <p className="text-xs text-muted-foreground">
                          No factories added yet. Add a factory first from the Factories page.
                        </p>
                      ) : (
                        <>
                          <Popover open={dispatchFactoryOpen} onOpenChange={setDispatchFactoryOpen}>
                            <PopoverTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                className="w-full h-7 text-xs justify-between font-normal"
                              >
                                {dispatchFactoryId
                                  ? brandFactories.find(f => f.id === dispatchFactoryId)?.name
                                  : <span className="text-muted-foreground">Select factory…</span>
                                }
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-64 p-0" align="start">
                              <Command>
                                <CommandInput placeholder="Search factories…" />
                                <CommandList>
                                  <CommandEmpty>No factories found.</CommandEmpty>
                                  <CommandGroup>
                                    {brandFactories.map(f => (
                                      <CommandItem
                                        key={f.id}
                                        value={`${f.name} ${f.country}`}
                                        onSelect={() => {
                                          setDispatchFactoryId(f.id);
                                          setDispatchFactoryOpen(false);
                                        }}
                                      >
                                        <span className={cn(
                                          "mr-2 h-3 w-3 rounded-full border shrink-0",
                                          dispatchFactoryId === f.id ? "bg-primary border-primary" : "border-muted-foreground"
                                        )} />
                                        <span className="flex-1 text-xs">{f.name}</span>
                                        <span className="text-xs text-muted-foreground">{f.country}</span>
                                      </CommandItem>
                                    ))}
                                  </CommandGroup>
                                </CommandList>
                              </Command>
                            </PopoverContent>
                          </Popover>
                          {dispatchFactoryId && (
                            <p className="text-xs text-muted-foreground">
                              Link will be sent to{" "}
                              <span className="font-medium text-foreground">
                                {brandFactories.find(f => f.id === dispatchFactoryId)?.email}
                              </span>
                            </p>
                          )}
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              className="flex-1 h-7 text-xs"
                              disabled={!dispatchFactoryId}
                              onClick={() => handleDispatchBatch(batch.id, dispatchFactoryId!)}
                            >
                              Confirm dispatch
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-7 text-xs"
                              onClick={() => { setDispatchingBatchId(null); setDispatchFactoryId(null); }}
                            >
                              Cancel
                            </Button>
                          </div>
                        </>
                      )}
                    </div>
                  )}
                  {batch.status === "dispatched" && batch.factoryLinkSentAt && (
                    <p className="text-xs text-muted-foreground">
                      Link sent {new Date(batch.factoryLinkSentAt).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <GenerateDppDialog
        open={dppDialogOpen}
        onOpenChange={setDppDialogOpen}
        product={{ ...product, dppStatus, dppGeneratedAt }}
        onGenerated={(generatedAt) => {
          setDppStatus("generated");
          setDppGeneratedAt(generatedAt);
        }}
      />

      <GenerateBatchDialog
        open={batchDialogOpen}
        onOpenChange={setBatchDialogOpen}
        productId={product.id}
        brandId={product.brandId}
        onCreated={handleBatchCreated}
      />
    </div>
  );
}
