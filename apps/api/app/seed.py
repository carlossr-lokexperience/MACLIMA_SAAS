from __future__ import annotations

"""Seed demo data.

Run:
    python -m app.seed
"""

from sqlalchemy.orm import Session

from .db import SessionLocal, init_db
from . import models
from .auth import hash_password

def upsert_tenant(db: Session, name: str, ttype: models.TenantType) -> models.Tenant:
    t = db.query(models.Tenant).filter(models.Tenant.name == name).first()
    if t:
        return t
    t = models.Tenant(name=name, type=ttype)
    db.add(t)
    db.commit()
    db.refresh(t)
    return t

def upsert_user(db: Session, tenant_id: int, email: str, full_name: str, portal: models.Portal, role: models.Role, password: str):
    u = db.query(models.User).filter(models.User.email == email).first()
    if u:
        return u
    u = models.User(
        tenant_id=tenant_id,
        email=email,
        full_name=full_name,
        portal=portal,
        role=role,
        password_hash=hash_password(password),
        is_active=True,
    )
    db.add(u)
    db.commit()
    db.refresh(u)
    return u

def seed():
    init_db()
    db = SessionLocal()
    try:
        # Tenants
        t_internal = upsert_tenant(db, "MACLIMA", models.TenantType.internal)
        t_partner = upsert_tenant(db, "ClimaPro Levante (PT-002)", models.TenantType.partner)
        t_client = upsert_tenant(db, "Juan Pérez (C-001)", models.TenantType.client)

        # Users
        upsert_user(db, t_internal.id, "admin@maclima.local", "Admin MACLIMA", models.Portal.internal, models.Role.admin, "admin123")
        upsert_user(db, t_partner.id, "partner@pt-002.local", "Partner Demo", models.Portal.partner, models.Role.partner_user, "partner123")
        upsert_user(db, t_client.id, "client@c-001.local", "Cliente Demo", models.Portal.client, models.Role.client_user, "client123")

        # Partners / Customers
        if not db.query(models.Partner).first():
            db.add_all([
                models.Partner(tenant_id=t_partner.id, name="ClimaPro Levante", level="Silver", city="Valencia", cert_valid=True),
                models.Partner(tenant_id=t_internal.id, name="Expert HVAC Centro", level="Expert", city="Madrid", cert_valid=True),
            ])
            db.commit()

        if not db.query(models.Customer).first():
            db.add_all([
                models.Customer(tenant_id=t_client.id, name="Juan Pérez", city="Madrid"),
                models.Customer(tenant_id=t_partner.id, name="Empresa XYZ", city="Valencia"),
            ])
            db.commit()

        # SKUs
        if not db.query(models.SKU).first():
            db.add_all([
                models.SKU(code="KIT-8KW", name="Kit Aerotermia 8kW", uom="ud", family="EQUIPO", price=3900.0, serializable=True),
                models.SKU(code="KIT-10KW", name="Kit Aerotermia 10kW", uom="ud", family="EQUIPO", price=4500.0, serializable=True),
                models.SKU(code="KIT-12KW", name="Kit Aerotermia 12kW", uom="ud", family="EQUIPO", price=5200.0, serializable=True),
                models.SKU(code="KIT-16KW", name="Kit Aerotermia 16kW", uom="ud", family="EQUIPO", price=6900.0, serializable=True),
                models.SKU(code="PANEL", name="Panel SR", uom="m²", family="SR", price=12.0, serializable=False),
                models.SKU(code="BANDA", name="Banda perimetral", uom="ml", family="SR", price=1.2, serializable=False),
                models.SKU(code="ADITIVO", name="Aditivo", uom="kg", family="SR", price=4.5, serializable=False),
                models.SKU(code="TUBO", name="Tubo PEX-A", uom="m", family="SR", price=0.9, serializable=False),
            ])
            db.commit()

        # Locations
        if not db.query(models.InventoryLocation).first():
            locs = [
                models.InventoryLocation(code="MAD-PICK-01", warehouse="MAD", zone="PICK", loc_type="PICK"),
                models.InventoryLocation(code="MAD-PICK-02", warehouse="MAD", zone="PICK", loc_type="PICK"),
                models.InventoryLocation(code="MAD-RES-01", warehouse="MAD", zone="RES", loc_type="RESERVE"),
                models.InventoryLocation(code="MAD-RECV-01", warehouse="MAD", zone="RECV", loc_type="RECEIVING"),
                models.InventoryLocation(code="MAD-QC-01", warehouse="MAD", zone="QC", loc_type="QUARANTINE"),
            ]
            db.add_all(locs)
            db.commit()

        # Inventory balances
        if not db.query(models.InventoryBalance).first():
            loc_by_code = {l.code: l for l in db.query(models.InventoryLocation).all()}
            db.add_all([
                models.InventoryBalance(sku_code="KIT-8KW", location_id=loc_by_code["MAD-PICK-01"].id, on_hand=6, reserved=0),
                models.InventoryBalance(sku_code="KIT-8KW", location_id=loc_by_code["MAD-RES-01"].id, on_hand=4, reserved=0),
                models.InventoryBalance(sku_code="KIT-12KW", location_id=loc_by_code["MAD-RES-01"].id, on_hand=3, reserved=0),
                models.InventoryBalance(sku_code="PANEL", location_id=loc_by_code["MAD-PICK-01"].id, on_hand=850, reserved=0),
                models.InventoryBalance(sku_code="BANDA", location_id=loc_by_code["MAD-PICK-02"].id, on_hand=1200, reserved=0),
                models.InventoryBalance(sku_code="TUBO", location_id=loc_by_code["MAD-RES-01"].id, on_hand=3200, reserved=0),
                models.InventoryBalance(sku_code="ADITIVO", location_id=loc_by_code["MAD-PICK-02"].id, on_hand=400, reserved=0),
            ])
            db.commit()

        # Create demo order + shipment + events
        if not db.query(models.SalesOrder).first():
            # attach to client tenant's customer
            customer = db.query(models.Customer).filter(models.Customer.name == "Juan Pérez").first()
            so = models.SalesOrder(tenant_id=t_client.id, customer_id=customer.id if customer else None, status=models.SalesOrderStatus.approved, priority="Normal")
            db.add(so)
            db.commit(); db.refresh(so)

            db.add_all([
                models.SalesOrderLine(order_id=so.id, sku_code="PANEL", qty=120),
                models.SalesOrderLine(order_id=so.id, sku_code="BANDA", qty=132),
                models.SalesOrderLine(order_id=so.id, sku_code="TUBO", qty=600),
                models.SalesOrderLine(order_id=so.id, sku_code="KIT-8KW", qty=1),
            ])
            db.commit()

            ship = models.Shipment(order_id=so.id, carrier="DHL", tracking="TRKSH00001", status=models.ShipmentStatus.in_transit)
            db.add(ship)
            db.commit(); db.refresh(ship)

            db.add_all([
                models.TrackingEvent(shipment_id=ship.id, title="Envío creado", detail="Etiqueta generada", actor="tms"),
                models.TrackingEvent(shipment_id=ship.id, title="Recogido", detail="Recogido en MAD", actor="carrier"),
                models.TrackingEvent(shipment_id=ship.id, title="En tránsito", detail="Hub central", actor="carrier"),
            ])
            db.commit()

        # Assets + ticket
        if not db.query(models.Asset).first():
            customer = db.query(models.Customer).filter(models.Customer.name == "Juan Pérez").first()
            asset = models.Asset(customer_id=customer.id, serial="SN8K-001122", model_sku="KIT-8KW", warranty_status=models.WarrantyStatus.active)
            db.add(asset)
            db.commit(); db.refresh(asset)

            t = models.Ticket(asset_id=asset.id, summary="Baja temperatura impulsión", priority="P2", status=models.TicketStatus.open, assigned_to=None)
            db.add(t); db.commit()

        # Procurement demo
        if not db.query(models.PurchaseOrder).first():
            po = models.PurchaseOrder(supplier_name="Proveedor SR España", status=models.PurchaseOrderStatus.created, eta="2026-02-28")
            db.add(po); db.commit(); db.refresh(po)
            db.add_all([
                models.PurchaseOrderLine(po_id=po.id, sku_code="PANEL", qty=1000),
                models.PurchaseOrderLine(po_id=po.id, sku_code="TUBO", qty=2000),
            ])
            db.commit()

        print("Seed OK ✅")
    finally:
        db.close()

if __name__ == "__main__":
    seed()
