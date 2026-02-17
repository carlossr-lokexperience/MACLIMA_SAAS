"use client";

import React from "react";
import { PageHeader } from "@/components/PageHeader";
import { Card } from "@/components/Card";

export default function Page() {
  return (
    <div className="space-y-4">
      <PageHeader title="Dashboard Partner" subtitle="Tu panel: pedidos, tickets, consignación, academy." />
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-3">
        <Card title="Pedidos" subtitle="Tracking y estados" icon="🚚">
          <a className="btn w-full" href="/partner/orders">Ver pedidos</a>
        </Card>
        <Card title="Tickets" subtitle="Soporte técnico" icon="🧰">
          <a className="btn w-full" href="/partner/tickets">Ver tickets</a>
        </Card>
        <Card title="Consignación" subtitle="Stock asignado (placeholder)" icon="📦">
          <a className="btn w-full" href="/partner/consignment">Ver consignación</a>
        </Card>
      </div>
    </div>
  );
}
