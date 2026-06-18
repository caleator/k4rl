"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft, ArrowRight, CheckCircle2, Clock, Package,
  ShieldCheck, RotateCcw, AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { MonoId } from "@/components/shared/mono-id";
import { useConsumerAuth } from "@/context/consumer-auth";
import { QR_ITEMS, PRODUCTS } from "@/lib/mock/products";
import { BRANDS } from "@/lib/mock/brands";
import { OWNERSHIP_EVENTS, type OwnershipEventType } from "@/lib/mock/ownership";
import { FRAUD_REPORTS } from "@/lib/mock/disputes";

// ─── Timeline event config ────────────────────────────────────────────────────

const EVENT_CONFIG: Record<OwnershipEventType, { label: string; icon: React.ElementType; color: string }> = {
  manufactured:          { label: "Manufactured",          icon: Package,        color: "text-muted-foreground" },
  unlocked:              { label: "Claim window opened",   icon: Clock,          color: "text-amber-500" },
  claimed:               { label: "Ownership registered",  icon: CheckCircle2,   color: "text-emerald-500" },
  "transfer-requested":  { label: "Transfer requested",    icon: ArrowRight,     color: "text-blue-500" },
  "transfer-approved":   { label: "Transfer approved",     icon: CheckCircle2,   color: "text-emerald-500" },
  "transfer-rejected":   { label: "Transfer rejected",     icon: ArrowLeft,      color: "text-destructive" },
  released:              { label: "Ownership released",    icon: RotateCcw,      color: "text-muted-foreground" },
  "fraud-flagged":       { label: "Flagged for review",    icon: ShieldCheck,    color: "text-destructive" },
};

// ─── Shell ────────────────────────────────────────────────────────────────────

function ItemShell({ children }: { children: React.ReactNode }) {
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
      <main className="flex-1 mx-auto w-full max-w-lg px-4 py-8 space-y-6 pb-16">
        {children}
      </main>
    </div>
  );
}

// ─── Fraud report form ────────────────────────────────────────────────────────

function FraudReportSection({ itemId, userEmail }: { itemId: string; userEmail: string }) {
  const [open, setOpen] = useState(false);
  const [description, setDescription] = useState("");
  const [confirmed, setConfirmed] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Check if already reported by this user
  const alreadyReported = FRAUD_REPORTS.some(
    (r) => r.itemId === itemId && r.reporterEmail.toLowerCase() === userEmail.toLowerCase()
  );

  if (alreadyReported || submitted) {
    return (
      <section className="rounded-xl border bg-muted/30 px-5 py-4 flex items-start gap-3">
        <ShieldCheck className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-medium text-foreground">Report submitted</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            Your report has been submitted. The brand will be in touch directly.
          </p>
        </div>
      </section>
    );
  }

  if (!open) {
    return (
      <section>
        <button
          onClick={() => setOpen(true)}
          className="w-full flex items-center justify-between rounded-xl border border-dashed px-5 py-4 text-left hover:bg-muted/30 transition-colors group"
        >
          <div className="flex items-center gap-3">
            <AlertTriangle className="h-4 w-4 text-muted-foreground shrink-0" />
            <span className="text-sm text-muted-foreground">Something doesn't look right?</span>
          </div>
          <span className="text-xs text-muted-foreground group-hover:text-foreground transition-colors">
            Report an issue
          </span>
        </button>
      </section>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!confirmed || !description.trim()) return;
    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 600));

    // Append to in-memory disputes
    FRAUD_REPORTS.push({
      id: `dispute-${Date.now()}`,
      itemId,
      reporterEmail: userEmail,
      description: description.trim(),
      submittedAt: new Date().toISOString(),
      status: "open",
    });

    // Append to ownership timeline
    OWNERSHIP_EVENTS.push({
      id: `evt-${Date.now()}`,
      itemId,
      type: "fraud-flagged",
      actorEmail: userEmail,
      timestamp: new Date().toISOString(),
      note: "Fraud report submitted by previous owner.",
    });

    setSubmitting(false);
    setSubmitted(true);
  }

  return (
    <section className="rounded-xl border border-destructive/30 bg-destructive/5 overflow-hidden">
      <div className="px-5 py-4 border-b border-destructive/20">
        <p className="text-sm font-semibold text-foreground flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-destructive shrink-0" />
          Report an issue
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          If you believe this item was transferred without your authorisation, submit a report. The brand will review it and contact you directly.
        </p>
      </div>
      <form onSubmit={handleSubmit} className="px-5 py-4 space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="fraud-desc">Describe the issue</Label>
          <Textarea
            id="fraud-desc"
            placeholder="e.g. I never approved a transfer of this item. It appears to be owned by someone else."
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />
        </div>

        <label className="flex items-start gap-2.5 cursor-pointer">
          <input
            type="checkbox"
            className="mt-0.5 h-4 w-4 rounded border-input accent-primary"
            checked={confirmed}
            onChange={(e) => setConfirmed(e.target.checked)}
            required
          />
          <span className="text-xs text-muted-foreground leading-relaxed">
            I confirm this report is accurate to the best of my knowledge.
          </span>
        </label>

        <div className="flex gap-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setOpen(false)}
            className="flex-1"
            disabled={submitting}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            size="sm"
            variant="destructive"
            className="flex-1"
            disabled={submitting || !confirmed || !description.trim()}
          >
            {submitting ? "Submitting…" : "Submit report"}
          </Button>
        </div>
      </form>
    </section>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ItemDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { user } = useConsumerAuth();

  useEffect(() => {
    if (!user) router.replace("/consumer/auth/login");
  }, [user, router]);

  if (!user) return null;

  const item = QR_ITEMS.find((i) => i.id === id);
  if (!item) {
    return (
      <ItemShell>
        <p className="text-sm text-muted-foreground text-center mt-16">Item not found.</p>
      </ItemShell>
    );
  }

  const product = PRODUCTS.find((p) => p.id === item.productId);
  const brand = product ? BRANDS.find((b) => b.id === product.brandId) : null;

  const events = OWNERSHIP_EVENTS
    .filter((e) => e.itemId === item.id)
    .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

  const isCurrentOwner = item.ownerEmail?.toLowerCase() === user.email.toLowerCase();

  // Was this user ever the owner? (has a "claimed" event with their email)
  const wasPreviousOwner = !isCurrentOwner && events.some(
    (e) => e.type === "claimed" && e.actorEmail?.toLowerCase() === user.email.toLowerCase()
  );

  return (
    <ItemShell>
      {/* ── Identity ── */}
      <section className="space-y-1.5">
        <p className="text-xs text-muted-foreground">{brand?.name}</p>
        <h1 className="text-xl font-semibold text-foreground">{product?.name ?? item.qrCode}</h1>
        <MonoId value={item.qrCode} />
      </section>

      {/* ── Previously owned banner ── */}
      {wasPreviousOwner && (
        <section className="rounded-xl border border-amber-200 dark:border-amber-900 bg-amber-500/5 px-5 py-4 flex items-start gap-3">
          <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-foreground">Previously owned by you</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              This item is no longer registered in your name.
            </p>
          </div>
        </section>
      )}

      {/* ── Item details ── */}
      <section className="rounded-xl border bg-card overflow-hidden">
        <div className="px-5 py-4 border-b">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Item details</p>
        </div>
        <div className="px-5 py-4 space-y-2 text-sm">
          {product && (
            <>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">SKU</span>
                <MonoId value={product.sku} />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Category</span>
                <span className="font-medium">{product.category}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Origin</span>
                <span className="font-medium">{product.countryOfManufacture}</span>
              </div>
            </>
          )}
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Status</span>
            <span className="font-medium capitalize">
              {wasPreviousOwner ? "Transferred" : item.state.replace("-", " ")}
            </span>
          </div>
          {item.claimedAt && (
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">
                {wasPreviousOwner ? "You claimed" : "Claimed"}
              </span>
              <span className="font-medium">
                {new Date(item.claimedAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
              </span>
            </div>
          )}
        </div>
      </section>

      {/* ── Transfer CTA (for current owner with pending request) ── */}
      {isCurrentOwner && item.state === "transfer-requested" && item.transferRequesterEmail && (
        <section className="rounded-xl border border-amber-200 dark:border-amber-900 bg-amber-500/5 px-5 py-5 space-y-3">
          <div>
            <p className="text-sm font-semibold text-foreground">Transfer request pending</p>
            <p className="text-xs text-muted-foreground mt-1">
              {item.transferRequesterEmail} has requested ownership of this item.
            </p>
          </div>
          <Button asChild size="sm" className="w-full">
            <Link href={`/consumer/transfer/${item.id}`}>Review transfer request</Link>
          </Button>
        </section>
      )}

      {/* ── View DPP ── */}
      <section>
        <Button asChild variant="outline" className="w-full">
          <Link href={`/product/${encodeURIComponent(item.qrCode)}`}>
            View product passport
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </section>

      {/* ── Ownership timeline ── */}
      <section className="rounded-xl border bg-card overflow-hidden">
        <div className="px-5 py-4 border-b">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Ownership history</p>
        </div>
        <div className="px-5 py-4">
          {events.length === 0 ? (
            <p className="text-sm text-muted-foreground">No events recorded.</p>
          ) : (
            <ol className="relative space-y-0">
              {events.map((evt, idx) => {
                const cfg = EVENT_CONFIG[evt.type] ?? { label: evt.type, icon: Clock, color: "text-muted-foreground" };
                const Icon = cfg.icon;
                const isLast = idx === events.length - 1;
                return (
                  <li key={evt.id} className="flex gap-3 pb-5 last:pb-0 relative">
                    {!isLast && (
                      <span className="absolute left-[13px] top-7 bottom-0 w-px bg-border" />
                    )}
                    <span className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-muted ${cfg.color}`}>
                      <Icon className="h-3.5 w-3.5" />
                    </span>
                    <div className="flex-1 min-w-0 pt-0.5">
                      <p className="text-sm font-medium text-foreground">{cfg.label}</p>
                      {evt.actorEmail && (
                        <p className="text-xs text-muted-foreground mt-0.5">{evt.actorEmail}</p>
                      )}
                      {evt.note && (
                        <p className="text-xs text-muted-foreground mt-0.5">{evt.note}</p>
                      )}
                      <p className="text-[10px] text-muted-foreground mt-1">
                        {new Date(evt.timestamp).toLocaleString("en-GB", {
                          day: "numeric", month: "short", year: "numeric",
                          hour: "2-digit", minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </li>
                );
              })}
            </ol>
          )}
        </div>
      </section>

      {/* ── Fraud report (only if previously owned, no longer owner) ── */}
      {wasPreviousOwner && (
        <FraudReportSection itemId={item.id} userEmail={user.email} />
      )}
    </ItemShell>
  );
}
