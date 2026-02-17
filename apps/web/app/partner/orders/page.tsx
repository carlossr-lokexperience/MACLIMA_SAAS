"use client";

import React, { useEffect, useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { Card } from "@/components/Card";
import { Table } from "@/components/Table";
import { api } from "@/lib/api";

export default function Page() {
  const [orders, setOrders] = useState<any[]>([]);
  const [ships, setShips] = useState<any[]>([]);
  useEffect(() => {
    (async () => {
      try {
        const [o, s] = await Promise.all([api.orders(), api.shipments()]) as any;
        setOrders(o);
        setShips(s);
      } catch {}
    })();
  }, []);
  return (
    <div className="space-y-4">
      <PageHeader title="Pedidos & Tracking" subtitle="Como partner solo ves tu tenant." />
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-3">
        <Card title="Pedidos" subtitle="OMS (vista partner)" icon="🧾">
          <Table columns={[{ key:"id", label:"ID" },{ key:"status", label:"Estado" },{ key:"priority", label:"Prio" }]} rows={orders} />
        </Card>
        <Card title="Envíos" subtitle="TMS (vista partner)" icon="🚚">
          <Table columns={[{ key:"id", label:"ID" },{ key:"tracking", label:"Tracking" },{ key:"status", label:"Estado" }]} rows={ships} />
        </Card>
      </div>
    </div>
  );
}
