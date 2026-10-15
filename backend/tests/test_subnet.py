"""
Pengujian endpoint dan logika analisis subnetting satu IP.
Menguji data uji emas G-JAR-01, G-JAR-02, serta kasus tepi Lampiran C.
"""

from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_g_jar_01_na_dan_ba_dengan_subnet_mask():
    """
    Data Uji Emas G-JAR-01:
    Input: 192.168.0.5 dan 255.255.255.224
    Hasil diharapkan: NA 192.168.0.0, invers mask 0.0.0.31, BA 192.168.0.31.
    """
    response = client.post(
        "/api/jaringan/subnet",
        json={"alamat_ip": "192.168.0.5", "subnet_mask": "255.255.255.224"}
    )
    assert response.status_code == 200
    data = response.json()

    ringkasan = data["hasil_akhir"]["ringkasan"]
    assert ringkasan["na"] == "192.168.0.0"
    assert ringkasan["ba"] == "192.168.0.31"
    assert ringkasan["prefix"] == 27
    assert ringkasan["subnet_mask"] == "255.255.255.224"

    # Verifikasi data pada langkah
    langkah3 = next(l for l in data["langkah"] if "invers" in l["judul"].lower())
    assert "0.0.0.31" in langkah3["hasil"]


def test_g_jar_02_analisis_cidr_dengan_prefix():
    """
    Data Uji Emas G-JAR-02:
    Input: 192.168.0.5 /27
    Hasil diharapkan:
    - Mask 255.255.255.224
    - 8 subnet
    - 30 host per subnet
    - Blok 32
    - Subnet pertama 192.168.0.0, host 192.168.0.1 - 192.168.0.30, BA 192.168.0.31 (aktif: True)
    - Subnet kedua 192.168.0.32, host 192.168.0.33 - 192.168.0.62, BA 192.168.0.63
    """
    response = client.post(
        "/api/jaringan/subnet",
        json={"alamat_ip": "192.168.0.5", "prefix": 27}
    )
    assert response.status_code == 200
    data = response.json()

    ringkasan = data["hasil_akhir"]["ringkasan"]
    assert ringkasan["subnet_mask"] == "255.255.255.224"
    assert ringkasan["jumlah_subnet"] == 8
    assert ringkasan["host_per_subnet"] == 30
    assert ringkasan["blok_subnet"] == 32

    tabel = data["hasil_akhir"]["tabel"]
    assert len(tabel) == 8

    # Subnet 1
    sub1 = tabel[0]
    assert sub1["na"] == "192.168.0.0"
    assert sub1["host_pertama"] == "192.168.0.1"
    assert sub1["host_terakhir"] == "192.168.0.30"
    assert sub1["broadcast"] == "192.168.0.31"
    assert sub1["aktif"] is True  # 192.168.0.5 berada di subnet 1

    # Subnet 2
    sub2 = tabel[1]
    assert sub2["na"] == "192.168.0.32"
    assert sub2["host_pertama"] == "192.168.0.33"
    assert sub2["host_terakhir"] == "192.168.0.62"
    assert sub2["broadcast"] == "192.168.0.63"
    assert sub2["aktif"] is False


def test_edge_case_prefix_31_dan_32():
    """
    Kasus tepi Lampiran C:
    Prefix /31 atau /32 dihitung dengan peringatan PREFIX_31_32.
    """
    response31 = client.post(
        "/api/jaringan/subnet",
        json={"alamat_ip": "192.168.1.10", "prefix": 31}
    )
    assert response31.status_code == 200
    data31 = response31.json()
    assert "PREFIX_31_32" in data31["peringatan"]
    assert data31["hasil_akhir"]["ringkasan"]["host_per_subnet"] == 0

    response32 = client.post(
        "/api/jaringan/subnet",
        json={"alamat_ip": "192.168.1.10", "prefix": 32}
    )
    assert response32.status_code == 200
    data32 = response32.json()
    assert "PREFIX_31_32" in data32["peringatan"]
    assert data32["hasil_akhir"]["ringkasan"]["host_per_subnet"] == 0


def test_edge_case_nol_di_depan_ditolak():
    """
    Kasus tepi Lampiran C:
    Nol di depan (192.168.01.1) ditolak dengan IP_TIDAK_VALID.
    """
    response = client.post(
        "/api/jaringan/subnet",
        json={"alamat_ip": "192.168.01.1", "prefix": 24}
    )
    assert response.status_code == 400
    err = response.json()
    assert err["kode"] == "IP_TIDAK_VALID"
    assert err["field"] == "alamat_ip"


def test_edge_case_mask_tidak_berurutan_ditolak():
    """
    Kasus tepi Lampiran C:
    Mask tidak berurutan (255.0.255.0) ditolak dengan MASK_TIDAK_VALID.
    """
    response = client.post(
        "/api/jaringan/subnet",
        json={"alamat_ip": "192.168.1.1", "subnet_mask": "255.0.255.0"}
    )
    assert response.status_code == 400
    err = response.json()
    assert err["kode"] == "MASK_TIDAK_VALID"
    assert err["field"] == "subnet_mask"


def test_edge_case_prefix_di_luar_rentang_ditolak():
    """
    Kasus tepi Lampiran C:
    Prefix di luar rentang (misal 33 atau -1) ditolak dengan PREFIX_TIDAK_VALID.
    """
    response = client.post(
        "/api/jaringan/subnet",
        json={"alamat_ip": "192.168.1.1", "prefix": 33}
    )
    assert response.status_code == 400
    err = response.json()
    assert err["kode"] == "PREFIX_TIDAK_VALID"
    assert err["field"] == "prefix"


def test_edge_case_prefix_lebih_kecil_dari_default_kelas():
    """
    Kasus tepi Lampiran C:
    Prefix lebih kecil dari default kelas (misalnya /7 pada kelas A 10.0.0.1)
    dihitung normal, jumlah subnet tidak berlaku.
    """
    response = client.post(
        "/api/jaringan/subnet",
        json={"alamat_ip": "10.0.0.1", "prefix": 7}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["hasil_akhir"]["ringkasan"]["jumlah_subnet"] is None


def test_missing_both_prefix_and_mask_rejected():
    """
    Jika prefix dan mask tidak diisi sama sekali, ditolak PERMINTAAN_TIDAK_VALID.
    """
    response = client.post(
        "/api/jaringan/subnet",
        json={"alamat_ip": "192.168.1.1"}
    )
    assert response.status_code == 400
    err = response.json()
    assert err["kode"] == "PERMINTAAN_TIDAK_VALID"
