"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowUpDown, FileText, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { StatusDot } from "@/components/shared/status-dot";
import { EcoScoreBadge } from "@/components/shared/eco-score-badge";
import { MonoId } from "@/components/shared/mono-id";
import { EmptyState } from "@/components/shared/empty-state";
import { PRODUCTS, BATCHES } from "@/lib/mock/products";
import { useAuth } from "@/context/auth";
import { cn } from "@/lib/utils";

type SortKey = "name" | "generatedAt" | "ecoScore";
type SortDir = "asc" | "desc";

function SortButton({ label, sortKey, active, dir, onSort }: {
  label: string;
  sortKey: SortKey;
  active: boolean;
  dir: SortDir;
  onSort: (k: SortKey) => void;
}) {
  return (
    <button
      onClick={() => onSort(sortKey)}
      className={cn(
        "inline-flex items-center gap-1 text-xs font-medium transition-colors",
        active ? "text-foreground" : "text-muted-foreground hover:text-foreground"
      )}
    >
      {label}
      <ArrowUpDown className={cn("h-3 w-3", active && "text-primary")} />
      {active && <span className="text-[10px] text-muted-foreground">{dir === "asc" ? "↑" : "↓"}</span>}
    </button>
  );
}

export default function DppsPage() {
  const { user } = useAuth();
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("generatedAt");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  const dpps = PRODUCTS.filter(
    p => p.brandId === user.brandId && p.dppStatus === "generated"
  );

  function handleSort(key: SortKey) {
    if (sortKey === key) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortKey(key); setSortDir("desc"); }
  }

  const filtered = dpps
    .filter(p => {
      if (!search) return true;
      const q = search.toLowerCase();
      return p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q);
    })
    .sort((a, b) => {
      let cmp = 0;
      if (sortKey === "name") cmp = a.name.localeCompare(b.name);
      if (sortKey === "generatedAt") cmp = (a.dppGeneratedAt ?? "").localeCompare(b.dppGeneratedAt ?? "");
      if (sortKey === "ecoScore") cmp = (a.ecoScore ?? -1) - (b.ecoScore ?? -1);
      return sortDir === "asc" ? cmp : -cmp;
    });

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="flex items-center gap-3">
        <Input
          placeholder="Search product name or SKU…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="max-w-xs"
        />
        <span className="text-sm text-muted-foreground">
          {dpps.length === 0
            ? "No DPPs generated yet"
            : filtered.length === dpps.length
              ? `${dpps.length} DPP${dpps.length !== 1 ? "s" : ""}`
              : `${filtered.length} of ${dpps.length} shown`}
        </span>
      </div>

      {dpps.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="No DPPs yet"
          description="Generate a DPP from a product to see it here."
          action={{ label: "Go to products", href: "/brand/products" }}
        />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={Search}
          title="No results"
          description="No DPPs match your search."
          action={{ label: "Clear search", onClick: () => setSearch("") }}
        />
      ) : (
        <div className="rounded-md border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 border-b sticky top-0">
              <tr>
                <th className="text-left px-4 py-3 font-medium w-12" />
                <th className="text-left px-4 py-3 font-medium">
                  <SortButton label="Product" sortKey="name" active={sortKey === "name"} dir={sortDir} onSort={handleSort} />
                </th>
                <th className="text-left px-4 py-3 font-medium hidden md:table-cell">SKU</th>
                <th className="text-left px-4 py-3 font-medium hidden lg:table-cell">
                  <SortButton label="Generated" sortKey="generatedAt" active={sortKey === "generatedAt"} dir={sortDir} onSort={handleSort} />
                </th>
                <th className="text-left px-4 py-3 font-medium hidden lg:table-cell">QR items</th>
                <th className="text-left px-4 py-3 font-medium">
                  <SortButton label="Eco-score" sortKey="ecoScore" active={sortKey === "ecoScore"} dir={sortDir} onSort={handleSort} />
                </th>
                <th className="text-right px-4 py-3 font-medium" />
              </tr>
            </thead>
            <tbody className="divide-y">
              {filtered.map(product => {
                const batchQr = BATCHES
                  .filter(b => b.productId === product.id && b.status !== "cancelled")
                  .reduce((sum, b) => sum + b.quantity, 0);

                return (
                  <tr
                    key={product.id}
                    className="hover:bg-muted/30 transition-colors cursor-pointer"
                    onClick={() => window.location.href = `/brand/dpps/${product.id}`}
                  >
                    <td className="px-4 py-3">
                      {product.thumbnail ? (
                        <img
                          src={product.thumbnail}
                          alt=""
                          className="w-10 h-10 rounded-md object-cover bg-muted"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-md bg-muted" />
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-medium">{product.name}</p>
                      <p className="text-xs text-muted-foreground">{product.category}</p>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <MonoId value={product.sku} />
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell text-muted-foreground">
                      {product.dppGeneratedAt
                        ? new Date(product.dppGeneratedAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })
                        : "—"}
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell text-muted-foreground tabular-nums">
                      {batchQr > 0 ? batchQr.toLocaleString() : "—"}
                    </td>
                    <td className="px-4 py-3">
                      {product.ecoScore !== undefined && product.ecoGrade
                        ? <EcoScoreBadge score={product.ecoScore} grade={product.ecoGrade} />
                        : <span className="text-muted-foreground">—</span>}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Button size="sm" variant="ghost" asChild onClick={e => e.stopPropagation()}>
                        <Link href={`/brand/dpps/${product.id}`}>
                          View
                        </Link>
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
