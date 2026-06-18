"use client";

import { useState, useRef, useCallback } from "react";
import {
  Plus,
  Trash2,
  AlertCircle,
  ChevronsUpDown,
  Check,
  Clock,
  XCircle,
  ImageIcon,
  Upload,
  Leaf,
  RotateCcw,
  Zap,
  FlaskConical,
  Shield,
  Scissors,
  Layers,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { MATERIALS, MATERIAL_REQUESTS, type MaterialCategory, type MaterialRequest } from "@/lib/mock/materials";
import type { NewProductDraft, CompositionEntry } from "@/lib/types/product";
import { cn } from "@/lib/utils";
import { MaterialRequestDialog } from "@/components/brand/material-request-dialog";

// ─── Material category config ─────────────────────────────────────────────────

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
    icon: Layers,
    color: "text-muted-foreground",
    bg: "bg-muted",
    label: category,
  };
}

// ─── Approved materials ───────────────────────────────────────────────────────

const approvedMaterials = MATERIALS.filter((m) => m.approved);

// ─── Composition ring (SVG) ───────────────────────────────────────────────────

function CompositionRing({ total }: { total: number }) {
  const r = 22;
  const size = 56;
  const cx = size / 2;
  const cy = size / 2;
  const circumference = 2 * Math.PI * r;
  const clamped = Math.min(total, 100);
  const dash = (clamped / 100) * circumference;
  const isComplete = total === 100;
  const isOver = total > 100;

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="-rotate-90"
        style={{ position: "absolute" }}
      >
        {/* Track */}
        <circle
          cx={cx} cy={cy} r={r}
          fill="none"
          strokeWidth={3.5}
          className="stroke-muted"
        />
        {/* Progress */}
        <circle
          cx={cx} cy={cy} r={r}
          fill="none"
          strokeWidth={3.5}
          strokeLinecap="round"
          strokeDasharray={`${dash} ${circumference}`}
          className={cn(
            "transition-all duration-300",
            isOver ? "stroke-destructive" : isComplete ? "stroke-primary" : "stroke-primary/70"
          )}
        />
      </svg>
      {/* Center label */}
      <span
        className={cn(
          "text-xs font-bold tabular-nums leading-none",
          isOver ? "text-destructive" : isComplete ? "text-primary" : "text-foreground"
        )}
        style={{ fontFamily: "var(--font-mono)" }}
      >
        {total}%
      </span>
    </div>
  );
}

// ─── Material visual row (read-only passport view) ────────────────────────────

function MaterialVisualRow({
  entry,
}: {
  entry: CompositionEntry;
  totalPct: number;
}) {
  const isPending = !!entry.pendingRequestId;
  const material = approvedMaterials.find((m) => m.id === entry.materialId);
  const category = material?.category ?? "";
  const style = getCategoryStyle(category);
  const Icon = isPending ? Clock : style.icon;
  const pct = entry.percentage || 0;
  const barWidth = Math.min(pct, 100);

  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-2.5">
        <span className={cn(
          "flex h-6 w-6 shrink-0 items-center justify-center rounded-md",
          isPending ? "bg-amber-500/10" : style.bg,
        )}>
          <Icon className={cn("h-3.5 w-3.5", isPending ? "text-amber-500" : style.color)} />
        </span>
        <span className="flex-1 text-sm font-medium leading-tight">
          {entry.materialName || "—"}
        </span>
        {isPending && (
          <span className="text-[10px] font-medium text-amber-600 dark:text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded-full shrink-0">
            Pending
          </span>
        )}
        <span
          className="text-sm font-bold tabular-nums shrink-0"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          {pct}%
        </span>
      </div>
      <div className="flex items-center gap-2 pl-8">
        <div className="flex-1 h-1 rounded-full bg-muted overflow-hidden">
          <div
            className={cn(
              "h-full rounded-full transition-all duration-500",
              pct > 0 ? (isPending ? "bg-amber-500/50" : "bg-primary/60") : "bg-transparent"
            )}
            style={{ width: `${barWidth}%` }}
          />
        </div>
        {(category || isPending) && (
          <span className="text-[10px] text-muted-foreground shrink-0 leading-none">
            {isPending ? "Pending approval" : style.label}
          </span>
        )}
      </div>
    </div>
  );
}

// ─── Searchable material combobox ─────────────────────────────────────────────

interface MaterialComboboxProps {
  value: string;
  onChange: (materialId: string) => void;
  usedIds: string[];
}

function MaterialCombobox({ value, onChange, usedIds }: MaterialComboboxProps) {
  const [open, setOpen] = useState(false);
  const selected = approvedMaterials.find((m) => m.id === value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          role="combobox"
          aria-expanded={open}
          className={cn(
            "flex w-full items-center justify-between rounded-md border bg-background px-3 py-2 text-sm transition-colors",
            "hover:bg-muted/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
            !selected && "text-muted-foreground"
          )}
        >
          <div className="flex items-center gap-2 min-w-0 text-left overflow-hidden">
            {selected ? (
              <>
                {(() => {
                  const s = getCategoryStyle(selected.category);
                  const Icon = s.icon;
                  return (
                    <span className={cn("flex h-5 w-5 shrink-0 items-center justify-center rounded", s.bg)}>
                      <Icon className={cn("h-3 w-3", s.color)} />
                    </span>
                  );
                })()}
                <span className="font-medium truncate">{selected.name}</span>
                <span className="text-xs text-muted-foreground shrink-0">{selected.category}</span>
              </>
            ) : (
              <span>Select a material…</span>
            )}
          </div>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-40" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="start">
        <Command>
          <CommandInput placeholder="Search materials…" />
          <CommandList>
            <CommandEmpty>No material found.</CommandEmpty>
            <CommandGroup>
              {approvedMaterials.map((m) => {
                const isUsed = usedIds.includes(m.id) && m.id !== value;
                const s = getCategoryStyle(m.category);
                const Icon = s.icon;
                return (
                  <CommandItem
                    key={m.id}
                    value={`${m.name} ${m.category}`}
                    disabled={isUsed}
                    onSelect={() => { onChange(m.id); setOpen(false); }}
                    className={cn(isUsed && "opacity-40 cursor-not-allowed")}
                  >
                    <Check className={cn("mr-2 h-4 w-4 shrink-0", value === m.id ? "opacity-100" : "opacity-0")} />
                    <span className={cn("mr-2 flex h-5 w-5 shrink-0 items-center justify-center rounded", s.bg)}>
                      <Icon className={cn("h-3 w-3", s.color)} />
                    </span>
                    <div className="flex flex-col min-w-0">
                      <span className="truncate">{m.name}</span>
                      <span className="text-xs text-muted-foreground">{m.category}</span>
                    </div>
                  </CommandItem>
                );
              })}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

// ─── Material edit row ────────────────────────────────────────────────────────

function MaterialEditRow({
  entry,
  index,
  usedIds,
  onSelect,
  onChangePercent,
  onRemove,
  canRemove,
}: {
  entry: CompositionEntry;
  index: number;
  usedIds: string[];
  onSelect: (id: string) => void;
  onChangePercent: (pct: number) => void;
  onRemove: () => void;
  canRemove: boolean;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const matLabel = entry.materialName || `material ${index + 1}`;

  // For rejected pending entries the remove button must always be visible
  const pendingReq = entry.pendingRequestId
    ? MATERIAL_REQUESTS.find(r => r.id === entry.pendingRequestId)
    : undefined;
  const isRejected = pendingReq?.status === "rejected";
  const effectiveCanRemove = canRemove || isRejected;

  const stepper = (
    <>
      <div className="flex items-center rounded-md border overflow-hidden shrink-0">
        <button
          type="button"
          aria-label={`Decrease percentage for ${matLabel}`}
          onClick={() => onChangePercent(Math.max(1, (entry.percentage || 0) - 5))}
          className="flex h-9 w-7 items-center justify-center text-muted-foreground hover:bg-muted transition-colors text-sm select-none"
        >−</button>
        <input
          ref={inputRef}
          type="number"
          min={1}
          max={100}
          value={entry.percentage || ""}
          onChange={(e) => onChangePercent(parseInt(e.target.value) || 0)}
          onFocus={() => inputRef.current?.select()}
          placeholder="0"
          className="w-10 border-x bg-background py-2 text-center text-sm font-mono font-semibold focus:outline-none focus:ring-2 focus:ring-inset focus:ring-ring"
          aria-label={`Percentage for ${matLabel}`}
        />
        <button
          type="button"
          aria-label={`Increase percentage for ${matLabel}`}
          onClick={() => onChangePercent(Math.min(100, (entry.percentage || 0) + 5))}
          className="flex h-9 w-7 items-center justify-center text-muted-foreground hover:bg-muted transition-colors text-sm select-none"
        >+</button>
      </div>
      <span className="text-xs text-muted-foreground shrink-0" aria-hidden="true">%</span>
      {effectiveCanRemove ? (
        <button
          type="button"
          aria-label={`Remove ${matLabel}`}
          onClick={onRemove}
          className="shrink-0 text-muted-foreground/50 hover:text-destructive transition-colors"
        >
          <Trash2 className="h-4 w-4" aria-hidden="true" />
        </button>
      ) : (
        <div className="w-4 shrink-0" aria-hidden="true" />
      )}
    </>
  );

  if (entry.pendingRequestId) {
    return (
      <div className="flex items-center gap-2">
        <div className={cn(
          "flex-1 min-w-0 flex items-center gap-2.5 rounded-md border px-3 py-2",
          isRejected ? "border-destructive/30 bg-destructive/5" : "border-amber-500/30 bg-amber-500/5"
        )}>
          {isRejected ? (
            <XCircle className="h-4 w-4 text-destructive shrink-0" />
          ) : (
            <Clock className="h-4 w-4 text-amber-500/70 shrink-0" />
          )}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{entry.materialName}</p>
            <p className={cn("text-[10px]", isRejected ? "text-destructive" : "text-amber-600 dark:text-amber-400")}>
              {isRejected
                ? (pendingReq?.rejectionReason ? `Rejected: ${pendingReq.rejectionReason}` : "Rejected — remove and replace")
                : "Pending admin approval"}
            </p>
          </div>
        </div>
        {stepper}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 min-w-0">
        <MaterialCombobox value={entry.materialId} onChange={onSelect} usedIds={usedIds} />
      </div>
      {stepper}
    </div>
  );
}

// ─── Gallery panel (right side) ───────────────────────────────────────────────

function GalleryPanel({
  draft,
  onChange,
}: {
  draft: NewProductDraft;
  onChange: (partial: Partial<NewProductDraft>) => void;
}) {
  // Merge thumbnail + gallery into one local list; index 0 = thumbnail
  const [images, setImages] = useState<string[]>(() => {
    const raw = [draft.thumbnail, ...(draft.gallery ?? [])].filter(Boolean) as string[];
    return [...new Set(raw)];
  });
  const [selectedIdx, setSelectedIdx] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dragRef = useRef(false);

  const mainImage = images[selectedIdx] ?? images[0] ?? null;

  function sync(next: string[]) {
    setImages(next);
    onChange({ thumbnail: next[0], gallery: next.slice(1) });
  }

  function addFiles(files: FileList | null) {
    if (!files) return;
    const newUrls = Array.from(files)
      .filter((f) => f.type.startsWith("image/"))
      .slice(0, 6 - images.length)
      .map((f) => URL.createObjectURL(f));
    if (newUrls.length) {
      const next = [...images, ...newUrls];
      sync(next);
      setSelectedIdx(next.length - 1);
    }
  }

  function removeImage(i: number) {
    const next = images.filter((_, idx) => idx !== i);
    sync(next);
    setSelectedIdx(Math.min(selectedIdx, Math.max(0, next.length - 1)));
  }

  const atCap = images.length >= 6;

  return (
    <div className="flex flex-col h-full bg-muted/20">
      {/* Main image display */}
      <div className="relative bg-muted/30 overflow-hidden" style={{ height: 260 }}>
        {mainImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={mainImage}
            alt="Product"
            className="h-full w-full object-contain"
          />
        ) : (
          /* Drop zone */
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            onDragOver={(e) => { e.preventDefault(); dragRef.current = true; }}
            onDrop={(e) => {
              e.preventDefault();
              dragRef.current = false;
              addFiles(e.dataTransfer.files);
            }}
            className="flex h-full w-full flex-col items-center justify-center gap-3 text-muted-foreground transition-colors hover:bg-muted/40"
          >
            <div className="flex h-14 w-14 items-center justify-center rounded-full border-2 border-dashed border-muted-foreground/30">
              <Upload className="h-6 w-6 opacity-40" />
            </div>
            <div className="text-center space-y-1">
              <p className="text-sm font-medium">Add product photos</p>
              <p className="text-xs text-muted-foreground/70">Drag & drop or click to browse</p>
            </div>
          </button>
        )}

        {/* Main image label */}
        {mainImage && selectedIdx === 0 && (
          <span className="absolute top-3 left-3 rounded-md bg-black/50 px-2 py-1 text-[10px] font-semibold uppercase tracking-widest text-white">
            Thumbnail
          </span>
        )}

        {/* Remove main image button */}
        {mainImage && (
          <button
            type="button"
            onClick={() => removeImage(selectedIdx)}
            className="absolute top-3 right-3 flex h-7 w-7 items-center justify-center rounded-full bg-black/50 text-white opacity-70 hover:opacity-100 transition-opacity"
            aria-label="Remove image"
          >
            <span className="text-xs leading-none">✕</span>
          </button>
        )}
      </div>

      {/* Thumbnail strip */}
      <div className="flex items-center gap-2 border-t bg-background/60 px-4 py-3 overflow-x-auto">
        {images.map((src, i) => (
          <button
            key={src + i}
            type="button"
            onClick={() => setSelectedIdx(i)}
            className={cn(
              "relative h-14 w-14 shrink-0 overflow-hidden rounded-md border-2 transition-all",
              selectedIdx === i
                ? "border-primary shadow-sm"
                : "border-transparent opacity-60 hover:opacity-100"
            )}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={src} alt={`Photo ${i + 1}`} className="h-full w-full object-cover" />
          </button>
        ))}

        {/* Add tile */}
        {!atCap && (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex h-14 w-14 shrink-0 items-center justify-center rounded-md border-2 border-dashed border-muted-foreground/20 text-muted-foreground hover:border-muted-foreground/40 hover:bg-muted/30 transition-colors"
            aria-label="Add photo"
          >
            <Plus className="h-4 w-4" />
          </button>
        )}

        {images.length === 0 && (
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <ImageIcon className="h-3.5 w-3.5" />
            No photos yet
          </div>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        className="sr-only"
        onChange={(e) => addFiles(e.target.files)}
        onClick={(e) => { (e.target as HTMLInputElement).value = ""; }}
      />
    </div>
  );
}

// ─── DNA panel (left side) ────────────────────────────────────────────────────

function DnaPanel({
  draft,
  onChange,
  onBack,
  onNext,
}: {
  draft: NewProductDraft;
  onChange: (partial: Partial<NewProductDraft>) => void;
  onBack: () => void;
  onNext: () => void;
}) {
  const [requestOpen, setRequestOpen] = useState(false);
  const [error, setError] = useState("");

  const total = draft.composition.reduce((s, c) => s + (c.percentage || 0), 0);
  const isComplete = total === 100;
  const usedIds = draft.composition.map((c) => c.materialId).filter(Boolean);
  const filled = draft.composition.filter((c) => (c.materialId || c.pendingRequestId) && c.percentage > 0);

  function addMaterial() {
    onChange({ composition: [...draft.composition, { materialId: "", materialName: "", percentage: 0 }] });
    setError("");
  }

  function updateEntry(index: number, partial: Partial<CompositionEntry>) {
    onChange({ composition: draft.composition.map((c, i) => i === index ? { ...c, ...partial } : c) });
  }

  function removeEntry(index: number) {
    onChange({ composition: draft.composition.filter((_, i) => i !== index) });
  }

  function selectMaterial(index: number, materialId: string) {
    const mat = approvedMaterials.find((m) => m.id === materialId);
    if (!mat) return;
    updateEntry(index, { materialId: mat.id, materialName: mat.name });
  }

  function handleRequestSubmitted(req: MaterialRequest) {
    onChange({
      composition: [
        ...draft.composition,
        { materialId: "", materialName: req.materialName, percentage: 0, pendingRequestId: req.id },
      ],
    });
  }

  function handleNext() {
    if (draft.composition.length === 0) { setError("Add at least one material."); return; }
    const hasEmpty = draft.composition.some((c) => !c.materialId && !c.pendingRequestId);
    if (hasEmpty) { setError("Select a material for each row, or remove empty rows."); return; }
    const hasRejected = draft.composition.some(c => {
      if (!c.pendingRequestId) return false;
      const req = MATERIAL_REQUESTS.find(r => r.id === c.pendingRequestId);
      return req?.status === "rejected";
    });
    if (hasRejected) { setError("Some materials were rejected. Remove them and select approved replacements."); return; }
    if (!isComplete) { setError(`Composition must total 100%. Currently ${total}%.`); return; }
    setError("");
    onNext();
  }

  return (
    <div className="flex flex-col h-full border-r bg-card">
      {/* ── Product header ── */}
      <div className="px-6 py-5 border-b">
        <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-muted-foreground mb-2">
          Product DNA
        </p>
        {draft.name ? (
          <h2 className="text-lg font-semibold leading-snug">{draft.name}</h2>
        ) : (
          <h2 className="text-lg font-semibold text-muted-foreground/40 italic">Untitled product</h2>
        )}
        <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5">
          {draft.category && (
            <span className="inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
              {draft.category}
            </span>
          )}
          {draft.countryOfManufacture && (
            <span className="text-xs text-muted-foreground">
              Made in {draft.countryOfManufacture}
            </span>
          )}
          {draft.weightGrams && (
            <span className="text-xs text-muted-foreground">· {draft.weightGrams}g</span>
          )}
        </div>
      </div>

      {/* ── Composition editor + calculator ── */}
      <div className="px-6 py-5 border-b space-y-4 flex-1 overflow-y-auto">
        {/* Calculator: ring + status */}
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-muted-foreground">
              Composition
            </p>
            <p
              role="status"
              aria-live="polite"
              className={cn(
                "mt-1 text-xs",
                isComplete ? "text-primary font-medium" : total > 100 ? "text-destructive" : "text-muted-foreground"
              )}
            >
              {isComplete
                ? "100% · Complete"
                : total > 100
                ? `${total}% · ${total - 100}% over limit`
                : total > 0
                ? `${total}% · ${100 - total}% remaining`
                : "No materials added"}
            </p>
          </div>
          <CompositionRing total={total} />
        </div>

        {/* ── Editor ── */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="flex-1 h-px bg-border" />
            <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-muted-foreground px-1">
              Edit
            </p>
            <div className="flex-1 h-px bg-border" />
          </div>

          {draft.composition.length === 0 ? (
            <p className="text-xs text-muted-foreground text-center py-2">
              No materials yet.
            </p>
          ) : (
            <div className="space-y-3">
              {draft.composition.map((entry, i) => (
                <fieldset key={i} className="border-0 p-0 m-0 min-w-0">
                  <legend className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground mb-1.5">
                    Material {i + 1}
                  </legend>
                  <MaterialEditRow
                    entry={entry}
                    index={i}
                    usedIds={usedIds}
                    onSelect={(id) => selectMaterial(i, id)}
                    onChangePercent={(pct) => updateEntry(i, { percentage: pct })}
                    onRemove={() => removeEntry(i)}
                    canRemove={draft.composition.length > 1}
                  />
                </fieldset>
              ))}
            </div>
          )}

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addMaterial}
            className="w-full border-dashed text-xs h-8"
          >
            <Plus className="h-3.5 w-3.5" />
            Add material
          </Button>

          <p className="text-xs text-muted-foreground text-center">
            Not in the list?{" "}
            <button
              type="button"
              className="underline underline-offset-2 hover:text-foreground transition-colors"
              onClick={() => setRequestOpen(true)}
            >
              Submit a request
            </button>
          </p>
        </div>
      </div>

      {/* ── Pending materials notice ── */}
      {filled.some((c) => c.pendingRequestId) && (
        <div className="mx-6 mb-2 rounded-md border border-amber-500/30 bg-amber-500/5 px-3 py-2.5 flex items-start gap-2">
          <Clock className="h-3.5 w-3.5 text-amber-500 mt-0.5 shrink-0" />
          <p className="text-xs text-amber-700 dark:text-amber-300 leading-relaxed">
            Some materials are pending K4RL approval. The product will stay in draft until all materials are approved. You can still proceed to review.
          </p>
        </div>
      )}

      {/* ── Validation + Navigation ── */}
      <div className="px-6 py-4 border-t space-y-3 shrink-0">
        {error && (
          <div className="flex items-center gap-2 text-xs text-destructive">
            <AlertCircle className="h-3.5 w-3.5 shrink-0" />
            {error}
          </div>
        )}
        <div className="flex gap-2">
          <Button variant="outline" onClick={onBack} className="flex-1">
            Back
          </Button>
          <Button onClick={handleNext} className="flex-1">
            Continue to review
          </Button>
        </div>
      </div>

      <MaterialRequestDialog
        open={requestOpen}
        onOpenChange={setRequestOpen}
        onSubmitted={handleRequestSubmitted}
      />
    </div>
  );
}

// ─── Main step export ─────────────────────────────────────────────────────────

export function StepMaterials({
  draft,
  onChange,
  onBack,
  onNext,
}: {
  draft: NewProductDraft;
  onChange: (partial: Partial<NewProductDraft>) => void;
  onBack: () => void;
  onNext: () => void;
}) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_260px] min-h-[600px]">
      {/* Left — DNA panel */}
      <DnaPanel
        draft={draft}
        onChange={onChange}
        onBack={onBack}
        onNext={onNext}
      />

      {/* Right — Gallery panel */}
      <GalleryPanel draft={draft} onChange={onChange} />
    </div>
  );
}
