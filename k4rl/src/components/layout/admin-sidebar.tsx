"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, FlaskConical, Building2, BarChart3 } from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarSeparator,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { SidebarUserFooter } from "@/components/layout/sidebar-user-footer";

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
}

type NavEntry = NavItem | "separator";

const ADMIN_NAV: NavEntry[] = [
  { label: "Dashboard",        href: "/admin/dashboard",  icon: LayoutDashboard },
  { label: "Material library", href: "/admin/materials",  icon: FlaskConical },
  "separator",
  { label: "Brands",           href: "/admin/brands",     icon: Building2 },
  { label: "Analytics",        href: "/admin/analytics",  icon: BarChart3 },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="flex flex-row items-center justify-between h-14 px-3 border-b shrink-0">
        <Link
          href="/admin/dashboard"
          className="flex items-center gap-2 group-data-[collapsible=icon]:hidden"
        >
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-primary text-primary-foreground text-xs font-bold">
            K
          </div>
          <span className="font-semibold text-sm tracking-tight">K4RL</span>
        </Link>
        <div className="hidden group-data-[collapsible=icon]:flex flex-col items-center justify-center gap-1.5 w-full">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary text-primary-foreground text-xs font-bold">
            K
          </div>
          <SidebarTrigger />
        </div>
        <SidebarTrigger className="group-data-[collapsible=icon]:hidden" />
      </SidebarHeader>

      <SidebarContent className="pt-2">
        <SidebarGroup>
          <SidebarMenu>
            {ADMIN_NAV.map((entry, i) => {
              if (entry === "separator") {
                return <SidebarSeparator key={`sep-${i}`} className="my-1" />;
              }

              const active =
                pathname === entry.href ||
                pathname.startsWith(entry.href + "/");

              return (
                <SidebarMenuItem key={entry.href}>
                  <SidebarMenuButton asChild isActive={active} tooltip={entry.label}>
                    <Link href={entry.href}>
                      <entry.icon />
                      <span>{entry.label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarUserFooter />
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}
