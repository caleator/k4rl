"use client";

import { useState } from "react";
import { AlertTriangle, ShieldCheck, ChevronDown, ChevronUp } from "lucide-react";
import { MonoId } from "@/components/shared/mono-id";
import { FRAUD_REPORTS, type FraudReport } from "@/lib/mock/disputes";
import { QR_ITEMS, PRODUCTS } from "@/lib/mock/products";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  open:           { label: "Open",         className: "text-destructive bg-destructive/10" },
  "under-review": { label: "Under review", className: "text-amber-600 dark:text-amber-400 bg-amber-500/10" },
  resolved:       { label: "Resolved",     className: "text-emerald-600 dark:text-emerald-400 bg-emerald-500/10" },
};

function StatusBadge({ status }: { status: string }) {
  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.open;
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide whitespace-nowrap ${cfg.className}`}>
      {cfg.label}
    </span>
  );
}

// Enrich each report with resolved item + product at module level (static)
interface EnrichedReport extends FraudReport {
  itemQrCode: string | null;
  productId: string | null;
  productName: string | null;
}

function enrich(report: FraudReport): EnrichedReport {
  const item = QR_ITEMS.find((i) => i.id === report.itemId) ?? null;
  const product = item ? (PRODUCTS.find((p) => p.id === item.productId) ?? null) : null;
  return {
    ...report,
    itemQrCode: item?.qrCode ?? null,
    productId: product?.id ?? null,
    productName: product?.name ?? null,
  };
}

// ─── Row with expandable detail ───────────────────────────────────────────────

function DisputeRow({ report }: { report: EnrichedReport }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="border-b last:border-b-0">
      {/* Clickable summary row */}
      <button
        onClick={() => setExpanded((v) => !v)}
        className="w-full text-left px-5 py-3.5 hover:bg-muted/30 transition-colors flex items-center gap-4 group"
      >
        {/* Product name */}
        <span className="flex-[2] min-w-0 text-sm font-medium text-foreground truncate">
          {report.productName ?? "—"}
        </span>

        {/* Item ID */}
        <span className="flex-[2] min-w-0 hidden sm:block">
          {report.itemQrCode ? (
            <MonoId value={report.itemQrCode} />
          ) : (
            <span className="text-xs text-muted-foreground">{report.itemId}</span>
          )}
        </span>

        {/* Date flagged */}
        <span className="flex-1 text-xs text-muted-foreground whitespace-nowrap hidden md:block">
          {new Date(report.submittedAt).toLocaleDateString("en-GB", {
            day: "numeric", month: "short", year: "numeric",
          })}
        </span>

        {/* Description preview */}
        <span className="flex-[3] text-xs text-muted-foreground truncate hidden lg:block">
          {report.description}
        </span>

        {/* Status */}
        <span className="flex-none">
          <StatusBadge status={report.status} />
        </span>

        {/* Expand toggle */}
        <span className="flex-none text-muted-foreground group-hover:text-foreground transition-colors ml-1">
          {expanded
            ? <ChevronUp className="h-4 w-4" />
            : <ChevronDown className="h-4 w-4" />}
        </span>
      </button>

      {/* Expanded detail panel */}
      {expanded && (
        <div className="px-5 pb-5 pt-1 space-y-4 bg-muted/20 border-t">
          <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-sm pt-2">
            <div className="flex flex-col gap-0.5">
              <span className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Product</span>
              <span className="font-medium">{report.productName ?? "—"}</span>
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Item code</span>
              {report.itemQrCode ? <MonoId value={report.itemQrCode} /> : <span className="font-medium">{report.itemId}</span>}
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Reported by</span>
              <span className="font-medium">{report.reporterEmail}</span>
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Date submitted</span>
              <span className="font-medium">
                {new Date(report.submittedAt).toLocaleDateString("en-GB", {
                  day: "numeric", month: "long", year: "numeric",
                })}
              </span>
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Status</span>
              <StatusBadge status={report.status} />
            </div>
          </div>
          <div className="space-y-1">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Description</p>
            <p className="text-sm text-foreground leading-relaxed">{report.description}</p>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function DisputesPage() {
  const [productFilter, setProductFilter] = useState<string>("all");

  const enriched = [...FRAUD_REPORTS]
    .map(enrich)
    .sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());

  // Products that have at least one dispute
  const filterProducts = Array.from(
    new Map(
      enriched
        .filter((r) => r.productId && r.productName)
        .map((r) => [r.productId!, r.productName!])
    ).entries()
  );

  const filtered = productFilter === "all"
    ? enriched
    : enriched.filter((r) => r.productId === productFilter);

  return (
    <div className="p-6 max-w-5xl space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-xl font-semibold text-foreground">Disputes</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Fraud reports submitted by consumers who believe an item was transferred without their authorisation.
          </p>
        </div>

        {/* Product filter */}
        {filterProducts.length > 1 && (
          <select
            value={productFilter}
            onChange={(e) => setProductFilter(e.target.value)}
            className="h-8 rounded-md border border-input bg-background px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="all">All products</option>
            {filterProducts.map(([id, name]) => (
              <option key={id} value={id}>{name}</option>
            ))}
          </select>
        )}
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <div className="rounded-xl border border-dashed px-6 py-16 text-center space-y-3">
          <ShieldCheck className="h-8 w-8 text-muted-foreground mx-auto" />
          <div>
            <p className="font-medium text-foreground">No disputes</p>
            <p className="text-sm text-muted-foreground mt-1">
              {productFilter === "all"
                ? "Any fraud reports submitted by consumers will appear here."
                : "No disputes for this product."}
            </p>
          </div>
        </div>
      ) : (
        <div className="rounded-xl border bg-card overflow-hidden">
          {/* Column headers */}
          <div className="px-5 py-2.5 border-b bg-muted/40 flex items-center gap-4">
            <span className="flex-[2] text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Product</span>
            <span className="flex-[2] text-[10px] font-semibold uppercase tracking-wider text-muted-foreground hidden sm:block">Item ID</span>
            <span className="flex-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground hidden md:block">Date flagged</span>
            <span className="flex-[3] text-[10px] font-semibold uppercase tracking-wider text-muted-foreground hidden lg:block">Description</span>
            <span className="flex-none text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Status</span>
            <span className="flex-none w-5" />
          </div>

          {/* Rows */}
          {filtered.map((report) => (
            <DisputeRow key={report.id} report={report} />
          ))}
        </div>
      )}
    </div>
  );
}
