"""
Tes format error terstruktur dan exception handler (PRD Lampiran B).
"""

from fastapi.testclient import TestClient
from app.core.errors import (
    AppError,
    IP_TIDAK_VALID,
    PERMINTAAN_TIDAK_VALID,
    format_error_message,
)
from app.main import app

client = TestClient(app)


def test_app_error_structure():
    """Memastikan AppError menghasilkan dict dengan field kode, pesan, field."""
    err = AppError(
        kode=IP_TIDAK_VALID,
        field="alamat_ip"
    )
    d = err.to_dict()
    assert d["kode"] == "IP_TIDAK_VALID"
    assert "Alamat IP harus empat angka" in d["pesan"]
    assert d["field"] == "alamat_ip"


def test_format_error_message_interpolation():
    """Memastikan interpolasi pesan error seperti {field} dan {n} berfungsi."""
    msg = format_error_message("BATAS_UKURAN_LEWAT", field="ruangan", n=20)
    assert "ruangan melebihi batas 20" in msg


def test_not_found_endpoint():
    """Endpoint yang tidak ada tetap merespons status 404."""
    response = client.get("/api/endpoint-tidak-ada")
    assert response.status_code == 404
