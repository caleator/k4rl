"use client";

import { use, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ArrowRight, CheckCircle2, AlertCircle, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { MonoId } from "@/components/shared/mono-id";
import { QR_ITEMS, PRODUCTS } from "@/lib/mock/products";
import { BRANDS } from "@/lib/mock/brands";
import { OWNERSHIP_EVENTS } from "@/lib/mock/ownership";
import { FRAUD_REPORTS } from "@/lib/mock/disputes";
import { useConsumerAuth } from "@/context/consumer-auth";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function normalizeClaimCode(raw: string): string {
  return raw.trim().toUpperCase().replace(/\s/g, "");
}

// ─── Layout shell ─────────────────────────────────────────────────────────────

function ClaimShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b bg-background sticky top-0 z-10">
        <div className="mx-auto max-w-lg px-4 h-12 flex items-center justify-center">
          <Link href="/" className="flex items-center gap-2">
            <div className="h-6 w-6 rounded-md bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-[10px] tracking-tight">K4</span>
            </div>
            <span className="font-semibold text-sm text-foreground">K4RL</span>
          </Link>
        </div>
      </header>
      <main className="flex-1 mx-auto w-full max-w-lg px-4 py-8">
        {children}
      </main>
    </div>
  );
}

// ─── Step indicator ───────────────────────────────────────────────────────────

function StepDots({ current, total }: { current: number; total: number }) {
  return (
    <div className="flex items-center justify-center gap-1.5 mb-8">
      {Array.from({ length: total }, (_, i) => (
        <span
          key={i}
          className={
            i + 1 === current
              ? "h-2 w-4 rounded-full bg-primary"
              : i + 1 < current
              ? "h-2 w-2 rounded-full bg-primary/40"
              : "h-2 w-2 rounded-full bg-muted"
          }
        />
      ))}
    </div>
  );
}

// ─── Success screen ───────────────────────────────────────────────────────────

import type { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";

function SuccessScreen({
  product,
  brand,
  item,
  effectiveEmail,
  qrCode,
  isLoggedIn,
  router,
}: {
  product: import("@/lib/mock/products").Product;
  brand: import("@/lib/mock/brands").Brand | null;
  item: import("@/lib/mock/products").QrItem;
  effectiveEmail: string;
  qrCode: string;
  isLoggedIn: boolean;
  router: AppRouterInstance;
}) {
  useEffect(() => {
    if (isLoggedIn) {
      const t = setTimeout(() => router.push("/consumer/dashboard"), 1800);
      return () => clearTimeout(t);
    }
  }, [isLoggedIn, router]);

  return (
    <ClaimShell>
      <div className="space-y-8">
        <StepDots current={3} total={3} />
        <div className="text-center space-y-3">
          <div className="mx-auto h-14 w-14 rounded-full bg-emerald-500/10 flex items-center justify-center">
            <CheckCircle2 className="h-7 w-7 text-emerald-500" />
          </div>
          <h1 className="text-xl font-semibold text-foreground">Ownership confirmed</h1>
          <p className="text-sm text-muted-foreground">
            You&apos;re now the registered owner of this item.
          </p>
        </div>

        <div className="rounded-xl border bg-card px-5 py-4 space-y-3 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Product</span>
            <span className="font-medium">{product.name}</span>
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
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Registered to</span>
            <span className="font-medium">{effectiveEmail}</span>
          </div>
        </div>

        <div className="space-y-3">
          {isLoggedIn ? (
            <Button asChild className="w-full" size="lg">
              <Link href="/consumer/dashboard">View my collection</Link>
            </Button>
          ) : (
            <>
              <Button asChild className="w-full" size="lg">
                <Link href="/consumer/auth/register">Create account to manage ownership</Link>
              </Button>
              <Button asChild variant="outline" className="w-full">
                <Link href="/consumer/auth/login">Sign in to existing account</Link>
              </Button>
            </>
          )}
          <Button asChild variant="ghost" className="w-full text-muted-foreground">
            <Link href={`/product/${encodeURIComponent(qrCode)}`}>View product passport</Link>
          </Button>
        </div>
      </div>
    </ClaimShell>
  );
}

// ─── Already-claimed fraud flag screen ────────────────────────────────────────

function AlreadyClaimedScreen({ qrCode, userEmail }: { qrCode: string; userEmail?: string }) {
  const [email, setEmail] = useState(userEmail ?? "");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [formError, setFormError] = useState("");

  const item = QR_ITEMS.find((i) => i.qrCode === qrCode);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) { setFormError("Email is required."); return; }
    if (!description.trim()) { setFormError("Please describe what happened."); return; }
    setFormError("");
    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 600));

    if (item) {
      FRAUD_REPORTS.push({
        id: `dispute-${Date.now()}`,
        itemId: item.id,
        reporterEmail: email.trim(),
        description: description.trim(),
        submittedAt: new Date().toISOString(),
        status: "open",
      });
    }

    setSubmitting(false);
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <ClaimShell>
        <div className="text-center space-y-4 mt-16">
          <div className="mx-auto h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center">
            <ShieldAlert className="h-7 w-7 text-primary" />
          </div>
          <h1 className="text-xl font-semibold text-foreground">Report received</h1>
          <p className="text-sm text-muted-foreground max-w-xs mx-auto">
            We&apos;ve logged your report. If we need more information, we&apos;ll contact you at {email}.
          </p>
          <Button asChild variant="outline" className="mt-4">
            <Link href={`/product/${encodeURIComponent(qrCode)}`}>View product</Link>
          </Button>
        </div>
      </ClaimShell>
    );
  }

  return (
    <ClaimShell>
      <div className="space-y-8 mt-4">
        <div className="text-center space-y-2">
          <div className="mx-auto h-12 w-12 rounded-full bg-muted flex items-center justify-center">
            <CheckCircle2 className="h-6 w-6 text-muted-foreground" />
          </div>
          <h1 className="text-xl font-semibold text-foreground">This item is already claimed</h1>
          <p className="text-sm text-muted-foreground">
            Ownership has already been registered for this item.
          </p>
          <Button variant="ghost" size="sm" asChild className="text-muted-foreground">
            <Link href={`/product/${encodeURIComponent(qrCode)}`}>
              <ArrowLeft className="mr-1.5 h-3.5 w-3.5" />
              View product
            </Link>
          </Button>
        </div>

        <div className="rounded-xl border border-destructive/30 bg-destructive/5 px-5 py-5 space-y-4">
          <div className="flex items-start gap-3">
            <ShieldAlert className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-foreground">Think this was claimed without your authorisation?</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Submit a report and we&apos;ll investigate. You don&apos;t need an account.
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="fraud-email">Your email address</Label>
              <Input
                id="fraud-email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setFormError(""); }}
                required
                disabled={!!userEmail}
              />
              {userEmail && (
                <p className="text-xs text-muted-foreground">Using your signed-in email.</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="fraud-description">What happened?</Label>
              <Textarea
                id="fraud-description"
                placeholder="Describe the situation — when you purchased the item, why you believe the claim was unauthorised, and any other relevant details."
                value={description}
                onChange={(e) => { setDescription(e.target.value); setFormError(""); }}
                rows={4}
                required
              />
            </div>

            {formError && (
              <p className="text-sm text-destructive flex items-center gap-1.5">
                <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                {formError}
              </p>
            )}

            <Button type="submit" variant="destructive" className="w-full" disabled={submitting}>
              {submitting ? "Submitting…" : "Submit fraud report"}
            </Button>
          </form>
        </div>
      </div>
    </ClaimShell>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ClaimPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const qrCode = decodeURIComponent(id);
  const router = useRouter();
  const { user } = useConsumerAuth();

  const item = QR_ITEMS.find((i) => i.qrCode === qrCode);
  const product = item ? PRODUCTS.find((p) => p.id === item.productId) : null;
  const brand = product ? BRANDS.find((b) => b.id === product.brandId) : null;

  const [step, setStep] = useState(1);
  const [email, setEmail] = useState(user?.email ?? "");
  const [claimCode, setClaimCode] = useState("");
  const [claimError, setClaimError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Pre-fill email if user is already logged in
  const effectiveEmail = user?.email ?? email;

  // ── Step 3: Success — checked before item state guards so the just-completed
  //    claim (which mutated item.state to "claimed") still reaches this branch.

  if (step === 3) {
    return (
      <SuccessScreen
        product={product!}
        brand={brand ?? null}
        item={item!}
        effectiveEmail={effectiveEmail}
        qrCode={qrCode}
        isLoggedIn={!!user}
        router={router}
      />
    );
  }

  if (!item || !product) {
    return (
      <ClaimShell>
        <div className="text-center space-y-3 mt-16">
          <AlertCircle className="h-10 w-10 text-muted-foreground mx-auto" />
          <p className="text-sm text-muted-foreground">This item could not be found.</p>
          <Button variant="outline" asChild>
            <Link href="/">Go home</Link>
          </Button>
        </div>
      </ClaimShell>
    );
  }

  if (item.state === "claimed") {
    return <AlreadyClaimedScreen qrCode={qrCode} userEmail={user?.email} />;
  }

  if (item.state !== "unlocked" && item.state !== "re-locked") {
    return (
      <ClaimShell>
        <div className="text-center space-y-3 mt-16">
          <AlertCircle className="h-10 w-10 text-muted-foreground mx-auto" />
          <p className="font-medium">Item not available for claim</p>
          <p className="text-sm text-muted-foreground">
            This item is in state "{item.state}" and cannot be claimed right now.
          </p>
          <Button variant="outline" asChild>
            <Link href={`/product/${encodeURIComponent(qrCode)}`}>View product</Link>
          </Button>
        </div>
      </ClaimShell>
    );
  }

  // ── Step 1: Email entry ────────────────────────────────────────────────────

  function handleEmailNext(e: React.FormEvent) {
    e.preventDefault();
    setStep(2);
  }

  // ── Step 2: Claim code entry ───────────────────────────────────────────────

  async function handleClaimSubmit(e: React.FormEvent) {
    e.preventDefault();
    setClaimError("");

    const entered = normalizeClaimCode(claimCode);
    const expected = item!.claimCode.toUpperCase().replace(/\s/g, "");

    if (entered !== expected) {
      setClaimError("That claim code doesn't match. Check the code printed on your label.");
      return;
    }

    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 600));

    // Mutate in-memory (session-scoped)
    item!.state = "claimed";
    item!.ownerEmail = effectiveEmail;
    item!.claimedAt = new Date().toISOString();

    // Append ownership event
    OWNERSHIP_EVENTS.push({
      id: `evt-${Date.now()}`,
      itemId: item!.id,
      type: "claimed",
      actorEmail: effectiveEmail,
      timestamp: new Date().toISOString(),
    });

    setSubmitting(false);
    setStep(3);
  }

  // ── Step 1 ─────────────────────────────────────────────────────────────────

  if (step === 1) {
    return (
      <ClaimShell>
        <div className="space-y-8">
          <StepDots current={1} total={3} />

          <div className="space-y-1.5">
            <h1 className="text-xl font-semibold text-foreground">Activate your product</h1>
            <p className="text-sm text-muted-foreground">
              {brand?.name} · {product.name}
            </p>
          </div>

          {user ? (
            <div className="rounded-xl border bg-card px-5 py-4 space-y-1">
              <p className="text-xs text-muted-foreground">Registering to</p>
              <p className="text-sm font-medium">{user.email}</p>
            </div>
          ) : (
            <form onSubmit={handleEmailNext} className="space-y-5">
              <div className="space-y-1.5">
                <Label htmlFor="email">Your email address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoFocus
                />
                <p className="text-xs text-muted-foreground">
                  Ownership will be linked to this email.
                </p>
              </div>

              <Button type="submit" className="w-full" size="lg">
                Continue
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </form>
          )}

          {user && (
            <Button onClick={() => setStep(2)} className="w-full" size="lg">
              Continue
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          )}

          <p className="text-xs text-center text-muted-foreground">
            Already have an account?{" "}
            <Link href="/consumer/auth/login" className="underline underline-offset-4 text-foreground">
              Sign in
            </Link>
          </p>
        </div>
      </ClaimShell>
    );
  }

  // ── Step 2 ─────────────────────────────────────────────────────────────────

  return (
    <ClaimShell>
      <div className="space-y-8">
        <StepDots current={2} total={3} />

        <div>
          <button
            onClick={() => setStep(1)}
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back
          </button>
          <h1 className="text-xl font-semibold text-foreground">Enter your claim code</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Find the code printed on the label inside your product.
          </p>
        </div>

        <form onSubmit={handleClaimSubmit} className="space-y-5">
          <div className="space-y-1.5">
            <Label htmlFor="claimCode">Claim code</Label>
            <Input
              id="claimCode"
              type="text"
              placeholder="e.g. PL2-7QN"
              value={claimCode}
              onChange={(e) => {
                setClaimCode(e.target.value);
                setClaimError("");
              }}
              className="font-mono text-base uppercase tracking-widest"
              required
              autoFocus
              autoCapitalize="characters"
            />
            {claimError && (
              <p className="text-sm text-destructive flex items-center gap-1.5">
                <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                {claimError}
              </p>
            )}
          </div>

          <Button type="submit" className="w-full" size="lg" disabled={submitting}>
            {submitting ? "Verifying…" : "Confirm claim"}
          </Button>
        </form>

        <div className="rounded-xl border bg-muted/30 px-5 py-4 space-y-1.5">
          <p className="text-xs font-medium text-foreground">Where to find the claim code</p>
          <p className="text-xs text-muted-foreground">
            The claim code is a short code (e.g. PL2-7QN) printed on the care label or packaging.
            It's separate from the QR code and hidden inside the garment.
          </p>
        </div>
      </div>
    </ClaimShell>
  );
}
