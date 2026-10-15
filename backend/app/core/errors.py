"""
Konstanta kode error, exception terstruktur, dan handler sesuai PRD Lampiran B.
"""

from typing import Any, Dict, Optional
from fastapi import Request, status
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse

# Konstanta Kode Error (PRD Lampiran B)
PERMINTAAN_TIDAK_VALID = "PERMINTAAN_TIDAK_VALID"
BATAS_UKURAN_LEWAT = "BATAS_UKURAN_LEWAT"
ANGKA_TIDAK_VALID = "ANGKA_TIDAK_VALID"
KESALAHAN_SERVER = "KESALAHAN_SERVER"
IP_TIDAK_VALID = "IP_TIDAK_VALID"
PREFIX_TIDAK_VALID = "PREFIX_TIDAK_VALID"
MASK_TIDAK_VALID = "MASK_TIDAK_VALID"
ALAMAT_BUKAN_BATAS_JARINGAN = "ALAMAT_BUKAN_BATAS_JARINGAN"
RUANGAN_TIDAK_VALID = "RUANGAN_TIDAK_VALID"
DEVICE_TIDAK_VALID = "DEVICE_TIDAK_VALID"
NAMA_DUPLIKAT = "NAMA_DUPLIKAT"
CADANGAN_TIDAK_VALID = "CADANGAN_TIDAK_VALID"
NIM_TIDAK_VALID = "NIM_TIDAK_VALID"
FLSM_TIDAK_MUNGKIN = "FLSM_TIDAK_MUNGKIN"
BASIS_TIDAK_VALID = "BASIS_TIDAK_VALID"
DIGIT_TIDAK_VALID = "DIGIT_TIDAK_VALID"
DHCP_EXCLUDED_TIDAK_VALID = "DHCP_EXCLUDED_TIDAK_VALID"

# Konstanta Kode Peringatan (bukan error, hasil tetap tampil)
VLSM_RUANG_KURANG = "VLSM_RUANG_KURANG"
MELEWATI_INDUK = "MELEWATI_INDUK"
GATEWAY_MEMBEDAKAN_HASIL = "GATEWAY_MEMBEDAKAN_HASIL"
PREFIX_31_32 = "PREFIX_31_32"

# Templat Pesan Default (PRD Lampiran B)
DEFAULT_MESSAGES: Dict[str, str] = {
    PERMINTAAN_TIDAK_VALID: "Data yang dikirim tidak lengkap. Muat ulang halaman lalu coba lagi",
    BATAS_UKURAN_LEWAT: "{field} melebihi batas {n}. Kurangi jumlahnya lalu hitung lagi",
    ANGKA_TIDAK_VALID: "Isi {field} dengan angka bulat",
    KESALAHAN_SERVER: "Perhitungan gagal di server. Coba lagi; jika berulang, laporkan beserta contoh datanya",
    IP_TIDAK_VALID: "Alamat IP harus empat angka 0–255 dipisah titik, misalnya 192.168.1.10",
    PREFIX_TIDAK_VALID: "Prefix harus bilangan bulat 0 sampai 32 (0 sampai 30 untuk induk)",
    MASK_TIDAK_VALID: "Subnet mask tidak valid. Bit 1 harus berurutan dari kiri, misalnya 255.255.255.224",
    ALAMAT_BUKAN_BATAS_JARINGAN: "Alamat induk harus alamat jaringan untuk /{p}, misalnya {contoh}",
    RUANGAN_TIDAK_VALID: "Jumlah ruangan harus 1 sampai 20",
    DEVICE_TIDAK_VALID: "Jumlah device {ruangan} harus bilangan bulat 1 atau lebih",
    NAMA_DUPLIKAT: "Nama {nama} dipakai dua kali. Beri nama yang berbeda",
    CADANGAN_TIDAK_VALID: "Cadangan harus angka 0 sampai 100 (persen)",
    NIM_TIDAK_VALID: "Isi dua digit terakhir NIM, misalnya 50",
    FLSM_TIDAK_MUNGKIN: "Induk /{p} hanya memuat {n} subnet /{q}, padahal dibutuhkan {m}. Pakai induk /{r}, pilih VLSM, atau aktifkan gaya modul",
    BASIS_TIDAK_VALID: "Basis harus 2, 8, 10, atau 16",
    DIGIT_TIDAK_VALID: "Digit {d} tidak berlaku di basis {b}. Bilangan negatif dan pecahan belum didukung",
    DHCP_EXCLUDED_TIDAK_VALID: "Rentang excluded harus berada di jaringan {n} dan menyisakan minimal satu alamat untuk klien",
}


def format_error_message(kode: str, **kwargs: Any) -> str:
    """Format template pesan error dengan variabel yang diberikan."""
    template = DEFAULT_MESSAGES.get(kode, "Terjadi kesalahan pada data masukan.")
    try:
        return template.format(**kwargs)
    except KeyError:
        return template


class AppError(Exception):
    """
    Custom application exception dengan format terstruktur:
    - kode: str
    - pesan: str
    - field: str | None
    - status_code: int (default 400)
    """
    def __init__(
        self,
        kode: str,
        pesan: Optional[str] = None,
        field: Optional[str] = None,
        status_code: int = status.HTTP_400_BAD_REQUEST,
        extra: Optional[Dict[str, Any]] = None,
        **format_kwargs: Any
    ):
        self.kode = kode
        if pesan is not None:
            self.pesan = pesan
        elif format_kwargs:
            self.pesan = format_error_message(kode, field=field, **format_kwargs)
        else:
            self.pesan = DEFAULT_MESSAGES.get(kode, "Terjadi kesalahan.")
        self.field = field
        self.status_code = status_code
        self.extra = extra or {}
        # Jika r ada di format_kwargs, simpan juga sebagai prefix_saran jika belum ada
        if "r" in format_kwargs and "prefix_saran" not in self.extra:
            self.extra["prefix_saran"] = format_kwargs["r"]
        super().__init__(self.pesan)

    def to_dict(self) -> Dict[str, Any]:
        res = {
            "kode": self.kode,
            "pesan": self.pesan,
            "field": self.field
        }
        if self.extra:
            res.update(self.extra)
        return res


async def app_error_handler(request: Request, exc: AppError) -> JSONResponse:
    """Handler untuk AppError mengembalikan format error terstruktur."""
    return JSONResponse(
        status_code=exc.status_code,
        content=exc.to_dict()
    )


async def validation_error_handler(request: Request, exc: RequestValidationError) -> JSONResponse:
    """Handler untuk FastAPI / Pydantic validation error."""
    errors = exc.errors()
    first_error = errors[0] if errors else {}
    loc = first_error.get("loc", [])
    field_name = str(loc[-1]) if loc else None
    
    # Deteksi jenis kesalahan sederhana
    msg = first_error.get("msg", "")
    error_type = first_error.get("type", "")
    
    kode = PERMINTAAN_TIDAK_VALID
    pesan = DEFAULT_MESSAGES[PERMINTAAN_TIDAK_VALID]

    if "int_parsing" in error_type or "int_type" in error_type:
        kode = ANGKA_TIDAK_VALID
        pesan = format_error_message(ANGKA_TIDAK_VALID, field=field_name or "kolom")
    
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={
            "kode": kode,
            "pesan": pesan,
            "field": field_name
        }
    )


async def generic_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    """Handler fallback untuk 500 error tidak terduga."""
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "kode": KESALAHAN_SERVER,
            "pesan": DEFAULT_MESSAGES[KESALAHAN_SERVER],
            "field": None
        }
    )
