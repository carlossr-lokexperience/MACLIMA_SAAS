"use client";

import React from "react";
import { Search, Bell, LogOut } from "lucide-react";
import { clearSession, getUser } from "@/lib/storage";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/Badge";

export function Topbar({ title }: { title: string }) {
  const router = useRouter();
  const user = getUser();

  return (
    <div className="flex items-center justify-between gap-3 py-4">
      <div>
        <div className="text-xl font-semibold">{title}</div>
        <div className="muted">Multi‑portal · RBAC · Audit · Pricing Engine · Loki</div>
      </div>

      <div className="flex items-center gap-2">
        <div className="hidden md:flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2">
          <Search size={16} className="text-muted" />
          <input className="bg-transparent outline-none text-sm w-64" placeholder="Búsqueda global (demo)" />
        </div>

        <button className="btn" title="Notificaciones">
          <Bell size={16} />
        </button>

        <div className="hidden sm:block">
          <Badge tone="info">{user?.portal ?? "—"} · {user?.role ?? "—"}</Badge>
        </div>

        <button
          className="btn"
          onClick={() => {
            clearSession();
            router.push("/login");
          }}
          title="Cerrar sesión"
        >
          <LogOut size={16} />
        </button>
      </div>
    </div>
  );
}
