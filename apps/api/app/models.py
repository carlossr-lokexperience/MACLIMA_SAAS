from __future__ import annotations

import enum
from datetime import datetime
from sqlalchemy import (
    Column, Integer, String, DateTime, Boolean, Enum, ForeignKey,
    Float, Text, JSON, UniqueConstraint
)
from sqlalchemy.orm import relationship
from .db import Base

class Portal(str, enum.Enum):
    internal = "internal"
    partner = "partner"
    client = "client"

class Role(str, enum.Enum):
    # internal
    admin = "admin"
    ops = "ops"
    warehouse = "warehouse"
    sat = "sat"
    procurement = "procurement"
    finance = "finance"
    # external
    partner_user = "partner_user"
    client_user = "client_user"

class TenantType(str, enum.Enum):
    internal = "internal"
    partner = "partner"
    client = "client"

class Tenant(Base):
    __tablename__ = "tenants"
    id = Column(Integer, primary_key=True)
    name = Column(String(200), nullable=False, unique=True)
    type = Column(Enum(TenantType), nullable=False, default=TenantType.internal)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    users = relationship("User", back_populates="tenant", cascade="all,delete-orphan")

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True)
    tenant_id = Column(Integer, ForeignKey("tenants.id"), nullable=False)
    email = Column(String(255), nullable=False, unique=True, index=True)
    full_name = Column(String(255), nullable=False)
    password_hash = Column(String(255), nullable=False)
    portal = Column(Enum(Portal), nullable=False, default=Portal.internal)
    role = Column(Enum(Role), nullable=False, default=Role.ops)
    is_active = Column(Boolean, nullable=False, default=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    tenant = relationship("Tenant", back_populates="users")

class Partner(Base):
    __tablename__ = "partners"
    id = Column(Integer, primary_key=True)
    tenant_id = Column(Integer, ForeignKey("tenants.id"), nullable=False, index=True)
    name = Column(String(255), nullable=False)
    level = Column(String(40), nullable=False, default="Bronze")
    city = Column(String(120), nullable=True)
    cert_valid = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

class Customer(Base):
    __tablename__ = "customers"
    id = Column(Integer, primary_key=True)
    tenant_id = Column(Integer, ForeignKey("tenants.id"), nullable=False, index=True)
    name = Column(String(255), nullable=False)
    city = Column(String(120), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

class SKU(Base):
    __tablename__ = "skus"
    code = Column(String(64), primary_key=True)
    name = Column(String(255), nullable=False)
    uom = Column(String(32), nullable=False, default="ud")
    family = Column(String(64), nullable=True)
    price = Column(Float, nullable=False, default=0.0)
    serializable = Column(Boolean, default=False, nullable=False)

class InventoryLocation(Base):
    __tablename__ = "inventory_locations"
    id = Column(Integer, primary_key=True)
    code = Column(String(64), nullable=False, unique=True)
    warehouse = Column(String(64), nullable=False)
    zone = Column(String(64), nullable=False)
    loc_type = Column(String(64), nullable=False)  # PICK/RES/RECV/QC/PACK
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

class InventoryBalance(Base):
    __tablename__ = "inventory_balances"
    id = Column(Integer, primary_key=True)
    sku_code = Column(String(64), ForeignKey("skus.code"), nullable=False, index=True)
    location_id = Column(Integer, ForeignKey("inventory_locations.id"), nullable=False, index=True)
    on_hand = Column(Float, nullable=False, default=0.0)
    reserved = Column(Float, nullable=False, default=0.0)
    updated_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    sku = relationship("SKU")
    location = relationship("InventoryLocation")

    __table_args__ = (
        UniqueConstraint("sku_code", "location_id", name="uq_sku_location"),
    )

class QuoteStatus(str, enum.Enum):
    draft = "draft"
    calculated = "calculated"
    sent = "sent"
    approved = "approved"
    rejected = "rejected"

class Quote(Base):
    __tablename__ = "quotes"
    id = Column(Integer, primary_key=True)
    tenant_id = Column(Integer, ForeignKey("tenants.id"), nullable=False, index=True)
    customer_id = Column(Integer, ForeignKey("customers.id"), nullable=True)
    status = Column(Enum(QuoteStatus), nullable=False, default=QuoteStatus.draft)
    engine_version = Column(String(64), nullable=False, default="engine-0.1")
    tariff_version = Column(String(64), nullable=False, default="tariff-2026.1")
    input_json = Column(JSON, nullable=False, default=dict)
    totals_json = Column(JSON, nullable=False, default=dict)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    customer = relationship("Customer")
    lines = relationship("QuoteLine", back_populates="quote", cascade="all,delete-orphan")

class QuoteLine(Base):
    __tablename__ = "quote_lines"
    id = Column(Integer, primary_key=True)
    quote_id = Column(Integer, ForeignKey("quotes.id"), nullable=False, index=True)
    sku_code = Column(String(64), ForeignKey("skus.code"), nullable=False)
    description = Column(String(255), nullable=True)
    qty = Column(Float, nullable=False, default=1.0)
    unit_price = Column(Float, nullable=False, default=0.0)
    discount_pct = Column(Float, nullable=False, default=0.0)
    line_total = Column(Float, nullable=False, default=0.0)

    quote = relationship("Quote", back_populates="lines")
    sku = relationship("SKU")

class SalesOrderStatus(str, enum.Enum):
    created = "created"
    approved = "approved"
    allocated = "allocated"
    picking = "picking"
    packed = "packed"
    shipped = "shipped"
    delivered = "delivered"
    backorder = "backorder"

class SalesOrder(Base):
    __tablename__ = "sales_orders"
    id = Column(Integer, primary_key=True)
    tenant_id = Column(Integer, ForeignKey("tenants.id"), nullable=False, index=True)
    customer_id = Column(Integer, ForeignKey("customers.id"), nullable=True)
    status = Column(Enum(SalesOrderStatus), nullable=False, default=SalesOrderStatus.created)
    priority = Column(String(32), nullable=False, default="Normal")
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    customer = relationship("Customer")
    lines = relationship("SalesOrderLine", back_populates="order", cascade="all,delete-orphan")

class SalesOrderLine(Base):
    __tablename__ = "sales_order_lines"
    id = Column(Integer, primary_key=True)
    order_id = Column(Integer, ForeignKey("sales_orders.id"), nullable=False, index=True)
    sku_code = Column(String(64), ForeignKey("skus.code"), nullable=False)
    qty = Column(Float, nullable=False, default=1.0)

    order = relationship("SalesOrder", back_populates="lines")
    sku = relationship("SKU")

class ShipmentStatus(str, enum.Enum):
    created = "created"
    in_transit = "in_transit"
    delivered = "delivered"
    exception = "exception"

class Shipment(Base):
    __tablename__ = "shipments"
    id = Column(Integer, primary_key=True)
    order_id = Column(Integer, ForeignKey("sales_orders.id"), nullable=False, index=True)
    carrier = Column(String(64), nullable=False)
    tracking = Column(String(128), nullable=False, unique=True)
    status = Column(Enum(ShipmentStatus), nullable=False, default=ShipmentStatus.created)
    pod_json = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    order = relationship("SalesOrder")
    events = relationship("TrackingEvent", back_populates="shipment", cascade="all,delete-orphan")

class TrackingEvent(Base):
    __tablename__ = "tracking_events"
    id = Column(Integer, primary_key=True)
    shipment_id = Column(Integer, ForeignKey("shipments.id"), nullable=False, index=True)
    ts = Column(DateTime, default=datetime.utcnow, nullable=False)
    title = Column(String(128), nullable=False)
    detail = Column(String(512), nullable=True)
    actor = Column(String(64), nullable=False, default="carrier")

    shipment = relationship("Shipment", back_populates="events")

class WarrantyStatus(str, enum.Enum):
    active = "active"
    expired = "expired"

class Asset(Base):
    __tablename__ = "assets"
    id = Column(Integer, primary_key=True)
    customer_id = Column(Integer, ForeignKey("customers.id"), nullable=False, index=True)
    serial = Column(String(128), nullable=False, unique=True)
    model_sku = Column(String(64), ForeignKey("skus.code"), nullable=False)
    warranty_status = Column(Enum(WarrantyStatus), nullable=False, default=WarrantyStatus.active)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    customer = relationship("Customer")
    model = relationship("SKU")

class TicketStatus(str, enum.Enum):
    open = "open"
    in_progress = "in_progress"
    resolved = "resolved"
    closed = "closed"

class Ticket(Base):
    __tablename__ = "tickets"
    id = Column(Integer, primary_key=True)
    asset_id = Column(Integer, ForeignKey("assets.id"), nullable=False, index=True)
    summary = Column(String(512), nullable=False)
    priority = Column(String(32), nullable=False, default="P3")
    status = Column(Enum(TicketStatus), nullable=False, default=TicketStatus.open)
    assigned_to = Column(String(255), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    asset = relationship("Asset")
    parts = relationship("TicketPart", back_populates="ticket", cascade="all,delete-orphan")

class TicketPart(Base):
    __tablename__ = "ticket_parts"
    id = Column(Integer, primary_key=True)
    ticket_id = Column(Integer, ForeignKey("tickets.id"), nullable=False, index=True)
    sku_code = Column(String(64), ForeignKey("skus.code"), nullable=False)
    qty = Column(Float, nullable=False, default=1.0)

    ticket = relationship("Ticket", back_populates="parts")
    sku = relationship("SKU")

class RMAStatus(str, enum.Enum):
    requested = "requested"
    received = "received"
    closed = "closed"

class RMA(Base):
    __tablename__ = "rmas"
    id = Column(Integer, primary_key=True)
    order_id = Column(Integer, ForeignKey("sales_orders.id"), nullable=False, index=True)
    reason = Column(String(512), nullable=False)
    status = Column(Enum(RMAStatus), nullable=False, default=RMAStatus.requested)
    disposition = Column(String(64), nullable=True)  # RESTOCK/REPAIR/SCRAP
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

class PurchaseOrderStatus(str, enum.Enum):
    created = "created"
    asn_sent = "asn_sent"
    received = "received"

class PurchaseOrder(Base):
    __tablename__ = "purchase_orders"
    id = Column(Integer, primary_key=True)
    supplier_name = Column(String(255), nullable=False)
    status = Column(Enum(PurchaseOrderStatus), nullable=False, default=PurchaseOrderStatus.created)
    eta = Column(String(32), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    lines = relationship("PurchaseOrderLine", back_populates="po", cascade="all,delete-orphan")

class PurchaseOrderLine(Base):
    __tablename__ = "purchase_order_lines"
    id = Column(Integer, primary_key=True)
    po_id = Column(Integer, ForeignKey("purchase_orders.id"), nullable=False, index=True)
    sku_code = Column(String(64), ForeignKey("skus.code"), nullable=False)
    qty = Column(Float, nullable=False, default=1.0)

    po = relationship("PurchaseOrder", back_populates="lines")
    sku = relationship("SKU")

class ASNStatus(str, enum.Enum):
    in_transit = "in_transit"
    received = "received"

class ASN(Base):
    __tablename__ = "asns"
    id = Column(Integer, primary_key=True)
    po_id = Column(Integer, ForeignKey("purchase_orders.id"), nullable=False, index=True)
    status = Column(Enum(ASNStatus), nullable=False, default=ASNStatus.in_transit)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

class QCStatus(str, enum.Enum):
    pending = "pending"
    pass_ = "pass"
    fail = "fail"
    hold = "hold"

class Receipt(Base):
    __tablename__ = "receipts"
    id = Column(Integer, primary_key=True)
    asn_id = Column(Integer, ForeignKey("asns.id"), nullable=False, index=True)
    status = Column(String(64), nullable=False, default="received")
    qc_status = Column(Enum(QCStatus), nullable=False, default=QCStatus.pending)
    received_at = Column(DateTime, default=datetime.utcnow, nullable=False)

class AuditLog(Base):
    __tablename__ = "audit_logs"
    id = Column(Integer, primary_key=True)
    ts = Column(DateTime, default=datetime.utcnow, nullable=False, index=True)
    actor = Column(String(255), nullable=False)
    action = Column(String(128), nullable=False)
    entity = Column(String(128), nullable=False)
    entity_id = Column(String(128), nullable=False)
    detail = Column(Text, nullable=True)
