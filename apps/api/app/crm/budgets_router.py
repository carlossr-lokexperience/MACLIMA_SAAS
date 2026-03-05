from fastapi import APIRouter, Depends
from sqlmodel import Session, select
from app.db import get_db
from .models import Budget, Attachment
from uuid import UUID


router = APIRouter(prefix="/crm/budgets", tags=["Budgets"])


@router.post("/")
def create_budget(budget: Budget, session: Session = Depends(get_db)):

    # Crear un nuevo presupuesto vinculado a un cliente (customer_id).

    session.add(budget)
    session.commit()
    session.refresh(budget)
    return budget


@router.get("/")
def list_budgets(session: Session = Depends(get_db)):

    statement = select(Budget)
    results = session.execute(statement).scalars().all()
    return results


@router.get("/pipeline")
def get_pipeline(session: Session = Depends(get_db)):

    statement = select(Budget)
    budgets = session.execute(statement).scalars().all()

    # Estructura del Pipeline
    pipeline = {"draft": [], "sent": [], "accepted": [], "rejected": []}

    for b in budgets:
        pipeline[b.status.value].append(b)

    return pipeline


@router.get("/stats")
def get_budget_stats(session: Session = Depends(get_db)):

    statement = select(Budget)
    budgets = session.execute(statement).scalars().all()

    # Inicializamos los contadores en 0.0
    stats = {
        "draft": {"count": 0, "total_base": 0.0, "total_iva": 0.0},
        "sent": {"count": 0, "total_base": 0.0, "total_iva": 0.0},
        "accepted": {"count": 0, "total_base": 0.0, "total_iva": 0.0},
        "rejected": {"count": 0, "total_base": 0.0, "total_iva": 0.0},
    }

    iva_rate = 0.21  # 21% de IVA en España para climatización

    for b in budgets:
        state = b.status.value
        base = b.total_amount
        iva = base * iva_rate

        stats[state]["count"] += 1
        stats[state]["total_base"] += base
        stats[state]["total_iva"] += iva

    return {
        "summary": stats,
        "grand_total_iva_included": sum(
            s["total_base"] + s["total_iva"] for s in stats.values()
        ),
    }


@router.post("/{budget_id}/attachments")
def add_attachment(
    budget_id: UUID,
    file_name: str,
    file_path: str,
    tenant_id: str,
    session: Session = Depends(get_db),
):
    """
    Registra un nuevo archivo adjunto (PDF, Planos, Fotos) vinculado a un presupuesto.
    """
    # 1. Verificar que el presupuesto existe
    budget = session.get(Budget, budget_id)
    if not budget:
        return {"error": "El presupuesto no existe. No se puede adjuntar el archivo."}

    # 2. Crear el registro del adjunto
    # Extraemos la extensión automáticamente (ej: .pdf)
    ext = file_name.split(".")[-1] if "." in file_name else "unknown"

    new_attachment = Attachment(
        file_name=file_name,
        file_path=file_path,
        file_type=ext,
        budget_id=budget_id,
        tenant_id=tenant_id,
    )

    session.add(new_attachment)
    session.commit()
    session.refresh(new_attachment)

    return {
        "message": "Archivo adjunto registrado con éxito",
        "attachment": new_attachment,
    }
