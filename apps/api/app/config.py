from __future__ import annotations
import os
from dotenv import load_dotenv

load_dotenv()

def _get(name: str, default: str = "") -> str:
    v = os.getenv(name)
    return v if v is not None and v != "" else default

DATABASE_URL = _get("DATABASE_URL", "postgresql+psycopg2://maclima:maclima@localhost:5432/maclima_os")
JWT_SECRET = _get("JWT_SECRET", "CHANGE_ME_IN_PROD")
JWT_ALG = _get("JWT_ALG", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(_get("ACCESS_TOKEN_EXPIRE_MINUTES", "480"))

# CSV origins for dev
CORS_ORIGINS = [o.strip() for o in _get("CORS_ORIGINS", "http://localhost:3000").split(",") if o.strip()]
