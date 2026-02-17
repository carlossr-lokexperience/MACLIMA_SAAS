import React from "react";
import { AppShell } from "@/components/AppShell";
import { Topbar } from "@/components/Topbar";
import { RequireAuth } from "@/components/RequireAuth";

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <RequireAuth portal="client">
      <AppShell>
        <Topbar title="Portal Cliente" />
        {children}
      </AppShell>
    </RequireAuth>
  );
}
