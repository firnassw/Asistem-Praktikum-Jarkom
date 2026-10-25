"""
Skema input dan validasi untuk modul subnetting jaringan.
"""

from typing import List, Optional, Tuple, Union
from pydantic import BaseModel, Field

from app.core.errors import (
    AppError,
    IP_TIDAK_VALID,
    MASK_TIDAK_VALID,
    PERMINTAAN_TIDAK_VALID,
    PREFIX_TIDAK_VALID,
)


def validate_ipv4_format(ip_str: str, field_name: str = "alamat_ip") -> List[int]:
    """
    Memvalidasi format IPv4 titik-desimal:
    - Harus 4 oktet dipisahkan titik.
    - Tiap oktet 0-255.
    - Tanpa nol di depan (misal: '192.168.01.1' ditolak).
    """
    if not isinstance(ip_str, str) or not ip_str.strip():
        raise AppError(IP_TIDAK_VALID, field=field_name)

    parts = ip_str.strip().split(".")
    if len(parts) != 4:
        raise AppError(IP_TIDAK_VALID, field=field_name)

    octets: List[int] = []
    for part in parts:
        if not part.isdigit():
            raise AppError(IP_TIDAK_VALID, field=field_name)
        # Menolak nol di depan jika panjang lebih dari 1 digit (misalnya '01', '005')
        if len(part) > 1 and part[0] == "0":
            raise AppError(IP_TIDAK_VALID, field=field_name)
        val = int(part)
        if val < 0 or val > 255:
            raise AppError(IP_TIDAK_VALID, field=field_name)
        octets.append(val)

    return octets


def mask_to_prefix(mask_str: str) -> int:
    """
    Memvalidasi subnet mask apakah memiliki bit 1 berurutan dari kiri.
    Mengembalikan prefix (0-32).
    Jika tidak valid, melempar AppError(MASK_TIDAK_VALID, field='subnet_mask').
    """
    octets = validate_ipv4_format(mask_str, field_name="subnet_mask")
    mask_int = (octets[0] << 24) | (octets[1] << 16) | (octets[2] << 8) | octets[3]

    # Himpunan mask valid (bit 1 berurutan dari kiri)
    valid_masks = {}
    for p in range(33):
        if p == 0:
            m = 0
        else:
            m = (0xFFFFFFFF << (32 - p)) & 0xFFFFFFFF
        valid_masks[m] = p

    if mask_int not in valid_masks:
        raise AppError(MASK_TIDAK_VALID, field="subnet_mask")

    return valid_masks[mask_int]


def prefix_to_mask(prefix: int) -> Tuple[int, str]:
    """
    Mengubah prefix (0-32) menjadi (mask_int, mask_str).
    """
    if prefix < 0 or prefix > 32:
        raise AppError(PREFIX_TIDAK_VALID, field="prefix")

    if prefix == 0:
        mask_int = 0
    else:
        mask_int = (0xFFFFFFFF << (32 - prefix)) & 0xFFFFFFFF

    o1 = (mask_int >> 24) & 255
    o2 = (mask_int >> 16) & 255
    o3 = (mask_int >> 8) & 255
    o4 = mask_int & 255
    mask_str = f"{o1}.{o2}.{o3}.{o4}"
    return mask_int, mask_str


class SubnetRequest(BaseModel):
    """
    Permintaan analisis subnet satu IP:
    - alamat_ip (wajib): IPv4 titik-desimal tanpa nol di depan.
    - prefix (opsional jika subnet_mask diisi): 0-32.
    - subnet_mask (opsional jika prefix diisi): mask IPv4 valid.
    """
    alamat_ip: str = Field(..., description="Alamat IPv4")
    prefix: Optional[int] = Field(None, description="Prefix CIDR (0-32)")
    subnet_mask: Optional[str] = Field(None, description="Subnet mask IPv4")


class KebutuhanItem(BaseModel):
    """
    Item kebutuhan host untuk satu ruangan / lab:
    - nama (wajib): 1-30 karakter, unik.
    - host (wajib): bilangan bulat >= 1.
    """
    nama: str = Field(..., description="Nama ruangan atau subnet (1-30 karakter)")
    host: int = Field(..., description="Jumlah kebutuhan host perangkat (>= 1)")


class VlsmRequest(BaseModel):
    """
    Permintaan alokasi VLSM (Variable Length Subnet Mask):
    - alamat_induk: IPv4 titik-desimal (harus alamat jaringan untuk prefix_induk).
    - prefix_induk: 0-30.
    - kebutuhan: list 1-20 ruangan.
    """
    alamat_induk: str = Field(..., description="Alamat induk IPv4 (Network Address)")
    prefix_induk: int = Field(..., description="Prefix induk (0-30)")
    kebutuhan: List[KebutuhanItem] = Field(..., description="Daftar kebutuhan host (1-20 ruangan)")


class FlsmRequest(BaseModel):
    """
    Permintaan alokasi FLSM (Fixed Length Subnet Mask):
    - alamat_induk: IPv4 titik-desimal (harus alamat jaringan untuk prefix_induk).
    - prefix_induk: 0-30.
    - kebutuhan: list 1-20 ruangan.
    - gaya_modul: izinkan alokasi subnet berurutan melampaui batas induk.
    """
    alamat_induk: str = Field(..., description="Alamat induk IPv4 (Network Address)")
    prefix_induk: int = Field(..., description="Prefix induk (0-30)")
    kebutuhan: List[KebutuhanItem] = Field(..., description="Daftar kebutuhan host (1-20 ruangan)")
    gaya_modul: bool = Field(False, description="Opsi gaya modul praktikum (lanjutkan melewati batas induk)")


class RuanganItem(BaseModel):
    """
    Item ruangan untuk fitur rencana:
    - nama: 1-30 karakter, unik.
    - device: bilangan bulat >= 1.
    """
    nama: str = Field(..., description="Nama ruangan (1-30 karakter)")
    device: int = Field(..., description="Jumlah device perangkat (>= 1)")


class RencanaRequest(BaseModel):
    """
    Permintaan rencana alokasi subnet dari ruangan dan device:
    - nim_dua_digit: 2 digit angka '00'..'99' (opsional jika alamat_induk diisi).
    - alamat_induk: IPv4 titik-desimal (opsional jika nim_dua_digit diisi).
    - prefix_induk: integer 0..30 (default 24 jika pakai nim).
    - ruangan: list 1..20 ruangan.
    - gateway: bool (default False).
    - cadangan_persen: int 0..100 (default 0).
    - mode: 'vlsm' | 'flsm' (default 'vlsm').
    - gaya_modul: bool (default False).
    """
    nim_dua_digit: Optional[Union[str, int]] = Field(None, description="Dua digit terakhir NIM ('00'..'99')")
    alamat_induk: Optional[str] = Field(None, description="Alamat induk IPv4 (Network Address)")
    prefix_induk: Optional[int] = Field(None, description="Prefix induk (0-30)")
    ruangan: List[RuanganItem] = Field(..., description="Daftar ruangan dan jumlah device (1-20 ruangan)")
    gateway: bool = Field(False, description="Opsi hitung gateway (+1 host per ruangan)")
    cadangan_persen: int = Field(0, description="Persentase cadangan pertumbuhan device (0-100%)")
    mode: str = Field("vlsm", description="Metode alokasi ('vlsm' atau 'flsm')")
    gaya_modul: bool = Field(False, description="Opsi gaya modul praktikum untuk FLSM")


class DhcpRequest(BaseModel):
    """
    Permintaan konfigurasi DHCP server router Cisco Packet Tracer:
    - alamat_router: IPv4 titik-desimal (wajib).
    - prefix: integer 0-30 (wajib).
    - interface: nama interface router, default 'fastEthernet0/0'.
    - nama_pool: nama DHCP pool, default 'dhcp_server'.
    - excluded_awal: IPv4 titik-desimal (wajib).
    - excluded_akhir: IPv4 titik-desimal (wajib).
    """
    alamat_router: str = Field(..., description="Alamat IP router/default gateway (IPv4)")
    prefix: int = Field(..., description="Panjang prefix (0-30)")
    interface: Optional[str] = Field("fastEthernet0/0", description="Nama interface router LAN")
    nama_pool: Optional[str] = Field("dhcp_server", description="Nama DHCP pool")
    excluded_awal: str = Field(..., description="Alamat IP awal rentang excluded")
    excluded_akhir: str = Field(..., description="Alamat IP akhir rentang excluded")


class KonversiRequest(BaseModel):
    """
    Permintaan konversi basis bilangan:
    - nilai (wajib): string representasi bilangan.
    - basis_asal (wajib): integer (2, 8, 10, atau 16).
    - mode_ipv4 (opsional): bool (default False), konversi 4 oktet IPv4 dipisahkan titik.
    """
    nilai: str = Field(..., description="Nilai bilangan yang akan dikonversi")
    basis_asal: int = Field(..., description="Basis asal bilangan: 2, 8, 10, atau 16")
    mode_ipv4: bool = Field(False, description="Mode konversi 4 oktet IPv4")


class PerangkatItem(BaseModel):
    """
    Item konfigurasi IP satu perangkat (host / server / router):
    - nama: 1-30 karakter, unik.
    - mode: 'static' atau 'dhcp' (default 'static').
    - ip: IPv4 titik-desimal (wajib jika mode static, opsional jika dhcp).
    - prefix: 0-32 (opsional jika subnet_mask diisi).
    - subnet_mask: IPv4 mask valid (opsional jika prefix diisi).
    - gateway: default gateway IPv4 (opsional).
    - dns: DNS server IPv4 (opsional).
    """
    nama: str = Field(..., description="Nama perangkat (1-30 karakter)")
    mode: Optional[str] = Field("static", description="Mode pengalamatan ('static' atau 'dhcp')")
    ip: Optional[str] = Field(None, description="Alamat IPv4 perangkat")
    prefix: Optional[int] = Field(None, description="Panjang prefix (0-32)")
    subnet_mask: Optional[str] = Field(None, description="Subnet mask IPv4")
    gateway: Optional[str] = Field(None, description="Default gateway IPv4")
    dns: Optional[str] = Field(None, description="DNS server IPv4")


class TabelIpRequest(BaseModel):
    """
    Permintaan rekap tabel IP perangkat:
    - perangkat: list 1 sampai 50 perangkat.
    """
    perangkat: List[PerangkatItem] = Field(..., description="Daftar konfigurasi IP perangkat (1-50 item)")





