"use client";

import type { ReactNode } from "react";
import { AdminShell } from "@/components/admin/admin-shell";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="h-svh max-h-svh min-h-0 overflow-hidden">
      <AdminShell>{children}</AdminShell>
    </div>
  );
}
