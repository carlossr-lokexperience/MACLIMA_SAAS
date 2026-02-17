"use client";

import React from "react";
import { PageHeader } from "@/components/PageHeader";
import { Card } from "@/components/Card";

export default function Page() {
  return (
    <div className="space-y-4">
      <PageHeader title="Academy / Certificación" subtitle="Placeholder: cursos, tests y gating de permisos." />
      <Card title="Cursos (placeholder)" subtitle="En producto final: lecciones, test, certificados, caducidades." icon="🎓">
        <div className="muted">Ejemplo: Certificación “Instalador Expert” habilita compra de ciertos SKUs.</div>
      </Card>
    </div>
  );
}
