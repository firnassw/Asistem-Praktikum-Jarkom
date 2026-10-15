"""
Pengujian komprehensif untuk fitur Rencana Ruangan dan Device (POST /api/jaringan/rencana).
Mencakup Data Uji Emas G-JAR-06, G-JAR-07, G-JAR-10, G-JAR-12, dan kasus tepi PRD Lampiran C.
"""

import pytest
from fastapi.testclient import TestClient

from app.main import app
from app.core.errors import (
    ALAMAT_BUKAN_BATAS_JARINGAN,
    CADANGAN_TIDAK_VALID,
    DEVICE_TIDAK_VALID,
    GATEWAY_MEMBEDAKAN_HASIL,
    NAMA_DUPLIKAT,
    NIM_TIDAK_VALID,
    RUANGAN_TIDAK_VALID,
)

client = TestClient(app)


# ==============================================================================
# 1. DATA UJI EMAS G-JAR-10: IP GLOBAL DARI NIM
# ==============================================================================

def test_ip_global_dari_nim_50():
    """G-JAR-10: NIM '50' menghasilkan induk '192.168.50.0/24'."""
    payload = {
        "nim_dua_digit": "50",
        "ruangan": [{"nama": "Lab Test", "device": 10}],
    }
    res = client.post("/api/jaringan/rencana", json=payload)
    assert res.status_code == 200
    data = res.json()
    assert data["hasil_akhir"]["ringkasan"]["kapasitas_induk"] == 256
    # Induk yang digunakan adalah 192.168.50.0/24
    assert any("192.168.50.0/24" in item["nilai"] for item in data["diketahui"])


def test_ip_global_dari_nim_05():
    """G-JAR-10: NIM '05' menghasilkan induk '192.168.5.0/24' (nol di depan dibuang)."""
    payload = {
        "nim_dua_digit": "05",
        "ruangan": [{"nama": "Lab Test", "device": 10}],
    }
    res = client.post("/api/jaringan/rencana", json=payload)
    assert res.status_code == 200
    data = res.json()
    assert any("192.168.5.0/24" in item["nilai"] for item in data["diketahui"])


def test_ip_global_dari_nim_00():
    """NIM '00' menghasilkan induk '192.168.0.0/24'."""
    payload = {
        "nim_dua_digit": "00",
        "ruangan": [{"nama": "Lab Test", "device": 10}],
    }
    res = client.post("/api/jaringan/rencana", json=payload)
    assert res.status_code == 200
    data = res.json()
    assert any("192.168.0.0/24" in item["nilai"] for item in data["diketahui"])


# ==============================================================================
# 2. DATA UJI EMAS G-JAR-06: RENCANA VLSM TANPA GATEWAY
# ==============================================================================

def test_rencana_emas_g_jar_06():
    """
    G-JAR-06: Rencana VLSM Tanpa Gateway
    Input:
      - nim_dua_digit="50" (192.168.50.0/24)
      - gateway=False
      - cadangan_persen=0
      - mode="vlsm"
      - ruangan:
          Lab Basis Data: 60
          Lab PPSI: 34
          Ruang Dosen: 30
          Ruang Seminar: 8
          Server: 1
    Hasil Wajib:
      - Lab Basis Data: 192.168.50.0/26 (host .1 s.d. .62, BA .63)
      - Lab PPSI: 192.168.50.64/26 (host .65 s.d. .126, BA .127)
      - Ruang Dosen: 192.168.50.128/27 (host .129 s.d. .158, BA .159)
      - Ruang Seminar: 192.168.50.160/28 (host .161 s.d. .174, BA .175)
      - Server: 192.168.50.176/30 (host .177 s.d. .178, BA .179)
      - Total terpakai: 180 alamat, sisa 76 alamat (.180 s.d. .255)
      - Memuat peringatan 'GATEWAY_MEMBEDAKAN_HASIL'
    """
    payload = {
        "nim_dua_digit": "50",
        "gateway": False,
        "cadangan_persen": 0,
        "mode": "vlsm",
        "ruangan": [
            {"nama": "Lab Basis Data", "device": 60},
            {"nama": "Lab PPSI", "device": 34},
            {"nama": "Ruang Dosen", "device": 30},
            {"nama": "Ruang Seminar", "device": 8},
            {"nama": "Server", "device": 1},
        ],
    }

    res = client.post("/api/jaringan/rencana", json=payload)
    assert res.status_code == 200
    data = res.json()

    assert data["fitur"] == "rencana"
    assert len(data["langkah"]) == 3
    assert GATEWAY_MEMBEDAKAN_HASIL in data["peringatan"]

    ringkasan = data["hasil_akhir"]["ringkasan"]
    assert ringkasan["total_alamat_dialokasikan"] == 180
    assert ringkasan["sisa_alamat"] == 76
    assert ringkasan["kapasitas_induk"] == 256
    assert ringkasan["sisa_rentang"]["mulai"] == "192.168.50.180"
    assert ringkasan["sisa_rentang"]["akhir"] == "192.168.50.255"

    tabel = data["hasil_akhir"]["tabel"]
    assert len(tabel) == 5

    # 1. Lab Basis Data
    assert tabel[0]["nama"] == "Lab Basis Data"
    assert tabel[0]["prefix"] == 26
    assert tabel[0]["subnet"] == "192.168.50.0"
    assert tabel[0]["host_pertama"] == "192.168.50.1"
    assert tabel[0]["host_terakhir"] == "192.168.50.62"
    assert tabel[0]["broadcast"] == "192.168.50.63"
    assert tabel[0]["usulan_gateway"] is None

    # 2. Lab PPSI
    assert tabel[1]["nama"] == "Lab PPSI"
    assert tabel[1]["prefix"] == 26
    assert tabel[1]["subnet"] == "192.168.50.64"
    assert tabel[1]["host_pertama"] == "192.168.50.65"
    assert tabel[1]["host_terakhir"] == "192.168.50.126"
    assert tabel[1]["broadcast"] == "192.168.50.127"
    assert tabel[1]["usulan_gateway"] is None

    # 3. Ruang Dosen
    assert tabel[2]["nama"] == "Ruang Dosen"
    assert tabel[2]["prefix"] == 27
    assert tabel[2]["subnet"] == "192.168.50.128"
    assert tabel[2]["host_pertama"] == "192.168.50.129"
    assert tabel[2]["host_terakhir"] == "192.168.50.158"
    assert tabel[2]["broadcast"] == "192.168.50.159"
    assert tabel[2]["usulan_gateway"] is None

    # 4. Ruang Seminar
    assert tabel[3]["nama"] == "Ruang Seminar"
    assert tabel[3]["prefix"] == 28
    assert tabel[3]["subnet"] == "192.168.50.160"
    assert tabel[3]["host_pertama"] == "192.168.50.161"
    assert tabel[3]["host_terakhir"] == "192.168.50.174"
    assert tabel[3]["broadcast"] == "192.168.50.175"
    assert tabel[3]["usulan_gateway"] is None

    # 5. Server
    assert tabel[4]["nama"] == "Server"
    assert tabel[4]["prefix"] == 30
    assert tabel[4]["subnet"] == "192.168.50.176"
    assert tabel[4]["host_pertama"] == "192.168.50.177"
    assert tabel[4]["host_terakhir"] == "192.168.50.178"
    assert tabel[4]["broadcast"] == "192.168.50.179"
    assert tabel[4]["usulan_gateway"] is None

    # Perbandingan gateway tersedia
    perbandingan_gw = data["hasil_akhir"]["perbandingan_gateway"]
    assert "tanpa_gateway" in perbandingan_gw
    assert "dengan_gateway" in perbandingan_gw
    assert len(perbandingan_gw["ruangan_berubah"]) == 1
    assert perbandingan_gw["ruangan_berubah"][0]["nama"] == "Ruang Dosen"


# ==============================================================================
# 3. DATA UJI EMAS G-JAR-07: RENCANA VLSM DENGAN GATEWAY
# ==============================================================================

def test_rencana_emas_g_jar_07():
    """
    G-JAR-07: Rencana VLSM Dengan Gateway
    Input sama dengan G-JAR-06, tetapi gateway=True.
    Hasil Wajib:
      - Lab Basis Data: 192.168.50.0/26, usulan gateway 192.168.50.1
      - Lab PPSI: 192.168.50.64/26, usulan gateway 192.168.50.65
      - Ruang Dosen: 192.168.50.128/26 (.129 s.d. .190, BA .191), usulan gateway 192.168.50.129
      - Ruang Seminar: 192.168.50.192/28 (.193 s.d. .206, BA .207), usulan gateway 192.168.50.193
      - Server: 192.168.50.208/30 (.209 s.d. .210, BA .211), usulan gateway 192.168.50.209
      - Memuat peringatan 'GATEWAY_MEMBEDAKAN_HASIL'
    """
    payload = {
        "nim_dua_digit": "50",
        "gateway": True,
        "cadangan_persen": 0,
        "mode": "vlsm",
        "ruangan": [
            {"nama": "Lab Basis Data", "device": 60},
            {"nama": "Lab PPSI", "device": 34},
            {"nama": "Ruang Dosen", "device": 30},
            {"nama": "Ruang Seminar", "device": 8},
            {"nama": "Server", "device": 1},
        ],
    }

    res = client.post("/api/jaringan/rencana", json=payload)
    assert res.status_code == 200
    data = res.json()

    assert data["fitur"] == "rencana"
    assert GATEWAY_MEMBEDAKAN_HASIL in data["peringatan"]

    tabel = data["hasil_akhir"]["tabel"]
    assert len(tabel) == 5

    # 1. Lab Basis Data
    assert tabel[0]["nama"] == "Lab Basis Data"
    assert tabel[0]["prefix"] == 26
    assert tabel[0]["subnet"] == "192.168.50.0"
    assert tabel[0]["usulan_gateway"] == "192.168.50.1"

    # 2. Lab PPSI
    assert tabel[1]["nama"] == "Lab PPSI"
    assert tabel[1]["prefix"] == 26
    assert tabel[1]["subnet"] == "192.168.50.64"
    assert tabel[1]["usulan_gateway"] == "192.168.50.65"

    # 3. Ruang Dosen (Berubah menjadi /26 karena 30 + 1 = 31 host membutuhkan /26)
    assert tabel[2]["nama"] == "Ruang Dosen"
    assert tabel[2]["prefix"] == 26
    assert tabel[2]["subnet"] == "192.168.50.128"
    assert tabel[2]["host_pertama"] == "192.168.50.129"
    assert tabel[2]["host_terakhir"] == "192.168.50.190"
    assert tabel[2]["broadcast"] == "192.168.50.191"
    assert tabel[2]["usulan_gateway"] == "192.168.50.129"

    # 4. Ruang Seminar
    assert tabel[3]["nama"] == "Ruang Seminar"
    assert tabel[3]["prefix"] == 28
    assert tabel[3]["subnet"] == "192.168.50.192"
    assert tabel[3]["host_pertama"] == "192.168.50.193"
    assert tabel[3]["host_terakhir"] == "192.168.50.206"
    assert tabel[3]["broadcast"] == "192.168.50.207"
    assert tabel[3]["usulan_gateway"] == "192.168.50.193"

    # 5. Server
    assert tabel[4]["nama"] == "Server"
    assert tabel[4]["prefix"] == 30
    assert tabel[4]["subnet"] == "192.168.50.208"
    assert tabel[4]["host_pertama"] == "192.168.50.209"
    assert tabel[4]["host_terakhir"] == "192.168.50.210"
    assert tabel[4]["broadcast"] == "192.168.50.211"
    assert tabel[4]["usulan_gateway"] == "192.168.50.209"


# ==============================================================================
# 4. DATA UJI EMAS G-JAR-12: GATEWAY MEMBEDAKAN PREFIX PADA 1 RUANGAN
# ==============================================================================

def test_rencana_emas_g_jar_12():
    """
    G-JAR-12: Gateway Membedakan Prefix pada 1 Ruangan
    Input: alamat_induk="192.168.2.0", prefix_induk=24, 1 ruangan 30 device
    - Tanpa gateway: menghasilkan 192.168.2.0/27 (30 host)
    - Dengan gateway: menghasilkan 192.168.2.0/26 (31 host)
    - Peringatan GATEWAY_MEMBEDAKAN_HASIL aktif
    """
    payload_tanpa = {
        "alamat_induk": "192.168.2.0",
        "prefix_induk": 24,
        "ruangan": [{"nama": "Ruang A", "device": 30}],
        "gateway": False,
    }
    res_tanpa = client.post("/api/jaringan/rencana", json=payload_tanpa)
    assert res_tanpa.status_code == 200
    data_tanpa = res_tanpa.json()
    assert data_tanpa["hasil_akhir"]["tabel"][0]["prefix"] == 27
    assert data_tanpa["hasil_akhir"]["tabel"][0]["subnet"] == "192.168.2.0"
    assert GATEWAY_MEMBEDAKAN_HASIL in data_tanpa["peringatan"]

    payload_dengan = {
        "alamat_induk": "192.168.2.0",
        "prefix_induk": 24,
        "ruangan": [{"nama": "Ruang A", "device": 30}],
        "gateway": True,
    }
    res_dengan = client.post("/api/jaringan/rencana", json=payload_dengan)
    assert res_dengan.status_code == 200
    data_dengan = res_dengan.json()
    assert data_dengan["hasil_akhir"]["tabel"][0]["prefix"] == 26
    assert data_dengan["hasil_akhir"]["tabel"][0]["subnet"] == "192.168.2.0"
    assert data_dengan["hasil_akhir"]["tabel"][0]["usulan_gateway"] == "192.168.2.1"
    assert GATEWAY_MEMBEDAKAN_HASIL in data_dengan["peringatan"]


# ==============================================================================
# 5. KASUS TEPI PRD LAMPIRAN C & VALIDASI ERROR
# ==============================================================================

def test_cadangan_20_persen_pada_40_device():
    """
    Lampiran C: Cadangan 20% pada 40 device -> cadangan 8 device,
    total 48 host (tanpa gateway) atau 49 host (dengan gateway).
    """
    payload = {
        "nim_dua_digit": "10",
        "cadangan_persen": 20,
        "gateway": False,
        "ruangan": [{"nama": "Lab A", "device": 40}],
    }
    res = client.post("/api/jaringan/rencana", json=payload)
    assert res.status_code == 200
    row = res.json()["hasil_akhir"]["tabel"][0]
    assert row["cadangan_host"] == 8
    assert row["host_dibutuhkan"] == 48

    # Uji dengan gateway
    payload["gateway"] = True
    res2 = client.post("/api/jaringan/rencana", json=payload)
    assert res2.status_code == 200
    row2 = res2.json()["hasil_akhir"]["tabel"][0]
    assert row2["cadangan_host"] == 8
    assert row2["host_dibutuhkan"] == 49


def test_satu_ruangan_saja_berjalan_normal():
    """Lampiran C: Satu ruangan saja berjalan normal, menghasilkan satu subnet."""
    payload = {
        "nim_dua_digit": "99",
        "ruangan": [{"nama": "Ruang Tunggal", "device": 15}],
    }
    res = client.post("/api/jaringan/rencana", json=payload)
    assert res.status_code == 200
    data = res.json()
    assert len(data["hasil_akhir"]["tabel"]) == 1
    # 15 device butuh 15 + 2 = 17 <= 32 (2^5) -> prefix /27
    assert data["hasil_akhir"]["tabel"][0]["prefix"] == 27


def test_nim_tidak_valid_ditolak():
    """NIM tidak valid ('5', 'abc', '123') ditolak dengan kode NIM_TIDAK_VALID."""
    for nim in ["5", "abc", "123", "-1"]:
        payload = {
            "nim_dua_digit": nim,
            "ruangan": [{"nama": "Lab", "device": 10}],
        }
        res = client.post("/api/jaringan/rencana", json=payload)
        assert res.status_code == 400
        err = res.json()
        assert err["kode"] == NIM_TIDAK_VALID
        assert err["field"] == "nim_dua_digit"
        assert "Isi dua digit terakhir NIM, misalnya 50" in err["pesan"]


def test_cadangan_di_luar_rentang_ditolak():
    """Cadangan di luar 0..100 (150 atau -5) ditolak dengan CADANGAN_TIDAK_VALID."""
    for cadangan in [150, -5]:
        payload = {
            "nim_dua_digit": "50",
            "cadangan_persen": cadangan,
            "ruangan": [{"nama": "Lab", "device": 10}],
        }
        res = client.post("/api/jaringan/rencana", json=payload)
        assert res.status_code == 400
        err = res.json()
        assert err["kode"] == CADANGAN_TIDAK_VALID
        assert err["field"] == "cadangan_persen"


def test_ruangan_jumlah_di_luar_rentang_ditolak():
    """Jumlah ruangan 0 atau > 20 ditolak dengan RUANGAN_TIDAK_VALID."""
    res_kosong = client.post("/api/jaringan/rencana", json={"nim_dua_digit": "50", "ruangan": []})
    assert res_kosong.status_code == 400
    assert res_kosong.json()["kode"] == RUANGAN_TIDAK_VALID

    banyak = [{"nama": f"R{i}", "device": 2} for i in range(21)]
    res_banyak = client.post("/api/jaringan/rencana", json={"nim_dua_digit": "50", "ruangan": banyak})
    assert res_banyak.status_code == 400
    assert res_banyak.json()["kode"] == RUANGAN_TIDAK_VALID


def test_nama_ruangan_duplikat_ditolak():
    """Nama ruangan kembar ditolak dengan NAMA_DUPLIKAT."""
    payload = {
        "nim_dua_digit": "50",
        "ruangan": [
            {"nama": "Ruang A", "device": 10},
            {"nama": "ruang a", "device": 15},
        ],
    }
    res = client.post("/api/jaringan/rencana", json=payload)
    assert res.status_code == 400
    err = res.json()
    assert err["kode"] == NAMA_DUPLIKAT
    assert "Nama Ruang A dipakai dua kali" in err["pesan"] or "Nama ruang a dipakai dua kali" in err["pesan"]


def test_device_kurang_dari_satu_ditolak():
    """Device < 1 ditolak dengan DEVICE_TIDAK_VALID."""
    payload = {
        "nim_dua_digit": "50",
        "ruangan": [
            {"nama": "Lab X", "device": 0},
        ],
    }
    res = client.post("/api/jaringan/rencana", json=payload)
    assert res.status_code == 400
    err = res.json()
    assert err["kode"] == DEVICE_TIDAK_VALID
    assert "Lab X" in err["pesan"]


def test_alamat_induk_manual_bukan_batas_jaringan_ditolak():
    """Alamat induk manual bukan batas jaringan ditolak dengan ALAMAT_BUKAN_BATAS_JARINGAN."""
    payload = {
        "alamat_induk": "192.168.1.5",
        "prefix_induk": 24,
        "ruangan": [{"nama": "Lab A", "device": 10}],
    }
    res = client.post("/api/jaringan/rencana", json=payload)
    assert res.status_code == 400
    err = res.json()
    assert err["kode"] == ALAMAT_BUKAN_BATAS_JARINGAN
