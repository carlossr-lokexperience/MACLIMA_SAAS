from fastapi import APIRouter, Depends
from sqlmodel import Session, select
from app.db import get_db
from .models import Budget


router = APIRouter(prefix="/crm/budgets", tags=["Budgets"])


@router.post("/")
def create_budget(budget: Budget, session: Session = Depends(get_db)):
    """
    Crea un nuevo presupuesto vinculado a un cliente (customer_id).
    """
    session.add(budget)
    session.commit()
    session.refresh(budget)
    return budget


@router.get("/")
def list_budgets(session: Session = Depends(get_db)):
    """
    Listar todos los presupuestos para el Pipeline.
    """
    statement = select(Budget)
    results = session.exec(statement)
    return results.all()
