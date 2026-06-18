"use client";

import { FlaskConical, Clock, CheckCircle2, XCircle, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";
import { MATERIAL_REQUESTS, type MaterialRequest } from "@/lib/mock/materials";
import { useAuth } from "@/context/auth";
import { cn } from "@/lib/utils";

// ─── Status badge ─────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: MaterialRequest["status"] }) {
  if (status === "pending") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 px-2 py-0.5 text-xs font-medium text-amber-600 dark:text-amber-400">
        <Clock className="h-3 w-3" />
        Pending
      </span>
    );
  }
  if (status === "approved") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2 py-0.5 text-xs font-medium text-emerald-600 dark:text-emerald-400">
        <CheckCircle2 className="h-3 w-3" />
        Approved
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-destructive/10 px-2 py-0.5 text-xs font-medium text-destructive">
      <XCircle className="h-3 w-3" />
      Rejected
    </span>
  );
}

// ─── Request row ──────────────────────────────────────────────────────────────

function RequestRow({ req }: { req: MaterialRequest }) {
  const [expanded, setExpanded] = useState(false);

  const hasLca =
    req.co2PerKg !== undefined ||
    req.waterPerKg !== undefined ||
    req.energyPerKg !== undefined ||
    req.chemistryScore !== undefined ||
    req.circularityScore !== undefined;

  return (
    <div className="border-b last:border-b-0">
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="w-full flex items-center gap-4 px-5 py-3.5 text-left hover:bg-muted/30 transition-colors"
      >
        <div className="flex-[2] min-w-0">
          <p className="text-sm font-medium text-foreground truncate">{req.materialName}</p>
          <p className="text-xs text-muted-foreground mt-0.5">{req.category}</p>
        </div>
        <div className="flex-1 hidden sm:block">
          <StatusBadge status={req.status} />
        </div>
        <div className="flex-1 text-xs text-muted-foreground hidden md:block">
          {new Date(req.submittedAt).toLocaleDateString("en-GB", {
            day: "numeric",
            month: "short",
            year: "numeric",
          })}
        </div>
        <div className="shrink-0 text-muted-foreground">
          {expanded ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </div>
      </button>

      {expanded && (
        <div className="px-5 pb-4 space-y-4">
          {/* Mobile status */}
          <div className="sm:hidden">
            <StatusBadge status={req.status} />
          </div>

          {req.notes && (
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                Notes
              </p>
              <p className="text-sm text-foreground">{req.notes}</p>
            </div>
          )}

          {hasLca && (
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                LCA values submitted
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {req.co2PerKg !== undefined && (
                  <div className="rounded-md border bg-muted/30 px-3 py-2">
                    <p className="text-[10px] text-muted-foreground">CO₂ (kg CO₂e/kg)</p>
                    <p className="text-sm font-semibold tabular-nums">{req.co2PerKg}</p>
                  </div>
                )}
                {req.waterPerKg !== undefined && (
                  <div className="rounded-md border bg-muted/30 px-3 py-2">
                    <p className="text-[10px] text-muted-foreground">Water (L/kg)</p>
                    <p className="text-sm font-semibold tabular-nums">{req.waterPerKg}</p>
                  </div>
                )}
                {req.energyPerKg !== undefined && (
                  <div className="rounded-md border bg-muted/30 px-3 py-2">
                    <p className="text-[10px] text-muted-foreground">Energy (MJ/kg)</p>
                    <p className="text-sm font-semibold tabular-nums">{req.energyPerKg}</p>
                  </div>
                )}
                {req.chemistryScore !== undefined && (
                  <div className="rounded-md border bg-muted/30 px-3 py-2">
                    <p className="text-[10px] text-muted-foreground">Chemistry (0–10)</p>
                    <p className="text-sm font-semibold tabular-nums">{req.chemistryScore}</p>
                  </div>
                )}
                {req.circularityScore !== undefined && (
                  <div className="rounded-md border bg-muted/30 px-3 py-2">
                    <p className="text-[10px] text-muted-foreground">Circularity (0–100)</p>
                    <p className="text-sm font-semibold tabular-nums">{req.circularityScore}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {req.status === "approved" && req.approvedAt && (
            <div className="flex items-center gap-2 rounded-md border border-emerald-500/20 bg-emerald-500/5 px-3 py-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
              <p className="text-xs text-emerald-700 dark:text-emerald-300">
                Approved on{" "}
                {new Date(req.approvedAt).toLocaleDateString("en-GB", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
                . The material is now available in the library.
              </p>
            </div>
          )}

          {req.status === "rejected" && req.rejectionReason && (
            <div className="space-y-1.5">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                Rejection reason
              </p>
              <div className="rounded-md border border-destructive/20 bg-destructive/5 px-3 py-2.5">
                <p className="text-sm text-foreground">{req.rejectionReason}</p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

type Filter = "all" | "pending" | "approved" | "rejected";

export default function BrandMaterialsPage() {
  const { user } = useAuth();
  const [filter, setFilter] = useState<Filter>("all");

  const brandRequests = MATERIAL_REQUESTS.filter(
    (r) => r.brandId === user.brandId
  );

  const filtered =
    filter === "all" ? brandRequests : brandRequests.filter((r) => r.status === filter);

  const counts = {
    all: brandRequests.length,
    pending: brandRequests.filter((r) => r.status === "pending").length,
    approved: brandRequests.filter((r) => r.status === "approved").length,
    rejected: brandRequests.filter((r) => r.status === "rejected").length,
  };

  const FILTERS: { key: Filter; label: string }[] = [
    { key: "all", label: `All (${counts.all})` },
    { key: "pending", label: `Pending (${counts.pending})` },
    { key: "approved", label: `Approved (${counts.approved})` },
    { key: "rejected", label: `Rejected (${counts.rejected})` },
  ];

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-foreground">Material requests</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Materials you've submitted for approval. Once approved, they become available in your
          material library.
        </p>
      </div>

      {/* Filter tabs */}
      <div className="flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            type="button"
            onClick={() => setFilter(f.key)}
            className={cn(
              "rounded-full px-3 py-1 text-xs font-medium transition-colors",
              filter === f.key
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-muted/70"
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <div className="rounded-xl border border-dashed px-6 py-12 text-center">
          <FlaskConical className="mx-auto h-8 w-8 text-muted-foreground/40 mb-3" />
          <p className="text-sm font-medium text-foreground">No requests yet</p>
          <p className="text-xs text-muted-foreground mt-1">
            When you submit a material request during product creation, it will appear here.
          </p>
        </div>
      ) : (
        <div className="rounded-xl border bg-card overflow-hidden">
          {/* Header */}
          <div className="flex items-center gap-4 px-5 py-2.5 border-b bg-muted/40">
            <span className="flex-[2] text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Material
            </span>
            <span className="flex-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground hidden sm:block">
              Status
            </span>
            <span className="flex-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground hidden md:block">
              Submitted
            </span>
            <div className="w-4 shrink-0" />
          </div>
          {filtered.map((req) => (
            <RequestRow key={req.id} req={req} />
          ))}
        </div>
      )}
    </div>
  );
}
