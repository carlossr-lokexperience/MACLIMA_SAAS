"""
Router de autenticación.

Incluye:
- POST /auth/login       → login con email + password
- GET  /auth/me          → datos del usuario autenticado
- GET  /auth/google      → inicia el flujo OAuth 2.0 con Google (redirige a Google)
- GET  /auth/google/callback → Google redirige aquí; intercambia el code, crea/busca
                               el usuario en BD y devuelve el JWT propio de la app.

Para que el SSO funcione necesitas:
  1. Crear un proyecto en https://console.cloud.google.com
  2. Añadir las credenciales OAuth 2.0 (tipo "Aplicación web")
  3. Poner como URI de redirección autorizada: http://localhost:8000/auth/google/callback
  4. Añadir al .env:
       GOOGLE_CLIENT_ID=...
       GOOGLE_CLIENT_SECRET=...
       GOOGLE_REDIRECT_URI=http://localhost:8000/auth/google/callback
       FRONTEND_URL=http://localhost:3000
"""
from __future__ import annotations

import os
import urllib.parse

import httpx
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import RedirectResponse
from sqlalchemy.orm import Session

from ..db import get_db
from .. import models
from ..schemas import LoginRequest, TokenResponse, MeResponse
from ..auth import verify_password, create_access_token
from ..deps import get_current_user
from ..services.audit import audit

router = APIRouter(prefix="/auth", tags=["auth"])

# ---------------------------------------------------------------------------
# Configuración Google OAuth (se lee del entorno)
# ---------------------------------------------------------------------------
GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID", "")
GOOGLE_CLIENT_SECRET = os.getenv("GOOGLE_CLIENT_SECRET", "")
GOOGLE_REDIRECT_URI = os.getenv(
    "GOOGLE_REDIRECT_URI", "http://localhost:8000/auth/google/callback"
)
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:3000")

GOOGLE_AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth"
GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token"
GOOGLE_USERINFO_URL = "https://www.googleapis.com/oauth2/v3/userinfo"


# ---------------------------------------------------------------------------
# Login clásico (email + contraseña)
# ---------------------------------------------------------------------------
@router.post("/login", response_model=TokenResponse)
def login(payload: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == payload.email).first()

    if not user or not user.is_active:
        raise HTTPException(status_code=401, detail="Invalid credentials")

    # Si el usuario solo tiene cuenta Google no tiene password_hash
    if not user.password_hash:
        raise HTTPException(
            status_code=401,
            detail="Este usuario usa inicio de sesión con Google. Pulsa 'Continuar con Google'.",
        )

    if not verify_password(payload.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    token = create_access_token(
        user.email,
        extra={
            "role": user.role.value,
            "portal": user.portal.value,
            "tenant_id": user.tenant_id,
        },
    )
    audit(
        db,
        actor=user.email,
        action="LOGIN",
        entity="USER",
        entity_id=str(user.id),
        detail=f"portal={user.portal.value} method=password",
    )
    return TokenResponse(
        access_token=token,
        user=_user_dict(user),
    )


# ---------------------------------------------------------------------------
# GET /auth/me
# ---------------------------------------------------------------------------
@router.get("/me", response_model=MeResponse)
def me(user: models.User = Depends(get_current_user)):
    return MeResponse(user=_user_dict(user))


# ---------------------------------------------------------------------------
# SSO Google — Paso 1: redirigir a Google
# ---------------------------------------------------------------------------
@router.get("/google")
def google_login():
    """
    El frontend redirige al usuario aquí.
    Esta ruta construye la URL de autorización de Google y hace redirect.
    """
    if not GOOGLE_CLIENT_ID:
        raise HTTPException(
            status_code=501,
            detail="Google SSO no configurado. Añade GOOGLE_CLIENT_ID al .env",
        )

    params = {
        "client_id": GOOGLE_CLIENT_ID,
        "redirect_uri": GOOGLE_REDIRECT_URI,
        "response_type": "code",
        # openid → identidad, email → correo, profile → nombre
        "scope": "openid email profile",
        "access_type": "offline",
        "prompt": "select_account",  # muestra siempre el selector de cuenta
    }
    url = f"{GOOGLE_AUTH_URL}?{urllib.parse.urlencode(params)}"
    return RedirectResponse(url)


# ---------------------------------------------------------------------------
# SSO Google — Paso 2: callback (Google nos devuelve el "code")
# ---------------------------------------------------------------------------
@router.get("/google/callback")
def google_callback(code: str, db: Session = Depends(get_db)):
    """
    Google redirige aquí con ?code=...
    1. Intercambiamos el code por un access_token de Google.
    2. Pedimos los datos del usuario a Google (email, nombre, sub).
    3. Buscamos o creamos el usuario en nuestra BD.
    4. Generamos nuestro propio JWT y redirigimos al frontend.
    """
    if not GOOGLE_CLIENT_ID or not GOOGLE_CLIENT_SECRET:
        raise HTTPException(status_code=501, detail="Google SSO no configurado.")

    # --- 1. Intercambiar code → tokens de Google
    token_response = httpx.post(
        GOOGLE_TOKEN_URL,
        data={
            "code": code,
            "client_id": GOOGLE_CLIENT_ID,
            "client_secret": GOOGLE_CLIENT_SECRET,
            "redirect_uri": GOOGLE_REDIRECT_URI,
            "grant_type": "authorization_code",
        },
        headers={"Content-Type": "application/x-www-form-urlencoded"},
    )

    if token_response.status_code != 200:
        raise HTTPException(status_code=400, detail="Error al obtener token de Google.")

    google_access_token = token_response.json().get("access_token")

    # --- 2. Obtener datos del usuario desde Google
    userinfo_response = httpx.get(
        GOOGLE_USERINFO_URL,
        headers={"Authorization": f"Bearer {google_access_token}"},
    )

    if userinfo_response.status_code != 200:
        raise HTTPException(status_code=400, detail="Error al obtener datos de Google.")

    google_data = userinfo_response.json()
    google_sub: str = google_data["sub"]          # ID único de Google (nunca cambia)
    google_email: str = google_data.get("email", "")
    google_name: str = google_data.get("name", google_email)

    if not google_email:
        raise HTTPException(status_code=400, detail="Google no devolvió email.")

    # --- 3. Buscar usuario en BD (primero por google_sub, luego por email)
    user = db.query(models.User).filter(models.User.google_sub == google_sub).first()

    if not user:
        # Puede que el usuario ya exista con email pero sin google_sub (cuenta clásica)
        user = db.query(models.User).filter(models.User.email == google_email).first()
        if user:
            # Vinculamos su cuenta Google al usuario existente
            user.google_sub = google_sub
            db.commit()

    if not user:
        # Usuario nuevo: creamos con portal "internal" y rol "ops" por defecto.
        # En producción podrías redirigir a una pantalla de selección de portal.
        # Primero nos aseguramos de que existe un tenant interno
        tenant = db.query(models.Tenant).filter(
            models.Tenant.type == models.TenantType.internal
        ).first()
        if not tenant:
            raise HTTPException(
                status_code=500,
                detail="No existe tenant interno. Ejecuta primero el seed.",
            )

        user = models.User(
            tenant_id=tenant.id,
            email=google_email,
            full_name=google_name,
            password_hash=None,   # sin contraseña: usa solo Google
            google_sub=google_sub,
            portal=models.Portal.internal,
            role=models.Role.ops,
            is_active=True,
        )
        db.add(user)
        db.commit()
        db.refresh(user)

    if not user.is_active:
        raise HTTPException(status_code=403, detail="Usuario inactivo.")

    # --- 4. Generar nuestro JWT y redirigir al frontend
    token = create_access_token(
        user.email,
        extra={
            "role": user.role.value,
            "portal": user.portal.value,
            "tenant_id": user.tenant_id,
        },
    )
    audit(
        db,
        actor=user.email,
        action="LOGIN",
        entity="USER",
        entity_id=str(user.id),
        detail=f"portal={user.portal.value} method=google_sso",
    )

    # Redirigimos al frontend pasando el token como query param.
    # El frontend debe leerlo y guardarlo en storage (igual que hace con /login).
    redirect_url = (
        f"{FRONTEND_URL}/auth/callback"
        f"?token={urllib.parse.quote(token)}"
        f"&portal={user.portal.value}"
    )
    return RedirectResponse(redirect_url)


# ---------------------------------------------------------------------------
# Helper privado
# ---------------------------------------------------------------------------
def _user_dict(user: models.User) -> dict:
    return {
        "id": user.id,
        "email": user.email,
        "full_name": user.full_name,
        "portal": user.portal.value,
        "role": user.role.value,
        "tenant_id": user.tenant_id,
        "tenant_name": user.tenant.name if user.tenant else None,
    }
