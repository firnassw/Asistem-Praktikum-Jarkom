"""
Skema Pydantic untuk struktur data inti Asisten Praktikum Jaringan.
Sesuai PRD Bagian 12 dan Lampiran A & B.
"""

from typing import Any, Dict, List, Optional, Union
from pydantic import BaseModel, Field


class DiketahuiItem(BaseModel):
    """Item dalam daftar 'diketahui' pada lembar jawaban."""
    label: str = Field(..., description="Label parameter yang diketahui, misalnya 'Alamat IP' atau 'Induk'")
    nilai: str = Field(..., description="Nilai parameter dalam representasi string")


class LangkahItem(BaseModel):
    """Satu langkah penyelesaian."""
    judul: str = Field(..., description="Judul langkah penyelesaian")
    penjelasan: str = Field(..., description="Penjelasan langkah")
    rumus: Optional[str] = Field(None, description="Rumus matematika atau biner")
    tabel: Optional[Union[Dict[str, Any], List[Any]]] = Field(None, description="Tabel data jika langkah memerlukan tabel")
    hasil: Optional[str] = Field(None, description="Nilai hasil dari langkah ini")


class StrukturJawaban(BaseModel):
    """
    Struktur jawaban seragam untuk semua modul/fitur sesuai PRD Bagian 12:
    - fitur: identifier fitur (e.g. 'subnet', 'vlsm')
    - diketahui: list of {"label": str, "nilai": str}
    - langkah: list of {"judul": str, "penjelasan": str, "rumus": str | None, "tabel": dict | list | None, "hasil": str | None}
    - hasil_akhir: dict (memuat "tabel" dll.)
    - kesimpulan: str
    - peringatan: list of str
    """
    fitur: str = Field(..., description="Identifier fitur")
    diketahui: List[DiketahuiItem] = Field(default_factory=list, description="Daftar parameter yang diketahui")
    langkah: List[LangkahItem] = Field(default_factory=list, description="Langkah-langkah terstruktur")
    hasil_akhir: Dict[str, Any] = Field(default_factory=dict, description="Hasil akhir, memuat tabel atau rangkuman data")
    kesimpulan: str = Field(..., description="Satu sampai tiga kalimat kesimpulan")
    peringatan: List[str] = Field(default_factory=list, description="Daftar kode peringatan jika ada")


class ErrorResponse(BaseModel):
    """
    Format error terstruktur sesuai PRD Bagian 12 dan Lampiran B:
    {"kode": str, "pesan": str, "field": str | None}
    """
    kode: str = Field(..., description="Konstanta kode error")
    pesan: str = Field(..., description="Pesan Bahasa Indonesia yang menyebut apa yang salah dan cara memperbaiki")
    field: Optional[str] = Field(None, description="Nama field yang bermasalah jika relevan")


class ModulMetadata(BaseModel):
    """Metadata modul yang terdaftar di registry."""
    id: str
    nama: str
    deskripsi: str
    rute: str
    contoh: str
    warna_aksen: str  # secondary | primary | tertiary
    urutan: int = 0
