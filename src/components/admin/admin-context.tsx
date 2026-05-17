"use client";

import type { Id } from "@cvx/_generated/dataModel";
import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import type { CampaignLifecycle } from "@/components/admin/campaign-labels";
import { useNormalizeLegacyLifecycles } from "@/components/admin/use-normalize-legacy-lifecycles";
import { type AdminToastVariant, showAdminToast } from "@/lib/admin-toast";
import { DEFAULT_CAMPAIGN_LIFECYCLE_FILTERS } from "@/lib/campaign-lifecycle-filters";
import {
  type CampaignSortKey,
  DEFAULT_CAMPAIGN_SORT,
} from "@/lib/campaign-sort";

export type ViewMode = "cards" | "list";

type AdminContextValue = {
  workspaceId: Id<"workspaces"> | null;
  setWorkspaceId: (id: Id<"workspaces"> | null) => void;
  selectedCampaignId: Id<"campaigns"> | null;
  setSelectedCampaignId: (id: Id<"campaigns"> | null) => void;
  search: string;
  setSearch: (value: string) => void;
  lifecycleFilters: CampaignLifecycle[];
  setLifecycleFilters: (value: CampaignLifecycle[]) => void;
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  campaignSort: CampaignSortKey;
  setCampaignSort: (sort: CampaignSortKey) => void;
  showShareMessage: (message: string, variant?: AdminToastVariant) => void;
};

const AdminContext = createContext<AdminContextValue | null>(null);

export function AdminProvider({ children }: { children: ReactNode }) {
  const [workspaceId, setWorkspaceId] = useState<Id<"workspaces"> | null>(null);
  const [selectedCampaignId, setSelectedCampaignId] =
    useState<Id<"campaigns"> | null>(null);
  const [search, setSearch] = useState("");
  const [lifecycleFilters, setLifecycleFilters] = useState<CampaignLifecycle[]>(
    () => [...DEFAULT_CAMPAIGN_LIFECYCLE_FILTERS],
  );
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [campaignSort, setCampaignSort] = useState<CampaignSortKey>(
    DEFAULT_CAMPAIGN_SORT,
  );

  useNormalizeLegacyLifecycles(workspaceId);

  const showShareMessage = useCallback(
    (message: string, variant: AdminToastVariant = "success") => {
      showAdminToast(message, variant);
    },
    [],
  );

  const value = useMemo(
    () => ({
      workspaceId,
      setWorkspaceId,
      selectedCampaignId,
      setSelectedCampaignId,
      search,
      setSearch,
      lifecycleFilters,
      setLifecycleFilters,
      viewMode,
      setViewMode,
      campaignSort,
      setCampaignSort,
      showShareMessage,
    }),
    [
      workspaceId,
      selectedCampaignId,
      search,
      lifecycleFilters,
      viewMode,
      campaignSort,
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
