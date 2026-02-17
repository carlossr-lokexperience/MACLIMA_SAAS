"use client";

import React, { useEffect, useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { Card } from "@/components/Card";
import { Table } from "@/components/Table";
import { api } from "@/lib/api";

export default function Page() {
  const [rmas, setRmas] = useState<any[]>([]);
  useEffect(() => {
    (async () => {
      try { setRmas(await api.rmas() as any); } catch {}
    })();
  }, []);

  return (
    <div className="space-y-4">
      <PageHeader
        title="RMA / Devoluciones"
        subtitle="Solicitud → recepción → disposición (restock/repair/scrap)."
        tags={[{ label: "RMA", tone: "info" }, { label: "Reverse logistics", tone: "info" }]}
      />

      <Card title="RMAs" subtitle="DB (seed) — En producto final: workflow completo + documentos" icon="↩️">
        <Table
          columns={[
            { key: "id", label: "ID" },
            { key: "order_id", label: "Pedido" },
            { key: "status", label: "Estado" },
            { key: "disposition", label: "Disposición" },
            { key: "reason", label: "Motivo" },
          ]}
          rows={rmas}
        />
      </Card>
    </div>
  );
}
