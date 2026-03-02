from datetime import datetime
from typing import Optional
from uuid import UUID, uuid4
from sqlmodel import SQLModel, Field
from typing import List, Optional


class Customer(SQLModel, table=True):

    __tablename__ = "crm_customers"

    # Identificador único (Primary Key)
    id: UUID = Field(default_factory=uuid4, primary_key=True)

    # Campo para Multi-tenant: Identifica a qué portal/empresa pertenece este cliente
    tenant_id: str = Field(index=True)

    # Información de contacto
    name: str = Field(index=True)
    email: str = Field(unique=True, index=True)
    nif: Optional[str] = Field(default=None, description="Identificación fiscal")
    phone: Optional[str] = Field(default=None)
    address: Optional[str] = Field(default=None)

    # Estado en el CRM: 'lead' (prospecto), 'active' (cliente), 'inactive'
    status: str = Field(default="lead")

    # Fechas automáticas
    created_at: datetime = Field(default_factory=datetime.utcnow)

    updated_at: datetime = Field(default_factory=datetime.utcnow)


class Budget(SQLModel, table=True):
    __tablename__ = "crm_budgets"

    id: UUID = Field(default_factory=uuid4, primary_key=True)
    description: str
    total_amount: float

    status: str = Field(default="draft")

    # RELACIÓN: Vinculación con el Cliente con el presupuesto

    customer_id: UUID = Field(foreign_key="crm_customers.id")

    tenant_id: str = Field(index=True)

    created_at: datetime = Field(default_factory=datetime.utcnow)
