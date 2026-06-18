"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MonoId } from "@/components/shared/mono-id";
import { useConsumerAuth } from "@/context/consumer-auth";
import { QR_ITEMS, PRODUCTS } from "@/lib/mock/products";
import { BRANDS } from "@/lib/mock/brands";
import { OWNERSHIP_EVENTS } from "@/lib/mock/ownership";

// ─── Shell ────────────────────────────────────────────────────────────────────

function TransferShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b bg-background sticky top-0 z-10">
        <div className="mx-auto max-w-lg px-4 h-12 flex items-center gap-3">
          <Link href="/consumer/dashboard" className="text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <Link href="/" className="flex items-center gap-2 mx-auto">
            <div className="h-6 w-6 rounded-md bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-[10px] tracking-tight">K4</span>
            </div>
            <span className="font-semibold text-sm text-foreground">K4RL</span>
          </Link>
          <span className="w-4" />
        </div>
      </header>
      <main className="flex-1 mx-auto w-full max-w-lg px-4 py-8 pb-16">
        {children}
      </main>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function TransferPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { user } = useConsumerAuth();

  const [decision, setDecision] = useState<"approved" | "rejected" | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!user) router.replace("/consumer/auth/login");
  }, [user, router]);

  if (!user) return null;

  const item = QR_ITEMS.find((i) => i.id === id);
  if (!item) {
    return (
      <TransferShell>
        <p className="text-sm text-muted-foreground text-center mt-16">Item not found.</p>
      </TransferShell>
    );
  }

  const product = PRODUCTS.find((p) => p.id === item.productId);
  const brand = product ? BRANDS.find((b) => b.id === product.brandId) : null;

  const isOwner = item.ownerEmail?.toLowerCase() === user.email.toLowerCase();

  if (!isOwner) {
    return (
      <TransferShell>
        <div className="text-center space-y-3 mt-16">
          <p className="font-medium">Access denied</p>
          <p className="text-sm text-muted-foreground">You are not the owner of this item.</p>
          <Button asChild variant="outline">
            <Link href="/consumer/dashboard">Go to dashboard</Link>
          </Button>
        </div>
      </TransferShell>
    );
  }

  if (item.state !== "transfer-requested") {
    return (
      <TransferShell>
        <div className="text-center space-y-3 mt-16">
          <p className="font-medium">No pending transfer</p>
          <p className="text-sm text-muted-foreground">There is no active transfer request for this item.</p>
          <Button asChild variant="outline">
            <Link href={`/consumer/item/${item.id}`}>Back to item</Link>
          </Button>
        </div>
      </TransferShell>
    );
  }

  async function handleDecision(choice: "approved" | "rejected") {
    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 700));

    const now = new Date().toISOString();

    if (choice === "approved") {
      item!.state = "claimed";
      item!.ownerEmail = item!.transferRequesterEmail;
      item!.transferRequestedAt = undefined;
      item!.transferRequesterEmail = undefined;
      OWNERSHIP_EVENTS.push({
        id: `evt-${Date.now()}`,
        itemId: item!.id,
        type: "transfer-approved",
        actorEmail: user!.email,
        timestamp: now,
      });
    } else {
      item!.state = "claimed";
      item!.transferRequestedAt = undefined;
      item!.transferRequesterEmail = undefined;
      OWNERSHIP_EVENTS.push({
        id: `evt-${Date.now()}`,
        itemId: item!.id,
        type: "transfer-rejected",
        actorEmail: user!.email,
        timestamp: now,
      });
    }

    setDecision(choice);
    setSubmitting(false);
  }

  // ── Success screen ──

  if (decision) {
    const approved = decision === "approved";
    return (
      <TransferShell>
        <div className="space-y-8">
          <div className="text-center space-y-3 mt-8">
            <div className={`mx-auto h-14 w-14 rounded-full flex items-center justify-center ${approved ? "bg-emerald-500/10" : "bg-muted"}`}>
              {approved
                ? <CheckCircle2 className="h-7 w-7 text-emerald-500" />
                : <XCircle className="h-7 w-7 text-muted-foreground" />
              }
            </div>
            <h1 className="text-xl font-semibold text-foreground">
              {approved ? "Transfer approved" : "Transfer rejected"}
            </h1>
            <p className="text-sm text-muted-foreground">
              {approved
                ? `Ownership has been transferred to ${item.ownerEmail}.`
                : "The transfer request has been declined. You remain the owner."}
            </p>
          </div>
          <Button asChild className="w-full" size="lg">
            <Link href="/consumer/dashboard">Back to dashboard</Link>
          </Button>
        </div>
      </TransferShell>
    );
  }

  // ── Review screen ──

  return (
    <TransferShell>
      <div className="space-y-6">
        <div className="space-y-1.5">
          <h1 className="text-xl font-semibold text-foreground">Transfer request</h1>
          <p className="text-sm text-muted-foreground">
            Review and approve or reject the ownership transfer.
          </p>
        </div>

        {/* Item summary */}
        <section className="rounded-xl border bg-card overflow-hidden">
          <div className="px-5 py-4 border-b">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Item</p>
          </div>
          <div className="px-5 py-4 space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Product</span>
              <span className="font-medium">{product?.name}</span>
            </div>
            {brand && (
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Brand</span>
                <span className="font-medium">{brand.name}</span>
              </div>
            )}
            <div className="flex items-start justify-between gap-3">
              <span className="text-muted-foreground shrink-0">Item code</span>
              <MonoId value={item.qrCode} />
            </div>
          </div>
        </section>

        {/* Request details */}
        <section className="rounded-xl border bg-card overflow-hidden">
          <div className="px-5 py-4 border-b">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Request details</p>
          </div>
          <div className="px-5 py-4 space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Requested by</span>
              <span className="font-medium">{item.transferRequesterEmail}</span>
            </div>
            {item.transferRequestedAt && (
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Requested</span>
                <span className="font-medium">
                  {new Date(item.transferRequestedAt).toLocaleDateString("en-GB", {
                    day: "numeric", month: "short", year: "numeric",
                  })}
                </span>
              </div>
            )}
          </div>
        </section>

        <p className="text-xs text-muted-foreground">
          Approving this transfer will permanently move ownership to the requester.
          This action cannot be undone.
        </p>

        <div className="space-y-3">
          <Button
            onClick={() => handleDecision("approved")}
            className="w-full"
            size="lg"
            disabled={submitting}
          >
            <CheckCircle2 className="mr-2 h-4 w-4" />
            {submitting ? "Processing…" : "Approve transfer"}
          </Button>
          <Button
            onClick={() => handleDecision("rejected")}
            variant="outline"
            className="w-full"
            size="lg"
            disabled={submitting}
          >
            <XCircle className="mr-2 h-4 w-4" />
            Reject transfer
          </Button>
        </div>
      </div>
    </TransferShell>
  );
}
