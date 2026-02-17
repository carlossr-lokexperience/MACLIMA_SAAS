"use client";

import React from "react";
import { PageHeader } from "@/components/PageHeader";
import { Card } from "@/components/Card";

export default function Page() {
  return (
    <div className="space-y-4">
      <PageHeader title="Documentos" subtitle="Placeholder: ofertas, garantías, manuales, partes." />
      <Card title="Repositorio (placeholder)" subtitle="S3 + permisos + versionado" icon="📄">
        <div className="muted">En producto final: subir/bajar, firmas, plantillas PDF, control de acceso.</div>
      </Card>
    </div>
  );
}
