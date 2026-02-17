"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import {
  LayoutDashboard, Users, Building2, Receipt, Boxes, Truck, Wrench, RotateCcw, LineChart, Shield, Bot, FileText
} from "lucide-react";
import { Logo } from "@/components/Logo";
import { getUser } from "@/lib/storage";

type NavItem = { label: string; href: string; icon: any };
type NavGroup = { title: string; items: NavItem[] };

function item(label: string, href: string, icon: any): NavItem {
  return { label, href, icon };
}

export function Sidebar() {
  const pathname = usePathname();
  const user = getUser();

  const nav: NavGroup[] = useMemo(() => {
    const portal = user?.portal;

    if (portal === "partner") {
      return [
        { title: "General", items: [item("Dashboard", "/partner/dashboard", LayoutDashboard)] },
        { title: "Operación", items: [item("Pedidos & Tracking", "/partner/orders", Truck), item("Tickets SAT", "/partner/tickets", Wrench)] },
        { title: "Logística", items: [item("Consignación", "/partner/consignment", Boxes)] },
        { title: "Academy", items: [item("Certificación", "/partner/academy", FileText)] },
      ];
    }

    if (portal === "client") {
      return [
        { title: "General", items: [item("Mi cuenta", "/client/dashboard", LayoutDashboard)] },
        { title: "Seguimiento", items: [item("Tracking", "/client/tracking", Truck)] },
        { title: "Soporte", items: [item("Incidencias", "/client/issues", Wrench)] },
        { title: "Equipos", items: [item("Mis equipos", "/client/assets", Boxes)] },
        { title: "Documentos", items: [item("Documentos", "/client/documents", FileText)] },
      ];
    }

    // internal
    return [
      { title: "General", items: [item("Dashboard", "/internal/dashboard", LayoutDashboard)] },
      { title: "Comercial", items: [item("CRM", "/internal/crm", Users), item("Presupuestos", "/internal/quotes", Receipt)] },
      { title: "Operaciones", items: [item("OMS Pedidos", "/internal/orders", Receipt), item("WMS Almacén", "/internal/wms", Boxes), item("TMS Transporte", "/internal/tms", Truck)] },
      { title: "Soporte", items: [item("SAT", "/internal/sat", Wrench), item("RMA", "/internal/rma", RotateCcw)] },
      { title: "Red", items: [item("Partners", "/internal/partners", Building2), item("Clientes", "/internal/customers", Users)] },
      { title: "Insights", items: [item("KPIs", "/internal/analytics", LineChart)] },
      { title: "IA", items: [item("Loki", "/internal/loki", Bot)] },
      { title: "Admin", items: [item("Auditoría", "/internal/admin/audit", Shield)] },
    ];
  }, [user?.portal]);

  return (
    <aside className="w-[280px] hidden lg:block">
      <div className="sticky top-0 h-screen p-4">
        <div className="card">
          <div className="cardPad">
            <Logo />
            <div className="mt-4 space-y-5">
              {nav.map((g) => (
                <div key={g.title}>
                  <div className="text-xs uppercase tracking-wide text-muted mb-2">{g.title}</div>
                  <div className="space-y-1">
                    {g.items.map((it) => {
                      const active = pathname === it.href;
                      const Icon = it.icon;
                      return (
                        <Link
                          key={it.href}
                          href={it.href}
                          className={clsx(
                            "flex items-center gap-3 rounded-xl px-3 py-2 text-sm border border-transparent hover:bg-white/5 transition",
                            active && "bg-white/5 border-white/10"
                          )}
                        >
                          <Icon size={16} className={clsx("text-muted", active && "text-white")} />
                          <span>{it.label}</span>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-5 text-xs text-muted">
              Portal: <span className="text-white">{user?.portal ?? "—"}</span><br />
              Tenant: <span className="text-white">{user?.tenant_name ?? user?.tenant_id ?? "—"}</span>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
