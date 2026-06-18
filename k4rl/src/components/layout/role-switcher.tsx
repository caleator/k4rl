"use client";

import { useAuth, MOCK_USERS, UserRole } from "@/context/auth";
import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";
import { Badge } from "@/components/ui/badge";
import { ChevronUp } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const ROLE_LABELS: Record<UserRole, string> = {
  "k4rl-admin": "K4RL Admin",
  "brand-admin": "Brand Admin",
  "brand-editor": "Brand Editor",
};

export function RoleSwitcher() {
  const { user, setRole } = useAuth();

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <div className="flex aspect-square size-8 items-center justify-center rounded-full bg-muted text-xs font-semibold shrink-0">
                {user.name.charAt(0)}
              </div>
              <div className="flex flex-col leading-tight group-data-[collapsible=icon]:hidden">
                <span className="text-sm font-medium truncate">{user.name}</span>
                <span className="text-xs text-muted-foreground">
                  {ROLE_LABELS[user.role]}
                </span>
              </div>
              <ChevronUp className="ml-auto group-data-[collapsible=icon]:hidden" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent side="top" className="w-56">
            <DropdownMenuLabel className="text-xs text-muted-foreground">
              Switch role (dev only)
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            {MOCK_USERS.map((u) => (
              <DropdownMenuItem
                key={u.role}
                onClick={() => setRole(u.role)}
                className="flex items-center justify-between"
              >
                <div className="flex flex-col">
                  <span className="text-sm">{u.name}</span>
                  <span className="text-xs text-muted-foreground">{u.email}</span>
                </div>
                {u.role === user.role && (
                  <Badge variant="secondary" className="text-xs">Active</Badge>
                )}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
