import React from "react";
import { AppShell } from "@/components/AppShell";
import { Topbar } from "@/components/Topbar";
import { RequireAuth } from "@/components/RequireAuth";

export default function InternalLayout({ children }: { children: React.ReactNode }) {
  return (
    <RequireAuth portal="internal">
      <AppShell>
        <Topbar title="Portal Interno" />
        {children}
      </AppShell>
    </RequireAuth>
  );
}
