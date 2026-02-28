from datetime import datetime
from typing import Optional
from uuid import UUID, uuid4
from sqlmodel import SQLModel, Field


class Customer(SQLModel, table=True):
    """
    Modelo de base de datos para el Módulo CRM.
    Representa a un cliente o lead dentro de un portal específico.
    """

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
