from __future__ import annotations
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field

# ---------- Auth ----------
class LoginRequest(BaseModel):
    email: str
    password: str
    portal: str = Field(default="internal")  # internal|partner|client (UI hint)

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: Dict[str, Any]

class MeResponse(BaseModel):
    user: Dict[str, Any]

# ---------- Common ----------
class PartnerOut(BaseModel):
    id: int
    tenant_id: int
    name: str
    level: str
    city: Optional[str] = None
    cert_valid: bool

class CustomerOut(BaseModel):
    id: int
    tenant_id: int
    name: str
    city: Optional[str] = None

class SKUOut(BaseModel):
    code: str
    name: str
    uom: str
    family: Optional[str] = None
    price: float
    serializable: bool

class InventoryBalanceOut(BaseModel):
    sku_code: str
    location_code: str
    warehouse: str
    zone: str
    on_hand: float
    reserved: float

# ---------- Quotes ----------
class QuoteCalcInput(BaseModel):
    # Minimal example inputs (ajusta a tus fórmulas reales)
    surface_m2: float = 120.0
    perimeter_ml: float = 132.0
    tubing_m: float = 600.0
    kit_model: str = "KIT-8KW"
    include_installation: bool = True
    partner_level: str = "Direct"  # Direct/Bronze/Silver/Expert
    region: str = "MAD"

class QuoteCalcResponse(BaseModel):
    engine_version: str
    tariff_version: str
    line_items: List[Dict[str, Any]]
    totals: Dict[str, Any]
    bom: List[Dict[str, Any]]
    explain: List[str]
    warnings: List[str] = []

class QuoteOut(BaseModel):
    id: int
    tenant_id: int
    status: str
    engine_version: str
    tariff_version: str
    input_json: Dict[str, Any]
    totals_json: Dict[str, Any]

# ---------- Orders/WMS/TMS ----------
class SalesOrderOut(BaseModel):
    id: int
    tenant_id: int
    status: str
    priority: str
    customer_id: Optional[int] = None

class ShipmentOut(BaseModel):
    id: int
    order_id: int
    carrier: str
    tracking: str
    status: str

class TrackingEventOut(BaseModel):
    ts: str
    title: str
    detail: Optional[str] = None
    actor: str

# ---------- SAT/RMA ----------
class AssetOut(BaseModel):
    id: int
    customer_id: int
    serial: str
    model_sku: str
    warranty_status: str

class TicketOut(BaseModel):
    id: int
    asset_id: int
    summary: str
    priority: str
    status: str

class RMAOut(BaseModel):
    id: int
    order_id: int
    reason: str
    status: str
    disposition: Optional[str] = None

# ---------- Admin / Audit ----------
class AuditLogOut(BaseModel):
    ts: str
    actor: str
    action: str
    entity: str
    entity_id: str
    detail: Optional[str] = None
