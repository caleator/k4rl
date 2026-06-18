"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, Home } from "lucide-react";
import { cn } from "@/lib/utils";

const SEGMENT_LABELS: Record<string, string> = {
  admin: "Admin",
  brand: "Brand",
  consumer: "Consumer",
  public: "Public",
  factory: "Factory",
  dashboard: "Dashboard",
  materials: "Material library",
  requests: "Requests",
  brands: "Brands",
  analytics: "Analytics",
  products: "Products",
  new: "New",
  batches: "QR & claim code pairs",
  factories: "Factories",
  resellers: "Resellers",
  disputes: "Disputes",
  team: "Team",
  billing: "Billing",
  wardrobe: "Wardrobe",
  scan: "Scan",
  claim: "Claim",
  transfer: "Transfer",
  auth: "Auth",
  login: "Sign in",
  register: "Register",
  upload: "Upload certificates",
  labels: "Download labels",
};

function labelForSegment(segment: string): string {
  return SEGMENT_LABELS[segment] ?? segment;
}

export function Breadcrumbs() {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);

  // Only render breadcrumbs at 3+ levels deep
  if (segments.length < 2) return null;

  const crumbs = segments.map((segment, i) => {
    const href = "/" + segments.slice(0, i + 1).join("/");
    const isLast = i === segments.length - 1;
    const label = labelForSegment(segment);

    return { href, label, isLast };
  });

  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-1 text-sm text-muted-foreground">
      <Link href="/" className="hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm">
        <Home className="h-3.5 w-3.5" />
        <span className="sr-only">Home</span>
      </Link>
      {crumbs.map(({ href, label, isLast }) => (
        <span key={href} className="flex items-center gap-1">
          <ChevronRight className="h-3.5 w-3.5 shrink-0" />
          {isLast ? (
            <span className="text-foreground font-medium">{label}</span>
          ) : (
            <Link
              href={href}
              className="hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm"
            >
              {label}
            </Link>
          )}
        </span>
      ))}
    </nav>
  );
}
