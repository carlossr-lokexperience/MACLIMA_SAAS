"use client";

import React from "react";
import { PageHeader } from "@/components/PageHeader";
import { Card } from "@/components/Card";

export default function Page() {
  return (
    <div className="space-y-4">
      <PageHeader
        title="CRM"
        subtitle="CRM light interno (si GHL se queda corto) — cuentas, contactos, pipeline y tareas."
        tags={[{ label: "Leads", tone: "info" }, { label: "Pipeline", tone: "info" }, { label: "Tareas", tone: "info" }]}
      />

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-3">
        <Card title="Leads" subtitle="Captación y cualificación" icon="🧲">
          <div className="muted">Placeholder UI: lista + filtros + estados + owner + fuente + notas.</div>
        </Card>
        <Card title="Pipeline" subtitle="Etapas y forecasting" icon="🗂️">
          <div className="muted">Placeholder UI: board kanban + probabilidad + valor + fecha cierre.</div>
        </Card>
        <Card title="Tareas" subtitle="Work management" icon="✅">
          <div className="muted">Placeholder UI: tareas por usuario, SLA y automatizaciones.</div>
        </Card>
      </div>
    </div>
  );
}
