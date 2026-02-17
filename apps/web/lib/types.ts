export type Portal = "internal" | "partner" | "client";
export type Role =
  | "admin" | "ops" | "warehouse" | "sat" | "procurement" | "finance"
  | "partner_user" | "client_user";

export type User = {
  id: number;
  email: string;
  full_name: string;
  portal: Portal;
  role: Role;
  tenant_id: number;
  tenant_name?: string | null;
};

export type LoginResponse = {
  access_token: string;
  token_type: "bearer";
  user: User;
};

export type QuoteCalcInput = {
  surface_m2: number;
  perimeter_ml: number;
  tubing_m: number;
  kit_model: string;
  include_installation: boolean;
  partner_level: string;
  region: string;
};

export type QuoteCalcResponse = {
  engine_version: string;
  tariff_version: string;
  line_items: any[];
  totals: Record<string, any>;
  bom: any[];
  explain: string[];
  warnings: string[];
};

export type InventoryRow = {
  sku_code: string;
  location_code: string;
  warehouse: string;
  zone: string;
  on_hand: number;
  reserved: number;
};

export type SalesOrder = {
  id: number;
  tenant_id: number;
  status: string;
  priority: string;
  customer_id?: number | null;
};

export type Shipment = {
  id: number;
  order_id: number;
  carrier: string;
  tracking: string;
  status: string;
};

export type TrackingEvent = {
  ts: string;
  title: string;
  detail?: string | null;
  actor: string;
};

export type Asset = {
  id: number;
  customer_id: number;
  serial: string;
  model_sku: string;
  warranty_status: string;
};

export type Ticket = {
  id: number;
  asset_id: number;
  summary: string;
  priority: string;
  status: string;
};

export type AuditRow = {
  ts: string;
  actor: string;
  action: string;
  entity: string;
  entity_id: string;
  detail?: string | null;
};
