from __future__ import annotations
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, DeclarativeBase
from .config import DATABASE_URL
from sqlmodel import SQLModel

# from app.crm.models import Customer

engine = create_engine(DATABASE_URL, pool_pre_ping=True, future=True)
SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False, future=True)


class Base(DeclarativeBase):
    pass


def init_db():
    # For demo: create tables automatically.
    # In production: use Alembic migrations.
    from app.crm.models import Customer, Budget

    print("🛠️ DEBUG: Sincronizando tablas con la base de datos...")
    SQLModel.metadata.create_all(bind=engine)

    print(f"✅ DEBUG: Tables now in metadata: {list(SQLModel.metadata.tables.keys())}")


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
