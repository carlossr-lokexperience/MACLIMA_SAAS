"use client";

import React, { useEffect, useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { Card } from "@/components/Card";
import { Table } from "@/components/Table";
import { api } from "@/lib/api";

export default function Page() {
  const [partners, setPartners] = useState<any[]>([]);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try { setPartners(await api.partners() as any); }
      catch (e: any) { setErr(e.message || "Error"); }
    })();
  }, []);

  return (
    <div className="space-y-4">
      <PageHeader
        title="Partners"
        subtitle="Red de instaladores, niveles, certificación, consignación, SLA."
        tags={[{ label: "RBAC por partner", tone: "info" }, { label: "Consignación", tone: "info" }, { label: "Academy", tone: "info" }]}
      />

      {err ? <div className="text-sm text-red-300">{err}</div> : null}

      <Card title="Listado de partners" subtitle="(Solo interno)" icon="🤝">
        <Table
          columns={[
            { key: "id", label: "ID" },
            { key: "tenant_id", label: "Tenant" },
            { key: "name", label: "Nombre" },
            { key: "level", label: "Nivel" },
            { key: "city", label: "Ciudad" },
            { key: "cert_valid", label: "Cert" },
          ]}
          rows={partners}
        />
      </Card>
    </div>
  );
}
