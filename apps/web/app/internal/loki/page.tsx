"use client";

import React, { useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { Card } from "@/components/Card";
import { api } from "@/lib/api";

export default function Page() {
  const [msg, setMsg] = useState("Necesito un presupuesto para 120m² en Madrid con KIT-8KW.");
  const [reply, setReply] = useState<string | null>(null);
  const [actions, setActions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  return (
    <div className="space-y-4">
      <PageHeader
        title="Loki (IA Copilot)"
        subtitle="UI + endpoint stub. En producto final: tool calling, RAG, acciones auditadas."
        tags={[{ label: "Tool calling", tone: "info" }, { label: "RAG", tone: "info" }, { label: "Audit", tone: "info" }]}
      />

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-3">
        <Card title="Chat" subtitle="Pregunta a Loki" icon="🤖">
          <textarea className="input h-28" value={msg} onChange={(e) => setMsg(e.target.value)} />
          <button
            className="btn btn-primary w-full mt-3"
            disabled={loading}
            onClick={async () => {
              setLoading(true);
              setReply(null);
              try {
                const res: any = await api.lokiChat(msg);
                setReply(res.reply);
                setActions(res.suggested_actions || []);
              } finally {
                setLoading(false);
              }
            }}
          >
            {loading ? "Pensando..." : "Enviar"}
          </button>
        </Card>

        <Card title="Respuesta" subtitle="Texto + sugerencias" icon="🧠">
          {reply ? <pre className="whitespace-pre-wrap text-sm text-muted">{reply}</pre> : <div className="muted">Aún no hay respuesta.</div>}
          {actions.length ? (
            <div className="mt-4 space-y-2">
              <div className="text-sm font-semibold">Acciones sugeridas</div>
              {actions.map((a, idx) => (
                <a key={idx} href={a.route} className="btn w-full justify-start">{a.label}</a>
              ))}
            </div>
          ) : null}
        </Card>

        <Card title="Cómo se integrará" subtitle="Arquitectura recomendada" icon="🧩">
          <ul className="text-sm text-muted list-disc pl-5 space-y-1">
            <li>Loki llama a herramientas internas (API) con permisos RBAC.</li>
            <li>Motor de presupuestos siempre determinista.</li>
            <li>Audit log para acciones de IA.</li>
            <li>RAG sobre manuales, protocolos y tarifas.</li>
          </ul>
        </Card>
      </div>
    </div>
  );
}
