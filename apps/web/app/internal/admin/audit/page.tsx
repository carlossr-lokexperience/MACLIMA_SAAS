"use client";

import React, { useEffect, useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { Card } from "@/components/Card";
import { Table } from "@/components/Table";
import { api } from "@/lib/api";

export default function Page() {
  const [rows, setRows] = useState<any[]>([]);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setRows(await api.audit() as any);
      } catch (e: any) {
        setErr("Necesitas rol admin (usa admin@maclima.local).");
      }
    })();
  }, []);

  return (
    <div className="space-y-4">
      <PageHeader
        title="Admin · Auditoría"
        subtitle="Trazabilidad de acciones críticas (login, cálculos, IA, etc.)"
        tags={[{ label: "Audit log", tone: "info" }, { label: "Compliance", tone: "info" }]}
      />

      {err ? <div className="text-sm text-amber-300">{err}</div> : null}

      <Card title="Eventos" subtitle="DB real" icon="🛡️">
        <Table
          columns={[
            { key: "ts", label: "TS" },
            { key: "actor", label: "Actor" },
            { key: "action", label: "Acción" },
            { key: "entity", label: "Entidad" },
            { key: "entity_id", label: "ID" },
            { key: "detail", label: "Detalle" },
          ]}
          rows={rows}
        />
      </Card>
    </div>
  );
}
