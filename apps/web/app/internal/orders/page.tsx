"use client";

import React, { useEffect, useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { Card } from "@/components/Card";
import { Table } from "@/components/Table";
import { api } from "@/lib/api";

export default function Page() {
  const [orders, setOrders] = useState<any[]>([]);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setOrders(await api.orders() as any);
      } catch (e: any) {
        setErr(e.message || "Error");
      }
    })();
  }, []);

  return (
    <div className="space-y-4">
      <PageHeader
        title="OMS · Pedidos"
        subtitle="Pedidos, fases, reservas (ATP), backorders, liberaciones. (Demo: listado)"
        tags={[{ label: "ATP/CTP", tone: "info" }, { label: "Allocations", tone: "info" }, { label: "Backorder", tone: "warn" }]}
      />

      {err ? <div className="text-sm text-red-300">{err}</div> : null}

      <Card title="Pedidos" subtitle="En producto final: detalle, fases, acciones, aprobaciones." icon="🧾">
        <Table
          columns={[
            { key: "id", label: "ID" },
            { key: "tenant_id", label: "Tenant" },
            { key: "status", label: "Estado" },
            { key: "priority", label: "Prioridad" },
            { key: "customer_id", label: "Cliente" },
          ]}
          rows={orders}
        />
      </Card>
    </div>
  );
}
