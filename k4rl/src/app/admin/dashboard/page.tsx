"use client";

import { Building2, Package, QrCode, CheckCircle2, Activity } from "lucide-react";
import { BRANDS } from "@/lib/mock/brands";
import { PRODUCTS, QR_ITEMS } from "@/lib/mock/products";
import { OWNERSHIP_EVENTS } from "@/lib/mock/ownership";

// ─── Metric card ─────────────────────────────────────────────────────────────

function MetricCard({
  icon: Icon,
  label,
  value,
  sub,
}: {
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

// ─── Activity event row ───────────────────────────────────────────────────────

const EVENT_LABELS: Record<string, string> = {
  manufactured: "Manufactured",
  unlocked: "Item unlocked",
  claimed: "Item claimed",
  "transfer-requested": "Transfer requested",
  "transfer-approved": "Transfer approved",
  "transfer-rejected": "Transfer rejected",
  released: "Item released",
  "fraud-flagged": "Fraud flagged",
};

function ActivityRow({ event }: { event: (typeof OWNERSHIP_EVENTS)[number] }) {
  const item = QR_ITEMS.find((i) => i.id === event.itemId);
  const product = item ? PRODUCTS.find((p) => p.id === item.productId) : null;
  const brand = BRANDS.find((b) => product && b.id === product.brandId);

  return (
    <div className="flex items-start gap-3 py-3 border-b last:border-b-0">
      <div className="mt-0.5 h-6 w-6 shrink-0 rounded-full bg-muted flex items-center justify-center">
        <Activity className="h-3 w-3 text-muted-foreground" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-foreground">
          <span className="font-medium">{EVENT_LABELS[event.type] ?? event.type}</span>
          {product && (
            <span className="text-muted-foreground"> · {product.name}</span>
          )}
        </p>
        <div className="flex items-center gap-2 mt-0.5 flex-wrap">
          {event.actorEmail && (
            <span className="text-xs text-muted-foreground">{event.actorEmail}</span>
          )}
          {brand && (
            <span className="text-xs text-muted-foreground">· {brand.name}</span>
          )}
        </div>
      </div>
      <time className="text-xs text-muted-foreground whitespace-nowrap shrink-0">
        {new Date(event.timestamp).toLocaleDateString("en-GB", {
          day: "numeric", month: "short",
        })}
      </time>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AdminDashboardPage() {
  const totalBrands = BRANDS.length;
  const activeBrands = BRANDS.filter((b) => b.subscriptionStatus === "active" || b.subscriptionStatus === "trialling").length;
  const totalDpps = PRODUCTS.filter((p) => p.dppStatus === "generated").length;
  const totalQr = QR_ITEMS.length;
  const totalClaimed = QR_ITEMS.filter((i) => i.claimedAt).length;

  const recentEvents = [...OWNERSHIP_EVENTS]
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 10);

  return (
    <div className="max-w-5xl space-y-8">
      <div>
        <h1 className="text-xl font-semibold text-foreground">Platform overview</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Live counts across all brands and items.
        </p>
      </div>

      {/* Metrics */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          icon={Building2}
          label="Brands"
          value={totalBrands}
          sub={`${activeBrands} active or trialling`}
        />
        <MetricCard
          icon={Package}
          label="DPPs generated"
          value={totalDpps}
          sub="Across all brands"
        />
        <MetricCard
          icon={QrCode}
          label="QR codes issued"
          value={totalQr}
          sub="Total QR items in system"
        />
        <MetricCard
          icon={CheckCircle2}
          label="Items claimed"
          value={totalClaimed}
          sub={`${Math.round((totalClaimed / Math.max(totalQr, 1)) * 100)}% claim rate`}
        />
      </div>

      {/* Activity feed */}
      <div className="space-y-3">
        <h2 className="text-sm font-semibold text-foreground">Recent activity</h2>
        {recentEvents.length === 0 ? (
          <div className="rounded-xl border border-dashed px-6 py-10 text-center">
            <p className="text-sm text-muted-foreground">No ownership events yet.</p>
          </div>
        ) : (
          <div className="rounded-xl border bg-card px-5 divide-y divide-border">
            {recentEvents.map((evt) => (
              <ActivityRow key={evt.id} event={evt} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
