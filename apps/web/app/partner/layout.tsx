import React from "react";
import { AppShell } from "@/components/AppShell";
import { Topbar } from "@/components/Topbar";
import { RequireAuth } from "@/components/RequireAuth";

export default function PartnerLayout({ children }: { children: React.ReactNode }) {
  return (
    <RequireAuth portal="partner">
      <AppShell>
        <Topbar title="Portal Partner" />
        {children}
      </AppShell>
    </RequireAuth>
  );
}
