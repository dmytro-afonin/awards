"use client";

import type { Id } from "@cvx/_generated/dataModel";
import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

export type ViewMode = "cards" | "list";

type AdminContextValue = {
  workspaceId: Id<"workspaces"> | null;
  setWorkspaceId: (id: Id<"workspaces"> | null) => void;
  selectedCampaignId: Id<"campaigns"> | null;
  setSelectedCampaignId: (id: Id<"campaigns"> | null) => void;
  search: string;
  setSearch: (value: string) => void;
  lifecycle: string;
  setLifecycle: (value: string) => void;
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  mobileNavOpen: boolean;
  setMobileNavOpen: (open: boolean) => void;
  shareMessage: string | null;
  showShareMessage: (message: string) => void;
};

const AdminContext = createContext<AdminContextValue | null>(null);

export function AdminProvider({ children }: { children: ReactNode }) {
  const [workspaceId, setWorkspaceId] = useState<Id<"workspaces"> | null>(null);
  const [selectedCampaignId, setSelectedCampaignId] =
    useState<Id<"campaigns"> | null>(null);
  const [search, setSearch] = useState("");
  const [lifecycle, setLifecycle] = useState("all");
  const [viewMode, setViewMode] = useState<ViewMode>("cards");
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [shareMessage, setShareMessage] = useState<string | null>(null);

  const showShareMessage = useCallback((message: string) => {
    setShareMessage(message);
  }, []);

  useEffect(() => {
    if (!shareMessage) return;
    const timer = window.setTimeout(() => setShareMessage(null), 2500);
    return () => window.clearTimeout(timer);
  }, [shareMessage]);

  const value = useMemo(
    () => ({
      workspaceId,
      setWorkspaceId,
      selectedCampaignId,
      setSelectedCampaignId,
      search,
      setSearch,
      lifecycle,
      setLifecycle,
      viewMode,
      setViewMode,
      mobileNavOpen,
      setMobileNavOpen,
      shareMessage,
      showShareMessage,
    }),
    [
      workspaceId,
      selectedCampaignId,
      search,
      lifecycle,
      viewMode,
      mobileNavOpen,
      shareMessage,
      showShareMessage,
    ],
  );

  return (
    <AdminContext.Provider value={value}>{children}</AdminContext.Provider>
  );
}

export function useAdmin() {
  const ctx = useContext(AdminContext);
  if (!ctx) {
    throw new Error("useAdmin must be used within AdminProvider");
  }
  return ctx;
}
