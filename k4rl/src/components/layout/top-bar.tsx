"use client";

import { usePathname } from "next/navigation";
import { Bell } from "lucide-react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";

const PAGE_TITLES: Record<string, string> = {
  "/brand/dashboard": "Dashboard",
  "/brand/products": "Products",
  "/brand/dpps": "DPPs",
  "/brand/factories": "Factories",
  "/brand/resellers": "Resellers",
  "/brand/billing": "Billing",
  "/brand/settings": "Settings",
  "/admin/dashboard": "Dashboard",
  "/admin/materials": "Material library",
  "/admin/materials/requests": "Material requests",
  "/admin/brands": "Brands",
  "/admin/analytics": "Analytics",
};

function getPageTitle(pathname: string): string {
  // Exact match first
  if (PAGE_TITLES[pathname]) return PAGE_TITLES[pathname];

  // Match by prefix — pick the longest matching key
  const match = Object.keys(PAGE_TITLES)
    .filter((key) => pathname.startsWith(key + "/"))
    .sort((a, b) => b.length - a.length)[0];

  if (match) return PAGE_TITLES[match];

  // Fallback: capitalise last segment
  const last = pathname.split("/").filter(Boolean).pop() ?? "";
  return last.charAt(0).toUpperCase() + last.slice(1);
}

export function TopBar() {
  const pathname = usePathname();
  const title = getPageTitle(pathname);

  return (
    <header className="flex h-14 shrink-0 items-center border-b px-4">
      {/* Left: sidebar trigger + logo */}
      <div className="flex items-center gap-3">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="h-4" />
        <span className="text-sm font-semibold tracking-tight">K4RL</span>
      </div>

      {/* Centre: page title */}
      <div className="flex-1 flex justify-center">
        <span className="text-sm font-medium text-foreground">{title}</span>
      </div>

      {/* Right: notifications bell */}
      <div className="flex items-center">
        <Button variant="ghost" size="icon" aria-label="Notifications">
          <Bell className="h-4 w-4" />
        </Button>
      </div>
    </header>
  );
}
