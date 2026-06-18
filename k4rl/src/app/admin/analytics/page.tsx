"use client";

import { BarChart3, Building2, Package, QrCode, CheckCircle2, Users, ShieldAlert } from "lucide-react";
import { BRANDS } from "@/lib/mock/brands";
import { PRODUCTS, QR_ITEMS } from "@/lib/mock/products";
import { FRAUD_REPORTS } from "@/lib/mock/disputes";
import { OWNERSHIP_EVENTS } from "@/lib/mock/ownership";

// ─── Metric card ─────────────────────────────────────────────────────────────

function Metric({ icon: Icon, label, value, sub }: {
  icon: React.ElementType;
  label: string;
  value: number | string;
  sub?: string;
}) {
  return (
    <div className="rounded-xl border bg-card px-5 py-4 space-y-3">
      <div className="flex items-center gap-2 text-muted-foreground">
        <Icon className="h-4 w-4" />
        <span className="text-xs font-medium uppercase tracking-wide">{label}</span>
      </div>
      <div>
        <p className="text-2xl font-semibold text-foreground tabular-nums">{value}</p>
        {sub && <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

// ─── Per-brand activity bar ───────────────────────────────────────────────────

function BrandActivityBar({ brand }: { brand: (typeof BRANDS)[number] }) {
  const brandProducts = PRODUCTS.filter((p) => p.brandId === brand.id);
  const brandItems = QR_ITEMS.filter((i) => brandProducts.some((p) => p.id === i.productId));
  const claimed = brandItems.filter((i) => i.claimedAt).length;
  const dpps = brandProducts.filter((p) => p.dppStatus === "generated").length;
  const claimRate = brandItems.length > 0 ? Math.round((claimed / brandItems.length) * 100) : 0;

  return (
    <div className="flex items-center gap-4 py-3 border-b last:border-b-0">
      <div className="flex-[2] min-w-0">
        <p className="text-sm font-medium text-foreground truncate">{brand.name}</p>
        <p className="text-xs text-muted-foreground">{brand.country}</p>
      </div>
      <div className="flex-1 text-center hidden sm:block">
        <p className="text-sm font-medium tabular-nums">{dpps}</p>
        <p className="text-[10px] text-muted-foreground uppercase tracking-wide">DPPs</p>
      </div>
      <div className="flex-1 text-center">
        <p className="text-sm font-medium tabular-nums">{brandItems.length}</p>
        <p className="text-[10px] text-muted-foreground uppercase tracking-wide">QR items</p>
      </div>
      <div className="flex-1 text-center">
        <p className="text-sm font-medium tabular-nums">{claimed}</p>
        <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Claimed</p>
      </div>
      <div className="flex-1 hidden md:block">
        <div className="flex items-center gap-2">
          <div className="h-1.5 flex-1 rounded-full bg-muted overflow-hidden">
            <div
              className="h-full rounded-full bg-primary/60"
              style={{ width: `${claimRate}%` }}
            />
          </div>
          <span className="text-xs text-muted-foreground tabular-nums w-8 text-right">{claimRate}%</span>
        </div>
        <p className="text-[10px] text-muted-foreground uppercase tracking-wide mt-0.5">Claim rate</p>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AnalyticsPage() {
  const totalBrands = BRANDS.length;
  const activeBrands = BRANDS.filter((b) => b.subscriptionStatus === "active" || b.subscriptionStatus === "trialling").length;
  const totalProducts = PRODUCTS.length;
  const totalDpps = PRODUCTS.filter((p) => p.dppStatus === "generated").length;
  const totalQr = QR_ITEMS.length;
  const totalClaimed = QR_ITEMS.filter((i) => i.claimedAt).length;
  const totalTransfers = OWNERSHIP_EVENTS.filter((e) => e.type === "transfer-approved").length;
  const totalDisputes = FRAUD_REPORTS.length;

  const claimRate = totalQr > 0 ? Math.round((totalClaimed / totalQr) * 100) : 0;

  return (
    <div className="max-w-5xl space-y-8">
      <div>
        <h1 className="text-xl font-semibold text-foreground">Analytics</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Platform-level metrics across all brands.
        </p>
      </div>

      {/* KPIs */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Metric icon={Building2} label="Active brands"    value={activeBrands}  sub={`${totalBrands} total registered`} />
        <Metric icon={Package}   label="DPPs generated"  value={totalDpps}     sub={`${totalProducts} products total`} />
        <Metric icon={QrCode}    label="QR codes issued" value={totalQr}        sub={`${claimRate}% overall claim rate`} />
        <Metric icon={CheckCircle2} label="Items claimed" value={totalClaimed}  sub={`${totalTransfers} transfer${totalTransfers !== 1 ? "s" : ""} completed`} />
      </div>

      {/* Secondary metrics */}
      <div className="grid gap-4 sm:grid-cols-2">
        <Metric
          icon={Users}
          label="Total team members"
          value={BRANDS.reduce((sum, b) => sum + b.members.length, 0)}
          sub="Across all brand accounts"
        />
        <Metric
          icon={ShieldAlert}
          label="Fraud reports"
          value={totalDisputes}
          sub={`${FRAUD_REPORTS.filter((r) => r.status === "open").length} open`}
        />
      </div>

      {/* Per-brand breakdown */}
      <div className="space-y-3">
        <h2 className="text-sm font-semibold text-foreground">Activity by brand</h2>
        <div className="rounded-xl border bg-card overflow-hidden">
          {/* Header */}
          <div className="px-5 py-2.5 border-b bg-muted/40 flex items-center gap-4">
            <span className="flex-[2] text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Brand</span>
            <span className="flex-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground text-center hidden sm:block">DPPs</span>
            <span className="flex-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground text-center">QR items</span>
            <span className="flex-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground text-center">Claimed</span>
            <span className="flex-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground hidden md:block">Claim rate</span>
          </div>
          <div className="px-5">
            {BRANDS.map((brand) => (
              <BrandActivityBar key={brand.id} brand={brand} />
            ))}
          </div>
        </div>
      </div>

      {/* Subscription mix */}
      <div className="space-y-3">
        <h2 className="text-sm font-semibold text-foreground">Subscription mix</h2>
        <div className="grid gap-3 sm:grid-cols-3">
          {(["Starter", "Growth", "Enterprise"] as const).map((tier) => {
            const count = BRANDS.filter((b) => b.subscriptionTier === tier).length;
            return (
              <div key={tier} className="rounded-xl border bg-card px-5 py-4 flex items-center justify-between">
                <span className="text-sm font-medium text-foreground">{tier}</span>
                <span className="text-2xl font-semibold tabular-nums">{count}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
