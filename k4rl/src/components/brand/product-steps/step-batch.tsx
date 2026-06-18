"use client";

import { useState } from "react";
import { QrCode, Loader2, CheckCircle2, Send, ArrowRight } from "lucide-react";
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
import { BATCHES } from "@/lib/mock/products";
import type { Batch } from "@/lib/mock/products";
import { cn } from "@/lib/utils";

type Stage = "configure" | "generating" | "done";

interface Props {
  productId: string;
  brandId: string;
  onDone: () => void;
}

export function StepBatch({ productId, brandId, onDone }: Props) {
  const [stage, setStage] = useState<Stage>("configure");
  const [quantity, setQuantity] = useState<string>("");
  const [quantityError, setQuantityError] = useState<string | null>(null);
  const [factoryOpen, setFactoryOpen] = useState(false);
  const [selectedFactoryId, setSelectedFactoryId] = useState<string | null>(null);
  const [createdBatch, setCreatedBatch] = useState<Batch | null>(null);

  const brandFactories = FACTORIES.filter(f => f.brandId === brandId);
  const selectedFactory = brandFactories.find(f => f.id === selectedFactoryId) ?? null;

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
      status: selectedFactory ? "dispatched" : "ready",
      createdAt: new Date().toISOString(),
      ...(selectedFactory ? { factoryLinkSentAt: new Date().toISOString() } : {}),
    };
    BATCHES.push(batch);
    setCreatedBatch(batch);
    setStage("done");
  }

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="space-y-1">
        <h2 className="text-base font-semibold">Generate QR & claim code pairs</h2>
        <p className="text-sm text-muted-foreground">
          Create a batch of unique QR + claim code pairs for this product. Each item gets its own code.
        </p>
      </div>

      {stage === "configure" && (
        <div className="space-y-5">
          {/* Quantity */}
          <div className="space-y-2">
            <Label htmlFor="step-batch-quantity">Number of items</Label>
            <Input
              id="step-batch-quantity"
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
              Items start in production state — not visible to consumers until released.
            </p>
          </div>

          {/* Factory */}
          <div className="space-y-2">
            <Label>Send labels to factory</Label>
            {brandFactories.length === 0 ? (
              <p className="text-sm text-muted-foreground rounded-md border border-dashed px-3 py-3">
                No factories added yet. Generate the batch now and send labels later from the product page.
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
                                setSelectedFactoryId(selectedFactoryId === f.id ? null : f.id);
                                setFactoryOpen(false);
                              }}
                            >
                              <span className={cn(
                                "mr-2 h-3.5 w-3.5 rounded-full border",
                                selectedFactoryId === f.id ? "bg-primary border-primary" : "border-muted-foreground"
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
                    : "Skip this to dispatch labels later from the product page."}
                </p>
              </>
            )}
          </div>

          <div className="flex gap-2">
            <Button variant="outline" className="flex-1" onClick={onDone}>
              Skip for now
            </Button>
            <Button className="flex-1" onClick={handleGenerate}>
              <QrCode className="h-4 w-4" />
              Generate batch
            </Button>
          </div>
        </div>
      )}

      {stage === "generating" && (
        <div className="flex flex-col items-center gap-4 py-10">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Generating pairs…</p>
        </div>
      )}

      {stage === "done" && createdBatch && (
        <div className="space-y-4">
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
              {selectedFactory && (
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Send className="h-3 w-3" />
                  <span>Label link sent to {selectedFactory.email}</span>
                </div>
              )}
            </div>
          </div>

          <Button className="w-full" onClick={onDone}>
            <ArrowRight className="h-4 w-4" />
            View product
          </Button>
        </div>
      )}
    </div>
  );
}
