"use client";

import { useState } from "react";
import { QrCode, Loader2, CheckCircle2, Send } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
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
import { MonoId } from "@/components/shared/mono-id";
import { FACTORIES } from "@/lib/mock/factories";
import type { Batch } from "@/lib/mock/products";
import { cn } from "@/lib/utils";

type Stage = "configure" | "generating" | "done";

interface GenerateBatchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  productId: string;
  brandId: string;
  onCreated: (batch: Batch, factoryEmail?: string) => void;
}

export function GenerateBatchDialog({
  open,
  onOpenChange,
  productId,
  brandId,
  onCreated,
}: GenerateBatchDialogProps) {
  const [stage, setStage] = useState<Stage>("configure");
  const [quantity, setQuantity] = useState<string>("");
  const [factoryOpen, setFactoryOpen] = useState(false);
  const [selectedFactoryId, setSelectedFactoryId] = useState<string | null>(null);
  const [createdBatch, setCreatedBatch] = useState<Batch | null>(null);
  const [dispatched, setDispatched] = useState(false);
  const [quantityError, setQuantityError] = useState<string | null>(null);

  const brandFactories = FACTORIES.filter(f => f.brandId === brandId);
  const selectedFactory = brandFactories.find(f => f.id === selectedFactoryId) ?? null;

  function handleOpenChange(next: boolean) {
    if (!next) {
      // reset on close
      setStage("configure");
      setQuantity("");
      setSelectedFactoryId(null);
      setCreatedBatch(null);
      setDispatched(false);
      setQuantityError(null);
    }
    onOpenChange(next);
  }

  function validate(): boolean {
    const n = parseInt(quantity, 10);
    if (!quantity || isNaN(n) || n < 1) {
      setQuantityError("Enter a quantity of at least 1.");
      return false;
    }
    if (n > 10000) {
      setQuantityError("Maximum batch size is 10,000 items.");
      return false;
    }
    setQuantityError(null);
    return true;
  }

  async function handleGenerate() {
    if (!validate()) return;
    setStage("generating");

    await new Promise(r => setTimeout(r, 1500));

    const batch: Batch = {
      id: `batch-${Date.now()}`,
      productId,
      brandId,
      quantity: parseInt(quantity, 10),
      status: "ready",
      createdAt: new Date().toISOString(),
    };
    setCreatedBatch(batch);
    setStage("done");
    onCreated(batch);
  }

  function handleDispatch() {
    if (!createdBatch || !selectedFactory) return;
    const updated: Batch = {
      ...createdBatch,
      status: "dispatched",
      factoryLinkSentAt: new Date().toISOString(),
    };
    setCreatedBatch(updated);
    setDispatched(true);
    onCreated(updated, selectedFactory.email);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Generate QR & claim code pairs</DialogTitle>
        </DialogHeader>

        {stage === "configure" && (
          <div className="space-y-5 pt-1">
            {/* Quantity */}
            <div className="space-y-2">
              <Label htmlFor="batch-quantity">Number of items</Label>
              <Input
                id="batch-quantity"
                type="number"
                min={1}
                max={10000}
                placeholder="e.g. 500"
                value={quantity}
                onChange={e => {
                  setQuantity(e.target.value);
                  if (quantityError) setQuantityError(null);
                }}
              />
              {quantityError && (
                <p className="text-sm text-destructive">{quantityError}</p>
              )}
              <p className="text-xs text-muted-foreground">
                Each item gets a unique QR code and claim code. Items start in production state — not visible to consumers.
              </p>
            </div>

            {/* Factory selector */}
            <div className="space-y-2">
              <Label>Send labels to factory</Label>
              {brandFactories.length === 0 ? (
                <p className="text-sm text-muted-foreground rounded-md border border-dashed px-3 py-3">
                  No factories added yet. Generate the batch now and send labels later from the Factories page.
                </p>
              ) : (
                <>
                  <Popover open={factoryOpen} onOpenChange={setFactoryOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={factoryOpen}
                        className="w-full justify-between font-normal"
                      >
                        {selectedFactory ? (
                          <span>{selectedFactory.name} — {selectedFactory.country}</span>
                        ) : (
                          <span className="text-muted-foreground">Select factory (optional)</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-full p-0" align="start">
                      <Command>
                        <CommandInput placeholder="Search factories…" />
                        <CommandList>
                          <CommandEmpty>No factories found.</CommandEmpty>
                          <CommandGroup>
                            {brandFactories.map(f => (
                              <CommandItem
                                key={f.id}
                                value={`${f.name} ${f.country}`}
                                onSelect={() => {
                                  setSelectedFactoryId(
                                    selectedFactoryId === f.id ? null : f.id
                                  );
                                  setFactoryOpen(false);
                                }}
                              >
                                <span className={cn(
                                  "mr-2 h-3.5 w-3.5 rounded-full border",
                                  selectedFactoryId === f.id
                                    ? "bg-primary border-primary"
                                    : "border-muted-foreground"
                                )} />
                                <span className="flex-1">{f.name}</span>
                                <span className="text-xs text-muted-foreground">{f.country}</span>
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                  <p className="text-xs text-muted-foreground">
                    {selectedFactory
                      ? `A label download link will be sent to ${selectedFactory.email}`
                      : "Skip this to dispatch labels later."}
                  </p>
                </>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-1">
              <Button variant="outline" onClick={() => handleOpenChange(false)}>
                Cancel
              </Button>
              <Button onClick={handleGenerate}>
                <QrCode className="h-4 w-4" />
                Generate
              </Button>
            </div>
          </div>
        )}

        {stage === "generating" && (
          <div className="flex flex-col items-center gap-4 py-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Generating pairs…</p>
          </div>
        )}

        {stage === "done" && createdBatch && (
          <div className="space-y-5 pt-1">
            <div className="flex items-start gap-3 rounded-md bg-muted/50 px-4 py-3">
              <CheckCircle2 className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
              <div className="space-y-1">
                <p className="text-sm font-medium">
                  {createdBatch.quantity.toLocaleString()} pairs generated
                </p>
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <span>Batch</span>
                  <MonoId value={createdBatch.id} />
                </div>
              </div>
            </div>

            {selectedFactory && !dispatched && (
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  Send a label download link to{" "}
                  <span className="font-medium text-foreground">{selectedFactory.name}</span>.
                </p>
                <Button className="w-full" onClick={handleDispatch}>
                  <Send className="h-4 w-4" />
                  Send link to {selectedFactory.email}
                </Button>
              </div>
            )}

            {dispatched && selectedFactory && (
              <div className="rounded-md bg-emerald-500/10 px-4 py-3">
                <p className="text-sm text-emerald-600 dark:text-emerald-400 font-medium">
                  Link sent to {selectedFactory.email}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {selectedFactory.name} can now download the label file.
                </p>
              </div>
            )}

            {!selectedFactory && (
              <p className="text-sm text-muted-foreground">
                No factory selected. You can send labels later from the batch row on this page.
              </p>
            )}

            <div className="flex justify-end">
              <Button variant="outline" onClick={() => handleOpenChange(false)}>
                Close
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
