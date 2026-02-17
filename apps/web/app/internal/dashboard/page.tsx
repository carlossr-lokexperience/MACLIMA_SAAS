"use client";

import React, { useEffect, useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { KpiRow } from "@/components/KpiRow";
import { Card } from "@/components/Card";
import { api } from "@/lib/api";

export default function Page() {
  const [kpis, setKpis] = useState({ orders: 0, shipments: 0, tickets: 0, backorders: 0 });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const [orders, shipments, tickets] = await Promise.all([
          api.orders(),
          api.shipments(),
          api.tickets(),
        ]) as any;
        setKpis({
          orders: orders.length,
          shipments: shipments.length,
          tickets: tickets.length,
          backorders: orders.filter((o: any) => o.status === "backorder").length,
        });
      } catch (e: any) {
        setError(e.message || "Error");
      }
    })();
  }, []);

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
        ]}
      />

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
