"use client";

import { getToken } from "@/lib/storage";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

async function request<T>(path: string, opts: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(opts.headers as any),
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${API_URL}${path}`, { ...opts, headers });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || `HTTP ${res.status}`);
  }
  return res.json() as Promise<T>;
}

export const api = {
  login: (email: string, password: string, portal: string) =>
    request("/auth/login", { method: "POST", body: JSON.stringify({ email, password, portal }) }),

  me: () => request("/auth/me"),

  skus: () => request("/catalog/skus"),
  inventory: () => request("/wms/inventory"),

  partners: () => request("/partners"),
  customers: () => request("/customers"),

  quoteCalc: (payload: any) => request("/quotes/calc", { method: "POST", body: JSON.stringify(payload) }),
  quotes: () => request("/quotes"),

  orders: () => request("/oms/orders"),
  shipments: () => request("/tms/shipments"),
  shipmentEvents: (id: number) => request(`/tms/shipments/${id}/events`),

  assets: () => request("/sat/assets"),
  tickets: () => request("/sat/tickets"),
  rmas: () => request("/rma"),

  audit: () => request("/admin/audit"),
  lokiChat: (message: string) => request("/loki/chat", { method: "POST", body: JSON.stringify({ message }) }),
};
