from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from ..db import get_db
from .. import models
from ..deps import get_current_user, require_portal, require_roles
from ..schemas import (
    PartnerOut, CustomerOut, SKUOut, InventoryBalanceOut,
    QuoteCalcInput, QuoteCalcResponse, QuoteOut,
    SalesOrderOut, ShipmentOut, TrackingEventOut,
    AssetOut, TicketOut, RMAOut, AuditLogOut
)
from ..pricing_engine.engine import calculate_quote
from ..services.audit import audit

router = APIRouter(tags=["core"])

# --- Catalog ---
@router.get("/catalog/skus", response_model=List[SKUOut])
def list_skus(db: Session = Depends(get_db), user: models.User = Depends(get_current_user)):
    skus = db.query(models.SKU).order_by(models.SKU.code.asc()).all()
    return [SKUOut(**{
        "code": s.code, "name": s.name, "uom": s.uom, "family": s.family, "price": s.price, "serializable": s.serializable
    }) for s in skus]

# --- Inventory ---
@router.get("/wms/inventory", response_model=List[InventoryBalanceOut])
def list_inventory(db: Session = Depends(get_db), user: models.User = Depends(get_current_user)):
    rows = (
        db.query(models.InventoryBalance, models.InventoryLocation)
        .join(models.InventoryLocation, models.InventoryBalance.location_id == models.InventoryLocation.id)
        .all()
    )
    out = []
    for bal, loc in rows:
        out.append(InventoryBalanceOut(
            sku_code=bal.sku_code,
            location_code=loc.code,
            warehouse=loc.warehouse,
            zone=loc.zone,
            on_hand=float(bal.on_hand),
            reserved=float(bal.reserved),
        ))
    return out

# --- Partners / Customers ---
@router.get("/partners", response_model=List[PartnerOut])
def list_partners(db: Session = Depends(get_db), user: models.User = Depends(require_portal(["internal"]))):
    partners = db.query(models.Partner).order_by(models.Partner.id.desc()).all()
    return [PartnerOut(**p.__dict__) for p in partners]

@router.get("/customers", response_model=List[CustomerOut])
def list_customers(db: Session = Depends(get_db), user: models.User = Depends(get_current_user)):
    # internal can see all; others: only their tenant
    q = db.query(models.Customer)
    if user.portal.value != "internal":
        q = q.filter(models.Customer.tenant_id == user.tenant_id)
    customers = q.order_by(models.Customer.id.desc()).all()
    return [CustomerOut(id=c.id, tenant_id=c.tenant_id, name=c.name, city=c.city) for c in customers]

# --- Quotes ---
@router.post("/quotes/calc", response_model=QuoteCalcResponse)
def calc_quote(payload: QuoteCalcInput, db: Session = Depends(get_db), user: models.User = Depends(get_current_user)):
    # Build a pricebook from SKUs table
    skus = db.query(models.SKU).all()
    pricebook = {s.code: float(s.price) for s in skus}
    result = calculate_quote(payload.model_dump(), pricebook)
    audit(db, actor=user.email, action="QUOTE_CALC", entity="QUOTE", entity_id="(calc)", detail=str(result["totals"]))
    return QuoteCalcResponse(**result)

@router.get("/quotes", response_model=List[QuoteOut])
def list_quotes(db: Session = Depends(get_db), user: models.User = Depends(get_current_user)):
    q = db.query(models.Quote)
    if user.portal.value != "internal":
        q = q.filter(models.Quote.tenant_id == user.tenant_id)
    quotes = q.order_by(models.Quote.id.desc()).limit(50).all()
    return [QuoteOut(
        id=x.id,
        tenant_id=x.tenant_id,
        status=x.status.value,
        engine_version=x.engine_version,
        tariff_version=x.tariff_version,
        input_json=x.input_json or {},
        totals_json=x.totals_json or {},
    ) for x in quotes]

# --- Orders / Shipments (TMS) ---
@router.get("/oms/orders", response_model=List[SalesOrderOut])
def list_orders(db: Session = Depends(get_db), user: models.User = Depends(get_current_user)):
    q = db.query(models.SalesOrder)
    if user.portal.value != "internal":
        q = q.filter(models.SalesOrder.tenant_id == user.tenant_id)
    orders = q.order_by(models.SalesOrder.id.desc()).limit(100).all()
    return [SalesOrderOut(
        id=o.id, tenant_id=o.tenant_id, status=o.status.value, priority=o.priority, customer_id=o.customer_id
    ) for o in orders]

@router.get("/tms/shipments", response_model=List[ShipmentOut])
def list_shipments(db: Session = Depends(get_db), user: models.User = Depends(get_current_user)):
    # internal can see all; others only shipments for their tenant's orders
    q = db.query(models.Shipment).join(models.SalesOrder, models.Shipment.order_id == models.SalesOrder.id)
    if user.portal.value != "internal":
        q = q.filter(models.SalesOrder.tenant_id == user.tenant_id)
    ships = q.order_by(models.Shipment.id.desc()).limit(100).all()
    return [ShipmentOut(id=s.id, order_id=s.order_id, carrier=s.carrier, tracking=s.tracking, status=s.status.value) for s in ships]

@router.get("/tms/shipments/{shipment_id}/events", response_model=List[TrackingEventOut])
def shipment_events(shipment_id: int, db: Session = Depends(get_db), user: models.User = Depends(get_current_user)):
    ship = db.query(models.Shipment).filter(models.Shipment.id == shipment_id).first()
    if not ship:
        raise HTTPException(status_code=404, detail="Shipment not found")
    events = db.query(models.TrackingEvent).filter(models.TrackingEvent.shipment_id == shipment_id).order_by(models.TrackingEvent.ts.asc()).all()
    return [TrackingEventOut(ts=e.ts.isoformat(), title=e.title, detail=e.detail, actor=e.actor) for e in events]

# --- SAT / RMA ---
@router.get("/sat/assets", response_model=List[AssetOut])
def list_assets(db: Session = Depends(get_db), user: models.User = Depends(get_current_user)):
    q = db.query(models.Asset).join(models.Customer, models.Asset.customer_id == models.Customer.id)
    if user.portal.value != "internal":
        q = q.filter(models.Customer.tenant_id == user.tenant_id)
    assets = q.order_by(models.Asset.id.desc()).limit(100).all()
    return [AssetOut(id=a.id, customer_id=a.customer_id, serial=a.serial, model_sku=a.model_sku, warranty_status=a.warranty_status.value) for a in assets]

@router.get("/sat/tickets", response_model=List[TicketOut])
def list_tickets(db: Session = Depends(get_db), user: models.User = Depends(get_current_user)):
    q = db.query(models.Ticket).join(models.Asset, models.Ticket.asset_id == models.Asset.id).join(models.Customer, models.Asset.customer_id == models.Customer.id)
    if user.portal.value != "internal":
        q = q.filter(models.Customer.tenant_id == user.tenant_id)
    tickets = q.order_by(models.Ticket.id.desc()).limit(100).all()
    return [TicketOut(id=t.id, asset_id=t.asset_id, summary=t.summary, priority=t.priority, status=t.status.value) for t in tickets]

@router.get("/rma", response_model=List[RMAOut])
def list_rmas(db: Session = Depends(get_db), user: models.User = Depends(get_current_user)):
    q = db.query(models.RMA).join(models.SalesOrder, models.RMA.order_id == models.SalesOrder.id)
    if user.portal.value != "internal":
        q = q.filter(models.SalesOrder.tenant_id == user.tenant_id)
    rmas = q.order_by(models.RMA.id.desc()).limit(100).all()
    return [RMAOut(id=r.id, order_id=r.order_id, reason=r.reason, status=r.status.value, disposition=r.disposition) for r in rmas]

# --- Admin / Audit ---
@router.get("/admin/audit", response_model=List[AuditLogOut])
def audit_log(db: Session = Depends(get_db), user: models.User = Depends(require_roles(["admin"]))):
    rows = db.query(models.AuditLog).order_by(models.AuditLog.ts.desc()).limit(200).all()
    return [AuditLogOut(ts=a.ts.isoformat(), actor=a.actor, action=a.action, entity=a.entity, entity_id=a.entity_id, detail=a.detail) for a in rows]
