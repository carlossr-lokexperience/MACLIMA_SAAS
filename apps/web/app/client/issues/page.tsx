"use client";

import React from "react";
import { PageHeader } from "@/components/PageHeader";
import { Card } from "@/components/Card";

export default function Page() {
  return (
    <div className="space-y-4">
      <PageHeader title="Incidencias" subtitle="Placeholder UI. En producto final: tickets + chat + adjuntos + SLA." />
      <Card title="Crear incidencia (placeholder)" subtitle="Formulario + adjuntos" icon="🧰">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <input className="input" placeholder="Asunto" />
          <select className="input">
            <option>Prioridad P3</option>
            <option>Prioridad P2</option>
            <option>Prioridad P1</option>
          </select>
          <textarea className="input md:col-span-2 h-28" placeholder="Describe el problema..." />
          <button className="btn btn-primary md:col-span-2">Enviar</button>
        </div>
      </Card>
    </div>
  );
}
