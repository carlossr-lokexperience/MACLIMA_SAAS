"use client";

import React, { useEffect, useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { Card } from "@/components/Card";
import { api } from "@/lib/api";

export default function Page() {
  const [ships, setShips] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [selected, setSelected] = useState<number | null>(null);

  useEffect(() => { (async () => { try { const s:any[] = await api.shipments(); setShips(s); if(s[0]) setSelected(s[0].id);} catch {} })(); }, []);
  useEffect(() => { (async () => { if(!selected) return; try { setEvents(await api.shipmentEvents(selected) as any); } catch {} })(); }, [selected]);

  return (
    <div className="space-y-4">
      <PageHeader title="Tracking" subtitle="Seguimiento de envíos (vista cliente)." />
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-3">
        <Card title="Envíos" subtitle="Selecciona uno" icon="🚚">
          <select className="input" value={selected ?? ""} onChange={(e) => setSelected(Number(e.target.value))}>
            {ships.map((s) => <option key={s.id} value={s.id}>{s.tracking} · {s.status}</option>)}
          </select>
          <div className="muted mt-2">En producto final: POD, incidencias transporte y notificaciones.</div>
        </Card>
        <Card title="Timeline" subtitle="Eventos tracking" icon="🧭">
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
