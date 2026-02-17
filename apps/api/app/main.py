from __future__ import annotations

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .config import CORS_ORIGINS
from .db import init_db
from .routers.auth import router as auth_router
from .routers.core import router as core_router
#from .routers.loki import router as loki_router

def create_app() -> FastAPI:
    app = FastAPI(title="MACLIMA OS API", version="0.1.0")

    app.add_middleware(
        CORSMiddleware,
        allow_origins=CORS_ORIGINS,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    @app.on_event("startup")
    def _startup():
        init_db()

    app.include_router(auth_router)
    app.include_router(core_router)
    #app.include_router(loki_router)

    return app

app = create_app()
