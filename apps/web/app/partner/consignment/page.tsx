"use client";

import React from "react";
import { PageHeader } from "@/components/PageHeader";
import { Card } from "@/components/Card";

export default function Page() {
  return (
    <div className="space-y-4">
      <PageHeader title="Consignación" subtitle="Placeholder UI (stock asignado al partner) + reposición automática." />
      <Card title="Consignación (placeholder)" subtitle="En producto final: min/max por SKU, conciliación, auditoría." icon="📦">
        <div className="muted">Aquí iría el stock consignado, movimientos y solicitudes de reposición.</div>
      </Card>
    </div>
  );
}
