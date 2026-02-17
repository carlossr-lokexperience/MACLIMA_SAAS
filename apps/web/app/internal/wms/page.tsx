"use client";

import React, { useEffect, useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { Card } from "@/components/Card";
import { Table } from "@/components/Table";
import { api } from "@/lib/api";

export default function Page() {
  const [inv, setInv] = useState<any[]>([]);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setInv(await api.inventory() as any);
      } catch (e: any) {
        setErr(e.message || "Error");
      }
    })();
  }, []);

  return (
    <div className="space-y-4">
      <PageHeader
        title="WMS · Almacén"
        subtitle="Ubicaciones, movimientos, picking/packing, recepciones QC, inventario cíclico."
        tags={[{ label: "Locations", tone: "info" }, { label: "Picking", tone: "info" }, { label: "Cycle count", tone: "info" }]}
      />

      {err ? <div className="text-sm text-red-300">{err}</div> : null}

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-3">
        <Card title="Inventario por ubicación" subtitle="DB real (seed)" icon="📦">
          <Table
            columns={[
              { key: "sku_code", label: "SKU" },
              { key: "warehouse", label: "WH" },
              { key: "location_code", label: "Ubicación" },
              { key: "on_hand", label: "On hand" },
              { key: "reserved", label: "Reserved" },
            ]}
            rows={inv}
          />
        </Card>

        <Card title="Movimientos" subtitle="Placeholder: put-away, replenishment, ajustes" icon="🔁">
          <div className="muted">En producto final: tareas por operario + escaneo + auditoría por movimiento.</div>
        </Card>

        <Card title="Picking / Packing" subtitle="Placeholder: olas, tareas, bultos" icon="📦">
          <div className="muted">En producto final: wave picking, packing HUs, etiquetas, documentación.</div>
        </Card>
      </div>
    </div>
  );
}
