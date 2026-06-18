"use client";

import { usePathname } from "next/navigation";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";

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
  if (PAGE_TITLES[pathname]) return PAGE_TITLES[pathname];
  const match = Object.keys(PAGE_TITLES)
    .filter((key) => pathname.startsWith(key + "/"))
    .sort((a, b) => b.length - a.length)[0];
  if (match) return PAGE_TITLES[match];
  const last = pathname.split("/").filter(Boolean).pop() ?? "";
  return last.charAt(0).toUpperCase() + last.slice(1);
}

export function PageHeader() {
  const pathname = usePathname();
  const title = getPageTitle(pathname);

  return (
    <header className="flex h-14 shrink-0 items-center border-b px-6 gap-3">
      {/* Collapse trigger — only visible when sidebar is collapsed (icon mode) */}
      <div className="flex items-center gap-2 md:hidden group-data-[state=collapsed]:flex">
        <SidebarTrigger />
        <Separator orientation="vertical" className="h-4" />
      </div>

      {/* Page title */}
      <span className="font-semibold text-sm flex-1">{title}</span>

      {/* Notifications */}
      <Button variant="ghost" size="icon" aria-label="Notifications">
        <Bell className="h-4 w-4" />
      </Button>
    </header>
  );
}
