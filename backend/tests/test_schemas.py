"""
Tes validasi kontrak skema jawaban seragam (PRD Bagian 12).
"""

import pytest
from pydantic import ValidationError
from app.core.schemas import DiketahuiItem, LangkahItem, StrukturJawaban


def test_uniform_response_schema_valid():
    """Memastikan struktur jawaban seragam dapat dibuat dan divalidasi dengan benar."""
    jawaban = StrukturJawaban(
        fitur="subnet",
        diketahui=[
            DiketahuiItem(label="Alamat IP", nilai="192.168.0.5"),
            DiketahuiItem(label="Prefix", nilai="/27")
        ],
        langkah=[
            LangkahItem(
                judul="Langkah 1: IP dan mask dalam biner",
                penjelasan="Ubah IP dan mask ke representasi biner 32-bit",
                rumus="11000000.10101000.00000000.00000101",
                tabel=None,
                hasil="192.168.0.5"
            ),
            LangkahItem(
                judul="Langkah 2: Network Address (NA)",
                penjelasan="Lakukan operasi AND antara IP dan Mask",
                rumus="IP AND MASK",
                tabel=None,
                hasil="192.168.0.0"
            )
        ],
        hasil_akhir={
            "tabel": [
                {
                    "subnet": "192.168.0.0/27",
                    "host_pertama": "192.168.0.1",
                    "host_terakhir": "192.168.0.30",
                    "broadcast": "192.168.0.31"
                }
            ],
            "na": "192.168.0.0",
            "ba": "192.168.0.31"
        },
        kesimpulan="Jaringan dengan prefix /27 memiliki 8 subnet dengan 30 host per subnet.",
        peringatan=[]
    )

    data = jawaban.model_dump()
    assert data["fitur"] == "subnet"
    assert len(data["diketahui"]) == 2
    assert data["diketahui"][0]["label"] == "Alamat IP"
    assert len(data["langkah"]) == 2
    assert "tabel" in data["hasil_akhir"]
    assert isinstance(data["kesimpulan"], str)
    assert isinstance(data["peringatan"], list)


def test_uniform_response_schema_missing_required():
    """Memastikan bahwa missing required field (misal kesimpulan atau fitur) memicu ValidationError."""
    with pytest.raises(ValidationError):
        StrukturJawaban(
            fitur="subnet",
            diketahui=[],
            langkah=[],
            hasil_akhir={},
            # kesimpulan sengaja diabaikan
        )
