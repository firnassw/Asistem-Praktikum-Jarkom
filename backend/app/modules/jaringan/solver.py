"""
Solver logika hitungan deterministik subnetting satu IP menggunakan Python murni dan bitwise integer.
Tanpa float dan tanpa math.log2.
"""

from typing import Any, Dict, List, Optional, Tuple
from app.core.errors import (
    AppError,
    ALAMAT_BUKAN_BATAS_JARINGAN,
    DEVICE_TIDAK_VALID,
    FLSM_TIDAK_MUNGKIN,
    IP_TIDAK_VALID,
    MELEWATI_INDUK,
    NAMA_DUPLIKAT,
    PERMINTAAN_TIDAK_VALID,
    PREFIX_31_32,
    PREFIX_TIDAK_VALID,
    RUANGAN_TIDAK_VALID,
    VLSM_RUANG_KURANG,
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


def validate_parent_network(alamat_induk: str, prefix_induk: int) -> Tuple[int, int, str]:
    """
    Validasi alamat induk dan prefix induk:
    - Format IPv4 valid tanpa nol di depan.
    - Prefix induk bilangan bulat 0..30.
    - Alamat induk harus merupakan network address (batas jaringan): ip_int & mask_induk == ip_int.
    Mengembalikan (ip_int, mask_induk, mask_induk_str).
    """
    if prefix_induk is None or not isinstance(prefix_induk, int) or prefix_induk < 0 or prefix_induk > 30:
        raise AppError(PREFIX_TIDAK_VALID, field="prefix_induk")

    octets = validate_ipv4_format(alamat_induk, field_name="alamat_induk")
    ip_int = (octets[0] << 24) | (octets[1] << 16) | (octets[2] << 8) | octets[3]
    mask_induk, mask_induk_str = prefix_to_mask(prefix_induk)

    if (ip_int & mask_induk) != ip_int:
        contoh = int_to_ip(ip_int & mask_induk)
        raise AppError(
            ALAMAT_BUKAN_BATAS_JARINGAN,
            field="alamat_induk",
            p=prefix_induk,
            contoh=contoh,
        )

    return ip_int, mask_induk, mask_induk_str


def validate_kebutuhan_list(kebutuhan: List[Any]) -> List[Dict[str, Any]]:
    """
    Validasi daftar kebutuhan ruangan:
    - 1 sampai 20 ruangan.
    - Nama 1..30 karakter setelah di-trim, tidak boleh kosong, dan harus unik (case-insensitive).
    - Host bilangan bulat >= 1.
    """
    if not kebutuhan or len(kebutuhan) == 0 or len(kebutuhan) > 20:
        raise AppError(RUANGAN_TIDAK_VALID, field="kebutuhan")

    cleaned: List[Dict[str, Any]] = []
    seen_names = set()

    for item in kebutuhan:
        if isinstance(item, dict):
            raw_nama = item.get("nama")
            raw_host = item.get("host")
        else:
            raw_nama = getattr(item, "nama", None)
            raw_host = getattr(item, "host", None)

        if raw_nama is None:
            raise AppError(PERMINTAAN_TIDAK_VALID, field="kebutuhan")
        nama = str(raw_nama).strip()
        if len(nama) < 1 or len(nama) > 30:
            raise AppError(PERMINTAAN_TIDAK_VALID, pesan="Nama ruangan harus 1 sampai 30 karakter", field="kebutuhan")

        name_key = nama.lower()
        if name_key in seen_names:
            raise AppError(NAMA_DUPLIKAT, field="kebutuhan", nama=nama)
        seen_names.add(name_key)

        if raw_host is None or not isinstance(raw_host, int) or raw_host < 1:
            raise AppError(DEVICE_TIDAK_VALID, field="kebutuhan", ruangan=nama)

        cleaned.append({"nama": nama, "host": raw_host})

    return cleaned


def hitung_vlsm(
    alamat_induk: str,
    prefix_induk: int,
    kebutuhan: List[Any],
) -> Dict[str, Any]:
    """
    Menghitung alokasi VLSM (Variable Length Subnet Mask):
    1. Validasi alamat induk (harus network boundary untuk prefix_induk 0..30).
    2. Validasi kebutuhan (1..20 item, nama unik 1..30 char, host >= 1).
    3. Urutkan kebutuhan dari host terbesar ke terkecil (pengurutan stabil).
    4. Hitung prefix tiap kebutuhan: prefix = 32 - (host + 1).bit_length() (maksimum /30).
    5. Alokasi blok berurutan mulai dari alamat_induk.
       - Jika muat (cursor + ukuran_blok <= batas_induk): alokasikan subnet.
       - Jika tidak muat: tandai 'Tidak muat' dan tambahkan peringatan VLSM_RUANG_KURANG.
    6. Hitung total kapasitas, terpakai, dan sisa alamat bebas.
    """
    ip_int, mask_induk, mask_induk_str = validate_parent_network(alamat_induk, prefix_induk)
    clean_kebutuhan = validate_kebutuhan_list(kebutuhan)

    # Pengurutan stabil descending berdasarkan host
    sorted_kebutuhan = sorted(clean_kebutuhan, key=lambda k: k["host"], reverse=True)

    kapasitas_induk = 1 << (32 - prefix_induk)
    batas_induk = ip_int + kapasitas_induk
    cursor = ip_int

    tabel: List[Dict[str, Any]] = []
    peringatan: List[str] = []
    total_alamat_dialokasikan = 0
    total_host_diminta = sum(k["host"] for k in sorted_kebutuhan)

    # Warna subnet cycle: biru (#8BD0FC), kuning (#FCE76C), oranye (#FF8F5C), abu-biru (#C9D0E4)
    colors = ["#8BD0FC", "#FCE76C", "#FF8F5C", "#C9D0E4"]

    for idx, item in enumerate(sorted_kebutuhan):
        nama = item["nama"]
        host = item["host"]

        # Hitung prefix: minimal /30
        bit_h = (host + 1).bit_length()
        prefix = 32 - bit_h
        if prefix > 30:
            prefix = 30
            bit_h = 2

        ukuran_blok = 1 << (32 - prefix)
        host_tersedia = ukuran_blok - 2
        _, mask_str = prefix_to_mask(prefix)
        color = colors[idx % len(colors)]

        if cursor + ukuran_blok <= batas_induk:
            na_int = cursor
            ba_int = cursor + ukuran_blok - 1
            host_pertama_int = na_int + 1
            host_terakhir_int = ba_int - 1

            tabel.append({
                "no": idx + 1,
                "nama": nama,
                "host_diminta": host,
                "host_tersedia": host_tersedia,
                "prefix": prefix,
                "subnet_mask": mask_str,
                "subnet": int_to_ip(na_int),
                "host_pertama": int_to_ip(host_pertama_int),
                "host_terakhir": int_to_ip(host_terakhir_int),
                "broadcast": int_to_ip(ba_int),
                "status": "Terpakai",
                "ukuran_blok": ukuran_blok,
                "warna": color,
                "bit_host": bit_h,
            })

            cursor += ukuran_blok
            total_alamat_dialokasikan += ukuran_blok
        else:
            tabel.append({
                "no": idx + 1,
                "nama": nama,
                "host_diminta": host,
                "host_tersedia": host_tersedia,
                "prefix": prefix,
                "subnet_mask": mask_str,
                "subnet": "-",
                "host_pertama": "-",
                "host_terakhir": "-",
                "broadcast": "-",
                "status": "Tidak muat",
                "ukuran_blok": 0,
                "warna": color,
                "bit_host": bit_h,
            })
            if VLSM_RUANG_KURANG not in peringatan:
                peringatan.append(VLSM_RUANG_KURANG)

    sisa_alamat = kapasitas_induk - total_alamat_dialokasikan
    if sisa_alamat < 0:
        sisa_alamat = 0

    sisa_rentang = None
    if sisa_alamat > 0:
        sisa_rentang = {
            "mulai": int_to_ip(cursor),
            "akhir": int_to_ip(batas_induk - 1),
            "jumlah": sisa_alamat,
        }

    return {
        "metode": "vlsm",
        "alamat_induk": alamat_induk,
        "prefix_induk": prefix_induk,
        "mask_induk": mask_induk_str,
        "kapasitas_induk": kapasitas_induk,
        "total_host_diminta": total_host_diminta,
        "total_alamat_dialokasikan": total_alamat_dialokasikan,
        "sisa_alamat": sisa_alamat,
        "sisa_rentang": sisa_rentang,
        "kebutuhan_input": clean_kebutuhan,
        "kebutuhan_terurut": sorted_kebutuhan,
        "tabel": tabel,
        "peringatan": peringatan,
    }


def hitung_flsm(
    alamat_induk: str,
    prefix_induk: int,
    kebutuhan: List[Any],
    gaya_modul: bool = False,
) -> Dict[str, Any]:
    """
    Menghitung alokasi FLSM (Fixed Length Subnet Mask):
    1. Validasi alamat induk (network boundary untuk prefix_induk 0..30).
    2. Validasi kebutuhan (1..20 item, nama unik 1..30 char, host >= 1).
    3. Cari host terbesar: host_terbesar = max(item.host for item in kebutuhan).
    4. Tentukan prefix seragam p = 32 - (host_terbesar + 1).bit_length() (maksimum /30).
    5. Jumlah kebutuhan m = len(kebutuhan).
    6. Bit subnet butuh = (m - 1).bit_length() if m > 1 else 0.
       Saran induk r = p - bit_butuh.
    7. Cek ketersediaan subnet dalam induk:
       - Jika p < prefix_induk: n = 0.
       - Jika p >= prefix_induk: n = 1 << (p - prefix_induk).
    8. Jika n < m:
       - gaya_modul == False: raise AppError(FLSM_TIDAK_MUNGKIN, field="prefix_induk", p=prefix_induk, n=n, q=p, m=m, r=r).
       - gaya_modul == True: alokasikan m subnet berurutan melewati induk, tambahkan peringatan MELEWATI_INDUK.
    9. Jika n >= m:
       - Bangkitkan seluruh n subnet berukuran /p.
       - m subnet pertama untuk kebutuhan input.
       - n - m subnet sisanya berstatus 'Cadangan' (host_diminta = 0).
    """
    ip_int, mask_induk, mask_induk_str = validate_parent_network(alamat_induk, prefix_induk)
    clean_kebutuhan = validate_kebutuhan_list(kebutuhan)

    host_terbesar = max(k["host"] for k in clean_kebutuhan)
    bit_h = (host_terbesar + 1).bit_length()
    p = 32 - bit_h
    if p > 30:
        p = 30
        bit_h = 2

    m = len(clean_kebutuhan)
    bit_butuh = (m - 1).bit_length() if m > 1 else 0
    r = p - bit_butuh

    if p < prefix_induk:
        n = 0
    else:
        n = 1 << (p - prefix_induk)

    peringatan: List[str] = []
    kapasitas_induk = 1 << (32 - prefix_induk)
    ukuran_blok = 1 << (32 - p)
    host_tersedia = ukuran_blok - 2
    _, mask_str = prefix_to_mask(p)

    colors = ["#8BD0FC", "#FCE76C", "#FF8F5C", "#C9D0E4"]

    if n < m:
        if not gaya_modul:
            raise AppError(
                FLSM_TIDAK_MUNGKIN,
                field="prefix_induk",
                p=prefix_induk,
                n=n,
                q=p,
                m=m,
                r=r,
            )
        else:
            peringatan.append(MELEWATI_INDUK)
            total_subnets_to_generate = m
    else:
        total_subnets_to_generate = n

    tabel: List[Dict[str, Any]] = []
    cursor = ip_int
    total_alamat_dialokasikan = 0

    for i in range(total_subnets_to_generate):
        na_int = cursor
        ba_int = cursor + ukuran_blok - 1
        host_pertama_int = na_int + 1
        host_terakhir_int = ba_int - 1

        if i < m:
            item = clean_kebutuhan[i]
            nama = item["nama"]
            host_diminta = item["host"]
            status = "Terpakai"
            color = colors[i % len(colors)]
        else:
            nama = "Cadangan"
            host_diminta = 0
            status = "Cadangan"
            color = "#D6D9E2"

        tabel.append({
            "no": i + 1,
            "nama": nama,
            "host_diminta": host_diminta,
            "host_tersedia": host_tersedia,
            "prefix": p,
            "subnet_mask": mask_str,
            "subnet": int_to_ip(na_int),
            "host_pertama": int_to_ip(host_pertama_int),
            "host_terakhir": int_to_ip(host_terakhir_int),
            "broadcast": int_to_ip(ba_int),
            "status": status,
            "ukuran_blok": ukuran_blok,
            "warna": color,
            "bit_host": bit_h,
        })

        cursor += ukuran_blok
        total_alamat_dialokasikan += ukuran_blok

    sisa_alamat = kapasitas_induk - total_alamat_dialokasikan
    if sisa_alamat < 0:
        sisa_alamat = 0

    return {
        "metode": "flsm",
        "alamat_induk": alamat_induk,
        "prefix_induk": prefix_induk,
        "mask_induk": mask_induk_str,
        "kapasitas_induk": kapasitas_induk,
        "host_terbesar": host_terbesar,
        "prefix_seragam": p,
        "subnet_mask_seragam": mask_str,
        "ukuran_blok": ukuran_blok,
        "host_tersedia": host_tersedia,
        "bit_host": bit_h,
        "bit_butuh": bit_butuh,
        "m": m,
        "n": n,
        "r": r,
        "gaya_modul": gaya_modul,
        "total_alamat_dialokasikan": total_alamat_dialokasikan,
        "sisa_alamat": sisa_alamat,
        "kebutuhan_input": clean_kebutuhan,
        "tabel": tabel,
        "peringatan": peringatan,
    }

