from __future__ import annotations

from fastapi import APIRouter, Depends
from typing import Dict, Any, List
from sqlalchemy.orm import Session

from ..db import get_db
from ..deps import get_current_user
from .. import models
from ..services.audit import audit

router = APIRouter(prefix="/loki", tags=["loki"])

@router.post("/chat")
def chat(payload: Dict[str, Any], db: Session = Depends(get_db), user: models.User = Depends(get_current_user)):
    """Stub endpoint.

    In the final product:
    - call LLM with tool calling
    - tools = query internal APIs (orders, inventory, tickets, quotes, etc.)
    - return answer + tool traces (for transparency)
    """
    message = (payload or {}).get("message", "")
    audit(db, actor=user.email, action="LOKI_CHAT", entity="LOKI", entity_id=user.email, detail=message[:200])

    return {
        "reply": (
            "Soy Loki (stub). En el producto final podré: "
            "1) buscar datos (pedidos, stock, tickets), "
            "2) crear acciones (presupuesto, tarea, ticket), "
            "3) explicar cálculos del motor.

"
            f"Tu mensaje: {message}"
        ),
        "tools_used": [],
        "suggested_actions": [
            {"id":"open_quote", "label":"Crear presupuesto", "route":"/internal/quotes/new"},
            {"id":"check_stock", "label":"Ver inventario", "route":"/internal/wms/inventory"},
        ],
    }
