"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Plus, Package, ArrowUpDown, X, ImageIcon, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { StatusDot } from "@/components/shared/status-dot";
import { EcoScoreBadge } from "@/components/shared/eco-score-badge";
import { MonoId } from "@/components/shared/mono-id";
import { EmptyState } from "@/components/shared/empty-state";
import { PRODUCTS } from "@/lib/mock/products";
import { useAuth } from "@/context/auth";
import { cn } from "@/lib/utils";

type SortKey = "name" | "sku" | "createdAt" | "ecoScore";
type SortDir = "asc" | "desc";
type EcoGrade = "A" | "B" | "C" | "D" | "E";

const GRADE_COLORS: Record<EcoGrade, string> = {
  A: "bg-emerald-500/10 text-emerald-700 border-emerald-200 hover:bg-emerald-500/20",
  B: "bg-green-500/10 text-green-700 border-green-200 hover:bg-green-500/20",
  C: "bg-amber-500/10 text-amber-700 border-amber-200 hover:bg-amber-500/20",
  D: "bg-orange-500/10 text-orange-700 border-orange-200 hover:bg-orange-500/20",
  E: "bg-red-500/10 text-red-700 border-red-200 hover:bg-red-500/20",
};

export default function ProductsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [gradeFilter, setGradeFilter] = useState<EcoGrade | "all" | "unscored">("all");
  const [sortKey, setSortKey] = useState<SortKey>("createdAt");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  const effectiveBrandId = user.brandId ?? "brand-001";
  const brandProducts = PRODUCTS.filter((p) => p.brandId === effectiveBrandId);

  // Derive available categories from current brand's products
  const availableCategories = useMemo(() => {
    const cats = [...new Set(brandProducts.map((p) => p.category))].sort();
    return cats;
  }, [brandProducts]);

  const filtered = useMemo(() => {
    let list = brandProducts;

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.sku.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q)
      );
    }

    if (statusFilter !== "all") {
      list = list.filter((p) => p.dppStatus === statusFilter);
    }

    if (categoryFilter !== "all") {
      list = list.filter((p) => p.category === categoryFilter);
    }

    if (gradeFilter === "unscored") {
      list = list.filter((p) => p.ecoGrade === undefined);
    } else if (gradeFilter !== "all") {
      list = list.filter((p) => p.ecoGrade === gradeFilter);
    }

    list = [...list].sort((a, b) => {
      let cmp = 0;
      if (sortKey === "name") cmp = a.name.localeCompare(b.name);
      else if (sortKey === "sku") cmp = a.sku.localeCompare(b.sku);
      else if (sortKey === "createdAt")
        cmp = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      else if (sortKey === "ecoScore")
        cmp = (a.ecoScore ?? -1) - (b.ecoScore ?? -1);
      return sortDir === "asc" ? cmp : -cmp;
    });

    return list;
  }, [brandProducts, search, statusFilter, categoryFilter, gradeFilter, sortKey, sortDir]);

  function toggleSort(key: SortKey) {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortKey(key); setSortDir("asc"); }
  }

  const activeFilterCount = [
    search.trim() ? 1 : 0,
    statusFilter !== "all" ? 1 : 0,
    categoryFilter !== "all" ? 1 : 0,
    gradeFilter !== "all" ? 1 : 0,
  ].reduce((a, b) => a + b, 0);

  function clearFilters() {
    setSearch("");
    setStatusFilter("all");
    setCategoryFilter("all");
    setGradeFilter("all");
  }

  return (
    <div className="space-y-6">
      {/* Page actions */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {brandProducts.length} product{brandProducts.length !== 1 ? "s" : ""}
          {activeFilterCount > 0 && (
            <span className="ml-1.5 text-foreground font-medium">
              · {filtered.length} shown
            </span>
          )}
        </p>
        <Button asChild size="sm">
          <Link href="/brand/products/new">
            <Plus className="h-4 w-4" />
            New product
          </Link>
        </Button>
      </div>

      {/* Filter bar */}
      <div className="rounded-lg border bg-muted/30 p-3 space-y-3">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Filters</span>
          {activeFilterCount > 0 && (
            <span className="ml-auto flex items-center gap-1.5">
              <span className="text-xs text-muted-foreground">{activeFilterCount} active</span>
              <Button variant="ghost" size="sm" onClick={clearFilters} className="h-6 px-2 text-xs text-muted-foreground hover:text-foreground">
                <X className="h-3 w-3 mr-1" />
                Clear
              </Button>
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
          {/* Search */}
          <Input
            placeholder="Search name, SKU, category…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-8 text-sm bg-background"
          />

          {/* DPP status */}
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="h-8 text-sm bg-background">
              <SelectValue placeholder="DPP status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All DPP statuses</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="generated">Generated</SelectItem>
            </SelectContent>
          </Select>

          {/* Category */}
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="h-8 text-sm bg-background">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All categories</SelectItem>
              {availableCategories.map((c) => (
                <SelectItem key={c} value={c}>{c}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Eco-grade */}
          <Select value={gradeFilter} onValueChange={(v) => setGradeFilter(v as typeof gradeFilter)}>
            <SelectTrigger className="h-8 text-sm bg-background">
              <SelectValue placeholder="Eco-grade" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All grades</SelectItem>
              {(["A", "B", "C", "D", "E"] as EcoGrade[]).map((g) => (
                <SelectItem key={g} value={g}>Grade {g}</SelectItem>
              ))}
              <SelectItem value="unscored">Unscored</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Active filter chips */}
        {activeFilterCount > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-0.5">
            {search.trim() && (
              <FilterChip label={`"${search.trim()}"`} onRemove={() => setSearch("")} />
            )}
            {statusFilter !== "all" && (
              <FilterChip
                label={statusFilter === "draft" ? "Draft" : "Generated"}
                onRemove={() => setStatusFilter("all")}
              />
            )}
            {categoryFilter !== "all" && (
              <FilterChip label={categoryFilter} onRemove={() => setCategoryFilter("all")} />
            )}
            {gradeFilter !== "all" && (
              <FilterChip
                label={gradeFilter === "unscored" ? "Unscored" : `Grade ${gradeFilter}`}
                onRemove={() => setGradeFilter("all")}
                grade={gradeFilter !== "unscored" ? gradeFilter : undefined}
              />
            )}
          </div>
        )}
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <EmptyState
          icon={Package}
          title={activeFilterCount > 0 ? "No products match your filters" : "No products yet"}
          description={
            activeFilterCount > 0
              ? "Try adjusting or clearing your filters."
              : "Create your first product to generate a Digital Product Passport."
          }
          action={
            activeFilterCount > 0
              ? { label: "Clear filters", onClick: clearFilters }
              : { label: "New product", href: "/brand/products/new" }
          }
        />
      ) : (
        <div className="rounded-lg border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead>
                  <SortButton label="Product" sortKey="name" current={sortKey} dir={sortDir} onToggle={toggleSort} />
                </TableHead>
                <TableHead>
                  <SortButton label="SKU" sortKey="sku" current={sortKey} dir={sortDir} onToggle={toggleSort} />
                </TableHead>
                <TableHead>Category</TableHead>
                <TableHead>DPP status</TableHead>
                <TableHead>
                  <SortButton label="Eco-score" sortKey="ecoScore" current={sortKey} dir={sortDir} onToggle={toggleSort} />
                </TableHead>
                <TableHead>
                  <SortButton label="Created" sortKey="createdAt" current={sortKey} dir={sortDir} onToggle={toggleSort} />
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((product) => {
                const isDraft = product.dppStatus === "draft";
                return (
                <TableRow
                  key={product.id}
                  className={cn(
                    "cursor-pointer transition-colors",
                    isDraft ? "opacity-60 hover:opacity-90 hover:bg-muted/30" : "hover:bg-muted/50"
                  )}
                  onClick={() => router.push(`/brand/products/${product.id}`)}
                >
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 shrink-0 overflow-hidden rounded-md bg-muted">
                        {product.thumbnail ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={product.thumbnail} alt={product.name} className="h-full w-full object-cover" />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center">
                            <ImageIcon className="h-4 w-4 text-muted-foreground/40" />
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col gap-0.5">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">{product.name || <span className="italic text-muted-foreground">Untitled</span>}</span>
                          {isDraft && (
                            <span className="inline-flex items-center rounded-sm border px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                              Draft
                            </span>
                          )}
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {product.weightGrams ? `${product.weightGrams}g` : ""}
                          {product.weightGrams && product.countryOfManufacture ? " · " : ""}
                          {product.countryOfManufacture}
                        </span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell><MonoId value={product.sku} /></TableCell>
                  <TableCell className="text-sm text-muted-foreground">{product.category}</TableCell>
                  <TableCell><StatusDot status={product.dppStatus} /></TableCell>
                  <TableCell>
                    {product.ecoScore !== undefined && product.ecoGrade ? (
                      <EcoScoreBadge score={product.ecoScore} grade={product.ecoGrade} />
                    ) : (
                      <span className="text-xs text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {new Date(product.createdAt).toLocaleDateString("en-GB", {
                      day: "numeric", month: "short", year: "numeric",
                    })}
                  </TableCell>
                </TableRow>
              ); })}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function SortButton({
  label, sortKey, current, dir, onToggle,
}: {
  label: string;
  sortKey: SortKey;
  current: SortKey;
  dir: SortDir;
  onToggle: (key: SortKey) => void;
}) {
  const active = current === sortKey;
  return (
    <Button
      variant="ghost"
      size="sm"
      className={cn("-ml-3 h-8 font-medium", active && "text-foreground")}
      onClick={() => onToggle(sortKey)}
    >
      {label}
      <ArrowUpDown className={cn("ml-1 h-3.5 w-3.5", active ? "text-foreground" : "text-muted-foreground")} />
    </Button>
  );
}

function FilterChip({
  label, onRemove, grade,
}: {
  label: string;
  onRemove: () => void;
  grade?: EcoGrade;
}) {
  return (
    <span className={cn(
      "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors",
      grade ? GRADE_COLORS[grade] : "bg-background text-foreground border-border"
    )}>
      {label}
      <button type="button" onClick={onRemove} className="ml-0.5 opacity-60 hover:opacity-100 transition-opacity" aria-label={`Remove ${label} filter`}>
        <X className="h-3 w-3" />
      </button>
    </span>
  );
}
