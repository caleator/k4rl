"use client";

import { useState, useMemo, useRef } from "react";
import {
  Download,
  CheckCircle2,
  Package,
  Hash,
  Layers,
  Camera,
  X,
  Search,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { MonoId } from "@/components/shared/mono-id";
import { FactoryContextHeader } from "./factory-context-header";
import { cn } from "@/lib/utils";

interface BatchDetails {
  productName: string;
  batchId: string;
  quantity: number;
}

export interface LabelItem {
  id: string;
  qrCode: string;
  claimCode: string;
}

interface LabelDownloadPageProps {
  brandName: string;
  factoryName: string;
  contextSentence: string;
  batch: BatchDetails;
  items: LabelItem[];
}

type DownloadState = "idle" | "downloading" | "done";
type CancelState = "idle" | "submitting" | "done";
type Mode = "scan" | "manual";

// ─── Pair display — QR code + claim code stacked ──────────────────────────────

function PairDisplay({ qrCode, claimCode }: { qrCode: string; claimCode: string }) {
  return (
    <div className="flex flex-col gap-0.5">
      <MonoId value={qrCode} />
      <span className="font-mono text-[11px] text-muted-foreground">{claimCode}</span>
    </div>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export function LabelDownloadPage({
  brandName,
  factoryName,
  contextSentence,
  batch,
  items,
}: LabelDownloadPageProps) {
  const [downloadState, setDownloadState] = useState<DownloadState>("idle");
  const [cancelState, setCancelState] = useState<CancelState>("idle");
  const [mode, setMode] = useState<Mode>("scan");

  // Selected pairs keyed by qrCode
  const [selected, setSelected] = useState<Set<string>>(new Set());

  // Scan mode
  const [scanInput, setScanInput] = useState("");
  const [scanError, setScanError] = useState<string | null>(null);
  const scanInputRef = useRef<HTMLInputElement>(null);

  // Manual mode
  const [searchQuery, setSearchQuery] = useState("");

  // Lookup maps for O(1) matching
  const byQr = useMemo(() => new Map(items.map((i) => [i.qrCode.toUpperCase(), i])), [items]);
  const byClaim = useMemo(() => new Map(items.map((i) => [i.claimCode.toUpperCase(), i])), [items]);

  function findPair(raw: string): LabelItem | undefined {
    const code = raw.trim().toUpperCase();
    return byQr.get(code) ?? byClaim.get(code);
  }

  function addScannedCode(raw: string) {
    if (!raw.trim()) return;
    const pair = findPair(raw);
    if (!pair) {
      setScanError("No pair found for this code in the current batch.");
      return;
    }
    setScanError(null);
    setSelected((prev) => new Set([...prev, pair.qrCode]));
    setScanInput("");
    scanInputRef.current?.focus();
  }

  function removeSelected(qrCode: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      next.delete(qrCode);
      return next;
    });
  }

  function toggleManual(qrCode: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(qrCode) ? next.delete(qrCode) : next.add(qrCode);
      return next;
    });
  }

  const filteredItems = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return items;
    return items.filter(
      (i) =>
        i.qrCode.toLowerCase().includes(q) ||
        i.claimCode.toLowerCase().includes(q)
    );
  }, [items, searchQuery]);

  async function handleDownload() {
    setDownloadState("downloading");
    await new Promise((r) => setTimeout(r, 1500));
    setDownloadState("done");
  }

  async function handleCancel() {
    if (!selected.size) return;
    setCancelState("submitting");
    await new Promise((r) => setTimeout(r, 1600));
    setCancelState("done");
  }

  // ── Cancel success screen ────────────────────────────────────────────────────
  if (cancelState === "done") {
    return (
      <>
        <FactoryContextHeader brandName={brandName} factoryName={factoryName} contextSentence={contextSentence} />
        <main className="mx-auto max-w-2xl px-4 py-16 sm:px-6 text-center">
          <CheckCircle2 className="mx-auto mb-4 h-12 w-12 text-primary" />
          <h1 className="text-xl font-semibold text-foreground mb-2">
            {selected.size} pair{selected.size !== 1 ? "s" : ""} cancelled
          </h1>
          <p className="text-sm text-muted-foreground">
            {brandName} has been notified. These QR & claim code pairs are permanently void and cannot be used to claim ownership.
          </p>
        </main>
      </>
    );
  }

  // ── Main page ────────────────────────────────────────────────────────────────
  return (
    <>
      <FactoryContextHeader brandName={brandName} factoryName={factoryName} contextSentence={contextSentence} />

      <main className="mx-auto max-w-2xl px-4 py-10 sm:px-6 space-y-8">

        {/* ── Download section ── */}
        <section>
          <h1 className="text-xl font-semibold text-foreground mb-1">Download labels</h1>
          <p className="text-sm text-muted-foreground mb-5">
            Your print-ready label file is ready. Download and print before dispatch.
          </p>

          <Card className="shadow-none mb-5">
            <CardContent className="p-0">
              <dl className="divide-y">
                <div className="flex items-center gap-3 px-4 py-3">
                  <Package className="h-4 w-4 shrink-0 text-muted-foreground" />
                  <dt className="w-28 shrink-0 text-xs text-muted-foreground">Product</dt>
                  <dd className="text-sm font-medium text-foreground">{batch.productName}</dd>
                </div>
                <div className="flex items-center gap-3 px-4 py-3">
                  <Hash className="h-4 w-4 shrink-0 text-muted-foreground" />
                  <dt className="w-28 shrink-0 text-xs text-muted-foreground">Batch</dt>
                  <dd><MonoId value={batch.batchId} /></dd>
                </div>
                <div className="flex items-center gap-3 px-4 py-3">
                  <Layers className="h-4 w-4 shrink-0 text-muted-foreground" />
                  <dt className="w-28 shrink-0 text-xs text-muted-foreground">Items</dt>
                  <dd className="text-sm font-medium text-foreground">
                    {batch.quantity.toLocaleString()} pairs
                  </dd>
                </div>
              </dl>
            </CardContent>
          </Card>

          <Button onClick={handleDownload} disabled={downloadState === "downloading"} className="w-full sm:w-auto">
            <Download className="mr-2 h-4 w-4" />
            {downloadState === "downloading" ? "Preparing file…" : downloadState === "done" ? "Download again" : "Download labels"}
          </Button>
          {downloadState !== "done" && (
            <p className="mt-3 text-xs text-muted-foreground">
              PDF format, print-ready at 300 dpi. One label per pair, {batch.quantity.toLocaleString()} pages total.
            </p>
          )}
        </section>

        {/* ── Divider ── */}
        <div className="border-t" />

        {/* ── Cancel codes section ── */}
        <section id="cancel-codes">
          <div className="mb-5 flex items-start justify-between gap-4">
            <div>
              <h2 className="text-base font-semibold text-foreground">Cancel unused pairs</h2>
              <p className="mt-0.5 text-sm text-muted-foreground">
                Mark pairs that were not attached to garments. Scan or enter either the QR code or the claim code — both codes in the pair will be permanently cancelled.
              </p>
            </div>
            {selected.size > 0 && (
              <span className="shrink-0 rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
                {selected.size} selected
              </span>
            )}
          </div>

          {/* Segmented control */}
          <div className="mb-5 inline-flex rounded-full bg-muted p-1">
            {(["scan", "manual"] as Mode[]).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => { setMode(m); setScanError(null); }}
                className={cn(
                  "rounded-full px-4 py-1.5 text-sm font-medium transition-all",
                  mode === m
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {m === "scan" ? "Scan codes" : "Select manually"}
              </button>
            ))}
          </div>

          {/* ── Scan mode ── */}
          {mode === "scan" && (
            <div className="space-y-4">
              {/* Camera zone */}
              <div className="flex flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed border-border px-6 py-10 text-center text-muted-foreground">
                <Camera className="h-8 w-8 opacity-40" />
                <p className="text-sm">Point camera at a QR code or claim code to mark the pair as unused</p>
              </div>

              {/* Code input */}
              <div className="space-y-1.5">
                <Input
                  ref={scanInputRef}
                  placeholder="Or type QR code or claim code…"
                  value={scanInput}
                  onChange={(e) => { setScanInput(e.target.value); if (scanError) setScanError(null); }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addScannedCode(scanInput);
                    }
                  }}
                  className={cn(scanError && "border-destructive focus-visible:ring-destructive")}
                />
                {scanError && (
                  <p className="flex items-center gap-1.5 text-xs text-destructive">
                    <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                    {scanError}
                  </p>
                )}
              </div>

              {/* Scanned pairs */}
              {selected.size > 0 && (
                <Card className="shadow-none">
                  <CardContent className="p-0">
                    <ul role="list" className="divide-y">
                      {[...selected].map((qrCode) => {
                        const pair = byQr.get(qrCode.toUpperCase());
                        return (
                          <li key={qrCode} className="flex items-center gap-3 px-4 py-3">
                            <div className="flex-1 min-w-0">
                              <PairDisplay
                                qrCode={qrCode}
                                claimCode={pair?.claimCode ?? "—"}
                              />
                            </div>
                            <span className="shrink-0 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                              Marked unused
                            </span>
                            <button
                              type="button"
                              onClick={() => removeSelected(qrCode)}
                              className="shrink-0 text-muted-foreground hover:text-foreground transition-colors"
                              aria-label={`Remove ${qrCode}`}
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {/* ── Manual mode ── */}
          {mode === "manual" && (
            <div className="space-y-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                <Input
                  placeholder="Search by QR code or claim code…"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>

              <Card className="shadow-none">
                <CardContent className="p-0">
                  {filteredItems.length === 0 ? (
                    <p className="px-4 py-6 text-center text-sm text-muted-foreground">
                      No pairs match your search.
                    </p>
                  ) : (
                    <ul role="list" className="divide-y">
                      {filteredItems.map((item) => {
                        const isSelected = selected.has(item.qrCode);
                        return (
                          <li key={item.id}>
                            <label
                              className={cn(
                                "flex cursor-pointer items-center gap-3 px-4 py-3 transition-colors",
                                isSelected ? "bg-primary/5" : "hover:bg-muted/40"
                              )}
                            >
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => toggleManual(item.qrCode)}
                                className="h-4 w-4 accent-primary shrink-0"
                                aria-label={`Mark pair ${item.qrCode} / ${item.claimCode} as unused`}
                              />
                              <div className="flex-1 min-w-0">
                                <PairDisplay qrCode={item.qrCode} claimCode={item.claimCode} />
                              </div>
                            </label>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {/* Footer */}
          <div className="mt-6 flex items-center gap-4">
            <Button
              variant="destructive"
              onClick={handleCancel}
              disabled={selected.size === 0 || cancelState === "submitting"}
            >
              {cancelState === "submitting"
                ? "Cancelling…"
                : `Cancel ${selected.size > 0 ? `${selected.size} ` : ""}pair${selected.size !== 1 ? "s" : ""}`}
            </Button>
            {selected.size > 0 && (
              <span className="text-sm text-muted-foreground">
                {selected.size} pair{selected.size !== 1 ? "s" : ""} selected
              </span>
            )}
          </div>
        </section>

      </main>
    </>
  );
}
