"use client";

import { useState, useMemo } from "react";
import {
  Search, FlaskConical, ChevronDown, ChevronUp, Plus, X,
  Leaf, Zap, Recycle, Shield, Scissors, Layers, Clock,
  CheckCircle2, XCircle, Building2,
  type LucideIcon,
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
  MATERIALS,
  MATERIAL_REQUESTS,
  type Material,
  type MaterialCategory,
  type MaterialRequest,
} from "@/lib/mock/materials";
import { cn } from "@/lib/utils";

// ─── Category config ──────────────────────────────────────────────────────────

interface CatStyle {
  icon: LucideIcon;
  color: string;
  bg: string;
  badgeColor: string;
}

const CATEGORY_CONFIG: Record<MaterialCategory, CatStyle> = {
  "Natural fiber":      { icon: Leaf,         color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-500/10", badgeColor: "text-emerald-700 dark:text-emerald-400 bg-emerald-500/10" },
  "Recycled synthetic": { icon: Recycle,      color: "text-sky-600 dark:text-sky-400",         bg: "bg-sky-500/10",     badgeColor: "text-sky-700 dark:text-sky-400 bg-sky-500/10" },
  "Synthetic":          { icon: Zap,          color: "text-orange-600 dark:text-orange-400",   bg: "bg-orange-500/10",  badgeColor: "text-orange-700 dark:text-orange-400 bg-orange-500/10" },
  "Semi-synthetic":     { icon: FlaskConical, color: "text-violet-600 dark:text-violet-400",   bg: "bg-violet-500/10",  badgeColor: "text-violet-700 dark:text-violet-400 bg-violet-500/10" },
  "Vegan leather":      { icon: Shield,       color: "text-amber-600 dark:text-amber-400",     bg: "bg-amber-500/10",   badgeColor: "text-amber-700 dark:text-amber-400 bg-amber-500/10" },
  "Trim":               { icon: Scissors,     color: "text-muted-foreground",                  bg: "bg-muted",          badgeColor: "text-muted-foreground bg-muted" },
  "Coating":            { icon: Layers,       color: "text-muted-foreground",                  bg: "bg-muted",          badgeColor: "text-muted-foreground bg-muted" },
};

function getCatStyle(cat: string): CatStyle {
  return CATEGORY_CONFIG[cat as MaterialCategory] ?? {
    icon: FlaskConical, color: "text-muted-foreground", bg: "bg-muted", badgeColor: "text-muted-foreground bg-muted",
  };
}

const CATEGORIES: MaterialCategory[] = [
  "Natural fiber", "Recycled synthetic", "Synthetic",
  "Semi-synthetic", "Vegan leather", "Trim", "Coating",
];

// ─── Category icon cell ───────────────────────────────────────────────────────

function CatIcon({ category }: { category: string }) {
  const s = getCatStyle(category);
  const Icon = s.icon;
  return (
    <span className={cn("flex h-6 w-6 shrink-0 items-center justify-center rounded-md", s.bg)}>
      <Icon className={cn("h-3.5 w-3.5", s.color)} />
    </span>
  );
}

// ─── Category badge ───────────────────────────────────────────────────────────

function CategoryBadge({ category }: { category: MaterialCategory }) {
  const s = getCatStyle(category);
  return (
    <span className={cn("inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide whitespace-nowrap", s.badgeColor)}>
      {category}
    </span>
  );
}

// ─── Score bar ────────────────────────────────────────────────────────────────

function ScoreBar({ value, max, danger }: { value: number; max: number; danger?: boolean }) {
  const pct = Math.min(100, Math.round((value / max) * 100));
  return (
    <div className="flex items-center gap-2">
      <div className="h-1.5 w-16 rounded-full bg-muted overflow-hidden">
        <div
          className={`h-full rounded-full ${danger ? "bg-destructive/60" : "bg-primary/60"}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-xs tabular-nums text-muted-foreground">{value}</span>
    </div>
  );
}

// ─── Material detail (expanded) ───────────────────────────────────────────────

function MaterialDetail({ mat }: { mat: Material }) {
  return (
    <div className="px-5 pb-5 pt-3 bg-muted/20 border-t grid gap-x-8 gap-y-3 sm:grid-cols-2 lg:grid-cols-3 text-sm">
      <div className="space-y-0.5">
        <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">CO₂ (kg CO₂e/kg)</p>
        <p className="font-medium">{mat.co2PerKg}</p>
      </div>
      <div className="space-y-0.5">
        <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Water (L/kg)</p>
        <p className="font-medium">{mat.waterPerKg.toLocaleString()}</p>
      </div>
      <div className="space-y-0.5">
        <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Energy (MJ/kg)</p>
        <p className="font-medium">{mat.energyPerKg}</p>
      </div>
      <div className="space-y-0.5">
        <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Chemistry score (0–10)</p>
        <ScoreBar value={mat.chemistryScore} max={10} />
      </div>
      <div className="space-y-0.5">
        <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Circularity score (0–100)</p>
        <ScoreBar value={mat.circularityScore} max={100} />
      </div>
      <div className="space-y-0.5">
        <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Toxicity</p>
        <p className="font-medium">{mat.toxicity}</p>
      </div>
      <div className="sm:col-span-2 lg:col-span-3 space-y-0.5">
        <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Notes</p>
        <p className="text-muted-foreground">{mat.notes}</p>
      </div>
      {mat.provenance && (
        <div className="sm:col-span-2 lg:col-span-3 pt-1 mt-1 border-t border-dashed flex flex-wrap gap-6">
          <div className="space-y-0.5">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Requested by</p>
            <p className="font-medium flex items-center gap-1.5">
              <Building2 className="h-3.5 w-3.5 text-muted-foreground" />
              {mat.provenance.brandName}
            </p>
          </div>
          <div className="space-y-0.5">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Request date</p>
            <p className="font-medium">
              {new Date(mat.provenance.requestDate).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Material row ─────────────────────────────────────────────────────────────

function MaterialRow({ mat }: { mat: Material }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="border-b last:border-b-0">
      <button
        onClick={() => setExpanded((v) => !v)}
        className="w-full text-left px-5 py-3 hover:bg-muted/30 transition-colors flex items-center gap-3 group"
      >
        {/* Icon */}
        <span className="shrink-0 w-6">
          <CatIcon category={mat.category} />
        </span>

        {/* Name */}
        <span className="flex-[3] min-w-0 text-sm font-medium text-foreground truncate">
          {mat.name}
        </span>

        {/* Category */}
        <span className="flex-[2] min-w-0 hidden sm:block">
          <CategoryBadge category={mat.category} />
        </span>

        {/* CO₂ */}
        <span className="flex-1 text-xs tabular-nums text-muted-foreground hidden md:block">
          {mat.co2PerKg} kg
        </span>

        {/* Circularity */}
        <span className="flex-1 hidden lg:block">
          <ScoreBar value={mat.circularityScore} max={100} />
        </span>

        {/* Expand */}
        <span className="flex-none text-muted-foreground group-hover:text-foreground transition-colors ml-1">
          {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </span>
      </button>

      {expanded && <MaterialDetail mat={mat} />}
    </div>
  );
}

// ─── Approve dialog ───────────────────────────────────────────────────────────

function ApproveDialog({
  req, onClose, onApproved,
}: {
  req: MaterialRequest;
  onClose: () => void;
  onApproved: () => void;
}) {
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

  const REQUIRED_FIELDS = ["co2PerKg", "waterPerKg", "energyPerKg", "chemistryScore", "circularityScore"] as const;
  const isFormValid = REQUIRED_FIELDS.every((k) => form[k].trim() && !isNaN(parseFloat(form[k])));

  function validate() {
    const e: Record<string, string> = {};
    REQUIRED_FIELDS.forEach((k) => {
      if (!form[k].trim() || isNaN(parseFloat(form[k]))) e[k] = "Required.";
    });
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function handleApprove() {
    if (!validate()) return;
    setSubmitting(true);
    setTimeout(() => {
      const newId = `mat-${Date.now()}`;
      MATERIALS.unshift({
        id: newId,
        name: req.materialName,
        category: req.category,
        co2PerKg: parseFloat(form.co2PerKg),
        waterPerKg: parseFloat(form.waterPerKg),
        energyPerKg: parseFloat(form.energyPerKg),
        chemistryScore: parseFloat(form.chemistryScore),
        circularityScore: parseFloat(form.circularityScore),
        toxicity: "Medium",
        circularity: "Medium",
        notes: form.notes.trim() || "",
        approved: true,
        provenance: {
          brandId: req.brandId,
          brandName: req.brandName,
          requestDate: req.submittedAt,
          requestId: req.id,
        },
      });
      const idx = MATERIAL_REQUESTS.indexOf(req);
      if (idx !== -1) {
        MATERIAL_REQUESTS[idx] = {
          ...req, status: "approved",
          approvedAt: new Date().toISOString(),
          approvedMaterialId: newId,
          co2PerKg: parseFloat(form.co2PerKg),
          waterPerKg: parseFloat(form.waterPerKg),
          energyPerKg: parseFloat(form.energyPerKg),
          chemistryScore: parseFloat(form.chemistryScore),
          circularityScore: parseFloat(form.circularityScore),
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
            Provide all LCA values for <span className="font-medium text-foreground">{req.materialName}</span>.
            The material will be added to the library and available to all brands immediately.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2 max-h-[55vh] overflow-y-auto pr-1">
          {(req.co2PerKg !== undefined) && (
            <p className="text-xs text-muted-foreground rounded-md border border-primary/20 bg-primary/5 px-3 py-2">
              Brand submitted LCA values — pre-filled below. Review and adjust if needed.
            </p>
          )}
          <div className="grid grid-cols-2 gap-3">
            {([
              { key: "co2PerKg", label: "CO₂ (kg CO₂e/kg)", placeholder: "e.g. 2.5" },
              { key: "waterPerKg", label: "Water (L/kg)", placeholder: "e.g. 2200" },
              { key: "energyPerKg", label: "Energy (MJ/kg)", placeholder: "e.g. 45" },
              { key: "chemistryScore", label: "Chemistry (0–10)", placeholder: "e.g. 3" },
            ] as const).map(({ key, label, placeholder }) => (
              <div key={key} className="space-y-1.5">
                <Label htmlFor={key} className="text-xs">{label}</Label>
                <Input id={key} type="number" step="0.01" min="0" placeholder={placeholder}
                  value={form[key]}
                  onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                  className={cn(errors[key] && "border-destructive")}
                />
                {errors[key] && <p className="text-xs text-destructive">{errors[key]}</p>}
              </div>
            ))}
            <div className="space-y-1.5 col-span-2">
              <Label htmlFor="circularityScore" className="text-xs">Circularity score (0–100)</Label>
              <Input id="circularityScore" type="number" step="1" min="0" max="100" placeholder="e.g. 60"
                value={form.circularityScore}
                onChange={(e) => setForm((f) => ({ ...f, circularityScore: e.target.value }))}
                className={cn(errors.circularityScore && "border-destructive")}
              />
              {errors.circularityScore && <p className="text-xs text-destructive">{errors.circularityScore}</p>}
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="notes" className="text-xs">Library notes <span className="text-muted-foreground font-normal">(optional)</span></Label>
            <Textarea id="notes" rows={2} placeholder="e.g. Certified closed-loop process."
              value={form.notes}
              onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
              className="resize-none"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={submitting}>Cancel</Button>
          <Button onClick={handleApprove} disabled={submitting || !isFormValid}>
            {submitting ? "Approving…" : "Approve and add to library"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Reject dialog ────────────────────────────────────────────────────────────

function RejectDialog({
  req, onClose, onRejected,
}: {
  req: MaterialRequest;
  onClose: () => void;
  onRejected: () => void;
}) {
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function handleReject() {
    if (!reason.trim()) { setError("A rejection reason is required."); return; }
    setSubmitting(true);
    setTimeout(() => {
      const idx = MATERIAL_REQUESTS.indexOf(req);
      if (idx !== -1) {
        MATERIAL_REQUESTS[idx] = {
          ...req, status: "rejected",
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
            Provide a reason for rejecting <span className="font-medium text-foreground">{req.materialName}</span>.
            The brand will see this and can resubmit.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-1.5 py-2">
          <Label htmlFor="reason">Rejection reason</Label>
          <Textarea id="reason" rows={4}
            placeholder="e.g. Conventional bamboo processing is chemically intensive. Please specify the exact processing method."
            value={reason}
            onChange={(e) => { setReason(e.target.value); setError(""); }}
            className={cn("resize-none", error && "border-destructive")}
          />
          {error && <p className="text-xs text-destructive">{error}</p>}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={submitting}>Cancel</Button>
          <Button variant="destructive" onClick={handleReject} disabled={submitting}>
            {submitting ? "Rejecting…" : "Reject request"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Requests tab ─────────────────────────────────────────────────────────────

function RequestsTab({ onMutated }: { onMutated: () => void }) {
  const [approveTarget, setApproveTarget] = useState<MaterialRequest | null>(null);
  const [rejectTarget, setRejectTarget] = useState<MaterialRequest | null>(null);

  const pending = MATERIAL_REQUESTS.filter((r) => r.status === "pending")
    .sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());
  const rest = MATERIAL_REQUESTS.filter((r) => r.status !== "pending")
    .sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());
  const all = [...pending, ...rest];

  function statusBadge(status: MaterialRequest["status"]) {
    if (status === "pending")
      return <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2 py-0.5 text-[10px] font-semibold text-amber-600 dark:text-amber-400"><Clock className="h-2.5 w-2.5" />Pending</span>;
    if (status === "approved")
      return <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400"><CheckCircle2 className="h-2.5 w-2.5" />Approved</span>;
    return <span className="inline-flex items-center gap-1 rounded-full bg-destructive/10 px-2 py-0.5 text-[10px] font-semibold text-destructive"><XCircle className="h-2.5 w-2.5" />Rejected</span>;
  }

  if (all.length === 0) {
    return (
      <div className="rounded-xl border border-dashed px-6 py-16 text-center">
        <FlaskConical className="h-8 w-8 text-muted-foreground/40 mx-auto mb-3" />
        <p className="text-sm font-medium">No requests yet</p>
        <p className="text-xs text-muted-foreground mt-1">Brand material requests will appear here for review.</p>
      </div>
    );
  }

  return (
    <>
      <div className="rounded-xl border bg-card overflow-hidden">
        {/* Header */}
        <div className="px-5 py-2.5 border-b bg-muted/40 flex items-center gap-4">
          <span className="flex-[2] text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Brand</span>
          <span className="flex-[2] text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Material name</span>
          <span className="flex-[3] text-[10px] font-semibold uppercase tracking-wider text-muted-foreground hidden md:block">Notes</span>
          <span className="flex-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground hidden sm:block">Submitted</span>
          <span className="w-36 shrink-0 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground text-right">Actions</span>
        </div>

        {all.map((req) => (
          <div key={req.id} className="flex items-center gap-4 px-5 py-3.5 border-b last:border-b-0 hover:bg-muted/20 transition-colors">
            <div className="flex-[2] min-w-0">
              <p className="text-sm font-medium text-foreground truncate">{req.brandName}</p>
            </div>
            <div className="flex-[2] min-w-0">
              <p className="text-sm text-foreground truncate">{req.materialName}</p>
              <p className="text-[10px] text-muted-foreground">{req.category}</p>
            </div>
            <div className="flex-[3] min-w-0 hidden md:block">
              {req.notes ? (
                <p className="text-xs text-muted-foreground truncate">{req.notes}</p>
              ) : (
                <p className="text-xs text-muted-foreground/50 italic">No notes</p>
              )}
            </div>
            <div className="flex-1 hidden sm:block">
              <p className="text-xs text-muted-foreground">
                {new Date(req.submittedAt).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
              </p>
            </div>
            <div className="w-36 shrink-0 flex flex-col items-end gap-1">
              {req.status === "pending" ? (
                <div className="flex items-center gap-1.5">
                  <Button size="sm" variant="outline"
                    className="h-7 text-xs text-destructive border-destructive/30 hover:bg-destructive/5 px-2.5"
                    onClick={() => setRejectTarget(req)}
                  >
                    Reject
                  </Button>
                  <Button size="sm" className="h-7 text-xs px-2.5"
                    onClick={() => setApproveTarget(req)}
                  >
                    Approve
                  </Button>
                </div>
              ) : (
                <>
                  {statusBadge(req.status)}
                  {req.status === "rejected" && req.rejectionReason && (
                    <p className="text-[10px] text-muted-foreground text-right leading-snug max-w-[136px] line-clamp-2" title={req.rejectionReason}>
                      {req.rejectionReason}
                    </p>
                  )}
                </>
              )}
            </div>
          </div>
        ))}
      </div>

      {approveTarget && (
        <ApproveDialog req={approveTarget} onClose={() => setApproveTarget(null)}
          onApproved={() => { setApproveTarget(null); onMutated(); }} />
      )}
      {rejectTarget && (
        <RejectDialog req={rejectTarget} onClose={() => setRejectTarget(null)}
          onRejected={() => { setRejectTarget(null); onMutated(); }} />
      )}
    </>
  );
}

// ─── Add material slide-over ──────────────────────────────────────────────────

interface AddMaterialForm {
  name: string;
  category: MaterialCategory | "";
  co2PerKg: string;
  waterPerKg: string;
  energyPerKg: string;
  chemistryScore: string;
  circularityScore: string;
  notes: string;
}

const EMPTY_FORM: AddMaterialForm = {
  name: "", category: "", co2PerKg: "", waterPerKg: "", energyPerKg: "",
  chemistryScore: "", circularityScore: "", notes: "",
};

function AddMaterialPanel({
  onClose,
  onSaved,
}: {
  onClose: () => void;
  onSaved: () => void;
}) {
  const [form, setForm] = useState<AddMaterialForm>(EMPTY_FORM);
  const [errors, setErrors] = useState<Record<string, string>>({});

  function validate() {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = "Material name is required.";
    if (!form.category) e.category = "Select a category.";
    if (!form.co2PerKg || isNaN(parseFloat(form.co2PerKg))) e.co2PerKg = "Required.";
    if (!form.circularityScore || isNaN(parseFloat(form.circularityScore))) e.circularityScore = "Required.";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function handleSave() {
    if (!validate()) return;
    const cat = form.category as MaterialCategory;
    MATERIALS.unshift({
      id: `mat-${Date.now()}`,
      name: form.name.trim(),
      category: cat,
      co2PerKg: parseFloat(form.co2PerKg),
      waterPerKg: form.waterPerKg ? parseFloat(form.waterPerKg) : 0,
      energyPerKg: form.energyPerKg ? parseFloat(form.energyPerKg) : 0,
      chemistryScore: form.chemistryScore ? parseFloat(form.chemistryScore) : 5,
      circularityScore: parseFloat(form.circularityScore),
      toxicity: "Medium",
      circularity: "Medium",
      notes: form.notes.trim() || "",
      approved: true,
    });
    onSaved();
  }

  const selectedCatStyle = form.category ? getCatStyle(form.category) : null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/40 backdrop-blur-[1px]"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-[480px] bg-background border-l shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b shrink-0">
          <h2 className="text-base font-semibold">Add material</h2>
          <button
            type="button"
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Close panel"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
          {/* Name */}
          <div className="space-y-1.5">
            <Label htmlFor="mat-name">Material name</Label>
            <Input
              id="mat-name"
              placeholder="e.g. Bamboo viscose"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              className={cn(errors.name && "border-destructive")}
            />
            {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
          </div>

          {/* Category */}
          <div className="space-y-2">
            <Label>Category</Label>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((cat) => {
                const s = getCatStyle(cat);
                const Icon = s.icon;
                const active = form.category === cat;
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setForm((f) => ({ ...f, category: cat }))}
                    className={cn(
                      "flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition-all",
                      active
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border bg-background text-muted-foreground hover:border-muted-foreground/40 hover:text-foreground"
                    )}
                  >
                    <Icon className={cn("h-3.5 w-3.5", active ? "text-primary" : s.color)} />
                    {cat}
                  </button>
                );
              })}
            </div>
            {errors.category && <p className="text-xs text-destructive">{errors.category}</p>}
          </div>

          {/* LCA values */}
          <div className="space-y-3">
            <p className="text-sm font-medium">LCA values</p>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="mat-co2" className="text-xs">CO₂ (kg CO₂e/kg)</Label>
                <Input id="mat-co2" type="number" step="0.01" min="0" placeholder="e.g. 2.5"
                  value={form.co2PerKg}
                  onChange={(e) => setForm((f) => ({ ...f, co2PerKg: e.target.value }))}
                  className={cn(errors.co2PerKg && "border-destructive")}
                />
                {errors.co2PerKg && <p className="text-xs text-destructive">{errors.co2PerKg}</p>}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="mat-water" className="text-xs">Water (L/kg)</Label>
                <Input id="mat-water" type="number" step="1" min="0" placeholder="e.g. 2200"
                  value={form.waterPerKg}
                  onChange={(e) => setForm((f) => ({ ...f, waterPerKg: e.target.value }))}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="mat-energy" className="text-xs">Energy (MJ/kg)</Label>
                <Input id="mat-energy" type="number" step="0.1" min="0" placeholder="e.g. 45"
                  value={form.energyPerKg}
                  onChange={(e) => setForm((f) => ({ ...f, energyPerKg: e.target.value }))}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="mat-chemistry" className="text-xs">Chemistry (0–10)</Label>
                <Input id="mat-chemistry" type="number" step="0.1" min="0" max="10" placeholder="e.g. 3"
                  value={form.chemistryScore}
                  onChange={(e) => setForm((f) => ({ ...f, chemistryScore: e.target.value }))}
                />
              </div>
              <div className="space-y-1.5 col-span-2">
                <Label htmlFor="mat-circ" className="text-xs">Circularity score (0–100)</Label>
                <Input id="mat-circ" type="number" step="1" min="0" max="100" placeholder="e.g. 60"
                  value={form.circularityScore}
                  onChange={(e) => setForm((f) => ({ ...f, circularityScore: e.target.value }))}
                  className={cn(errors.circularityScore && "border-destructive")}
                />
                {errors.circularityScore && <p className="text-xs text-destructive">{errors.circularityScore}</p>}
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-1.5">
            <Label htmlFor="mat-notes" className="text-sm font-medium">
              Notes <span className="text-muted-foreground font-normal">(optional)</span>
            </Label>
            <Textarea id="mat-notes" rows={2} placeholder="e.g. Certified GOTS organic. Supplier: BioFabrics."
              value={form.notes}
              onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
              className="resize-none"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="border-t px-6 py-4 flex items-center gap-3 shrink-0">
          <Button onClick={handleSave} className="flex-1">
            Save material
          </Button>
          <button
            type="button"
            onClick={onClose}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

type SortKey = "name" | "category" | "co2PerKg" | "circularityScore";
type Tab = "materials" | "requests";

export default function MaterialsPage() {
  const [tab, setTab] = useState<Tab>("materials");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<"all" | MaterialCategory>("all");
  const [circularityMin, setCircularityMin] = useState<number | null>(null);
  const [co2Max, setCo2Max] = useState<number | null>(null);
  const [source, setSource] = useState<"all" | "admin" | "brand-request">("all");
  const [sourceBrand, setSourceBrand] = useState<string>("all");
  const [sortKey, setSortKey] = useState<SortKey>("name");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [addOpen, setAddOpen] = useState(false);
  const [, forceUpdate] = useState(0);

  function refresh() { forceUpdate((n) => n + 1); }

  function toggleSort(key: SortKey) {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortKey(key); setSortDir("asc"); }
  }

  const pendingCount = MATERIAL_REQUESTS.filter((r) => r.status === "pending").length;

  const brandRequestedBrands = useMemo(() => {
    const seen = new Map<string, string>();
    MATERIALS.forEach((m) => {
      if (m.provenance && !seen.has(m.provenance.brandId)) {
        seen.set(m.provenance.brandId, m.provenance.brandName);
      }
    });
    return [...seen.entries()].map(([id, name]) => ({ id, name }));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [MATERIALS.length]);

  const filtered = useMemo(() => {
    return [...MATERIALS]
      .filter((m) => {
        const matchSearch = m.name.toLowerCase().includes(search.toLowerCase());
        const matchCat = category === "all" || m.category === category;
        const matchCirc = circularityMin === null || m.circularityScore > circularityMin;
        const matchCo2 = co2Max === null || m.co2PerKg < co2Max;
        const matchSource =
          source === "all" ? true :
          source === "admin" ? !m.provenance :
          !!(m.provenance && (sourceBrand === "all" || m.provenance.brandId === sourceBrand));
        return matchSearch && matchCat && matchCirc && matchCo2 && matchSource;
      })
      .sort((a, b) => {
        const mul = sortDir === "asc" ? 1 : -1;
        if (sortKey === "name") return mul * a.name.localeCompare(b.name);
        if (sortKey === "category") return mul * a.category.localeCompare(b.category);
        return mul * (a[sortKey] - b[sortKey]);
      });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, category, circularityMin, co2Max, source, sourceBrand, sortKey, sortDir, MATERIALS.length]);

  function SortHeader({ col, label, className }: { col: SortKey; label: string; className?: string }) {
    const active = sortKey === col;
    return (
      <button
        onClick={() => toggleSort(col)}
        className={cn(
          "flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider transition-colors",
          active ? "text-foreground" : "text-muted-foreground hover:text-foreground",
          className
        )}
      >
        {label}
        {active
          ? (sortDir === "asc" ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />)
          : <ChevronDown className="h-3 w-3 opacity-30" />
        }
      </button>
    );
  }

  return (
    <div className="max-w-5xl space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-foreground">Material library</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {MATERIALS.length} materials
          </p>
        </div>
        <Button onClick={() => setAddOpen(true)} className="shrink-0">
          <Plus className="h-4 w-4" />
          Add material
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-0 border-b">
        {([
          { key: "materials" as Tab, label: "Materials" },
          { key: "requests" as Tab, label: `Requests${pendingCount > 0 ? ` · ${pendingCount}` : ""}` },
        ]).map(({ key, label }) => (
          <button
            key={key}
            type="button"
            onClick={() => setTab(key)}
            className={cn(
              "px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors",
              tab === key
                ? "border-primary text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground hover:border-muted-foreground/30"
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === "materials" && (
        <>
          {/* Filter bar */}
          <div className="flex flex-wrap gap-2">
            <div className="relative flex-1 min-w-40 max-w-64">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
              <Input
                placeholder="Search materials…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8 h-8 text-sm"
              />
            </div>

            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as typeof category)}
              className="h-8 rounded-md border border-input bg-background px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="all">All categories</option>
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>

            <select
              value={circularityMin ?? ""}
              onChange={(e) => setCircularityMin(e.target.value ? Number(e.target.value) : null)}
              className="h-8 rounded-md border border-input bg-background px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="">Any circularity</option>
              <option value="50">Above 50</option>
              <option value="70">Above 70</option>
              <option value="90">Above 90</option>
            </select>

            <select
              value={co2Max ?? ""}
              onChange={(e) => setCo2Max(e.target.value ? Number(e.target.value) : null)}
              className="h-8 rounded-md border border-input bg-background px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="">Any CO₂</option>
              <option value="2">Below 2 kg</option>
              <option value="5">Below 5 kg</option>
              <option value="10">Below 10 kg</option>
            </select>

            <select
              value={source}
              onChange={(e) => {
                setSource(e.target.value as typeof source);
                setSourceBrand("all");
              }}
              className="h-8 rounded-md border border-input bg-background px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="all">All sources</option>
              <option value="admin">Admin-added</option>
              <option value="brand-request">From brand request</option>
            </select>

            {source === "brand-request" && brandRequestedBrands.length > 1 && (
              <select
                value={sourceBrand}
                onChange={(e) => setSourceBrand(e.target.value)}
                className="h-8 rounded-md border border-input bg-background px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="all">All brands</option>
                {brandRequestedBrands.map((b) => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </select>
            )}
          </div>

          {/* Table */}
          {filtered.length === 0 ? (
            <div className="rounded-xl border border-dashed px-6 py-16 text-center space-y-3">
              <FlaskConical className="h-8 w-8 text-muted-foreground mx-auto" />
              <div>
                <p className="font-medium text-foreground">No materials found</p>
                <p className="text-sm text-muted-foreground mt-1">Try adjusting your filters.</p>
              </div>
            </div>
          ) : (
            <div className="rounded-xl border bg-card overflow-hidden">
              {/* Column headers */}
              <div className="px-5 py-2.5 border-b bg-muted/40 flex items-center gap-3">
                <span className="w-6 shrink-0" />
                <span className="flex-[3]"><SortHeader col="name" label="Name" /></span>
                <span className="flex-[2] hidden sm:block"><SortHeader col="category" label="Category" /></span>
                <span className="flex-1 hidden md:block"><SortHeader col="co2PerKg" label="CO₂ kg" /></span>
                <span className="flex-1 hidden lg:block"><SortHeader col="circularityScore" label="Circularity" /></span>
                <span className="flex-none w-5" />
              </div>

              {filtered.map((mat) => (
                <MaterialRow key={mat.id} mat={mat} />
              ))}
            </div>
          )}
        </>
      )}

      {tab === "requests" && (
        <RequestsTab onMutated={refresh} />
      )}

      {/* Add material slide-over */}
      {addOpen && (
        <AddMaterialPanel
          onClose={() => setAddOpen(false)}
          onSaved={() => { setAddOpen(false); refresh(); }}
        />
      )}
    </div>
  );
}
