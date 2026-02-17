"use client";

import React, { useState } from "react";
import { api } from "@/lib/api";
import { setSession } from "@/lib/storage";
import { useRouter } from "next/navigation";
import { Logo } from "@/components/Logo";
import { Badge } from "@/components/Badge";
import { Lock, Users, Building2 } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [portal, setPortal] = useState<"internal" | "partner" | "client">("internal");
  const [email, setEmail] = useState("admin@maclima.local");
  const [password, setPassword] = useState("admin123");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const quickFill = (p: typeof portal) => {
    setPortal(p);
    if (p === "internal") { setEmail("admin@maclima.local"); setPassword("admin123"); }
    if (p === "partner") { setEmail("partner@pt-002.local"); setPassword("partner123"); }
    if (p === "client") { setEmail("client@c-001.local"); setPassword("client123"); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="max-w-5xl w-full grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <div className="cardPad">
            <Logo />
            <div className="mt-6">
              <div className="text-2xl font-semibold">Iniciar sesión</div>
              <div className="muted mt-1">Elige portal y entra con un usuario demo.</div>
            </div>

            <div className="mt-5 grid grid-cols-3 gap-2">
              <button className="btn" onClick={() => quickFill("internal")}>
                <Building2 size={16} /> Interno
              </button>
              <button className="btn" onClick={() => quickFill("partner")}>
                <Users size={16} /> Partner
              </button>
              <button className="btn" onClick={() => quickFill("client")}>
                <Users size={16} /> Cliente
              </button>
            </div>

            <div className="mt-5">
              <label className="text-sm text-muted">Portal</label>
              <select className="input mt-2" value={portal} onChange={(e) => setPortal(e.target.value as any)}>
                <option value="internal">Interno</option>
                <option value="partner">Partner</option>
                <option value="client">Cliente</option>
              </select>
            </div>

            <div className="mt-4">
              <label className="text-sm text-muted">Email</label>
              <input className="input mt-2" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>

            <div className="mt-4">
              <label className="text-sm text-muted">Contraseña</label>
              <input className="input mt-2" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>

            {err ? (
              <div className="mt-4 text-sm text-red-300">{err}</div>
            ) : null}

            <button
              className="btn btn-primary w-full mt-5"
              disabled={loading}
              onClick={async () => {
                setErr(null);
                setLoading(true);
                try {
                  const data: any = await api.login(email, password, portal);
                  setSession(data);
                  const p = data.user.portal;
                  if (p === "internal") router.push("/internal/dashboard");
                  else if (p === "partner") router.push("/partner/dashboard");
                  else router.push("/client/dashboard");
                } catch (e: any) {
                  setErr(e.message || "Error login");
                } finally {
                  setLoading(false);
                }
              }}
            >
              <Lock size={16} /> {loading ? "Entrando..." : "Entrar"}
            </button>

            <div className="mt-4 flex flex-wrap gap-2">
              <Badge tone="info">RBAC</Badge>
              <Badge tone="info">Multi-portal</Badge>
              <Badge tone="info">Audit</Badge>
              <Badge tone="info">Pricing Engine</Badge>
              <Badge tone="info">Loki</Badge>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <div className="card">
            <div className="cardPad">
              <div className="text-lg font-semibold">Qué vas a enseñar con esta UI</div>
              <ul className="mt-3 space-y-2 text-sm text-muted list-disc pl-5">
                <li>Paneles por portal (interno/partner/cliente) con menú adaptativo.</li>
                <li>Ventanas clave: CRM, Presupuestos, OMS, WMS, TMS, SAT, RMA, Partners/Clientes, KPIs, Auditoría.</li>
                <li>Presupuestador determinista con breakdown + explicaciones.</li>
                <li>Loki (stub) con acciones sugeridas (tool calling futuro).</li>
              </ul>
            </div>
          </div>

          <div className="card">
            <div className="cardPad">
              <div className="text-lg font-semibold">Notas (para producción)</div>
              <div className="muted mt-2">
                Este starter usa token en localStorage/cookie legible (demo). En producción: cookies httpOnly + refresh tokens + CORS
                estricto + rate limits.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
