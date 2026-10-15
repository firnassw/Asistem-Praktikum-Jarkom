"""
Tes endpoint modul registry GET /api/modul.
"""

from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_list_modul_returns_registered_features():
    response = client.get("/api/modul")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) >= 6

    feature_ids = [m["id"] for m in data]
    # Memastikan 6 modul utama terdaftar
    assert "subnet" in feature_ids
    assert "flsm-vlsm" in feature_ids
    assert "rencana" in feature_ids
    assert "konversi" in feature_ids
    assert "dhcp" in feature_ids
    assert "tabel-ip" in feature_ids

    # Verifikasi struktur field tiap item
    for item in data:
        assert "id" in item
        assert "nama" in item
        assert "deskripsi" in item
        assert "rute" in item
        assert "contoh" in item
        assert "warna_aksen" in item
