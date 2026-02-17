from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..db import get_db
from .. import models
from ..schemas import LoginRequest, TokenResponse, MeResponse
from ..auth import verify_password, create_access_token
from ..deps import get_current_user
from ..services.audit import audit

router = APIRouter(prefix="/auth", tags=["auth"])

@router.post("/login", response_model=TokenResponse)
def login(payload: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == payload.email).first()
    if not user or not user.is_active:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    if not verify_password(payload.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    token = create_access_token(user.email, extra={"role": user.role.value, "portal": user.portal.value, "tenant_id": user.tenant_id})
    audit(db, actor=user.email, action="LOGIN", entity="USER", entity_id=str(user.id), detail=f"portal={user.portal.value}")
    return TokenResponse(
        access_token=token,
        user={
            "id": user.id,
            "email": user.email,
            "full_name": user.full_name,
            "portal": user.portal.value,
            "role": user.role.value,
            "tenant_id": user.tenant_id,
            "tenant_name": user.tenant.name if user.tenant else None,
        },
    )

@router.get("/me", response_model=MeResponse)
def me(user: models.User = Depends(get_current_user)):
    return MeResponse(user={
        "id": user.id,
        "email": user.email,
        "full_name": user.full_name,
        "portal": user.portal.value,
        "role": user.role.value,
        "tenant_id": user.tenant_id,
        "tenant_name": user.tenant.name if user.tenant else None,
    })
