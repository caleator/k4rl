"use client";

import { ChevronsUpDown, LogOut, RefreshCw } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";
import { useAuth, MOCK_USERS, UserRole } from "@/context/auth";

const ROLE_LABELS: Record<UserRole, string> = {
  "k4rl-admin": "K4RL Admin",
  "brand-admin": "Brand Admin",
  "brand-editor": "Brand Editor",
};

function Initials({ name }: { name: string }) {
  const parts = name.trim().split(" ");
  const initials =
    parts.length >= 2
      ? parts[0][0] + parts[parts.length - 1][0]
      : parts[0].slice(0, 2);
  return <span>{initials.toUpperCase()}</span>;
}

export function SidebarUserFooter() {
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
              {/* Avatar */}
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold">
                <Initials name={user.name} />
              </div>

              {/* Name + brand */}
              <div className="flex flex-col leading-tight group-data-[collapsible=icon]:hidden">
                <span className="text-[13px] font-medium truncate">
                  {user.name}
                </span>
                {user.brandName && (
                  <span className="text-[11px] text-muted-foreground truncate">
                    {user.brandName}
                  </span>
                )}
              </div>

              {/* Selector icon */}
              <ChevronsUpDown className="ml-auto h-4 w-4 shrink-0 text-muted-foreground group-data-[collapsible=icon]:hidden" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>

          <DropdownMenuContent side="top" align="start" className="w-60">
            {/* Current user info */}
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col gap-0.5">
                <span className="text-[13px] font-medium">{user.name}</span>
                <span className="text-[11px] text-muted-foreground">
                  {user.email}
                </span>
              </div>
            </DropdownMenuLabel>

            <DropdownMenuSeparator />

            {/* Dev-only role switcher */}
            <DropdownMenuLabel className="text-[11px] text-muted-foreground font-normal px-2">
              Switch role (dev only)
            </DropdownMenuLabel>
            {MOCK_USERS.map((u) => (
              <DropdownMenuItem
                key={u.role}
                onClick={() => setRole(u.role)}
                className="flex items-center gap-2"
              >
                <RefreshCw className="h-3.5 w-3.5 text-muted-foreground" />
                <div className="flex flex-col leading-tight">
                  <span className="text-[13px]">{ROLE_LABELS[u.role]}</span>
                  <span className="text-[11px] text-muted-foreground">
                    {u.name}
                  </span>
                </div>
                {u.role === user.role && (
                  <span className="ml-auto text-[11px] text-muted-foreground">
                    active
                  </span>
                )}
              </DropdownMenuItem>
            ))}

            <DropdownMenuSeparator />

            <DropdownMenuItem className="text-destructive focus:text-destructive">
              <LogOut className="h-3.5 w-3.5" />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
