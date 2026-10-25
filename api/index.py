import os
import sys

# Tambahkan direktori backend ke sys.path
backend_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "backend"))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from app.main import app as fastapi_app


async def app(scope, receive, send):
    """
    ASGI entrypoint untuk Vercel Serverless Function.
    Menjamin kompatibilitas path routing baik dengan maupun tanpa prefix /api.
    """
    if scope["type"] == "http":
        path = scope.get("path", "")
        if not path.startswith("/api"):
            scope["path"] = "/api" + path
    await fastapi_app(scope, receive, send)
