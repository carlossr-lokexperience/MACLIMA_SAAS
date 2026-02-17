"use client";

import React, { useEffect, useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { Card } from "@/components/Card";
import { Table } from "@/components/Table";
import { api } from "@/lib/api";

export default function Page() {
  const [assets, setAssets] = useState<any[]>([]);
  useEffect(() => { (async () => { try { setAssets(await api.assets() as any); } catch {} })(); }, []);
  return (
    <div className="space-y-4">
      <PageHeader title="Mis equipos" subtitle="Activos y garantía (vista cliente)." />
      <Card title="Equipos" subtitle="DB (seed)" icon="🏷️">
        <Table columns={[{ key:"id", label:"ID" },{ key:"serial", label:"Serie" },{ key:"model_sku", label:"Modelo" },{ key:"warranty_status", label:"Garantía" }]} rows={assets} />
      </Card>
    </div>
  );
}
