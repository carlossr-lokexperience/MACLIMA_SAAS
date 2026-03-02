from fastapi import APIRouter, Depends
from sqlmodel import Session, select
from app.db import get_db
from .models import Customer

router = APIRouter(prefix="/crm", tags=["CRM"])


@router.get("/customers")
def get_customers(session: Session = Depends(get_db)):
    customers = session.execute(select(Customer)).all()
    return customers


@router.post("/customers")
def create_customer(customer: Customer, session: Session = Depends(get_db)):
    session.add(customer)
    session.commit()
    session.refresh(customer)
    return customer
