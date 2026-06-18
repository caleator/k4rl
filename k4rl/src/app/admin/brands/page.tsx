"use client";

import { useState, useMemo } from "react";
import { ChevronDown, ChevronUp, Building2 } from "lucide-react";
import { MonoId } from "@/components/shared/mono-id";
import { BRANDS, type SubscriptionStatus, type SubscriptionTier } from "@/lib/mock/brands";
import { PRODUCTS, QR_ITEMS } from "@/lib/mock/products";

// ─── Badges ───────────────────────────────────────────────────────────────────

const STATUS_CFG: Record<SubscriptionStatus, { label: string; className: string }> = {
  active:      { label: "Active",     className: "text-emerald-600 dark:text-emerald-400 bg-emerald-500/10" },
  trialling:   { label: "Trialling",  className: "text-sky-600 dark:text-sky-400 bg-sky-500/10" },
  "past-due":  { label: "Past due",   className: "text-destructive bg-destructive/10" },
  cancelled:   { label: "Cancelled",  className: "text-muted-foreground bg-muted" },
};

const TIER_CFG: Record<SubscriptionTier, { label: string; className: string }> = {
  Starter:    { label: "Starter",    className: "text-muted-foreground bg-muted" },
  Growth:     { label: "Growth",     className: "text-violet-700 dark:text-violet-400 bg-violet-500/10" },
  Enterprise: { label: "Enterprise", className: "text-amber-700 dark:text-amber-400 bg-amber-500/10" },
};

function StatusBadge({ status }: { status: SubscriptionStatus }) {
  const cfg = STATUS_CFG[status];
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${cfg.className}`}>
      {cfg.label}
    </span>
  );
}

function TierBadge({ tier }: { tier: SubscriptionTier }) {
  const cfg = TIER_CFG[tier];
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${cfg.className}`}>
      {cfg.label}
    </span>
  );
}

// ─── Expanded detail ──────────────────────────────────────────────────────────

function BrandDetail({ brand }: { brand: (typeof BRANDS)[number] }) {
  const brandProducts = PRODUCTS.filter((p) => p.brandId === brand.id);
  const brandItems = QR_ITEMS.filter((i) =>
    brandProducts.some((p) => p.id === i.productId)
  );
  const claimedItems = brandItems.filter((i) => i.claimedAt).length;

  return (
    <div className="px-5 pb-5 pt-3 bg-muted/20 border-t space-y-4">
      <div className="grid gap-x-8 gap-y-3 sm:grid-cols-2 lg:grid-cols-4 text-sm">
        <div className="space-y-0.5">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Contact</p>
          <p className="font-medium">{brand.email}</p>
        </div>
        <div className="space-y-0.5">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Country</p>
          <p className="font-medium">{brand.country}</p>
        </div>
        <div className="space-y-0.5">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">DPPs this month</p>
          <p className="font-medium">
            {brand.dppUsedThisMonth.toLocaleString()}
            {brand.dppLimitThisMonth < 99999 && (
              <span className="text-muted-foreground"> / {brand.dppLimitThisMonth.toLocaleString()}</span>
            )}
          </p>
        </div>
        <div className="space-y-0.5">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">QR items issued</p>
          <p className="font-medium">{brandItems.length} · {claimedItems} claimed</p>
        </div>
      </div>

      {/* Members */}
      {brand.members.length > 0 && (
        <div className="space-y-2">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Team members</p>
          <div className="flex flex-col gap-1.5">
            {brand.members.map((m) => (
              <div key={m.id} className="flex items-center gap-3 text-sm">
                <span className="font-medium">{m.name}</span>
                <span className="text-muted-foreground">{m.email}</span>
                <span className="text-[10px] text-muted-foreground uppercase tracking-wide">{m.role}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {brand.trialEndsAt && (
        <p className="text-xs text-muted-foreground">
          Trial ends {new Date(brand.trialEndsAt).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}
        </p>
      )}
    </div>
  );
}

// ─── Row ─────────────────────────────────────────────────────────────────────

function BrandRow({ brand }: { brand: (typeof BRANDS)[number] }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="border-b last:border-b-0">
      <button
        onClick={() => setExpanded((v) => !v)}
        className="w-full text-left px-5 py-3.5 hover:bg-muted/30 transition-colors flex items-center gap-4 group"
      >
        <span className="flex-[3] min-w-0 text-sm font-medium text-foreground truncate">{brand.name}</span>
        <span className="flex-1 text-xs text-muted-foreground hidden sm:block">{brand.country}</span>
        <span className="flex-none hidden md:block"><TierBadge tier={brand.subscriptionTier} /></span>
        <span className="flex-none"><StatusBadge status={brand.subscriptionStatus} /></span>
        <span className="flex-1 text-xs text-muted-foreground hidden lg:block tabular-nums">
          {brand.members.length} member{brand.members.length !== 1 ? "s" : ""}
        </span>
        <span className="flex-1 text-xs text-muted-foreground hidden lg:block">
          {new Date(brand.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
        </span>
        <span className="flex-none text-muted-foreground group-hover:text-foreground transition-colors ml-1">
          {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </span>
      </button>

      {expanded && <BrandDetail brand={brand} />}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

const STATUSES: SubscriptionStatus[] = ["active", "trialling", "past-due", "cancelled"];
const TIERS: SubscriptionTier[] = ["Starter", "Growth", "Enterprise"];

export default function BrandsPage() {
  const [statusFilter, setStatusFilter] = useState<"all" | SubscriptionStatus>("all");
  const [tierFilter, setTierFilter] = useState<"all" | SubscriptionTier>("all");

  const filtered = useMemo(() => {
    return BRANDS.filter((b) => {
      const matchStatus = statusFilter === "all" || b.subscriptionStatus === statusFilter;
      const matchTier = tierFilter === "all" || b.subscriptionTier === tierFilter;
      return matchStatus && matchTier;
    });
  }, [statusFilter, tierFilter]);

  return (
    <div className="max-w-5xl space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-foreground">Brands</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          {BRANDS.length} brand{BRANDS.length !== 1 ? "s" : ""} registered on the platform.
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
          className="h-8 rounded-md border border-input bg-background px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        >
          <option value="all">All statuses</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>{STATUS_CFG[s].label}</option>
          ))}
        </select>

        <select
          value={tierFilter}
          onChange={(e) => setTierFilter(e.target.value as typeof tierFilter)}
          className="h-8 rounded-md border border-input bg-background px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        >
          <option value="all">All tiers</option>
          {TIERS.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <div className="rounded-xl border border-dashed px-6 py-16 text-center space-y-3">
          <Building2 className="h-8 w-8 text-muted-foreground mx-auto" />
          <div>
            <p className="font-medium text-foreground">No brands match these filters</p>
            <p className="text-sm text-muted-foreground mt-1">Try adjusting the status or tier filter.</p>
          </div>
        </div>
      ) : (
        <div className="rounded-xl border bg-card overflow-hidden">
          {/* Column headers */}
          <div className="px-5 py-2.5 border-b bg-muted/40 flex items-center gap-4">
            <span className="flex-[3] text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Brand</span>
            <span className="flex-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground hidden sm:block">Country</span>
            <span className="flex-none text-[10px] font-semibold uppercase tracking-wider text-muted-foreground hidden md:block">Tier</span>
            <span className="flex-none text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Status</span>
            <span className="flex-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground hidden lg:block">Members</span>
            <span className="flex-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground hidden lg:block">Joined</span>
            <span className="flex-none w-5" />
          </div>

          {filtered.map((brand) => (
            <BrandRow key={brand.id} brand={brand} />
          ))}
        </div>
      )}
    </div>
  );
}
