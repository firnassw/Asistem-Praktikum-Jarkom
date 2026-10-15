"""
Pengujian komprehensif untuk fitur VLSM (POST /api/jaringan/vlsm) dan FLSM (POST /api/jaringan/flsm).
Mencakup Data Uji Emas G-JAR-04, G-JAR-05, G-JAR-11, serta seluruh kasus tepi PRD Lampiran C.
"""

import pytest
from fastapi.testclient import TestClient

from app.main import app
from app.core.errors import (
    ALAMAT_BUKAN_BATAS_JARINGAN,
    DEVICE_TIDAK_VALID,
    FLSM_TIDAK_MUNGKIN,
    IP_TIDAK_VALID,
    MELEWATI_INDUK,
    NAMA_DUPLIKAT,
    PREFIX_TIDAK_VALID,
    RUANGAN_TIDAK_VALID,
    VLSM_RUANG_KURANG,
)
from app.modules.jaringan.solver import hitung_flsm, hitung_vlsm

client = TestClient(app)


# ==============================================================================
# 1. DATA UJI EMAS G-JAR-04: VLSM
# ==============================================================================

def test_vlsm_emas_g_jar_04():
    """
    G-JAR-04: VLSM
    Input: alamat_induk="192.168.64.0", prefix_induk=24
    Kebutuhan: Lab Jaringan (64), Lab Komputasi (24), Lab Mulmed (8)
    Hasil wajib:
    - Lab Jaringan: 192.168.64.0/25 (host 192.168.64.1 s.d. 192.168.64.126, BA 192.168.64.127)
    - Lab Komputasi: 192.168.64.128/27 (host 192.168.64.129 s.d. 192.168.64.158, BA 192.168.64.159)
    - Lab Mulmed: 192.168.64.160/28 (host 192.168.64.161 s.d. 192.168.64.174, BA 192.168.64.175)
    - Sisa bebas: 80 IP (192.168.64.176 s.d. 192.168.64.255)
    """
    payload = {
        "alamat_induk": "192.168.64.0",
        "prefix_induk": 24,
        "kebutuhan": [
            {"nama": "Lab Jaringan", "host": 64},
            {"nama": "Lab Komputasi", "host": 24},
            {"nama": "Lab Mulmed", "host": 8},
        ],
    }

    res = client.post("/api/jaringan/vlsm", json=payload)
    assert res.status_code == 200
    data = res.json()

    assert data["fitur"] == "vlsm"
    assert len(data["langkah"]) == 3
    assert len(data["peringatan"]) == 0

    tabel = data["hasil_akhir"]["tabel"]
    assert len(tabel) == 3

    # Row 1: Lab Jaringan
    r1 = tabel[0]
    assert r1["nama"] == "Lab Jaringan"
    assert r1["host_diminta"] == 64
    assert r1["prefix"] == 25
    assert r1["subnet_mask"] == "255.255.255.128"
    assert r1["subnet"] == "192.168.64.0"
    assert r1["host_pertama"] == "192.168.64.1"
    assert r1["host_terakhir"] == "192.168.64.126"
    assert r1["broadcast"] == "192.168.64.127"
    assert r1["status"] == "Terpakai"

    # Row 2: Lab Komputasi
    r2 = tabel[1]
    assert r2["nama"] == "Lab Komputasi"
    assert r2["host_diminta"] == 24
    assert r2["prefix"] == 27
    assert r2["subnet_mask"] == "255.255.255.224"
    assert r2["subnet"] == "192.168.64.128"
    assert r2["host_pertama"] == "192.168.64.129"
    assert r2["host_terakhir"] == "192.168.64.158"
    assert r2["broadcast"] == "192.168.64.159"
    assert r2["status"] == "Terpakai"

    # Row 3: Lab Mulmed
    r3 = tabel[2]
    assert r3["nama"] == "Lab Mulmed"
    assert r3["host_diminta"] == 8
    assert r3["prefix"] == 28
    assert r3["subnet_mask"] == "255.255.255.240"
    assert r3["subnet"] == "192.168.64.160"
    assert r3["host_pertama"] == "192.168.64.161"
    assert r3["host_terakhir"] == "192.168.64.174"
    assert r3["broadcast"] == "192.168.64.175"
    assert r3["status"] == "Terpakai"

    # Ringkasan
    ringkasan = data["hasil_akhir"]["ringkasan"]
    assert ringkasan["kapasitas_induk"] == 256
    assert ringkasan["total_alamat_dialokasikan"] == 176
    assert ringkasan["sisa_alamat"] == 80
    assert ringkasan["sisa_rentang"]["mulai"] == "192.168.64.176"
    assert ringkasan["sisa_rentang"]["akhir"] == "192.168.64.255"

    # Kesimpulan utuh Bahasa Indonesia
    assert "Alokasi VLSM untuk jaringan induk 192.168.64.0/24" in data["kesimpulan"]
    assert "80 alamat IP bebas" in data["kesimpulan"]


# ==============================================================================
# 2. DATA UJI EMAS G-JAR-05: FLSM
# ==============================================================================

def test_flsm_emas_g_jar_05_ditolak():
    """
    G-JAR-05 bagian 1:
    Kebutuhan G-JAR-04 pada induk 192.168.64.0/24 tanpa gaya_modul (default).
    Ditolak FLSM_TIDAK_MUNGKIN: /25 hanya 2 subnet, saran induk /23.
    """
    payload = {
        "alamat_induk": "192.168.64.0",
        "prefix_induk": 24,
        "kebutuhan": [
            {"nama": "Lab Jaringan", "host": 64},
            {"nama": "Lab Komputasi", "host": 24},
            {"nama": "Lab Mulmed", "host": 8},
        ],
        "gaya_modul": False,
    }

    res = client.post("/api/jaringan/flsm", json=payload)
    assert res.status_code == 400
    err = res.json()
    assert err["kode"] == FLSM_TIDAK_MUNGKIN
    assert err["field"] == "prefix_induk"
    assert "Induk /24 hanya memuat 2 subnet /25, padahal dibutuhkan 3" in err["pesan"]
    assert "Pakai induk /23" in err["pesan"]
    assert err.get("prefix_saran") == 23


def test_flsm_emas_g_jar_05_induk_23():
    """
    G-JAR-05 bagian 2:
    Kebutuhan G-JAR-04 pada induk 192.168.64.0/23.
    Sukses menghasilkan 3 subnet /25 yang diminta + 1 subnet /25 Cadangan.
    """
    payload = {
        "alamat_induk": "192.168.64.0",
        "prefix_induk": 23,
        "kebutuhan": [
            {"nama": "Lab Jaringan", "host": 64},
            {"nama": "Lab Komputasi", "host": 24},
            {"nama": "Lab Mulmed", "host": 8},
        ],
    }

    res = client.post("/api/jaringan/flsm", json=payload)
    assert res.status_code == 200
    data = res.json()

    assert data["fitur"] == "flsm"
    assert len(data["peringatan"]) == 0

    tabel = data["hasil_akhir"]["tabel"]
    # Induk /23 (512 IP), subnet /25 (128 IP) -> 4 subnet terbentuk
    assert len(tabel) == 4

    assert tabel[0]["nama"] == "Lab Jaringan"
    assert tabel[0]["subnet"] == "192.168.64.0"
    assert tabel[0]["prefix"] == 25
    assert tabel[0]["broadcast"] == "192.168.64.127"
    assert tabel[0]["status"] == "Terpakai"

    assert tabel[1]["nama"] == "Lab Komputasi"
    assert tabel[1]["subnet"] == "192.168.64.128"
    assert tabel[1]["prefix"] == 25
    assert tabel[1]["broadcast"] == "192.168.64.255"
    assert tabel[1]["status"] == "Terpakai"

    assert tabel[2]["nama"] == "Lab Mulmed"
    assert tabel[2]["subnet"] == "192.168.65.0"
    assert tabel[2]["prefix"] == 25
    assert tabel[2]["broadcast"] == "192.168.65.127"
    assert tabel[2]["status"] == "Terpakai"

    # Subnet ke-4 adalah Cadangan
    assert tabel[3]["nama"] == "Cadangan"
    assert tabel[3]["subnet"] == "192.168.65.128"
    assert tabel[3]["prefix"] == 25
    assert tabel[3]["broadcast"] == "192.168.65.255"
    assert tabel[3]["status"] == "Cadangan"


def test_flsm_emas_g_jar_05_gaya_modul():
    """
    G-JAR-05 bagian 3:
    Kebutuhan G-JAR-04 pada induk 192.168.64.0/24 dengan gaya_modul=True.
    Sukses menghasilkan 3 subnet /25 dan memuat peringatan MELEWATI_INDUK.
    """
    payload = {
        "alamat_induk": "192.168.64.0",
        "prefix_induk": 24,
        "kebutuhan": [
            {"nama": "Lab Jaringan", "host": 64},
            {"nama": "Lab Komputasi", "host": 24},
            {"nama": "Lab Mulmed", "host": 8},
        ],
        "gaya_modul": True,
    }

    res = client.post("/api/jaringan/flsm", json=payload)
    assert res.status_code == 200
    data = res.json()

    assert data["fitur"] == "flsm"
    assert MELEWATI_INDUK in data["peringatan"]

    tabel = data["hasil_akhir"]["tabel"]
    assert len(tabel) == 3
    assert tabel[0]["subnet"] == "192.168.64.0"
    assert tabel[1]["subnet"] == "192.168.64.128"
    assert tabel[2]["subnet"] == "192.168.65.0"


# ==============================================================================
# 3. DATA UJI EMAS G-JAR-11: FLSM Kecil dengan Cadangan
# ==============================================================================

def test_flsm_emas_g_jar_11():
    """
    G-JAR-11: FLSM kecil
    Input: alamat_induk="192.168.0.0", prefix_induk=24, 5 ruangan kebutuhan terbesar 20 host.
    Hasil:
    - Kebutuhan terbesar 20 host -> prefix seragam /27 (ukuran blok 32).
    - 8 subnet terbentuk.
    - 5 subnet pertama status Terpakai, 3 subnet terakhir status Cadangan.
    """
    payload = {
        "alamat_induk": "192.168.0.0",
        "prefix_induk": 24,
        "kebutuhan": [
            {"nama": "R1", "host": 20},
            {"nama": "R2", "host": 15},
            {"nama": "R3", "host": 10},
            {"nama": "R4", "host": 8},
            {"nama": "R5", "host": 5},
        ],
    }

    res = client.post("/api/jaringan/flsm", json=payload)
    assert res.status_code == 200
    data = res.json()

    ringkasan = data["hasil_akhir"]["ringkasan"]
    assert ringkasan["prefix_seragam"] == 27
    assert ringkasan["total_subnet_terbentuk"] == 8
    assert ringkasan["subnet_terpakai"] == 5
    assert ringkasan["subnet_cadangan"] == 3

    tabel = data["hasil_akhir"]["tabel"]
    assert len(tabel) == 8

    # 5 pertama terpakai
    for i in range(5):
        assert tabel[i]["status"] == "Terpakai"
        assert tabel[i]["prefix"] == 27
        assert tabel[i]["subnet"] == f"192.168.0.{i * 32}"

    # 3 terakhir cadangan
    for i in range(5, 8):
        assert tabel[i]["status"] == "Cadangan"
        assert tabel[i]["nama"] == "Cadangan"
        assert tabel[i]["host_diminta"] == 0
        assert tabel[i]["prefix"] == 27
        assert tabel[i]["subnet"] == f"192.168.0.{i * 32}"


# ==============================================================================
# 4. KASUS TEPI (PRD Lampiran C)
# ==============================================================================

def test_vlsm_kebutuhan_sama_besar_stable_sort():
    """Kebutuhan sama besar harus mempertahankan urutan input (stable sort)."""
    payload = {
        "alamat_induk": "192.168.1.0",
        "prefix_induk": 24,
        "kebutuhan": [
            {"nama": "Lab Alfa", "host": 30},
            {"nama": "Lab Beta", "host": 30},
            {"nama": "Lab Gamma", "host": 10},
        ],
    }
    res = client.post("/api/jaringan/vlsm", json=payload)
    assert res.status_code == 200
    tabel = res.json()["hasil_akhir"]["tabel"]
    assert tabel[0]["nama"] == "Lab Alfa"
    assert tabel[1]["nama"] == "Lab Beta"
    assert tabel[2]["nama"] == "Lab Gamma"
    assert tabel[0]["subnet"] == "192.168.1.0"
    assert tabel[1]["subnet"] == "192.168.1.32"


def test_vlsm_kebutuhan_1_host_mendapat_prefix_30():
    """Kebutuhan 1 host harus mendapatkan prefix /30."""
    payload = {
        "alamat_induk": "10.0.0.0",
        "prefix_induk": 24,
        "kebutuhan": [
            {"nama": "PointToPoint", "host": 1},
        ],
    }
    res = client.post("/api/jaringan/vlsm", json=payload)
    assert res.status_code == 200
    tabel = res.json()["hasil_akhir"]["tabel"]
    assert tabel[0]["prefix"] == 30
    assert tabel[0]["host_tersedia"] == 2
    assert tabel[0]["subnet"] == "10.0.0.0"
    assert tabel[0]["host_pertama"] == "10.0.0.1"
    assert tabel[0]["host_terakhir"] == "10.0.0.2"
    assert tabel[0]["broadcast"] == "10.0.0.3"


def test_vlsm_total_melebihi_induk_ruang_kurang():
    """
    Jika total kebutuhan melebihi kapasitas induk:
    Yang muat tetap tampil, yang tidak muat ditandai 'Tidak muat', muncul peringatan VLSM_RUANG_KURANG.
    """
    payload = {
        "alamat_induk": "192.168.10.0",
        "prefix_induk": 28,  # Kapasitas 16 IP
        "kebutuhan": [
            {"nama": "Lab 1", "host": 6},   # butuh /29 (8 IP) -> muat di 192.168.10.0
            {"nama": "Lab 2", "host": 4},   # butuh /29 (8 IP) -> muat di 192.168.10.8
            {"nama": "Lab 3", "host": 2},   # butuh /30 (4 IP) -> tidak muat (melebihi 16)
        ],
    }
    res = client.post("/api/jaringan/vlsm", json=payload)
    assert res.status_code == 200
    data = res.json()
    assert VLSM_RUANG_KURANG in data["peringatan"]

    tabel = data["hasil_akhir"]["tabel"]
    assert tabel[0]["status"] == "Terpakai"
    assert tabel[1]["status"] == "Terpakai"
    assert tabel[2]["status"] == "Tidak muat"
    assert tabel[2]["subnet"] == "-"
    assert tabel[2]["host_pertama"] == "-"
    assert tabel[2]["broadcast"] == "-"


def test_validasi_alamat_bukan_batas_jaringan():
    """Alamat induk bukan batas jaringan harus ditolak dengan ALAMAT_BUKAN_BATAS_JARINGAN."""
    payload = {
        "alamat_induk": "192.168.64.5",
        "prefix_induk": 24,
        "kebutuhan": [{"nama": "Lab A", "host": 10}],
    }
    res = client.post("/api/jaringan/vlsm", json=payload)
    assert res.status_code == 400
    err = res.json()
    assert err["kode"] == ALAMAT_BUKAN_BATAS_JARINGAN
    assert err["field"] == "alamat_induk"
    assert "192.168.64.0" in err["pesan"]


def test_validasi_nama_duplikat():
    """Nama ruangan yang sama harus ditolak dengan NAMA_DUPLIKAT."""
    payload = {
        "alamat_induk": "192.168.1.0",
        "prefix_induk": 24,
        "kebutuhan": [
            {"nama": "Lab Jaringan", "host": 20},
            {"nama": "lab jaringan", "host": 10},
        ],
    }
    res = client.post("/api/jaringan/vlsm", json=payload)
    assert res.status_code == 400
    err = res.json()
    assert err["kode"] == NAMA_DUPLIKAT
    assert err["field"] == "kebutuhan"


def test_validasi_device_kurang_dari_satu():
    """Device < 1 harus ditolak dengan DEVICE_TIDAK_VALID."""
    payload = {
        "alamat_induk": "192.168.1.0",
        "prefix_induk": 24,
        "kebutuhan": [
            {"nama": "Lab A", "host": 0},
        ],
    }
    res = client.post("/api/jaringan/vlsm", json=payload)
    assert res.status_code == 400
    err = res.json()
    assert err["kode"] == DEVICE_TIDAK_VALID
    assert err["field"] == "kebutuhan"


def test_validasi_ruangan_kosong_atau_lebih_dari_20():
    """Jumlah ruangan 0 atau > 20 harus ditolak dengan RUANGAN_TIDAK_VALID."""
    payload_kosong = {
        "alamat_induk": "192.168.1.0",
        "prefix_induk": 24,
        "kebutuhan": [],
    }
    res = client.post("/api/jaringan/vlsm", json=payload_kosong)
    assert res.status_code == 400
    assert res.json()["kode"] == RUANGAN_TIDAK_VALID

    payload_banyak = {
        "alamat_induk": "192.168.1.0",
        "prefix_induk": 24,
        "kebutuhan": [{"nama": f"R{i}", "host": 2} for i in range(21)],
    }
    res2 = client.post("/api/jaringan/vlsm", json=payload_banyak)
    assert res2.status_code == 400
    assert res2.json()["kode"] == RUANGAN_TIDAK_VALID


def test_validasi_prefix_induk_di_luar_rentang():
    """Prefix induk < 0 atau > 30 harus ditolak dengan PREFIX_TIDAK_VALID."""
    payload = {
        "alamat_induk": "192.168.1.0",
        "prefix_induk": 31,
        "kebutuhan": [{"nama": "R1", "host": 1}],
    }
    res = client.post("/api/jaringan/vlsm", json=payload)
    assert res.status_code == 400
    err = res.json()
    assert err["kode"] == PREFIX_TIDAK_VALID
    assert err["field"] == "prefix_induk"


def test_validasi_ip_induk_salah_format():
    """IP dengan nol di depan atau format bukan 4 oktet ditolak dengan IP_TIDAK_VALID."""
    payload = {
        "alamat_induk": "192.168.01.0",
        "prefix_induk": 24,
        "kebutuhan": [{"nama": "R1", "host": 1}],
    }
    res = client.post("/api/jaringan/vlsm", json=payload)
    assert res.status_code == 400
    err = res.json()
    assert err["kode"] == IP_TIDAK_VALID
    assert err["field"] == "alamat_induk"
