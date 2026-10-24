"""
Pengujian fitur Konversi Basis (FR-12, US-03, G-JAR-03)
Menguji solver deterministik dan endpoint POST /api/jaringan/konversi.
"""

import pytest
from fastapi.testclient import TestClient

from app.core.errors import (
    AppError,
    BASIS_TIDAK_VALID,
    BATAS_UKURAN_LEWAT,
    DIGIT_TIDAK_VALID,
    IP_TIDAK_VALID,
)
from app.main import app
from app.modules.jaringan.solver import hitung_konversi
from app.modules.jaringan.steps import susun_langkah_konversi

client = TestClient(app)


class TestKonversiSolver:
    """Uji solver hitung_konversi dengan data uji emas G-JAR-03."""

    def test_g_jar_03_kasus_1_biner_ke_basis_lain(self):
        """
        G-JAR-03 Kasus 1:
        10101100 (basis 2) -> desimal 172, heksadesimal AC, oktal 254,
        bobot aktif [128, 32, 8, 4] dengan rumus 128 + 32 + 8 + 4 = 172.
        """
        res = hitung_konversi(nilai="10101100", basis_asal=2)

        assert res["desimal"] == "172"
        assert res["heksadesimal"] == "AC"
        assert res["oktal"] == "254"
        assert res["biner"] == "10101100"
        assert res["bobot_aktif"] == [128, 32, 8, 4]
        assert res["rumus_penjumlahan"] == "128 + 32 + 8 + 4 = 172"

        # Verifikasi tabel posisi bit 8-bit
        tabel_bit = res["tabel_bit"]
        assert len(tabel_bit) == 8
        # Bobot 128 (aktif), 64 (mati), 32 (aktif), 16 (mati), 8 (aktif), 4 (aktif), 2 (mati), 1 (mati)
        assert tabel_bit[0]["bobot"] == 128 and tabel_bit[0]["bit"] == 1 and tabel_bit[0]["aktif"] is True
        assert tabel_bit[1]["bobot"] == 64 and tabel_bit[1]["bit"] == 0 and tabel_bit[1]["aktif"] is False
        assert tabel_bit[2]["bobot"] == 32 and tabel_bit[2]["bit"] == 1 and tabel_bit[2]["aktif"] is True
        assert tabel_bit[3]["bobot"] == 16 and tabel_bit[3]["bit"] == 0 and tabel_bit[3]["aktif"] is False
        assert tabel_bit[4]["bobot"] == 8 and tabel_bit[4]["bit"] == 1 and tabel_bit[4]["aktif"] is True
        assert tabel_bit[5]["bobot"] == 4 and tabel_bit[5]["bit"] == 1 and tabel_bit[5]["aktif"] is True
        assert tabel_bit[6]["bobot"] == 2 and tabel_bit[6]["bit"] == 0 and tabel_bit[6]["aktif"] is False
        assert tabel_bit[7]["bobot"] == 1 and tabel_bit[7]["bit"] == 0 and tabel_bit[7]["aktif"] is False

    def test_g_jar_03_kasus_2_desimal_ke_basis_lain(self):
        """
        G-JAR-03 Kasus 2:
        234 (basis 10) -> biner 11101010, heksadesimal EA, oktal 352,
        bobot aktif [128, 64, 32, 8, 2].
        """
        res = hitung_konversi(nilai="234", basis_asal=10)

        assert res["biner"] == "11101010"
        assert res["heksadesimal"] == "EA"
        assert res["oktal"] == "352"
        assert res["desimal"] == "234"
        assert res["bobot_aktif"] == [128, 64, 32, 8, 2]
        assert res["rumus_penjumlahan"] == "128 + 64 + 32 + 8 + 2 = 234"

    def test_g_jar_03_kasus_3_heksadesimal_ke_basis_lain(self):
        """
        G-JAR-03 Kasus 3:
        FF (basis 16) -> desimal 255, biner 11111111, oktal 377,
        bobot aktif [128, 64, 32, 16, 8, 4, 2, 1].
        """
        res = hitung_konversi(nilai="FF", basis_asal=16)

        assert res["desimal"] == "255"
        assert res["biner"] == "11111111"
        assert res["oktal"] == "377"
        assert res["heksadesimal"] == "FF"
        assert res["bobot_aktif"] == [128, 64, 32, 16, 8, 4, 2, 1]
        assert res["rumus_penjumlahan"] == "128 + 64 + 32 + 16 + 8 + 4 + 2 + 1 = 255"

    def test_heksa_huruf_kecil_dan_awalan_0x(self):
        """Heksa dengan awalan 0x atau huruf kecil diterima dan ditampilkan huruf besar."""
        res1 = hitung_konversi(nilai="0xff", basis_asal=16)
        assert res1["heksadesimal"] == "FF"
        assert res1["desimal"] == "255"

        res2 = hitung_konversi(nilai="ac", basis_asal=16)
        assert res2["heksadesimal"] == "AC"
        assert res2["desimal"] == "172"

        res3 = hitung_konversi(nilai="0X1a", basis_asal=16)
        assert res3["heksadesimal"] == "1A"
        assert res3["desimal"] == "26"

    def test_nilai_nol(self):
        """Uji konversi angka 0."""
        res = hitung_konversi(nilai="0", basis_asal=10)
        assert res["desimal"] == "0"
        assert res["biner"] == "00000000"
        assert res["oktal"] == "0"
        assert res["heksadesimal"] == "0"
        assert res["bobot_aktif"] == []
        assert res["rumus_penjumlahan"] == "0 = 0"

    def test_basis_8_oktal(self):
        """Uji konversi dari basis 8 (oktal)."""
        res = hitung_konversi(nilai="254", basis_asal=8)
        assert res["desimal"] == "172"
        assert res["biner"] == "10101100"
        assert res["heksadesimal"] == "AC"


class TestKonversiValidasiKasusTepi:
    """Uji penolakan input tidak valid sesuai Lampiran B & C."""

    def test_basis_asal_tidak_valid(self):
        """Basis selain 2, 8, 10, 16 ditolak dengan BASIS_TIDAK_VALID."""
        with pytest.raises(AppError) as exc_info:
            hitung_konversi(nilai="10", basis_asal=5)
        assert exc_info.value.kode == BASIS_TIDAK_VALID
        assert exc_info.value.field == "basis_asal"
        assert "Basis harus 2, 8, 10, atau 16" in exc_info.value.pesan

    def test_bilangan_negatif_ditolak(self):
        """Bilangan negatif diawali '-' ditolak dengan DIGIT_TIDAK_VALID."""
        with pytest.raises(AppError) as exc_info:
            hitung_konversi(nilai="-10", basis_asal=10)
        assert exc_info.value.kode == DIGIT_TIDAK_VALID
        assert exc_info.value.field == "nilai"
        assert "Digit - tidak berlaku di basis 10" in exc_info.value.pesan

    def test_pecahan_koma_atau_titik_ditolak(self):
        """Pecahan bertanda titik atau koma ditolak dengan DIGIT_TIDAK_VALID."""
        with pytest.raises(AppError) as exc_info1:
            hitung_konversi(nilai="10.5", basis_asal=10)
        assert exc_info1.value.kode == DIGIT_TIDAK_VALID

        with pytest.raises(AppError) as exc_info2:
            hitung_konversi(nilai="10,5", basis_asal=10)
        assert exc_info2.value.kode == DIGIT_TIDAK_VALID

    def test_digit_tidak_sah_per_basis(self):
        """Karakter bukan digit sah basis ditolak dengan DIGIT_TIDAK_VALID."""
        # Digit '2' pada basis 2
        with pytest.raises(AppError) as exc_biner:
            hitung_konversi(nilai="10201", basis_asal=2)
        assert exc_biner.value.kode == DIGIT_TIDAK_VALID
        assert "Digit 2 tidak berlaku di basis 2" in exc_biner.value.pesan

        # Digit '8' pada basis 8
        with pytest.raises(AppError) as exc_oktal:
            hitung_konversi(nilai="18", basis_asal=8)
        assert exc_oktal.value.kode == DIGIT_TIDAK_VALID
        assert "Digit 8 tidak berlaku di basis 8" in exc_oktal.value.pesan

        # Huruf 'G' pada basis 16
        with pytest.raises(AppError) as exc_heksa:
            hitung_konversi(nilai="1G", basis_asal=16)
        assert exc_heksa.value.kode == DIGIT_TIDAK_VALID
        assert "Digit G tidak berlaku di basis 16" in exc_heksa.value.pesan

    def test_batas_ukuran_64_bit(self):
        """Angka melebihi 64 bit biner ditolak dengan BATAS_UKURAN_LEWAT."""
        nilai_64_bit = str(1 << 64)
        with pytest.raises(AppError) as exc_info:
            hitung_konversi(nilai=nilai_64_bit, basis_asal=10)
        assert exc_info.value.kode == BATAS_UKURAN_LEWAT
        assert exc_info.value.field == "nilai"


class TestKonversiModeIpv4:
    """Uji konversi dalam mode 4 oktet IPv4."""

    def test_ipv4_valid(self):
        """Konversi 4 oktet desimal IPv4."""
        res = hitung_konversi(nilai="172.16.0.1", basis_asal=10, mode_ipv4=True)
        assert res["desimal"] == "172.16.0.1"
        assert res["biner"] == "10101100.00010000.00000000.00000001"
        assert res["heksadesimal"] == "AC.10.00.01"
        assert len(res["oktet_list"]) == 4

    def test_ipv4_format_salah(self):
        """Jumlah oktet bukan 4 ditolak dengan IP_TIDAK_VALID."""
        with pytest.raises(AppError) as exc_info:
            hitung_konversi(nilai="192.168.1", basis_asal=10, mode_ipv4=True)
        assert exc_info.value.kode == IP_TIDAK_VALID

    def test_ipv4_oktet_melebihi_255(self):
        """Nilai oktet > 255 ditolak."""
        with pytest.raises(AppError) as exc_info:
            hitung_konversi(nilai="192.168.1.300", basis_asal=10, mode_ipv4=True)
        assert exc_info.value.kode == IP_TIDAK_VALID


class TestKonversiEndpointDanLangkah:
    """Uji kontrak endpoint POST /api/jaringan/konversi dan struktur langkah."""

    def test_endpoint_berhasil(self):
        """Memanggil endpoint POST /api/jaringan/konversi."""
        payload = {
            "nilai": "10101100",
            "basis_asal": 2,
            "mode_ipv4": False,
        }
        response = client.post("/api/jaringan/konversi", json=payload)
        assert response.status_code == 200
        data = response.json()

        assert data["fitur"] == "konversi"
        assert len(data["diketahui"]) >= 3
        assert len(data["langkah"]) >= 2
        assert "tabel" in data["hasil_akhir"]
        assert data["hasil_akhir"]["desimal"] == "172"
        assert data["hasil_akhir"]["heksadesimal"] == "AC"
        assert "172" in data["kesimpulan"]

    def test_endpoint_error_basis_tidak_valid(self):
        """Endpoint mengembalikan 400 terstruktur saat basis_asal tidak valid."""
        payload = {
            "nilai": "10101100",
            "basis_asal": 3,
            "mode_ipv4": False,
        }
        response = client.post("/api/jaringan/konversi", json=payload)
        assert response.status_code == 400
        err = response.json()
        assert err["kode"] == BASIS_TIDAK_VALID
        assert err["field"] == "basis_asal"

    def test_endpoint_error_digit_tidak_valid(self):
        """Endpoint mengembalikan 400 terstruktur saat digit salah."""
        payload = {
            "nilai": "10201",
            "basis_asal": 2,
            "mode_ipv4": False,
        }
        response = client.post("/api/jaringan/konversi", json=payload)
        assert response.status_code == 400
        err = response.json()
        assert err["kode"] == DIGIT_TIDAK_VALID
        assert err["field"] == "nilai"
        assert "Digit 2 tidak berlaku di basis 2" in err["pesan"]
