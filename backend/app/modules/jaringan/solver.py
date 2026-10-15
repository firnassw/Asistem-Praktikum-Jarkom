"""
Solver logika hitungan deterministik subnetting satu IP menggunakan Python murni dan bitwise integer.
Tanpa float dan tanpa math.log2.
"""

from typing import Any, Dict, List, Optional
from app.core.errors import (
    AppError,
    PERMINTAAN_TIDAK_VALID,
    PREFIX_31_32,
    PREFIX_TIDAK_VALID,
)
from app.modules.jaringan.schemas import (
    mask_to_prefix,
    prefix_to_mask,
    validate_ipv4_format,
)


def int_to_ip(val: int) -> str:
    """Mengubah integer 32-bit ke representasi dotted-decimal IPv4."""
    o1 = (val >> 24) & 255
    o2 = (val >> 16) & 255
    o3 = (val >> 8) & 255
    o4 = val & 255
    return f"{o1}.{o2}.{o3}.{o4}"


def int_to_bin(val: int) -> str:
    """Mengubah integer 32-bit ke string biner 4 oktet dengan pemisah titik."""
    o1 = (val >> 24) & 255
    o2 = (val >> 16) & 255
    o3 = (val >> 8) & 255
    o4 = val & 255
    return f"{o1:08b}.{o2:08b}.{o3:08b}.{o4:08b}"


def hitung_subnet(
    alamat_ip: str,
    prefix: Optional[int] = None,
    subnet_mask: Optional[str] = None,
) -> Dict[str, Any]:
    """
    Menghitung parameter subnetting satu IP secara deterministik menggunakan operasi bitwise:
    - NA = IP AND mask
    - invers_mask = ~mask & 0xFFFFFFFF
    - BA = NA OR invers_mask
    - Jumlah subnet, host valid, blok subnet, dan daftar seluruh subnet.
    """
    # 1. Validasi Input IP
    octets = validate_ipv4_format(alamat_ip, field_name="alamat_ip")
    ip_int = (octets[0] << 24) | (octets[1] << 16) | (octets[2] << 8) | octets[3]
    ip_str = int_to_ip(ip_int)

    # 2. Validasi & Sinkronisasi Prefix dan Subnet Mask
    if prefix is None and subnet_mask is None:
        raise AppError(PERMINTAAN_TIDAK_VALID)

    if subnet_mask is not None:
        derived_prefix = mask_to_prefix(subnet_mask)
        if prefix is not None and prefix != derived_prefix:
            raise AppError(
                PERMINTAAN_TIDAK_VALID,
                pesan="Prefix dan Subnet Mask yang dimasukkan tidak cocok.",
                field="prefix"
            )
        prefix = derived_prefix

    if prefix is None or prefix < 0 or prefix > 32:
        raise AppError(PREFIX_TIDAK_VALID, field="prefix")

    mask_int, mask_str = prefix_to_mask(prefix)

    # 3. Hitung NA, Invers Mask, BA
    na_int = ip_int & mask_int
    invers_mask_int = (~mask_int) & 0xFFFFFFFF
    ba_int = na_int | invers_mask_int

    na_str = int_to_ip(na_int)
    invers_mask_str = int_to_ip(invers_mask_int)
    ba_str = int_to_ip(ba_int)

    # 4. Tentukan Kelas IP & Prefix Default
    first_octet = octets[0]
    if first_octet < 128:
        kelas = "A"
        prefix_default_kelas: Optional[int] = 8
    elif first_octet < 192:
        kelas = "B"
        prefix_default_kelas = 16
    elif first_octet < 224:
        kelas = "C"
        prefix_default_kelas = 24
    elif first_octet < 240:
        kelas = "D (Multicast)"
        prefix_default_kelas = None
    else:
        kelas = "E (Eksperimen)"
        prefix_default_kelas = None

    # 5. Jumlah Subnet (2^x)
    x: Optional[int] = None
    jumlah_subnet: Optional[int] = None
    catatan_subnet: Optional[str] = None

    if prefix_default_kelas is not None:
        if prefix >= prefix_default_kelas:
            x = prefix - prefix_default_kelas
            jumlah_subnet = 1 << x
        else:
            catatan_subnet = (
                f"Prefix /{prefix} lebih kecil dari prefix default kelas {kelas} "
                f"(/{prefix_default_kelas}), sehingga perhitungan jumlah subnet tidak berlaku."
            )
    else:
        catatan_subnet = f"Alamat IP kelas {kelas} tidak menggunakan subnetting berbasis kelas."

    # 6. Jumlah Host per Subnet & Rentang Host Valid (2^y - 2)
    y = 32 - prefix
    peringatan: List[str] = []

    if prefix <= 30:
        host_per_subnet = (1 << y) - 2
        host_pertama_str = int_to_ip(na_int + 1)
        host_terakhir_str = int_to_ip(ba_int - 1)
    else:
        # /31 dan /32 tidak digunakan untuk host biasa di modul
        peringatan.append(PREFIX_31_32)
        host_per_subnet = 0
        host_pertama_str = "-"
        host_terakhir_str = "-"

    # 7. Ukuran Blok Subnet
    ukuran_blok = 1 << (32 - prefix)
    if prefix == 0:
        oktet_ke = 1
        lompatan_oktet = 256
        nilai_oktet_mask = 0
    else:
        oktet_ke = ((prefix - 1) // 8) + 1
        mask_octets = [
            (mask_int >> 24) & 255,
            (mask_int >> 16) & 255,
            (mask_int >> 8) & 255,
            mask_int & 255
        ]
        nilai_oktet_mask = mask_octets[oktet_ke - 1]
        lompatan_oktet = 256 - nilai_oktet_mask

    # 8. Daftar Seluruh Subnet (Maksimal 256 baris)
    tabel_subnet: List[Dict[str, Any]] = []
    if prefix_default_kelas is not None and prefix >= prefix_default_kelas and jumlah_subnet is not None:
        induk_mask_int = (0xFFFFFFFF << (32 - prefix_default_kelas)) & 0xFFFFFFFF
        induk_na_int = ip_int & induk_mask_int
        total_subnets = jumlah_subnet
    else:
        induk_na_int = na_int
        total_subnets = 1

    baris_ditampilkan = min(total_subnets, 256)
    for i in range(baris_ditampilkan):
        sub_na_int = induk_na_int + (i * ukuran_blok)
        sub_ba_int = sub_na_int + ukuran_blok - 1
        is_aktif = (sub_na_int <= ip_int <= sub_ba_int)

        if prefix <= 30:
            sub_h_first = int_to_ip(sub_na_int + 1)
            sub_h_last = int_to_ip(sub_ba_int - 1)
        else:
            sub_h_first = "-"
            sub_h_last = "-"

        tabel_subnet.append({
            "no": i + 1,
            "subnet": f"{int_to_ip(sub_na_int)}/{prefix}",
            "na": int_to_ip(sub_na_int),
            "host_pertama": sub_h_first,
            "host_terakhir": sub_h_last,
            "broadcast": int_to_ip(sub_ba_int),
            "aktif": is_aktif,
        })

    return {
        "alamat_ip": ip_str,
        "prefix": prefix,
        "subnet_mask": mask_str,
        "ip_int": ip_int,
        "mask_int": mask_int,
        "na_int": na_int,
        "invers_mask_int": invers_mask_int,
        "ba_int": ba_int,
        "na": na_str,
        "invers_mask": invers_mask_str,
        "ba": ba_str,
        "kelas": kelas,
        "prefix_default_kelas": prefix_default_kelas,
        "x": x,
        "y": y,
        "jumlah_subnet": jumlah_subnet,
        "catatan_subnet": catatan_subnet,
        "host_per_subnet": host_per_subnet,
        "host_pertama": host_pertama_str,
        "host_terakhir": host_terakhir_str,
        "ukuran_blok": ukuran_blok,
        "oktet_ke": oktet_ke,
        "nilai_oktet_mask": nilai_oktet_mask,
        "lompatan_oktet": lompatan_oktet,
        "tabel_subnet": tabel_subnet,
        "total_subnets": total_subnets,
        "ringkasan_tabel": total_subnets > 256,
        "peringatan": peringatan,
    }
