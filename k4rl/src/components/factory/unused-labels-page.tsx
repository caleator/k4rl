"use client";

import { useState, useMemo } from "react";
import { Search, CheckCircle2, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { MonoId } from "@/components/shared/mono-id";
import { FactoryContextHeader } from "./factory-context-header";
import { cn } from "@/lib/utils";

interface LabelItem {
  id: string;
  qrCode: string;
  state: "locked" | "unlocked" | "claimed" | "transfer-requested";
}

interface UnusedLabelsPageProps {
  brandName: string;
  factoryName: string;
  contextSentence: string;
  productName: string;
  batchId: string;
  totalQuantity: number;
  items: LabelItem[];
}

type PageState = "idle" | "submitting" | "success";

const STATE_LABEL: Record<LabelItem["state"], string> = {
  locked: "Not activated",
  unlocked: "Activated",
  claimed: "Claimed",
  "transfer-requested": "Transfer pending",
};

// Only locked items can be cancelled — others are already in use
function isCancellable(state: LabelItem["state"]) {
  return state === "locked";
}

export function UnusedLabelsPage({
  brandName,
  factoryName,
  contextSentence,
  productName,
  batchId,
  totalQuantity,
  items,
}: UnusedLabelsPageProps) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState("");
  const [pageState, setPageState] = useState<PageState>("idle");

  const cancellable = items.filter((i) => isCancellable(i.state));

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return cancellable.filter(
      (i) => !q || i.qrCode.toLowerCase().includes(q)
    );
  }, [cancellable, search]);

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function toggleAll() {
    if (selected.size === filtered.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(filtered.map((i) => i.id)));
    }
  }

  async function handleSubmit() {
    if (!selected.size) return;
    setPageState("submitting");
    await new Promise((r) => setTimeout(r, 1600));
    setPageState("success");
  }

  if (pageState === "success") {
    return (
      <>
        <FactoryContextHeader
          brandName={brandName}
          factoryName={factoryName}
          contextSentence={contextSentence}
        />
        <main className="mx-auto max-w-2xl px-4 py-16 sm:px-6 text-center">
          <div className="flex justify-center mb-4">
            <CheckCircle2 className="h-12 w-12 text-primary" />
          </div>
          <h1 className="text-xl font-semibold text-foreground mb-2">
            {selected.size} label{selected.size !== 1 ? "s" : ""} reported as unused
          </h1>
          <p className="text-sm text-muted-foreground">
            {brandName} has been notified. These labels will be cancelled and cannot be activated. You can close this page.
          </p>
        </main>
      </>
    );
  }

  const allFilteredSelected =
    filtered.length > 0 && filtered.every((i) => selected.has(i.id));

  return (
    <>
      <FactoryContextHeader
        brandName={brandName}
        factoryName={factoryName}
        contextSentence={contextSentence}
      />

      <main className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
        <div className="mb-6">
          <h1 className="text-xl font-semibold text-foreground">Report unused labels</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Select the labels that were not used. Only unactivated labels can be cancelled —
            labels that have already been activated or claimed are shown as read-only.
          </p>
        </div>

        {/* Batch summary */}
        <div className="mb-5 flex flex-wrap gap-4 text-sm">
          <div>
            <span className="text-muted-foreground">Product </span>
            <span className="font-medium text-foreground">{productName}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Batch </span>
            <MonoId value={batchId} />
          </div>
          <div>
            <span className="text-muted-foreground">Total issued </span>
            <span className="font-medium text-foreground">{totalQuantity.toLocaleString()}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Cancellable </span>
            <span className="font-medium text-foreground">{cancellable.length}</span>
          </div>
        </div>

        {cancellable.length === 0 ? (
          <Card className="shadow-none">
            <CardContent className="flex items-center gap-3 py-6 px-4">
              <AlertTriangle className="h-5 w-5 shrink-0 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                All labels in this batch have already been activated or claimed. There is nothing to cancel.
              </p>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Search + select all */}
            <div className="mb-3 flex items-center gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                <Input
                  placeholder="Search by QR code…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9"
                />
              </div>
              <button
                type="button"
                onClick={toggleAll}
                className="shrink-0 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                {allFilteredSelected ? "Deselect all" : "Select all"}
              </button>
            </div>

            {/* Label list */}
            <Card className="shadow-none">
              <CardContent className="p-0">
                {filtered.length === 0 ? (
                  <p className="px-4 py-6 text-center text-sm text-muted-foreground">
                    No labels match your search.
                  </p>
                ) : (
                  <ul role="list" className="divide-y">
                    {filtered.map((item) => {
                      const isSelected = selected.has(item.id);
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
                              onChange={() => toggle(item.id)}
                              className="h-4 w-4 accent-primary"
                              aria-label={`Mark ${item.qrCode} as unused`}
                            />
                            <MonoId value={item.qrCode} className="flex-1" />
                            <span className="text-xs text-muted-foreground">
                              {STATE_LABEL[item.state]}
                            </span>
                          </label>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </CardContent>
            </Card>

            {/* Footer actions */}
            <div className="mt-6 flex items-center gap-4">
              <Button
                onClick={handleSubmit}
                disabled={selected.size === 0 || pageState === "submitting"}
                variant="destructive"
              >
                {pageState === "submitting"
                  ? "Submitting…"
                  : `Cancel ${selected.size > 0 ? `${selected.size} ` : ""}label${selected.size !== 1 ? "s" : ""}`}
              </Button>
              {selected.size > 0 && (
                <span className="text-sm text-muted-foreground">
                  {selected.size} of {cancellable.length} selected
                </span>
              )}
            </div>
          </>
        )}
      </main>
    </>
  );
}
