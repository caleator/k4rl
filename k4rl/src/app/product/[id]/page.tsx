"use client";

import { use, useState } from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  Leaf, RotateCcw, Zap, FlaskConical, Shield, Scissors, Layers,
  CheckCircle2, Clock, Lock, ArrowRight, ShieldCheck, X, type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { EcoScoreBadge } from "@/components/shared/eco-score-badge";
import { MonoId } from "@/components/shared/mono-id";
import { QR_ITEMS, PRODUCTS, BATCHES } from "@/lib/mock/products";
import { BRANDS } from "@/lib/mock/brands";
import { FACTORY_LINKS, FACTORIES } from "@/lib/mock/factories";
import { MATERIALS } from "@/lib/mock/materials";
import type { MaterialCategory } from "@/lib/mock/materials";
import { FRAUD_REPORTS } from "@/lib/mock/disputes";
import { cn } from "@/lib/utils";

// ─── Category config (shared pattern with brand portal) ───────────────────────

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
  return CATEGORY_CONFIG[category as MaterialCategory] ?? { icon: Layers, color: "text-muted-foreground", bg: "bg-muted", label: category };
}

// ─── Claim window helper ───────────────────────────────────────────────────────

function getClaimWindow(unlockedAt: string): { hoursLeft: number; expired: boolean } {
  const expiresAt = new Date(unlockedAt).getTime() + 72 * 60 * 60 * 1000;
  const now = Date.now();
  const hoursLeft = Math.max(0, Math.floor((expiresAt - now) / (60 * 60 * 1000)));
  return { hoursLeft, expired: now > expiresAt };
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function PublicDppPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const qrCode = decodeURIComponent(id);

  // Read live from mock arrays (picks up session mutations from claim flow)
  const item = QR_ITEMS.find((i) => i.qrCode === qrCode);
  if (!item) notFound();

  const product = PRODUCTS.find((p) => p.id === item.productId);
  if (!product || product.dppStatus !== "generated") notFound();

  const brand = BRANDS.find((b) => b.id === product.brandId);
  const batch = BATCHES.find((b) => b.id === item.batchId);
  const factoryLink = batch ? FACTORY_LINKS.find((l) => l.batchId === batch.id) : null;
  const factory = factoryLink ? FACTORIES.find((f) => f.id === factoryLink.factoryId) : null;

  const claimWindow = item.state === "unlocked" && item.unlockedAt
    ? getClaimWindow(item.unlockedAt)
    : null;

  return (
    <main className="mx-auto max-w-lg px-4 py-8 space-y-6 pb-16">

      {/* ── Product image ── */}
      {product.thumbnail && (
        <section className="rounded-xl overflow-hidden border bg-muted aspect-square max-h-64">
          <img
            src={product.thumbnail}
            alt={product.name}
            className="w-full h-full object-cover"
          />
        </section>
      )}

      {/* ── Identity ── */}
      <section>
        <p className="text-xs font-medium text-muted-foreground mb-1">{brand?.name}</p>
        <h1 className="text-2xl font-semibold text-foreground leading-snug">{product.name}</h1>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <MonoId value={product.sku} />
          <span className="inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
            {product.category}
          </span>
          <span className="inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
            Made in {product.countryOfManufacture}
          </span>
        </div>
      </section>

      {/* ── Composition ── */}
      <section className="rounded-xl border bg-card overflow-hidden">
        <div className="px-5 py-4 border-b">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Material composition</p>
          <p className="text-xs text-primary font-medium mt-0.5">100% declared</p>
        </div>
        <div className="px-5 py-4 space-y-4">
          {product.composition.map((c, i) => {
            const mat = MATERIALS.find((m) => m.id === c.materialId);
            const style = getCategoryStyle(mat?.category ?? "");
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
                  <span className="text-sm font-semibold tabular-nums shrink-0" style={{ fontFamily: "var(--font-mono)" }}>
                    {c.percentage}%
                  </span>
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
      </section>

      {/* ── Eco-score ── */}
      {product.ecoScore !== undefined && product.ecoGrade && product.ecoScorePublic && (
        <section className="rounded-xl border bg-card overflow-hidden">
          <div className="px-5 py-4 border-b">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Eco-score</p>
          </div>
          <div className="px-5 py-4 flex items-center justify-between">
            <div className="space-y-1">
              <EcoScoreBadge score={product.ecoScore} grade={product.ecoGrade} />
              <p className="text-xs text-muted-foreground">Environmental impact rating</p>
            </div>
            <div className="text-right space-y-0.5">
              <p className="text-2xl font-bold text-foreground">{product.ecoScore}</p>
              <p className="text-xs text-muted-foreground">out of 100</p>
            </div>
          </div>
        </section>
      )}

      {/* ── Provenance ── */}
      {factory && (
        <section className="rounded-xl border bg-card overflow-hidden">
          <div className="px-5 py-4 border-b">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Manufacturing</p>
          </div>
          <div className="px-5 py-4 space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-foreground">{factory.name}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{factory.country} · {factory.type}</p>
              </div>
              <ShieldCheck className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
            </div>
            {factory.certificates.length > 0 && (
              <div className="space-y-1.5 pt-1 border-t">
                <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide pt-2">Certifications</p>
                {factory.certificates.map((cert) => (
                  <div key={cert.id} className="flex items-center justify-between text-sm">
                    <span className="text-foreground">{cert.type}</span>
                    <span className="text-xs text-muted-foreground">
                      {new Date(cert.uploadedAt).toLocaleDateString("en-GB", { month: "short", year: "numeric" })}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {/* ── DPP authenticity ── */}
      <section className="rounded-xl border bg-card overflow-hidden">
        <div className="px-5 py-4 border-b">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Digital product passport</p>
        </div>
        <div className="px-5 py-4 space-y-2 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">DPP status</span>
            <span className="font-medium text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5" />
              EU-compliant
            </span>
          </div>
          {product.dppGeneratedAt && (
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Issued</span>
              <span className="font-medium">
                {new Date(product.dppGeneratedAt).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}
              </span>
            </div>
          )}
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Item code</span>
            <MonoId value={item.qrCode} />
          </div>
        </div>
      </section>

      {/* ── Item ownership state ── */}
      <ItemStateSection item={item} claimWindow={claimWindow} />

    </main>
  );
}

// ─── Item state section (reads live state on each render) ─────────────────────

type Mode = "idle" | "transfer-form" | "transfer-sent" | "fraud-form" | "fraud-sent";

function ItemStateSection({
  item,
  claimWindow,
}: {
  item: ReturnType<typeof QR_ITEMS.find> & {};
  claimWindow: { hoursLeft: number; expired: boolean } | null;
}) {
  const [mode, setMode] = useState<Mode>("idle");
  const [transferEmail, setTransferEmail] = useState("");
  const [fraudEmail, setFraudEmail] = useState("");
  const [fraudDesc, setFraudDesc] = useState("");
  const [fraudConfirmed, setFraudConfirmed] = useState(false);

  const state = item!.state;

  function submitTransfer(e: React.FormEvent) {
    e.preventDefault();
    const email = transferEmail.trim().toLowerCase();
    if (!email) return;
    item!.state = "transfer-requested";
    item!.transferRequesterEmail = email;
    item!.transferRequestedAt = new Date().toISOString();
    setMode("transfer-sent");
  }

  function submitFraud(e: React.FormEvent) {
    e.preventDefault();
    if (!fraudDesc.trim() || !fraudConfirmed || !fraudEmail.trim()) return;
    FRAUD_REPORTS.push({
      id: `dispute-${Date.now()}`,
      itemId: item!.id,
      reporterEmail: fraudEmail.trim().toLowerCase(),
      description: fraudDesc.trim(),
      submittedAt: new Date().toISOString(),
      status: "open",
    });
    setMode("fraud-sent");
  }

  // ── Locked ──────────────────────────────────────────────────────────────────
  if (state === "locked") {
    return (
      <section className="rounded-xl border bg-muted/30 px-5 py-5 flex items-start gap-3">
        <Lock className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-medium text-foreground">Not yet available</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            This item hasn't been released to market yet.
          </p>
        </div>
      </section>
    );
  }

  // ── Transfer in progress ─────────────────────────────────────────────────────
  if (state === "transfer-requested") {
    return (
      <section className="rounded-xl border bg-blue-500/5 border-blue-200 dark:border-blue-900 px-5 py-5 flex items-start gap-3">
        <Clock className="h-4 w-4 text-blue-500 shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-medium text-foreground">Ownership transfer in progress</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            The current owner is reviewing a transfer request. Check back soon.
          </p>
        </div>
      </section>
    );
  }

  // ── Claimed ──────────────────────────────────────────────────────────────────
  if (state === "claimed") {
    // Confirmations
    if (mode === "transfer-sent") {
      return (
        <section className="rounded-xl border bg-blue-500/5 border-blue-200 dark:border-blue-900 px-5 py-5 flex items-start gap-3">
          <Clock className="h-4 w-4 text-blue-500 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-foreground">Request sent</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Your claim request has been sent. You will be notified when the owner responds.
            </p>
          </div>
        </section>
      );
    }

    if (mode === "fraud-sent") {
      return (
        <section className="rounded-xl border border-dashed px-5 py-5 flex items-start gap-3">
          <CheckCircle2 className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-foreground">Report submitted</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Your report has been submitted. The brand will be in touch directly.
            </p>
          </div>
        </section>
      );
    }

    // Transfer request form
    if (mode === "transfer-form") {
      return (
        <section className="rounded-xl border bg-card px-5 py-5 space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-foreground">Request ownership</p>
            <button
              onClick={() => setMode("idle")}
              aria-label="Cancel"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <p className="text-xs text-muted-foreground">
            Enter your email address. The current owner will receive your request and can approve or decline.
          </p>
          <form onSubmit={submitTransfer} className="space-y-3">
            <input
              type="email"
              value={transferEmail}
              onChange={(e) => setTransferEmail(e.target.value)}
              placeholder="your@email.com"
              required
              className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
            <Button type="submit" className="w-full" size="lg">
              Send request
            </Button>
          </form>
        </section>
      );
    }

    // Fraud report form
    if (mode === "fraud-form") {
      return (
        <section className="rounded-xl border border-destructive/20 bg-destructive/5 px-5 py-5 space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-foreground">Report an issue</p>
            <button
              onClick={() => setMode("idle")}
              aria-label="Cancel"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <p className="text-xs text-muted-foreground">
            If you believe this item was transferred without your authorisation, describe what happened. The brand will review your report.
          </p>
          <form onSubmit={submitFraud} className="space-y-3">
            <input
              type="email"
              value={fraudEmail}
              onChange={(e) => setFraudEmail(e.target.value)}
              placeholder="your@email.com"
              required
              className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
            <textarea
              value={fraudDesc}
              onChange={(e) => setFraudDesc(e.target.value)}
              placeholder="Describe what happened…"
              rows={3}
              required
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
            />
            <label className="flex items-start gap-2 text-xs text-muted-foreground cursor-pointer select-none">
              <input
                type="checkbox"
                checked={fraudConfirmed}
                onChange={(e) => setFraudConfirmed(e.target.checked)}
                className="mt-0.5 shrink-0"
              />
              I confirm I previously owned this item and did not authorise this transfer.
            </label>
            <Button
              type="submit"
              variant="destructive"
              className="w-full"
              size="lg"
              disabled={!fraudDesc.trim() || !fraudConfirmed || !fraudEmail.trim()}
            >
              Submit report
            </Button>
          </form>
        </section>
      );
    }

    // Idle — owned state with options
    return (
      <section className="space-y-2">
        <div className="rounded-xl border bg-muted/30 px-5 py-5 flex items-start gap-3">
          <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-foreground">This item is owned</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Ownership has been registered on the K4RL network.
            </p>
          </div>
        </div>
        <button
          onClick={() => setMode("transfer-form")}
          className="w-full text-left rounded-xl border border-dashed px-5 py-4 hover:bg-muted/30 hover:border-foreground/20 transition-colors"
        >
          <p className="text-sm font-medium text-foreground">Think this is yours?</p>
          <p className="text-xs text-muted-foreground mt-0.5">Request an ownership transfer →</p>
        </button>
        <button
          onClick={() => setMode("fraud-form")}
          className="w-full text-center py-2 text-xs text-muted-foreground hover:text-destructive transition-colors"
        >
          Report an issue with this item
        </button>
      </section>
    );
  }

  // ── Unlocked or re-locked — activation CTA ───────────────────────────────────
  const expired = claimWindow?.expired ?? false;
  const hoursLeft = claimWindow?.hoursLeft ?? 72;

  return (
    <section className="rounded-xl border bg-card px-5 py-5 space-y-4">
      <div>
        <p className="text-base font-semibold text-foreground">Activate your product</p>
        <p className="text-sm text-muted-foreground mt-1">
          Register ownership to protect your purchase and build a verified ownership history.
        </p>
      </div>

      {claimWindow && !expired && (
        <div className="flex items-center gap-1.5 text-xs text-amber-600 dark:text-amber-400">
          <Clock className="h-3.5 w-3.5 shrink-0" />
          <span>Claim window closes in {hoursLeft}h</span>
        </div>
      )}

      {expired && (
        <p className="text-xs text-muted-foreground">
          The original claim window has closed. Scan the QR code again to open a new window.
        </p>
      )}

      <Button asChild className="w-full" size="lg">
        <Link href={`/consumer/claim/${encodeURIComponent(item!.qrCode)}`}>
          Activate your product
          <ArrowRight className="ml-2 h-4 w-4" />
        </Link>
      </Button>

      <p className="text-xs text-center text-muted-foreground">
        You'll need the claim code printed on your label.
      </p>
    </section>
  );
}
