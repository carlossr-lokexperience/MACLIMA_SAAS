"use client";

import React, { useEffect, useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { Card } from "@/components/Card";
import { Table } from "@/components/Table";
import { api } from "@/lib/api";

export default function Page() {
  const [assets, setAssets] = useState<any[]>([]);
  const [tickets, setTickets] = useState<any[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const [a, t] = await Promise.all([api.assets(), api.tickets()]) as any;
        setAssets(a);
        setTickets(t);
      } catch {}
    })();
  }, []);

  return (
    <div className="space-y-4">
      <PageHeader
        title="SAT / Aftermarket"
        subtitle="Activos serializados, garantías, tickets, repuestos, SLA."
        tags={[{ label: "Assets", tone: "info" }, { label: "Tickets", tone: "info" }, { label: "Parts", tone: "info" }]}
      />

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-3">
        <Card title="Activos" subtitle="DB real (seed)" icon="🏷️">
          <Table
            columns={[
              { key: "id", label: "ID" },
              { key: "serial", label: "Serie" },
              { key: "model_sku", label: "Modelo" },
              { key: "warranty_status", label: "Garantía" },
            ]}
            rows={assets}
          />
        </Card>

        <Card title="Tickets" subtitle="DB real (seed)" icon="🧰">
          <Table
            columns={[
              { key: "id", label: "ID" },
              { key: "asset_id", label: "Asset" },
              { key: "priority", label: "Prio" },
              { key: "status", label: "Estado" },
              { key: "summary", label: "Resumen" },
            ]}
            rows={tickets}
          />
        </Card>
      </div>
    </div>
  );
}
