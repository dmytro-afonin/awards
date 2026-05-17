"use client";

import { SignOutButton, useClerk, useUser } from "@clerk/nextjs";
import { api } from "@cvx/_generated/api";
import type { Id } from "@cvx/_generated/dataModel";
import {
  type RemixiconComponentType,
  RiArrowUpDownLine,
  RiBellLine,
  RiCheckLine,
  RiComputerLine,
  RiGroupLine,
  RiLayoutGridLine,
  RiLogoutBoxRLine,
  RiMoonLine,
  RiSunLine,
  RiTeamLine,
  RiUserSettingsLine,
} from "@remixicon/react";
import { useQuery } from "convex/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { useEffect, useMemo } from "react";
import { useAdmin } from "@/components/admin/admin-context";
import { workspaceDisplayName } from "@/components/admin/campaign-labels";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar";

type AdminWorkspace = {
  _id: Id<"workspaces">;
  name: string;
  isDefault: boolean;
  role: "owner" | "admin" | "member";
  canAccessAdmin: boolean;
};

const navItems: {
  href: string;
  label: string;
  icon: RemixiconComponentType;
  active?: boolean;
  disabled?: boolean;
}[] = [
  { href: "/admin", label: "Campaigns", icon: RiLayoutGridLine, active: true },
  { href: "#", label: "Notifications", icon: RiBellLine, disabled: true },
  { href: "#", label: "Team", icon: RiGroupLine, disabled: true },
  { href: "#", label: "Members", icon: RiTeamLine, disabled: true },
];

function workspaceSubtitle(workspace: AdminWorkspace): string {
  if (workspace.isDefault) return "Default workspace";
  return workspace.role.charAt(0).toUpperCase() + workspace.role.slice(1);
}

function workspaceInitial(name: string): string {
  const trimmed = name.trim();
  return trimmed ? trimmed.charAt(0).toUpperCase() : "W";
}

function WorkspaceSwitcher({
  workspaces,
  currentWorkspace,
  onSelect,
}: {
  workspaces: AdminWorkspace[];
  currentWorkspace: AdminWorkspace | undefined;
  onSelect: (id: AdminWorkspace["_id"]) => void;
}) {
  const { isMobile } = useSidebar();

  const displayName = currentWorkspace
    ? workspaceDisplayName(currentWorkspace.name)
    : "No workspace";

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <SidebarMenuButton
                size="lg"
                className="data-popup-open:bg-sidebar-accent data-popup-open:text-sidebar-accent-foreground"
              />
            }
          >
            <div className="flex aspect-square size-8 shrink-0 items-center justify-center rounded-lg bg-sidebar-primary text-sm font-semibold text-sidebar-primary-foreground">
              {workspaceInitial(displayName)}
            </div>
            <div className="grid min-w-0 flex-1 text-left text-sm leading-tight">
              <span className="truncate font-medium">{displayName}</span>
              <span className="truncate text-xs text-sidebar-foreground/70">
                {currentWorkspace
                  ? workspaceSubtitle(currentWorkspace)
                  : "Select workspace"}
              </span>
            </div>
            <RiArrowUpDownLine className="ml-auto size-4 shrink-0 opacity-70" />
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="min-w-56 rounded-lg"
            align="start"
            side={isMobile ? "bottom" : "right"}
            sideOffset={4}
          >
            <DropdownMenuGroup>
              <DropdownMenuLabel className="text-xs text-muted-foreground">
                Workspaces
              </DropdownMenuLabel>
              {workspaces.map((workspace, index) => {
                const name = workspaceDisplayName(workspace.name);
                const isActive = workspace._id === currentWorkspace?._id;
                return (
                  <DropdownMenuItem
                    key={workspace._id}
                    className="gap-2 p-2"
                    onClick={() => onSelect(workspace._id)}
                  >
                    <div className="flex size-6 items-center justify-center rounded-md border bg-background text-xs font-medium">
                      {workspaceInitial(name)}
                    </div>
                    <span className="min-w-0 flex-1 truncate">{name}</span>
                    {isActive ? (
                      <RiCheckLine className="size-4 shrink-0 opacity-70" />
                    ) : index < 9 ? (
                      <DropdownMenuShortcut>⌘{index + 1}</DropdownMenuShortcut>
                    ) : null}
                  </DropdownMenuItem>
                );
              })}
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}

function AdminNavUser() {
  const { isMobile } = useSidebar();
  const { user } = useUser();
  const { openUserProfile } = useClerk();
  const { setTheme } = useTheme();

  const name =
    user?.fullName?.trim() ||
    user?.primaryEmailAddress?.emailAddress ||
    "Account";
  const email = user?.primaryEmailAddress?.emailAddress ?? "";
  const initials =
    name
      .split(/\s+/)
      .map((part) => part.charAt(0))
      .join("")
      .slice(0, 2)
      .toUpperCase() || "A";

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <SidebarMenuButton
                size="lg"
                className="data-popup-open:bg-sidebar-accent data-popup-open:text-sidebar-accent-foreground"
              />
            }
          >
            <Avatar className="size-8 rounded-lg">
              {user?.imageUrl ? (
                <AvatarImage src={user.imageUrl} alt={name} />
              ) : null}
              <AvatarFallback className="rounded-lg text-xs">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="grid min-w-0 flex-1 text-left text-sm leading-tight">
              <span className="truncate font-medium">{name}</span>
              <span className="truncate text-xs text-sidebar-foreground/70">
                {email}
              </span>
            </div>
            <RiArrowUpDownLine className="ml-auto size-4 shrink-0 opacity-70" />
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="min-w-56 rounded-lg"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuGroup>
              <DropdownMenuLabel className="p-0 font-normal">
                <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                  <Avatar className="size-8 rounded-lg">
                    {user?.imageUrl ? (
                      <AvatarImage src={user.imageUrl} alt={name} />
                    ) : null}
                    <AvatarFallback className="rounded-lg text-xs">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="grid min-w-0 flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-medium">{name}</span>
                    <span className="truncate text-xs text-muted-foreground">
                      {email}
                    </span>
                  </div>
                </div>
              </DropdownMenuLabel>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem onClick={() => openUserProfile()}>
                <RiUserSettingsLine />
                Manage account
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuLabel className="text-xs text-muted-foreground">
                Theme
              </DropdownMenuLabel>
              <DropdownMenuItem onClick={() => setTheme("light")}>
                <RiSunLine />
                Light
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme("dark")}>
                <RiMoonLine />
                Dark
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme("system")}>
                <RiComputerLine />
                System
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <SignOutButton signOutOptions={{ redirectUrl: "/" }}>
                <DropdownMenuItem className="cursor-pointer">
                  <RiLogoutBoxRLine />
                  Log out
                </DropdownMenuItem>
              </SignOutButton>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}

export function AdminSidebar() {
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
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <WorkspaceSwitcher
          workspaces={adminWorkspaces}
          currentWorkspace={currentWorkspace}
          onSelect={setWorkspaceId}
        />
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Admin</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive =
                  Boolean(item.active) &&
                  pathname === "/admin" &&
                  !item.disabled;

                return (
                  <SidebarMenuItem key={item.label}>
                    {item.disabled ? (
                      <SidebarMenuButton disabled tooltip={item.label}>
                        <Icon />
                        <span>{item.label}</span>
                      </SidebarMenuButton>
                    ) : (
                      <SidebarMenuButton
                        isActive={isActive}
                        tooltip={item.label}
                        render={
                          <Link
                            href={item.href}
                            prefetch={item.href === "/admin"}
                          />
                        }
                      >
                        <Icon />
                        <span>{item.label}</span>
                      </SidebarMenuButton>
                    )}
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <AdminNavUser />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
