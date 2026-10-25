"""
Pengujian untuk fitur Generator DHCP (G-JAR-08, kasus batas, dan error handling).
Sesuai PRD Bagian 7 US-08, Bagian 8 FR-13, Bagian 9, Lampiran A, B, C, dan D.
"""

import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.core.errors import (
    DHCP_EXCLUDED_TIDAK_VALID,
    IP_TIDAK_VALID,
    PREFIX_TIDAK_VALID,
    AppError,
)
from app.modules.jaringan.solver import hitung_dhcp
from app.modules.jaringan.steps import susun_langkah_dhcp

client = TestClient(app)


def test_dhcp_gold_standard_g_jar_08():
    """
    Kasus Uji Emas G-JAR-08:
    Router 192.168.10.1/24 di fastEthernet0/0; pool dhcp_server;
    excluded 192.168.10.1 sampai 192.168.10.5.
    Harus menghasilkan:
    - Klien pertama: 192.168.10.6
    - 10 baris perintah CLI cocok persis dengan Modul 3
    """
    calc = hitung_dhcp(
        alamat_router="192.168.10.1",
        prefix=24,
        interface="fastEthernet0/0",
        nama_pool="dhcp_server",
        excluded_awal="192.168.10.1",
        excluded_akhir="192.168.10.5",
    )

    assert calc["klien_pertama"] == "192.168.10.6"
    assert calc["network_address"] == "192.168.10.0"
    assert calc["subnet_mask"] == "255.255.255.0"
    assert calc["broadcast_address"] == "192.168.10.255"
    assert calc["host_pertama"] == "192.168.10.1"
    assert calc["host_terakhir"] == "192.168.10.254"

    cli_baris = calc["cli_baris"]
    assert len(cli_baris) == 10

    expected_commands = [
        ("enable", "Masuk ke Privileged EXEC mode"),
        ("configure terminal", "Masuk ke Global Configuration mode"),
        ("interface fastEthernet0/0", "Pilih interface router yang terhubung ke jaringan lokal"),
        ("ip address 192.168.10.1 255.255.255.0", "Pasang alamat IP router dan subnet mask pada interface"),
        ("no shutdown", "Aktifkan interface agar berstatus menyala (up)"),
        ("ip dhcp pool dhcp_server", "Buat dan beri nama DHCP pool pada router"),
        ("default-router 192.168.10.1", "Tentukan alamat default gateway untuk klien DHCP"),
        ("network 192.168.10.0 255.255.255.0", "Tentukan alamat jaringan dan subnet mask yang dibagikan"),
        ("exit", "Keluar dari mode konfigurasi DHCP pool"),
        ("ip dhcp excluded-address 192.168.10.1 192.168.10.5", "Kecualikan rentang alamat IP agar tidak dibagikan ke klien"),
    ]

    for i, (expected_cmd, expected_penjelasan) in enumerate(expected_commands):
        assert cli_baris[i]["perintah"] == expected_cmd
        assert cli_baris[i]["penjelasan"] == expected_penjelasan

    expected_script = "\n".join(cmd for cmd, _ in expected_commands)
    assert calc["cli_script"] == expected_script

    # Uji struktur langkah
    resp = susun_langkah_dhcp(calc)
    assert resp.fitur == "dhcp"
    assert len(resp.langkah) == 3
    assert resp.hasil_akhir["klien_pertama"] == "192.168.10.6"
    assert "192.168.10.6" in resp.kesimpulan


def test_dhcp_default_parameters():
    """Menguji penggunaan nilai bawaan saat interface dan nama_pool dikosongkan."""
    calc = hitung_dhcp(
        alamat_router="192.168.1.1",
        prefix=24,
        interface="",
        nama_pool="   ",
        excluded_awal="192.168.1.1",
        excluded_akhir="192.168.1.10",
    )
    assert calc["interface"] == "fastEthernet0/0"
    assert calc["nama_pool"] == "dhcp_server"
    assert calc["klien_pertama"] == "192.168.1.11"
    assert calc["cli_baris"][2]["perintah"] == "interface fastEthernet0/0"
    assert calc["cli_baris"][5]["perintah"] == "ip dhcp pool dhcp_server"


def test_dhcp_excluded_outside_network():
    """Excluded address di luar jaringan harus ditolak dengan DHCP_EXCLUDED_TIDAK_VALID."""
    with pytest.raises(AppError) as exc_info:
        hitung_dhcp(
            alamat_router="192.168.10.1",
            prefix=24,
            excluded_awal="192.168.20.1",
            excluded_akhir="192.168.20.5",
        )
    assert exc_info.value.kode == DHCP_EXCLUDED_TIDAK_VALID
    assert "192.168.10.0/24" in exc_info.value.pesan


def test_dhcp_excluded_start_greater_than_end():
    """Excluded awal lebih besar dari akhir harus ditolak dengan DHCP_EXCLUDED_TIDAK_VALID."""
    with pytest.raises(AppError) as exc_info:
        hitung_dhcp(
            alamat_router="192.168.10.1",
            prefix=24,
            excluded_awal="192.168.10.10",
            excluded_akhir="192.168.10.5",
        )
    assert exc_info.value.kode == DHCP_EXCLUDED_TIDAK_VALID
    assert exc_info.value.field == "excluded_akhir"


def test_dhcp_excluded_consumes_all_hosts():
    """Excluded menghabiskan seluruh host harus ditolak dengan DHCP_EXCLUDED_TIDAK_VALID."""
    # Pada /24, host valid adalah .1 sampai .254
    with pytest.raises(AppError) as exc_info:
        hitung_dhcp(
            alamat_router="192.168.10.1",
            prefix=24,
            excluded_awal="192.168.10.1",
            excluded_akhir="192.168.10.254",
        )
    assert exc_info.value.kode == DHCP_EXCLUDED_TIDAK_VALID
    assert exc_info.value.field == "excluded_akhir"


def test_dhcp_router_ip_invalid_format():
    """Alamat router tidak valid (misal leading zero) harus ditolak dengan IP_TIDAK_VALID."""
    with pytest.raises(AppError) as exc_info:
        hitung_dhcp(
            alamat_router="192.168.01.1",
            prefix=24,
            excluded_awal="192.168.1.1",
            excluded_akhir="192.168.1.5",
        )
    assert exc_info.value.kode == IP_TIDAK_VALID
    assert exc_info.value.field == "alamat_router"


def test_dhcp_router_ip_cannot_be_na_or_ba():
    """IP router tidak boleh berupa Network Address atau Broadcast Address."""
    # Network Address
    with pytest.raises(AppError) as exc_info:
        hitung_dhcp(
            alamat_router="192.168.10.0",
            prefix=24,
            excluded_awal="192.168.10.1",
            excluded_akhir="192.168.10.5",
        )
    assert exc_info.value.kode == IP_TIDAK_VALID
    assert exc_info.value.field == "alamat_router"

    # Broadcast Address
    with pytest.raises(AppError) as exc_info2:
        hitung_dhcp(
            alamat_router="192.168.10.255",
            prefix=24,
            excluded_awal="192.168.10.1",
            excluded_akhir="192.168.10.5",
        )
    assert exc_info2.value.kode == IP_TIDAK_VALID
    assert exc_info2.value.field == "alamat_router"


def test_dhcp_prefix_out_of_range():
    """Prefix di luar rentang 0..30 harus ditolak dengan PREFIX_TIDAK_VALID."""
    with pytest.raises(AppError) as exc_info:
        hitung_dhcp(
            alamat_router="192.168.10.1",
            prefix=31,
            excluded_awal="192.168.10.1",
            excluded_akhir="192.168.10.1",
        )
    assert exc_info.value.kode == PREFIX_TIDAK_VALID


def test_api_post_dhcp_success():
    """Uji integrasi HTTP POST /api/jaringan/dhcp berhasil sesuai data G-JAR-08."""
    payload = {
        "alamat_router": "192.168.10.1",
        "prefix": 24,
        "interface": "fastEthernet0/0",
        "nama_pool": "dhcp_server",
        "excluded_awal": "192.168.10.1",
        "excluded_akhir": "192.168.10.5",
    }
    response = client.post("/api/jaringan/dhcp", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["fitur"] == "dhcp"
    assert data["hasil_akhir"]["klien_pertama"] == "192.168.10.6"
    assert len(data["hasil_akhir"]["cli_baris"]) == 10
    assert len(data["langkah"]) == 3


def test_api_post_dhcp_error_validation():
    """Uji integrasi HTTP POST /api/jaringan/dhcp gagal validasi mengembalikan error terstruktur."""
    payload = {
        "alamat_router": "192.168.10.1",
        "prefix": 24,
        "interface": "fastEthernet0/0",
        "nama_pool": "dhcp_server",
        "excluded_awal": "192.168.20.1",
        "excluded_akhir": "192.168.20.5",
    }
    response = client.post("/api/jaringan/dhcp", json=payload)
    assert response.status_code == 400
    err = response.json()
    assert err["kode"] == DHCP_EXCLUDED_TIDAK_VALID
    assert "192.168.10.0/24" in err["pesan"]
