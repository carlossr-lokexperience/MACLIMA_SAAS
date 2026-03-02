"use client";

import React, { useEffect, useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { KpiRow } from "@/components/KpiRow";
import { Card } from "@/components/Card";
import { api } from "@/lib/api";
import { StatisticsChart } from "@/components/StatisticsChart";
import RecentOrders from "@/components/RecentOrders";
import { Badge } from "@/components/Badge";



export default function Page() {
  const [kpis, setKpis] = useState({
    orders: 0,
    shipments: 0,
    tickets: 0,
    backorders: 0,
    leads: 0,

    totalSkus: 0,
    lowStock: 0,
    outOfStock: 0,

    openTickets: 0,
    pendingTickets: 0,
    closedTickets: 0,
  });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const [orders, shipments, tickets, leads, inventory] = await Promise.all([
          api.orders(),
          api.shipments(),
          api.tickets(),
          api.leads(),
          api.inventory(),
        ]) as any;
        const lowStock = inventory.filter((i: any) => i.stock < 10 && i.stock > 0).length;
        const outOfStock = inventory.filter((i: any) => i.stock === 0).length;

        const openTickets = tickets.filter((t: any) => t.status === "Open").length;
        const pendingTickets = tickets.filter((t: any) => t.status === "Pending").length;
        const closedTickets = tickets.filter((t: any) => t.status === "Closed").length;

        setKpis({
          orders: orders.length,
          shipments: shipments.length,
          tickets: tickets.length,
          backorders: orders.filter((o: any) => o.status === "backorder").length,
          leads: leads.length,
          totalSkus: inventory.length,
          lowStock,
          outOfStock,

          openTickets,
          pendingTickets,
          closedTickets,
        });
      } catch (e: any) {
        setError(e.message || "Error");
      }
    })();
  }, []);
  const criticalAlerts: string[] = [];

  if (kpis.outOfStock > 0) {
    criticalAlerts.push(`${kpis.outOfStock} productos sin stock`);
  }

  if (kpis.openTickets > 10) {
    criticalAlerts.push("Alto volumen de tickets abiertos");
  }


  return (
    <div className="space-y-4">
      <PageHeader
        title="Dashboard"
        subtitle="Snapshot operacional (demo) con widgets típicos enterprise."
        tags={[{ label: "OTIF", tone: "info" }, { label: "Fill rate", tone: "info" }, { label: "SLA", tone: "info" }]}
      />

      {error ? <div className="text-sm text-red-300">{error}</div> : null}



      <KpiRow
        items={[
          { label: "Pedidos", value: String(kpis.orders) },
          { label: "Backorders", value: String(kpis.backorders), delta: "Revisar ATP / compras" },
          { label: "Envíos", value: String(kpis.shipments) },
          { label: "Tickets SAT", value: String(kpis.tickets) },
          { label: "Leads", value: String(kpis.leads) },
        ]}
      />

      <StatisticsChart />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card
          title="Estado del Inventario"
          subtitle="Resumen actual de stock"
          icon="📦"
        >
          <KpiRow
            items={[
              { label: "Total SKUs", value: String(kpis.totalSkus) },
              { label: "Low Stock", value: String(kpis.lowStock) },
              { label: "Out of Stock", value: String(kpis.outOfStock) },
            ]}
          />
        </Card>
        <Card
          title="Estado del Equipo"
          subtitle="Gestión de tickets internos"
          icon="👥"
        >
          <div className="flex gap-4 flex-wrap">
            <Badge tone="bad">
              Open: {kpis.openTickets}
            </Badge>

            <Badge tone="warn">
              Pending: {kpis.pendingTickets}
            </Badge>

            <Badge tone="ok">
              Closed: {kpis.closedTickets}
            </Badge>
          </div>
        </Card>
      </div>

      <div className="mt-6">
        <Card
          title="Alertas Críticas"
          subtitle="Eventos que requieren atención"
          icon="🚨"
        >
          {criticalAlerts.length === 0 ? (
            <Badge tone="ok">Sin alertas críticas</Badge>
          ) : (
            <div className="flex flex-col gap-2">
              {criticalAlerts.map((alert, i) => (
                <Badge key={i} tone="bad">
                  {alert}
                </Badge>
              ))}
            </div>
          )}
        </Card>
      </div>



      <RecentOrders />



      <div className="grid grid-cols-1 xl:grid-cols-3 gap-3">
        <Card title="Alertas" subtitle="Lo que el responsable ve al entrar" icon="⚠️">
          <ul className="text-sm text-muted list-disc pl-5 space-y-1">
            <li>Backorder: revisar stock y fecha promesa</li>
            <li>Recepciones pendientes de QC</li>
            <li>Tickets P1/P2 cerca de SLA</li>
          </ul>
        </Card>

        <Card title="Quick actions" subtitle="Acciones típicas" icon="⚡">
          <div className="grid grid-cols-2 gap-2">
            <a className="btn" href="/internal/quotes">Presupuesto</a>
            <a className="btn" href="/internal/orders">Pedidos</a>
            <a className="btn" href="/internal/wms">WMS</a>
            <a className="btn" href="/internal/loki">Loki</a>
          </div>
        </Card>

        <Card title="Actividad" subtitle="Audit log y eventos (en Admin)" icon="🧾">
          <div className="muted">Mira Admin → Auditoría para ver eventos reales (login, quote calc, etc.).</div>
        </Card>
      </div>
    </div>
  );
}
