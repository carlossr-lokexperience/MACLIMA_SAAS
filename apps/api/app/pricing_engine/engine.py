from __future__ import annotations
from typing import Dict, Any, List, Tuple

ENGINE_VERSION = "engine-0.1"
TARIFF_VERSION = "tariff-2026.1"

def _partner_discount(level: str) -> float:
    lvl = (level or "").lower()
    if lvl == "bronze":
        return 0.05
    if lvl == "silver":
        return 0.10
    if lvl == "expert":
        return 0.15
    return 0.0

def calculate_quote(inputs: Dict[str, Any], pricebook: Dict[str, float]) -> Dict[str, Any]:
    """Deterministic quote calc.

    This is intentionally simple: replace with your real formulas.
    The key is the shape:
    - line_items
    - bom
    - totals
    - explain (auditability)
    """
    surface = float(inputs.get("surface_m2", 0.0))
    perimeter = float(inputs.get("perimeter_ml", 0.0))
    tubing = float(inputs.get("tubing_m", 0.0))
    kit_model = inputs.get("kit_model", "KIT-8KW")
    include_install = bool(inputs.get("include_installation", True))
    partner_level = inputs.get("partner_level", "Direct")

    # Basic BOM rules (placeholder)
    # Example: panels = surface, band = perimeter, tube = tubing, additive = surface*0.2
    bom = [
        {"sku": "PANEL", "qty": round(surface, 2), "uom": "m²"},
        {"sku": "BANDA", "qty": round(perimeter, 2), "uom": "ml"},
        {"sku": "TUBO", "qty": round(tubing, 2), "uom": "m"},
        {"sku": "ADITIVO", "qty": round(surface * 0.20, 2), "uom": "kg"},
        {"sku": kit_model, "qty": 1.0, "uom": "ud"},
    ]

    explain: List[str] = []
    explain.append(f"Paneles = superficie ({surface} m²)")
    explain.append(f"Banda = perímetro ({perimeter} ml)")
    explain.append(f"Tubo = longitud ({tubing} m)")
    explain.append(f"Aditivo = superficie * 0.20 = {round(surface*0.20,2)} kg")
    explain.append(f"Equipo = {kit_model} x1")

    line_items: List[Dict[str, Any]] = []
    subtotal = 0.0
    for b in bom:
        sku = b["sku"]
        qty = float(b["qty"])
        unit = float(pricebook.get(sku, 0.0))
        total = round(qty * unit, 2)
        subtotal += total
        line_items.append({
            "type": "material",
            "sku": sku,
            "description": sku,
            "qty": qty,
            "unit_price": unit,
            "discount_pct": 0.0,
            "total": total,
        })

    labor = 0.0
    if include_install:
        # Placeholder: 16h + 0.05h per m2
        hours = 16.0 + surface * 0.05
        rate = 35.0
        labor = round(hours * rate, 2)
        subtotal += labor
        line_items.append({
            "type": "labor",
            "sku": "LABOR",
            "description": f"Instalación ({round(hours,1)}h)",
            "qty": round(hours,1),
            "unit_price": rate,
            "discount_pct": 0.0,
            "total": labor,
        })
        explain.append(f"Mano de obra = (16 + 0.05*{surface})h * {rate}€/h")

    disc = _partner_discount(partner_level)
    discount_amount = round(subtotal * disc, 2) if disc > 0 else 0.0
    total_after_discount = round(subtotal - discount_amount, 2)

    vat_rate = 0.21
    vat = round(total_after_discount * vat_rate, 2)
    grand_total = round(total_after_discount + vat, 2)

    totals = {
        "subtotal": round(subtotal, 2),
        "discount_pct": disc,
        "discount_amount": discount_amount,
        "total_after_discount": total_after_discount,
        "vat_rate": vat_rate,
        "vat": vat,
        "grand_total": grand_total,
    }

    if disc > 0:
        explain.append(f"Descuento partner ({partner_level}) = {int(disc*100)}%")

    warnings: List[str] = []
    if surface <= 0:
        warnings.append("Superficie <= 0 (revisar inputs).")

    return {
        "engine_version": ENGINE_VERSION,
        "tariff_version": TARIFF_VERSION,
        "line_items": line_items,
        "bom": bom,
        "totals": totals,
        "explain": explain,
        "warnings": warnings,
    }
