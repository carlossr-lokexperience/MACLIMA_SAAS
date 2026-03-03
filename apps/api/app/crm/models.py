from datetime import datetime
from enum import Enum
from typing import List, Optional
from uuid import UUID, uuid4
from sqlmodel import Field, Relationship, SQLModel


# 1. Definición de Estados para el Pipeline
class BudgetStatus(str, Enum):
    DRAFT = "draft"
    SENT = "sent"
    ACCEPTED = "accepted"
    REJECTED = "rejected"


class Customer(SQLModel, table=True):
    __tablename__ = "crm_customers"

    id: Optional[UUID] = Field(default_factory=uuid4, primary_key=True)
    tenant_id: str
    name: str
    email: str
    is_lead: bool = True

    # Relación: Un cliente puede tener muchos presupuestos / Customer → muchos Budget
    budgets: List["Budget"] = Relationship(back_populates="customer")


class Budget(SQLModel, table=True):
    __tablename__ = "crm_budgets"

    id: Optional[UUID] = Field(default_factory=uuid4, primary_key=True)
    tenant_id: str
    total_amount: float  # total presupuesto

    status: BudgetStatus = Field(default=BudgetStatus.DRAFT)

    # Relación con Cliente
    customer_id: UUID = Field(foreign_key="crm_customers.id")  # foreign Key
    customer: Optional[Customer] = Relationship(back_populates="budgets")

    # Relación con Archivos
    attachments: List["Attachment"] = Relationship(back_populates="budget")


class Attachment(SQLModel, table=True):
    __tablename__ = "crm_attachments"

    id: Optional[UUID] = Field(default_factory=uuid4, primary_key=True)
    tenant_id: str
    file_name: str
    file_path: str
    file_type: str

    # Relación con Presupuesto
    budget_id: UUID = Field(foreign_key="crm_budgets.id")
    budget: Optional[Budget] = Relationship(back_populates="attachments")

    created_at: datetime = Field(default_factory=datetime.utcnow)
