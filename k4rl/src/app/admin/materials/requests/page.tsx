"use client";

import { useState } from "react";
import {
  Clock,
  CheckCircle2,
  XCircle,
  ChevronDown,
  ChevronUp,
  Inbox,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  MATERIAL_REQUESTS,
  MATERIALS,
  type MaterialRequest,
  type MaterialCategory,
} from "@/lib/mock/materials";
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

// ─── Approve dialog ───────────────────────────────────────────────────────────

interface ApproveDialogProps {
  req: MaterialRequest;
  onClose: () => void;
  onApproved: () => void;
}

function ApproveDialog({ req, onClose, onApproved }: ApproveDialogProps) {
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    co2PerKg: req.co2PerKg?.toString() ?? "",
    waterPerKg: req.waterPerKg?.toString() ?? "",
    energyPerKg: req.energyPerKg?.toString() ?? "",
    chemistryScore: req.chemistryScore?.toString() ?? "",
    circularityScore: req.circularityScore?.toString() ?? "",
    notes: req.notes ?? "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const brandSubmittedAll =
    req.co2PerKg !== undefined &&
    req.waterPerKg !== undefined &&
    req.energyPerKg !== undefined &&
    req.chemistryScore !== undefined &&
    req.circularityScore !== undefined;

  function validate() {
    const e: Record<string, string> = {};
    const required = ["co2PerKg", "waterPerKg", "energyPerKg", "chemistryScore", "circularityScore"] as const;
    required.forEach((k) => {
      if (!form[k].trim() || isNaN(parseFloat(form[k]))) {
        e[k] = "Required.";
      }
    });
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function parseNum(s: string) {
    return parseFloat(s);
  }

  function handleApprove() {
    if (!validate()) return;
    setSubmitting(true);
    setTimeout(() => {
      const newId = `mat-${Date.now()}`;
      // Add to MATERIALS vocabulary
      MATERIALS.push({
        id: newId,
        name: req.materialName,
        category: req.category as MaterialCategory,
        co2PerKg: parseNum(form.co2PerKg),
        waterPerKg: parseNum(form.waterPerKg),
        energyPerKg: parseNum(form.energyPerKg),
        chemistryScore: parseNum(form.chemistryScore),
        circularityScore: parseNum(form.circularityScore),
        toxicity: "Medium",
        circularity: "Medium",
        notes: form.notes.trim() || `Added via material request ${req.id}`,
        approved: true,
      });
      // Update the request
      const idx = MATERIAL_REQUESTS.indexOf(req);
      if (idx !== -1) {
        MATERIAL_REQUESTS[idx] = {
          ...req,
          status: "approved",
          approvedAt: new Date().toISOString(),
          approvedMaterialId: newId,
          co2PerKg: parseNum(form.co2PerKg),
          waterPerKg: parseNum(form.waterPerKg),
          energyPerKg: parseNum(form.energyPerKg),
          chemistryScore: parseNum(form.chemistryScore),
          circularityScore: parseNum(form.circularityScore),
        };
      }
      setSubmitting(false);
      onApproved();
    }, 800);
  }

  return (
    <Dialog open onOpenChange={(v) => { if (!v) onClose(); }}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Approve material</DialogTitle>
          <DialogDescription>
            Provide all LCA values for{" "}
            <span className="font-medium text-foreground">{req.materialName}</span>. The
            material will be added to the controlled library immediately and become available
            to all brands.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2 max-h-[60vh] overflow-y-auto pr-1">
          {brandSubmittedAll && (
            <div className="rounded-md border border-primary/20 bg-primary/5 px-3 py-2">
              <p className="text-xs text-muted-foreground">
                The brand submitted LCA values — pre-filled below. Review and adjust if needed.
              </p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            {(
              [
                { key: "co2PerKg", label: "CO₂ (kg CO₂e/kg)", placeholder: "e.g. 2.5" },
                { key: "waterPerKg", label: "Water (L/kg)", placeholder: "e.g. 2200" },
                { key: "energyPerKg", label: "Energy (MJ/kg)", placeholder: "e.g. 45" },
                { key: "chemistryScore", label: "Chemistry (0–10)", placeholder: "e.g. 3" },
              ] as const
            ).map(({ key, label, placeholder }) => (
              <div key={key} className="space-y-1.5">
                <Label htmlFor={key} className="text-xs">
                  {label}
                </Label>
                <Input
                  id={key}
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder={placeholder}
                  value={form[key]}
                  onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                  className={cn(errors[key] && "border-destructive")}
                />
                {errors[key] && (
                  <p className="text-xs text-destructive">{errors[key]}</p>
                )}
              </div>
            ))}

            <div className="space-y-1.5 col-span-2">
              <Label htmlFor="circularityScore" className="text-xs">
                Circularity score (0–100)
              </Label>
              <Input
                id="circularityScore"
                type="number"
                step="1"
                min="0"
                max="100"
                placeholder="e.g. 60"
                value={form.circularityScore}
                onChange={(e) =>
                  setForm((f) => ({ ...f, circularityScore: e.target.value }))
                }
                className={cn(errors.circularityScore && "border-destructive")}
              />
              {errors.circularityScore && (
                <p className="text-xs text-destructive">{errors.circularityScore}</p>
              )}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="notes" className="text-xs">
              Library notes{" "}
              <span className="text-muted-foreground font-normal">(optional)</span>
            </Label>
            <Textarea
              id="notes"
              rows={2}
              placeholder="e.g. Certified closed-loop process. Source: Litrax SS26."
              value={form.notes}
              onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
              className="resize-none"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={submitting}>
            Cancel
          </Button>
          <Button onClick={handleApprove} disabled={submitting}>
            {submitting ? "Approving…" : "Approve & add to library"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Reject dialog ────────────────────────────────────────────────────────────

interface RejectDialogProps {
  req: MaterialRequest;
  onClose: () => void;
  onRejected: () => void;
}

function RejectDialog({ req, onClose, onRejected }: RejectDialogProps) {
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function handleReject() {
    if (!reason.trim()) {
      setError("A rejection reason is required.");
      return;
    }
    setSubmitting(true);
    setTimeout(() => {
      const idx = MATERIAL_REQUESTS.indexOf(req);
      if (idx !== -1) {
        MATERIAL_REQUESTS[idx] = {
          ...req,
          status: "rejected",
          rejectedAt: new Date().toISOString(),
          rejectionReason: reason.trim(),
        };
      }
      setSubmitting(false);
      onRejected();
    }, 600);
  }

  return (
    <Dialog open onOpenChange={(v) => { if (!v) onClose(); }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Reject material request</DialogTitle>
          <DialogDescription>
            Provide a reason for rejecting{" "}
            <span className="font-medium text-foreground">{req.materialName}</span>. The brand
            will see this reason and can resubmit with corrections.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-1.5 py-2">
          <Label htmlFor="reason">Rejection reason</Label>
          <Textarea
            id="reason"
            rows={4}
            placeholder="e.g. Conventional bamboo processing is chemically intensive. Please specify the processing method or resubmit as Lyocell/TENCEL™."
            value={reason}
            onChange={(e) => { setReason(e.target.value); setError(""); }}
            className={cn("resize-none", error && "border-destructive")}
          />
          {error && <p className="text-xs text-destructive">{error}</p>}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={submitting}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleReject}
            disabled={submitting}
          >
            {submitting ? "Rejecting…" : "Reject request"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Request row ──────────────────────────────────────────────────────────────

function RequestRow({
  req,
  onAction,
}: {
  req: MaterialRequest;
  onAction: (action: "approve" | "reject", req: MaterialRequest) => void;
}) {
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
          <p className="text-sm font-medium text-foreground truncate">
            {req.materialName}
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">
            {req.category} · {req.brandName}
          </p>
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
          <div className="sm:hidden">
            <StatusBadge status={req.status} />
          </div>

          {req.notes && (
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                Brand notes
              </p>
              <p className="text-sm text-foreground">{req.notes}</p>
            </div>
          )}

          {hasLca && (
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                LCA values from brand
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

          {!hasLca && req.status === "pending" && (
            <p className="text-xs text-muted-foreground italic">
              No LCA values submitted by brand — you'll need to provide all values on approval.
            </p>
          )}

          {req.status === "rejected" && req.rejectionReason && (
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                Rejection reason
              </p>
              <div className="rounded-md border border-destructive/20 bg-destructive/5 px-3 py-2.5">
                <p className="text-sm text-foreground">{req.rejectionReason}</p>
              </div>
            </div>
          )}

          {req.status === "pending" && (
            <div className="flex gap-2 pt-1">
              <Button
                size="sm"
                variant="outline"
                className="text-destructive border-destructive/30 hover:bg-destructive/5"
                onClick={() => onAction("reject", req)}
              >
                Reject
              </Button>
              <Button size="sm" onClick={() => onAction("approve", req)}>
                Review &amp; approve
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

type Filter = "all" | "pending" | "approved" | "rejected";

export default function AdminMaterialRequestsPage() {
  const [filter, setFilter] = useState<Filter>("pending");
  const [, forceUpdate] = useState(0);
  const [approveTarget, setApproveTarget] = useState<MaterialRequest | null>(null);
  const [rejectTarget, setRejectTarget] = useState<MaterialRequest | null>(null);

  function refresh() {
    forceUpdate((n) => n + 1);
  }

  const all = [...MATERIAL_REQUESTS].sort(
    (a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()
  );
  const filtered = filter === "all" ? all : all.filter((r) => r.status === filter);

  const counts = {
    all: all.length,
    pending: all.filter((r) => r.status === "pending").length,
    approved: all.filter((r) => r.status === "approved").length,
    rejected: all.filter((r) => r.status === "rejected").length,
  };

  const FILTERS: { key: Filter; label: string }[] = [
    { key: "pending", label: `Pending (${counts.pending})` },
    { key: "all", label: `All (${counts.all})` },
    { key: "approved", label: `Approved (${counts.approved})` },
    { key: "rejected", label: `Rejected (${counts.rejected})` },
  ];

  function handleAction(action: "approve" | "reject", req: MaterialRequest) {
    if (action === "approve") setApproveTarget(req);
    else setRejectTarget(req);
  }

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-foreground">Material requests</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Review brand-submitted material requests. Approving a material adds it to the
          controlled library immediately.
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
          <Inbox className="mx-auto h-8 w-8 text-muted-foreground/40 mb-3" />
          <p className="text-sm font-medium text-foreground">No requests to review</p>
          <p className="text-xs text-muted-foreground mt-1">
            Material requests from brands will appear here for review.
          </p>
        </div>
      ) : (
        <div className="rounded-xl border bg-card overflow-hidden">
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
            <RequestRow key={req.id} req={req} onAction={handleAction} />
          ))}
        </div>
      )}

      {/* Approve dialog */}
      {approveTarget && (
        <ApproveDialog
          req={approveTarget}
          onClose={() => setApproveTarget(null)}
          onApproved={() => { setApproveTarget(null); refresh(); }}
        />
      )}

      {/* Reject dialog */}
      {rejectTarget && (
        <RejectDialog
          req={rejectTarget}
          onClose={() => setRejectTarget(null)}
          onRejected={() => { setRejectTarget(null); refresh(); }}
        />
      )}
    </div>
  );
}
