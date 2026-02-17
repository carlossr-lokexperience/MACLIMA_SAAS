"use client";

import React, { useEffect, useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { Card } from "@/components/Card";
import { Table } from "@/components/Table";
import { api } from "@/lib/api";

export default function Page() {
  const [customers, setCustomers] = useState<any[]>([]);
  useEffect(() => {
    (async () => {
      try { setCustomers(await api.customers() as any); } catch {}
    })();
  }, []);

  return (
    <div className="space-y-4">
      <PageHeader
        title="Clientes"
        subtitle="Gestión de clientes y obras. (En producto final: sites, activos, contratos, docs)"
        tags={[{ label: "Customer 360", tone: "info" }]}
      />

      <Card title="Listado" subtitle="DB (seed). Externos solo ven su tenant." icon="👤">
        <Table
          columns={[
            { key: "id", label: "ID" },
            { key: "tenant_id", label: "Tenant" },
            { key: "name", label: "Nombre" },
            { key: "city", label: "Ciudad" },
          ]}
          rows={customers}
        />
      </Card>
    </div>
  );
}
