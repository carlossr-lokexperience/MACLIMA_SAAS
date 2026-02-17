"use client";

import React, { useEffect, useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { Card } from "@/components/Card";
import { Table } from "@/components/Table";
import { api } from "@/lib/api";

export default function Page() {
  const [ships, setShips] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [selected, setSelected] = useState<number | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const s = await api.shipments() as any[];
        setShips(s);
        if (s.length) {
          setSelected(s[0].id);
        }
      } catch (e: any) {
        setErr(e.message || "Error");
      }
    })();
  }, []);

  useEffect(() => {
    (async () => {
      if (!selected) return;
      try {
        setEvents(await api.shipmentEvents(selected) as any);
      } catch (e: any) {}
    })();
  }, [selected]);

  return (
    <div className="space-y-4">
      <PageHeader
        title="TMS · Transporte"
        subtitle="Envíos, carriers, tracking, POD e incidencias."
        tags={[{ label: "Tracking", tone: "info" }, { label: "POD", tone: "info" }, { label: "Claims", tone: "warn" }]}
      />

      {err ? <div className="text-sm text-red-300">{err}</div> : null}

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-3">
        <Card title="Envíos" subtitle="DB real (seed)" icon="🚚">
          <Table
            columns={[
              { key: "id", label: "ID" },
              { key: "order_id", label: "Pedido" },
              { key: "carrier", label: "Carrier" },
              { key: "tracking", label: "Tracking" },
              { key: "status", label: "Estado" },
            ]}
            rows={ships}
          />
          <div className="mt-3">
            <label className="text-sm text-muted">Ver eventos tracking de envío:</label>
            <select className="input mt-2" value={selected ?? ""} onChange={(e) => setSelected(Number(e.target.value))}>
              {ships.map((s) => <option key={s.id} value={s.id}>{s.id} · {s.tracking}</option>)}
            </select>
          </div>
        </Card>

        <Card title="Timeline tracking" subtitle="Eventos" icon="🧭">
          <div className="space-y-2">
            {events.map((ev, idx) => (
              <div key={idx} className="rounded-xl border border-white/10 bg-white/5 p-3">
                <div className="text-sm font-semibold">{ev.title}</div>
                <div className="muted">{new Date(ev.ts).toLocaleString()} · {ev.actor}</div>
                {ev.detail ? <div className="text-sm text-muted mt-1">{ev.detail}</div> : null}
              </div>
            ))}
            {events.length === 0 ? <div className="muted">Sin eventos.</div> : null}
          </div>
        </Card>
      </div>
    </div>
  );
}
