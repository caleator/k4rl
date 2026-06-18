"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowRight, Package, LogOut, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MonoId } from "@/components/shared/mono-id";
import { useConsumerAuth } from "@/context/consumer-auth";
import { QR_ITEMS, PRODUCTS } from "@/lib/mock/products";
import { BRANDS } from "@/lib/mock/brands";
import { OWNERSHIP_EVENTS } from "@/lib/mock/ownership";

// ─── Dashboard shell with header ─────────────────────────────────────────────

function DashboardShell({ children, onLogout }: { children: React.ReactNode; onLogout: () => void }) {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b bg-background sticky top-0 z-10">
        <div className="mx-auto max-w-lg px-4 h-12 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="h-6 w-6 rounded-md bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-[10px] tracking-tight">K4</span>
            </div>
            <span className="font-semibold text-sm text-foreground">K4RL</span>
          </Link>
          <button
            onClick={onLogout}
            className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            <LogOut className="h-3.5 w-3.5" />
            Sign out
          </button>
        </div>
      </header>
      <main className="flex-1 mx-auto w-full max-w-lg px-4 py-8">
        {children}
      </main>
    </div>
  );
}

// ─── Item state label ─────────────────────────────────────────────────────────

function ItemStateLabel({ state }: { state: string }) {
  const config: Record<string, { label: string; className: string }> = {
    claimed:              { label: "Owned",            className: "text-emerald-600 dark:text-emerald-400 bg-emerald-500/10" },
    "transfer-requested": { label: "Transfer pending", className: "text-amber-600 dark:text-amber-400 bg-amber-500/10" },
    "re-locked":          { label: "Released",         className: "text-muted-foreground bg-muted" },
    transferred:          { label: "Transferred",      className: "text-muted-foreground bg-muted" },
  };
  const { label, className } = config[state] ?? { label: state, className: "text-muted-foreground bg-muted" };
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${className}`}>
      {label}
    </span>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const router = useRouter();
  const { user, logout } = useConsumerAuth();

  useEffect(() => {
    if (!user) router.replace("/consumer/auth/login");
  }, [user, router]);

  if (!user) return null;

  // Items currently owned by this user
  const ownedItems = QR_ITEMS.filter(
    (item) =>
      item.ownerEmail?.toLowerCase() === user.email.toLowerCase() &&
      item.state !== "locked" &&
      item.state !== "unlocked"
  );

  // Items previously owned (user has a "claimed" event but is no longer the owner)
  const previouslyOwnedIds = new Set(
    OWNERSHIP_EVENTS
      .filter((e) => e.type === "claimed" && e.actorEmail?.toLowerCase() === user.email.toLowerCase())
      .map((e) => e.itemId)
  );
  const previousItems = QR_ITEMS.filter(
    (item) =>
      previouslyOwnedIds.has(item.id) &&
      item.ownerEmail?.toLowerCase() !== user.email.toLowerCase()
  );

  // Pending transfer requests submitted by this user (72h window, not yet approved/rejected)
  const pendingItems = QR_ITEMS.filter((item) => {
    if (item.state !== "transfer-requested") return false;
    if (item.transferRequesterEmail?.toLowerCase() !== user.email.toLowerCase()) return false;
    if (item.transferRequestedAt) {
      const expiresAt = new Date(item.transferRequestedAt).getTime() + 72 * 60 * 60 * 1000;
      if (Date.now() > expiresAt) return false;
    }
    return true;
  });

  const myItems = [...ownedItems, ...previousItems];

  function handleLogout() {
    logout();
    router.push("/consumer/auth/login");
  }

  return (
    <DashboardShell onLogout={handleLogout}>
      <div className="space-y-6">
        <div>
          <h1 className="text-xl font-semibold text-foreground">My products</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Welcome back, {user.name.split(" ")[0]}</p>
        </div>

        {/* Pending transfer requests */}
        {pendingItems.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Clock className="h-3.5 w-3.5 text-amber-500" />
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Pending requests</p>
            </div>
            <div className="space-y-2">
              {pendingItems.map((item) => {
                const product = PRODUCTS.find((p) => p.id === item.productId);
                const brand = product ? BRANDS.find((b) => b.id === product.brandId) : null;
                return (
                  <div
                    key={item.id}
                    className="flex items-center gap-4 rounded-xl border bg-amber-500/5 border-amber-200 dark:border-amber-900 px-5 py-4"
                  >
                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-medium text-foreground truncate">{product?.name ?? item.qrCode}</p>
                        <ItemStateLabel state="transfer-requested" />
                      </div>
                      <p className="text-xs text-muted-foreground">{brand?.name}</p>
                      <MonoId value={item.qrCode} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Owned and previously owned */}
        {myItems.length === 0 && pendingItems.length === 0 ? (
          <div className="rounded-xl border border-dashed px-6 py-12 text-center space-y-3">
            <Package className="h-8 w-8 text-muted-foreground mx-auto" />
            <div>
              <p className="font-medium text-foreground">No products yet</p>
              <p className="text-sm text-muted-foreground mt-1">
                Scan a product QR code to activate ownership.
              </p>
            </div>
          </div>
        ) : myItems.length > 0 ? (
          <div className="space-y-3">
            {myItems.map((item) => {
              const product = PRODUCTS.find((p) => p.id === item.productId);
              const brand = product ? BRANDS.find((b) => b.id === product.brandId) : null;
              const isPreviouslyOwned = previousItems.includes(item);
              const displayState = isPreviouslyOwned ? "transferred" : item.state;
              return (
                <Link
                  key={item.id}
                  href={`/consumer/item/${item.id}`}
                  className="flex items-center gap-4 rounded-xl border bg-card px-5 py-4 hover:bg-accent/30 transition-colors group"
                >
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-medium text-foreground truncate">{product?.name ?? item.qrCode}</p>
                      <ItemStateLabel state={displayState} />
                    </div>
                    <p className="text-xs text-muted-foreground">{brand?.name}</p>
                    <MonoId value={item.qrCode} />
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0 group-hover:text-foreground transition-colors" />
                </Link>
              );
            })}
          </div>
        ) : null}
      </div>
    </DashboardShell>
  );
}
