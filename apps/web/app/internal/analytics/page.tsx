"use client";

import React from "react";
import { PageHeader } from "@/components/PageHeader";
import { Card } from "@/components/Card";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

const data = [
  { day: "D1", orders: 2, otif: 92 },
  { day: "D2", orders: 3, otif: 90 },
  { day: "D3", orders: 4, otif: 93 },
  { day: "D4", orders: 2, otif: 91 },
  { day: "D5", orders: 5, otif: 89 },
  { day: "D6", orders: 3, otif: 92 },
  { day: "D7", orders: 6, otif: 94 },
];

export default function Page() {
  return (
    <div className="space-y-4">
      <PageHeader
        title="KPIs / Analítica"
        subtitle="En producto final: OTIF, fill rate, costes transporte, exactitud inventario, SLA SAT."
        tags={[{ label: "OTIF", tone: "info" }, { label: "Fill rate", tone: "info" }, { label: "SLA", tone: "info" }]}
      />

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-3">
        <Card title="Pedidos / día" subtitle="Mock chart" icon="📈">
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data}>
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="orders" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card title="OTIF (%)" subtitle="Mock chart" icon="✅">
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data}>
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="otif" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    </div>
  );
}
