"use client";

import React, { useEffect, useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { Card } from "@/components/Card";
import { Table } from "@/components/Table";
import { api } from "@/lib/api";
import type { QuoteCalcInput, QuoteCalcResponse } from "@/lib/types";

export default function Page() {
  const [input, setInput] = useState<QuoteCalcInput>({
    surface_m2: 120,
    perimeter_ml: 132,
    tubing_m: 600,
    kit_model: "KIT-8KW",
    include_installation: true,
    partner_level: "Direct",
    region: "MAD",
  });
  const [calc, setCalc] = useState<QuoteCalcResponse | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [skus, setSkus] = useState<any[]>([]);
  const [history, setHistory] = useState<any[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const [s, q] = await Promise.all([api.skus(), api.quotes()]) as any;
        setSkus(s);
        setHistory(q);
      } catch (e: any) {}
    })();
  }, []);

  return (
    <div className="space-y-4">
      <PageHeader
        title="Presupuestos (CPQ / Quoting)"
        subtitle="Motor determinista (Python) llamado por el backend. Loki lo podrá orquestar y explicar."
        tags={[{ label: "Pricing Engine", tone: "info" }, { label: "Versionado", tone: "info" }, { label: "Auditabilidad", tone: "info" }]}
      />

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-3">
        <Card title="Inputs" subtitle="Datos mínimos para cálculo (demo)" icon="🧮">
          <div className="space-y-3">
            <div>
              <label className="text-sm text-muted">Superficie (m²)</label>
              <input className="input mt-2" type="number" value={input.surface_m2} onChange={(e) => setInput({ ...input, surface_m2: Number(e.target.value) })} />
            </div>
            <div>
              <label className="text-sm text-muted">Perímetro (ml)</label>
              <input className="input mt-2" type="number" value={input.perimeter_ml} onChange={(e) => setInput({ ...input, perimeter_ml: Number(e.target.value) })} />
            </div>
            <div>
              <label className="text-sm text-muted">Tubería (m)</label>
              <input className="input mt-2" type="number" value={input.tubing_m} onChange={(e) => setInput({ ...input, tubing_m: Number(e.target.value) })} />
            </div>
            <div>
              <label className="text-sm text-muted">Modelo equipo</label>
              <select className="input mt-2" value={input.kit_model} onChange={(e) => setInput({ ...input, kit_model: e.target.value })}>
                {skus.filter((s) => String(s.code).startsWith("KIT")).map((s) => (
                  <option key={s.code} value={s.code}>{s.code} · {s.name}</option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" checked={input.include_installation} onChange={(e) => setInput({ ...input, include_installation: e.target.checked })} />
              <span className="text-sm">Incluir instalación</span>
            </div>
            <div>
              <label className="text-sm text-muted">Nivel partner</label>
              <select className="input mt-2" value={input.partner_level} onChange={(e) => setInput({ ...input, partner_level: e.target.value })}>
                {["Direct","Bronze","Silver","Expert"].map((x) => <option key={x} value={x}>{x}</option>)}
              </select>
            </div>

            {err ? <div className="text-sm text-red-300">{err}</div> : null}

            <button className="btn btn-primary w-full" onClick={async () => {
              setErr(null);
              try {
                const res = await api.quoteCalc(input) as any;
                setCalc(res);
              } catch (e: any) {
                setErr(e.message || "Error");
              }
            }}>
              Calcular presupuesto
            </button>
          </div>
        </Card>

        <Card title="Resultado" subtitle="Breakdown + totales" icon="💶">
          {calc ? (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div className="pill pill-info">Subtotal: <strong>€{calc.totals.subtotal}</strong></div>
                <div className="pill pill-info">Descuento: <strong>€{calc.totals.discount_amount}</strong></div>
                <div className="pill pill-info">IVA: <strong>€{calc.totals.vat}</strong></div>
                <div className="pill pill-ok">Total: <strong>€{calc.totals.grand_total}</strong></div>
              </div>

              <div className="text-sm text-muted">
                Engine: {calc.engine_version} · Tarifa: {calc.tariff_version}
              </div>

              <div className="mt-2">
                <div className="text-sm font-semibold">Explicación (audit)</div>
                <ul className="text-sm text-muted list-disc pl-5 mt-2 space-y-1">
                  {calc.explain.map((x, i) => <li key={i}>{x}</li>)}
                </ul>
              </div>
            </div>
          ) : (
            <div className="muted">Aún no has calculado. Rellena inputs y pulsa “Calcular”.</div>
          )}
        </Card>

        <Card title="BOM / Materiales" subtitle="Lo que se usaría para inventario y compras" icon="📦">
          {calc ? (
            <Table
              columns={[
                { key: "sku", label: "SKU" },
                { key: "qty", label: "Qty" },
                { key: "uom", label: "UOM" },
              ]}
              rows={calc.bom}
            />
          ) : (
            <div className="muted">El BOM aparece tras el cálculo.</div>
          )}
        </Card>
      </div>

      <Card title="Histórico de presupuestos (DB)" subtitle="Lista (demo). En producto final: estados, aprobaciones, PDFs, firma." icon="🗃️">
        <Table
          columns={[
            { key: "id", label: "ID" },
            { key: "tenant_id", label: "Tenant" },
            { key: "status", label: "Estado" },
            { key: "engine_version", label: "Engine" },
            { key: "tariff_version", label: "Tarifa" },
          ]}
          rows={history}
        />
      </Card>
    </div>
  );
}
