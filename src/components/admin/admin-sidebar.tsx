"use client";

import { UserButton } from "@clerk/nextjs";
import { api } from "@cvx/_generated/api";
import { useQuery } from "convex/react";
import { Bell, ChevronDown, LayoutGrid, Users, UsersRound } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo } from "react";
import { useAdmin } from "@/components/admin/admin-context";
import { workspaceDisplayName } from "@/components/admin/campaign-labels";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

const navItems: {
  href: string;
  label: string;
  icon: typeof LayoutGrid;
  active?: boolean;
  disabled?: boolean;
}[] = [
  { href: "/admin", label: "Campaigns", icon: LayoutGrid, active: true },
  {
    href: "#",
    label: "Notifications",
    icon: Bell,
    disabled: true,
  },
  { href: "#", label: "Team", icon: UsersRound, disabled: true },
  { href: "#", label: "Members", icon: Users, disabled: true },
];

export function AdminSidebar({ className }: { className?: string }) {
  const pathname = usePathname();
  const { workspaceId, setWorkspaceId } = useAdmin();
  const workspaces = useQuery(api.workspaces.listForViewer);

  const adminWorkspaces = useMemo(
    () => workspaces?.filter((w) => w.canAccessAdmin) ?? [],
    [workspaces],
  );

  useEffect(() => {
    if (!adminWorkspaces.length) return;
    if (workspaceId && adminWorkspaces.some((w) => w._id === workspaceId)) {
      return;
    }
    setWorkspaceId(adminWorkspaces[0]._id);
  }, [adminWorkspaces, workspaceId, setWorkspaceId]);

  const currentWorkspace = adminWorkspaces.find((w) => w._id === workspaceId);

  return (
    <aside
      className={cn(
        "flex h-full w-64 shrink-0 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground",
        className,
      )}
    >
      <div className="flex flex-col gap-1 p-4">
        <p className="px-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Workspace
        </p>
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button
                variant="outline"
                className="w-full justify-between border-sidebar-border bg-sidebar-accent/40"
              />
            }
          >
            <span className="truncate text-left">
              {currentWorkspace
                ? workspaceDisplayName(
                    currentWorkspace.name,
                    currentWorkspace.isDefault,
                  )
                : workspaces === undefined
                  ? "Loading…"
                  : "No workspace"}
            </span>
            <ChevronDown className="size-4 shrink-0 opacity-60" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-56">
            {adminWorkspaces.map((workspace) => (
              <DropdownMenuItem
                key={workspace._id}
                onClick={() => setWorkspaceId(workspace._id)}
              >
                {workspaceDisplayName(workspace.name, workspace.isDefault)}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <ScrollArea className="flex-1 px-2">
        <nav className="flex flex-col gap-0.5 py-2">
          {navItems.map((item) => {
            const isActive =
              Boolean(item.active) && pathname === "/admin" && !item.disabled;
            const Icon = item.icon;
            return (
              <Link
                key={item.label}
                href={item.disabled ? "#" : item.href}
                aria-disabled={item.disabled}
                className={cn(
                  "flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors",
                  item.disabled &&
                    "pointer-events-none cursor-not-allowed opacity-40",
                  isActive
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-sidebar-foreground/80 hover:bg-sidebar-accent/60",
                )}
                onClick={(e) => {
                  if (item.disabled) e.preventDefault();
                }}
              >
                <Icon className="size-4 shrink-0" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </ScrollArea>

      <Separator className="bg-sidebar-border" />
      <div className="flex items-center gap-3 p-4">
        <UserButton
          appearance={{
            elements: {
              avatarBox: "size-9",
            },
          }}
        />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium">Account</p>
          <p className="truncate text-xs text-muted-foreground">
            Manage profile
          </p>
        </div>
      </div>
    </aside>
  );
}
