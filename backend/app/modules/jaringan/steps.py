"""
Penyusun langkah-langkah penyelesaian subnetting sesuai urutan Modul 2 praktikum.
Menghasilkan struktur jawaban seragam (StrukturJawaban).
"""

from typing import Any, Dict
from app.core.schemas import DiketahuiItem, LangkahItem, StrukturJawaban
from app.modules.jaringan.solver import int_to_bin


def susun_langkah_subnet(data: Dict[str, Any]) -> StrukturJawaban:
    """
    Menyusun langkah penyelesaian subnetting sesuai lembar jawaban praktikum Modul 2:
    1. Biner IP dan Mask (dengan pemisahan bit jaringan dan bit host).
    2. Network Address (NA = IP AND mask).
    3. Invers Subnet Mask (NOT mask).
    4. Broadcast Address (BA = NA OR invers mask).
    5. Karakteristik subnet (jumlah subnet, host valid, blok subnet).
    """
    ip_str = data["alamat_ip"]
    prefix = data["prefix"]
    mask_str = data["subnet_mask"]
    kelas = data["kelas"]
    na_str = data["na"]
    invers_mask_str = data["invers_mask"]
    ba_str = data["ba"]
    ip_int = data["ip_int"]
    mask_int = data["mask_int"]
    na_int = data["na_int"]
    invers_mask_int = data["invers_mask_int"]
    ba_int = data["ba_int"]
    x = data["x"]
    y = data["y"]
    jumlah_subnet = data["jumlah_subnet"]
    catatan_subnet = data["catatan_subnet"]
    host_per_subnet = data["host_per_subnet"]
    host_pertama = data["host_pertama"]
    host_terakhir = data["host_terakhir"]
    lompatan_oktet = data["lompatan_oktet"]
    nilai_oktet_mask = data["nilai_oktet_mask"]
    oktet_ke = data["oktet_ke"]
    tabel_subnet = data["tabel_subnet"]
    peringatan = data["peringatan"]

    # 1. Diketahui
    diketahui = [
        DiketahuiItem(label="Alamat IP", nilai=ip_str),
        DiketahuiItem(label="Subnet Mask", nilai=f"{mask_str} (/{prefix})"),
        DiketahuiItem(label="Kelas Alamat", nilai=f"Kelas {kelas}"),
    ]

    # 2. Langkah 1: Ubah IP dan mask ke bentuk biner
    langkah1 = LangkahItem(
        judul="Ubah IP dan subnet mask ke bentuk biner",
        penjelasan=(
            f"Konversikan setiap oktet alamat IP dan subnet mask ke format 8-bit biner. "
            f"Bit ke-1 sampai {prefix} adalah alokasi bit jaringan (Network ID), dan "
            f"{32 - prefix} bit terakhir adalah alokasi bit host (Host ID)."
        ),
        rumus=None,
        tabel={
            "tipe": "biner_dua_warna",
            "ip_biner": int_to_bin(ip_int),
            "mask_biner": int_to_bin(mask_int),
            "prefix": prefix,
            "bit_host": 32 - prefix,
            "ip_desimal": ip_str,
            "mask_desimal": mask_str,
        },
        hasil=f"IP: {ip_str} | Subnet Mask: {mask_str}",
    )

    # 3. Langkah 2: Hitung NA (IP AND mask)
    langkah2 = LangkahItem(
        judul="Hitung Network Address: NA = IP AND subnet mask",
        penjelasan=(
            "Lakukan operasi logika Boolean AND antara alamat IP dan subnet mask. "
            "Hasil bit bernilai 1 hanya bila kedua bit bernilai 1."
        ),
        rumus="NA = IP AND subnet mask",
        tabel={
            "tipe": "operasi_biner",
            "operasi": "AND",
            "op1": int_to_bin(ip_int),
            "op1_label": f"IP   ({ip_str})",
            "op2": int_to_bin(mask_int),
            "op2_label": f"Mask ({mask_str})",
            "hasil_biner": int_to_bin(na_int),
            "hasil_label": f"NA   ({na_str})",
        },
        hasil=f"Network Address (NA) = {na_str}",
    )

    # 4. Langkah 3: Tentukan Invers Mask (NOT mask)
    langkah3 = LangkahItem(
        judul="Tentukan invers subnet mask (wildcard mask)",
        penjelasan=(
            "Balikkan seluruh bit pada subnet mask (operasi logika NOT: bit 1 menjadi 0, "
            "dan bit 0 menjadi 1) untuk menentukan ukuran blok subnet dan rentang broadcast."
        ),
        rumus="Invers Mask = NOT subnet mask",
        tabel={
            "tipe": "operasi_biner",
            "operasi": "NOT",
            "op1": int_to_bin(mask_int),
            "op1_label": f"Mask   ({mask_str})",
            "hasil_biner": int_to_bin(invers_mask_int),
            "hasil_label": f"Invers ({invers_mask_str})",
        },
        hasil=f"Invers Subnet Mask = {invers_mask_str}",
    )

    # 5. Langkah 4: Hitung BA (NA OR invers mask)
    langkah4 = LangkahItem(
        judul="Hitung Broadcast Address: BA = NA OR invers mask",
        penjelasan=(
            "Lakukan operasi logika Boolean OR antara Network Address dan invers subnet mask. "
            "Hasil bit bernilai 1 jika salah satu atau kedua bit bernilai 1."
        ),
        rumus="BA = NA OR invers mask",
        tabel={
            "tipe": "operasi_biner",
            "operasi": "OR",
            "op1": int_to_bin(na_int),
            "op1_label": f"NA     ({na_str})",
            "op2": int_to_bin(invers_mask_int),
            "op2_label": f"Invers ({invers_mask_str})",
            "hasil_biner": int_to_bin(ba_int),
            "hasil_label": f"BA     ({ba_str})",
        },
        hasil=f"Broadcast Address (BA) = {ba_str}",
    )

    # 6. Langkah 5: Jumlah Subnet, Host, dan Blok
    rumus_karakteristik = (
        f"Subnet = 2^{x} = {jumlah_subnet} | " if x is not None else ""
    ) + f"Host = 2^{y} - 2 = {host_per_subnet} | Blok = 256 - {nilai_oktet_mask} = {lompatan_oktet}"

    langkah5 = LangkahItem(
        judul="Hitung jumlah subnet, host per subnet, dan blok subnet",
        penjelasan=(
            "Gunakan rumus berbasis bit untuk menghitung segmentasi dan kapasitas host: "
            "jumlah subnet (2^x), jumlah host valid (2^y - 2), serta ukuran blok lompatan oktet."
        ),
        rumus=rumus_karakteristik,
        tabel={
            "tipe": "karakteristik",
            "x": x,
            "y": y,
            "oktet_ke": oktet_ke,
            "nilai_oktet_mask": nilai_oktet_mask,
            "jumlah_subnet": jumlah_subnet,
            "host_per_subnet": host_per_subnet,
            "blok_subnet": lompatan_oktet,
            "catatan": catatan_subnet,
        },
        hasil=(
            f"Subnet: {jumlah_subnet if jumlah_subnet is not None else 'N/A'} | "
            f"Host valid: {host_per_subnet} | Blok: {lompatan_oktet}"
        ),
    )

    langkah_list = [langkah1, langkah2, langkah3, langkah4, langkah5]

    # 7. Hasil Akhir
    hasil_akhir = {
        "ringkasan": {
            "alamat_ip": ip_str,
            "prefix": prefix,
            "subnet_mask": mask_str,
            "na": na_str,
            "ba": ba_str,
            "host_pertama": host_pertama,
            "host_terakhir": host_terakhir,
            "host_per_subnet": host_per_subnet,
            "jumlah_subnet": jumlah_subnet,
            "blok_subnet": lompatan_oktet,
            "kelas": kelas,
        },
        "tabel": tabel_subnet,
        "total_subnets": data["total_subnets"],
        "ringkasan_tabel": data["ringkasan_tabel"],
    }

    # 8. Kesimpulan Utuh Bahasa Indonesia
    kesimpulan_parts = [
        f"Alamat IP {ip_str} dengan prefix /{prefix} (subnet mask {mask_str}) "
        f"memiliki Network Address {na_str} dan Broadcast Address {ba_str}."
    ]
    if host_per_subnet > 0:
        kesimpulan_parts.append(
            f"Rentang alamat host valid adalah {host_pertama} hingga {host_terakhir} "
            f"dengan kapasitas {host_per_subnet} host per subnet."
        )
    else:
        kesimpulan_parts.append(
            f"Prefix /{prefix} tidak menyediakan rentang alamat host valid untuk perangkat klien."
        )

    if jumlah_subnet is not None:
        kesimpulan_parts.append(
            f"Terbentuk {jumlah_subnet} subnet dengan ukuran blok {lompatan_oktet} alamat."
        )

    kesimpulan = " ".join(kesimpulan_parts)

    return StrukturJawaban(
        fitur="subnet",
        diketahui=diketahui,
        langkah=langkah_list,
        hasil_akhir=hasil_akhir,
        kesimpulan=kesimpulan,
        peringatan=peringatan,
    )
