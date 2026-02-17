from __future__ import annotations
from sqlalchemy.orm import Session
from ..models import AuditLog

def audit(db: Session, actor: str, action: str, entity: str, entity_id: str, detail: str = "") -> None:
    row = AuditLog(actor=actor, action=action, entity=entity, entity_id=entity_id, detail=detail)
    db.add(row)
    db.commit()
