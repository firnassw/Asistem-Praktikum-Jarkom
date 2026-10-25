"""
Pengujian komprehensif untuk fitur Tabel IP Perangkat (POST /api/jaringan/tabel-ip).
Mencakup Data Uji Emas G-JAR-09, penanganan DHCP, kasus tepi, validasi error, dan deteksi peringatan.
Sesuai PRD Bagian 7 US-09, Bagian 8 FR-14, Bagian 9, Lampiran A, B, C, dan D.
"""

import pytest
from fastapi.testclient import TestClient

from app.main import app
from app.core.errors import (
    BATAS_UKURAN_LEWAT,
    IP_TIDAK_VALID,
    MASK_TIDAK_VALID,
    NAMA_DUPLIKAT,
    PERMINTAAN_TIDAK_VALID,
    PREFIX_TIDAK_VALID,
)
from app.modules.jaringan.solver import hitung_tabel_ip
from app.modules.jaringan.steps import susun_langkah_tabel_ip

client = TestClient(app)


# ==============================================================================
# 1. DATA UJI EMAS G-JAR-09 (CONTOH MODUL 4)
# ==============================================================================

def test_tabel_ip_emas_g_jar_09_solver():
    """
    Uji unit solver hitung_tabel_ip dengan Data Uji Emas G-JAR-09:
    - Server: 192.168.1.1 / 255.255.255.0
    - PC0: 192.168.1.2 / 255.255.255.0, DNS: 192.168.1.1
    - PC1: 192.168.1.3 / 255.255.255.0, DNS: 192.168.1.1
    """
    perangkat = [
        {"nama": "Server", "mode": "static", "ip": "192.168.1.1", "subnet_mask": "255.255.255.0"},
        {"nama": "PC0", "mode": "static", "ip": "192.168.1.2", "subnet_mask": "255.255.255.0", "dns": "192.168.1.1"},
        {"nama": "PC1", "mode": "static", "ip": "192.168.1.3", "subnet_mask": "255.255.255.0", "dns": "192.168.1.1"},
    ]

    calc = hitung_tabel_ip(perangkat=perangkat)

    assert calc["total_perangkat"] == 3
    assert calc["total_static"] == 3
    assert calc["total_dhcp"] == 0
    assert calc["segmen_jaringan"] == ["192.168.1.0/24"]
    assert calc["daftar_dns"] == ["192.168.1.1"]
    assert len(calc["tabel"]) == 3
    assert calc["peringatan"] == []

    # Validasi baris Server
    row_server = calc["tabel"][0]
    assert row_server["no"] == 1
    assert row_server["nama"] == "Server"
    assert row_server["mode"] == "Static"
    assert row_server["ip"] == "192.168.1.1"
    assert row_server["subnet_mask"] == "255.255.255.0"
    assert row_server["prefix"] == "/24"
    assert row_server["gateway"] == "-"
    assert row_server["dns"] == "-"

    # Validasi baris PC0
    row_pc0 = calc["tabel"][1]
    assert row_pc0["no"] == 2
    assert row_pc0["nama"] == "PC0"
    assert row_pc0["ip"] == "192.168.1.2"
    assert row_pc0["dns"] == "192.168.1.1"

    # Validasi baris PC1
    row_pc1 = calc["tabel"][2]
    assert row_pc1["no"] == 3
    assert row_pc1["nama"] == "PC1"
    assert row_pc1["ip"] == "192.168.1.3"
    assert row_pc1["dns"] == "192.168.1.1"


def test_tabel_ip_emas_g_jar_09_endpoint():
    """
    Uji endpoint POST /api/jaringan/tabel-ip dengan payload G-JAR-09.
    """
    payload = {
        "perangkat": [
            {"nama": "Server", "mode": "static", "ip": "192.168.1.1", "subnet_mask": "255.255.255.0"},
            {"nama": "PC0", "mode": "static", "ip": "192.168.1.2", "subnet_mask": "255.255.255.0", "dns": "192.168.1.1"},
            {"nama": "PC1", "mode": "static", "ip": "192.168.1.3", "subnet_mask": "255.255.255.0", "dns": "192.168.1.1"},
        ]
    }

    res = client.post("/api/jaringan/tabel-ip", json=payload)
    assert res.status_code == 200
    data = res.json()

    assert data["fitur"] == "tabel-ip"
    assert len(data["langkah"]) == 3
    assert data["hasil_akhir"]["ringkasan"]["total_perangkat"] == 3
    assert len(data["hasil_akhir"]["tabel"]) == 3
    assert "192.168.1.0/24" in data["kesimpulan"]


# ==============================================================================
# 2. UJI PERANGKAT MODE DHCP
# ==============================================================================

def test_tabel_ip_perangkat_mode_dhcp():
    """
    Sesuai G-JAR-09 Lampiran D:
    Perangkat dengan mode 'dhcp' tampil sebagai 'DHCP' di tabel hasil tanpa error.
    """
    payload = {
        "perangkat": [
            {"nama": "Server", "mode": "static", "ip": "192.168.1.1", "prefix": 24},
            {"nama": "Laptop0", "mode": "dhcp"},
        ]
    }

    res = client.post("/api/jaringan/tabel-ip", json=payload)
    assert res.status_code == 200
    data = res.json()

    tabel = data["hasil_akhir"]["tabel"]
    assert len(tabel) == 2

    laptop = tabel[1]
    assert laptop["nama"] == "Laptop0"
    assert laptop["mode"] == "DHCP"
    assert laptop["ip"] == "DHCP"
    assert laptop["subnet_mask"] == "DHCP"
    assert laptop["prefix"] == "DHCP"
    assert laptop["gateway"] == "DHCP"
    assert laptop["dns"] == "DHCP"

    ringkasan = data["hasil_akhir"]["ringkasan"]
    assert ringkasan["total_static"] == 1
    assert ringkasan["total_dhcp"] == 1


# ==============================================================================
# 3. KASUS VALIDASI & ERROR HANDLING (PRD LAMPIRAN B & C)
# ==============================================================================

def test_nama_duplikat_ditolak():
    """Nama perangkat kembar ('PC0' dua kali) ditolak dengan NAMA_DUPLIKAT."""
    payload = {
        "perangkat": [
            {"nama": "PC0", "mode": "static", "ip": "192.168.1.2", "prefix": 24},
            {"nama": "pc0", "mode": "static", "ip": "192.168.1.3", "prefix": 24},
        ]
    }
    res = client.post("/api/jaringan/tabel-ip", json=payload)
    assert res.status_code == 400
    err = res.json()
    assert err["kode"] == NAMA_DUPLIKAT
    assert err["field"] == "perangkat"
    assert "Nama pc0 dipakai dua kali" in err["pesan"] or "Nama PC0 dipakai dua kali" in err["pesan"]


def test_format_ip_salah_ditolak():
    """Format IP salah (oktet > 255 atau leading zero) ditolak dengan IP_TIDAK_VALID."""
    for bad_ip in ["192.168.1.999", "192.168.01.2", "192.168.1", "abc"]:
        payload = {
            "perangkat": [
                {"nama": "PC0", "mode": "static", "ip": bad_ip, "prefix": 24},
            ]
        }
        res = client.post("/api/jaringan/tabel-ip", json=payload)
        assert res.status_code == 400
        assert res.json()["kode"] == IP_TIDAK_VALID
        assert res.json()["field"] == "ip"


def test_mask_tidak_berurutan_ditolak():
    """Subnet mask tidak berurutan (mis. 255.0.255.0) ditolak dengan MASK_TIDAK_VALID."""
    payload = {
        "perangkat": [
            {"nama": "PC0", "mode": "static", "ip": "192.168.1.10", "subnet_mask": "255.0.255.0"},
        ]
    }
    res = client.post("/api/jaringan/tabel-ip", json=payload)
    assert res.status_code == 400
    assert res.json()["kode"] == MASK_TIDAK_VALID
    assert res.json()["field"] == "subnet_mask"


def test_lebih_dari_50_perangkat_ditolak():
    """Daftar perangkat lebih dari 50 (51 item) ditolak dengan BATAS_UKURAN_LEWAT."""
    banyak = [
        {"nama": f"PC{i}", "mode": "static", "ip": f"10.0.0.{i+1}", "prefix": 24}
        for i in range(51)
    ]
    payload = {"perangkat": banyak}
    res = client.post("/api/jaringan/tabel-ip", json=payload)
    assert res.status_code == 400
    err = res.json()
    assert err["kode"] == BATAS_UKURAN_LEWAT
    assert err["field"] == "perangkat"
    assert "50" in err["pesan"]


def test_perangkat_kosong_ditolak():
    """Daftar perangkat kosong ([]) ditolak dengan PERMINTAAN_TIDAK_VALID."""
    payload = {"perangkat": []}
    res = client.post("/api/jaringan/tabel-ip", json=payload)
    assert res.status_code == 400
    assert res.json()["kode"] == PERMINTAAN_TIDAK_VALID
    assert res.json()["field"] == "perangkat"


# ==============================================================================
# 4. PEMERIKSAAN KONSISTENSI & PERINGATAN (PRINSIP #4)
# ==============================================================================

def test_peringatan_konflik_ip_statis():
    """Dua perangkat statis memakai IP sama memicu peringatan tanpa menyembunyikan hasil."""
    payload = {
        "perangkat": [
            {"nama": "PC0", "mode": "static", "ip": "192.168.1.50", "prefix": 24},
            {"nama": "PC1", "mode": "static", "ip": "192.168.1.50", "prefix": 24},
        ]
    }
    res = client.post("/api/jaringan/tabel-ip", json=payload)
    assert res.status_code == 200
    data = res.json()
    assert len(data["peringatan"]) > 0
    assert any("Konflik alamat IP" in w and "192.168.1.50" in w for w in data["peringatan"])


def test_peringatan_gateway_di_luar_subnet():
    """Default gateway di luar subnet perangkat memicu peringatan."""
    payload = {
        "perangkat": [
            {"nama": "PC0", "mode": "static", "ip": "192.168.1.10", "prefix": 24, "gateway": "10.0.0.1"},
        ]
    }
    res = client.post("/api/jaringan/tabel-ip", json=payload)
    assert res.status_code == 200
    data = res.json()
    assert any("di luar subnet" in w for w in data["peringatan"])


def test_peringatan_ip_host_adalah_network_address():
    """IP host memakai Network Address memicu peringatan."""
    payload = {
        "perangkat": [
            {"nama": "PC0", "mode": "static", "ip": "192.168.1.0", "prefix": 24},
        ]
    }
    res = client.post("/api/jaringan/tabel-ip", json=payload)
    assert res.status_code == 200
    data = res.json()
    assert any("Network Address" in w for w in data["peringatan"])
