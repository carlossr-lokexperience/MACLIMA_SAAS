"use client";

import React, { useEffect, useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { Card } from "@/components/Card";
import { Table } from "@/components/Table";
import { api } from "@/lib/api";

export default function Page() {
  const [tickets, setTickets] = useState<any[]>([]);
  useEffect(() => { (async () => { try { setTickets(await api.tickets() as any); } catch {} })(); }, []);
  return (
    <div className="space-y-4">
      <PageHeader title="Tickets SAT" subtitle="Soporte y escalado (vista partner)." />
      <Card title="Tickets" subtitle="DB (seed)" icon="🧰">
        <Table columns={[{ key:"id", label:"ID" },{ key:"priority", label:"Prio" },{ key:"status", label:"Estado" },{ key:"summary", label:"Resumen" }]} rows={tickets} />
      </Card>
    </div>
  );
}
