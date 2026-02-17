"use client";

import React from "react";
import { PageHeader } from "@/components/PageHeader";
import { Card } from "@/components/Card";

export default function Page() {
  return (
    <div className="space-y-4">
      <PageHeader title="Mi cuenta" subtitle="Estado del proyecto/instalación, fases, documentos." />
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-3">
        <Card title="Tracking" subtitle="Ver estado de envío" icon="🚚">
          <a className="btn w-full" href="/client/tracking">Abrir tracking</a>
        </Card>
        <Card title="Incidencias" subtitle="Abrir ticket y adjuntar evidencias" icon="🧰">
          <a className="btn w-full" href="/client/issues">Abrir incidencias</a>
        </Card>
        <Card title="Equipos" subtitle="Garantía, serie, manuales" icon="🏷️">
          <a className="btn w-full" href="/client/assets">Ver equipos</a>
        </Card>
      </div>
    </div>
  );
}
