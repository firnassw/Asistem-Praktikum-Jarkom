"""
Main entry point FastAPI untuk Asisten Praktikum Jaringan.
"""

from typing import Any, Dict, List
from fastapi import FastAPI
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware

from app.core.errors import (
    AppError,
    app_error_handler,
    generic_exception_handler,
    validation_error_handler,
)
from app.core.registry import get_all_features
from app.core.schemas import ModulMetadata
from app.modules.jaringan.router import router as jaringan_router

app = FastAPI(
    title="Asisten Praktikum Jaringan API",
    description="Backend deterministik untuk Asisten Praktikum Jaringan",
    version="1.0.0",
    docs_url="/api/docs",
    openapi_url="/api/openapi.json",
)

# Konfigurasi CORS agar frontend dapat mengakses API
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "*",  # Fleksibel untuk dev
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Daftarkan handler error terstruktur
app.add_exception_handler(AppError, app_error_handler)
app.add_exception_handler(RequestValidationError, validation_error_handler)
app.add_exception_handler(Exception, generic_exception_handler)

# Daftarkan router modul
app.include_router(jaringan_router)


@app.get("/api/health", summary="Health check endpoint")
async def health_check() -> Dict[str, str]:
    """Endpoint pemeriksaan kesehatan backend."""
    return {"status": "ok"}


@app.get("/api/modul", response_model=List[ModulMetadata], summary="Daftar modul fitur")
async def list_modul() -> List[ModulMetadata]:
    """Mengembalikan daftar seluruh modul fitur yang terdaftar di registry."""
    return get_all_features()

