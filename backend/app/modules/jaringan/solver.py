"""
Solver logika hitungan deterministik subnetting satu IP menggunakan Python murni dan bitwise integer.
Tanpa float dan tanpa math.log2.
"""

from typing import Any, Dict, List, Optional, Tuple, Union
from app.core.errors import (
    AppError,
    ALAMAT_BUKAN_BATAS_JARINGAN,
    BASIS_TIDAK_VALID,
    BATAS_UKURAN_LEWAT,
    CADANGAN_TIDAK_VALID,
    DEVICE_TIDAK_VALID,
    DHCP_EXCLUDED_TIDAK_VALID,
    DIGIT_TIDAK_VALID,
    FLSM_TIDAK_MUNGKIN,
    GATEWAY_MEMBEDAKAN_HASIL,
    IP_TIDAK_VALID,
    MELEWATI_INDUK,
    NAMA_DUPLIKAT,
    NIM_TIDAK_VALID,
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


def validate_nim_dua_digit(nim_dua_digit: Any) -> Tuple[str, int]:
    """
    Validasi dua digit terakhir NIM:
    - Harus 2 digit angka '00' sampai '99'
    - String atau integer 2 digit (misal '50', '05', '00')
    - Jika diisi bukan 2 digit angka '00'..'99' (mis. '5', '123', 'ab'), tolak dengan NIM_TIDAK_VALID
    - Mengembalikan tuple (nim_str, xx_int).
    """
    if nim_dua_digit is None:
        raise AppError(NIM_TIDAK_VALID, field="nim_dua_digit", pesan="Isi dua digit terakhir NIM, misalnya 50")

    s = str(nim_dua_digit).strip()
    if len(s) != 2 or not s.isdigit():
        raise AppError(NIM_TIDAK_VALID, field="nim_dua_digit", pesan="Isi dua digit terakhir NIM, misalnya 50")

    xx = int(s)
    return s, xx


def validate_ruangan_rencana(
    ruangan: List[Any],
    cadangan_persen: int,
) -> List[Dict[str, Any]]:
    """
    Validasi daftar ruangan untuk fitur rencana:
    - 1 sampai 20 ruangan (di luar itu: RUANGAN_TIDAK_VALID).
    - nama: 1..30 karakter setelah di-trim, unik (case-insensitive) (kembar: NAMA_DUPLIKAT).
    - device: bilangan bulat >= 1 (< 1: DEVICE_TIDAK_VALID).
    - Hitung cadangan integer ceiling: (device * cadangan_persen + 99) // 100
    """
    if not ruangan or len(ruangan) == 0 or len(ruangan) > 20:
        raise AppError(RUANGAN_TIDAK_VALID, field="ruangan", pesan="Jumlah ruangan harus 1 sampai 20")

    cleaned: List[Dict[str, Any]] = []
    seen_names = set()

    for item in ruangan:
        if isinstance(item, dict):
            raw_nama = item.get("nama")
            raw_device = item.get("device")
        else:
            raw_nama = getattr(item, "nama", None)
            raw_device = getattr(item, "device", None)

        if raw_nama is None:
            raise AppError(RUANGAN_TIDAK_VALID, field="ruangan", pesan="Nama ruangan harus 1 sampai 30 karakter")
        nama = str(raw_nama).strip()
        if len(nama) < 1 or len(nama) > 30:
            raise AppError(RUANGAN_TIDAK_VALID, field="ruangan", pesan="Nama ruangan harus 1 sampai 30 karakter")

        name_key = nama.lower()
        if name_key in seen_names:
            raise AppError(NAMA_DUPLIKAT, field="ruangan", nama=nama, pesan=f"Nama {nama} dipakai dua kali. Beri nama yang berbeda")
        seen_names.add(name_key)

        if raw_device is None or not isinstance(raw_device, int) or raw_device < 1:
            raise AppError(DEVICE_TIDAK_VALID, field="ruangan", ruangan=nama, pesan=f"Jumlah device {nama} harus bilangan bulat 1 atau lebih")

        cadangan_host = (raw_device * cadangan_persen + 99) // 100

        cleaned.append({
            "nama": nama,
            "device": raw_device,
            "cadangan_host": cadangan_host,
        })

    return cleaned


def _alokasikan_rencana_skenario(
    ip_int: int,
    prefix_induk: int,
    clean_ruangan: List[Dict[str, Any]],
    gateway: bool,
    mode: str,
    gaya_modul: bool = False,
) -> Dict[str, Any]:
    """
    Menghitung alokasi rencana untuk satu skenario konfigurasi (gateway dan mode tertentu).
    Menggunakan operasi bilangan bulat dan bitwise murni.
    """
    kapasitas_induk = 1 << (32 - prefix_induk)
    batas_induk = ip_int + kapasitas_induk
    cursor = ip_int
    total_dialokasikan = 0
    tabel: List[Dict[str, Any]] = []
    peringatan: List[str] = []
    colors = ["#8BD0FC", "#FCE76C", "#FF8F5C", "#C9D0E4"]

    ruangan_skenario: List[Dict[str, Any]] = []
    for r in clean_ruangan:
        gw_add = 1 if gateway else 0
        h_req = r["device"] + r["cadangan_host"] + gw_add
        ruangan_skenario.append({
            **r,
            "gateway_aktif": gateway,
            "tambahan_gateway": gw_add,
            "host_dibutuhkan": h_req,
        })

    if mode == "vlsm":
        # Pengurutan stabil descending berdasarkan host_dibutuhkan
        sorted_ruangan = sorted(ruangan_skenario, key=lambda x: x["host_dibutuhkan"], reverse=True)

        for idx, r in enumerate(sorted_ruangan):
            bit_h = (r["host_dibutuhkan"] + 1).bit_length()
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
                usulan_gw = int_to_ip(host_pertama_int) if gateway else None

                tabel.append({
                    "no": idx + 1,
                    "nama": r["nama"],
                    "device": r["device"],
                    "cadangan_host": r["cadangan_host"],
                    "host_dibutuhkan": r["host_dibutuhkan"],
                    "host_tersedia": host_tersedia,
                    "prefix": prefix,
                    "subnet_mask": mask_str,
                    "subnet": int_to_ip(na_int),
                    "host_pertama": int_to_ip(host_pertama_int),
                    "host_terakhir": int_to_ip(host_terakhir_int),
                    "usulan_gateway": usulan_gw,
                    "broadcast": int_to_ip(ba_int),
                    "status": "Terpakai",
                    "ukuran_blok": ukuran_blok,
                    "warna": color,
                    "bit_host": bit_h,
                })
                cursor += ukuran_blok
                total_dialokasikan += ukuran_blok
            else:
                tabel.append({
                    "no": idx + 1,
                    "nama": r["nama"],
                    "device": r["device"],
                    "cadangan_host": r["cadangan_host"],
                    "host_dibutuhkan": r["host_dibutuhkan"],
                    "host_tersedia": host_tersedia,
                    "prefix": prefix,
                    "subnet_mask": mask_str,
                    "subnet": "-",
                    "host_pertama": "-",
                    "host_terakhir": "-",
                    "usulan_gateway": None,
                    "broadcast": "-",
                    "status": "Tidak muat",
                    "ukuran_blok": 0,
                    "warna": color,
                    "bit_host": bit_h,
                })
                if VLSM_RUANG_KURANG not in peringatan:
                    peringatan.append(VLSM_RUANG_KURANG)

    elif mode == "flsm":
        host_terbesar = max(r["host_dibutuhkan"] for r in ruangan_skenario)
        bit_h = (host_terbesar + 1).bit_length()
        p = 32 - bit_h
        if p > 30:
            p = 30
            bit_h = 2

        ukuran_blok = 1 << (32 - p)
        host_tersedia = ukuran_blok - 2
        _, mask_str = prefix_to_mask(p)
        m = len(ruangan_skenario)
        bit_butuh = (m - 1).bit_length() if m > 1 else 0
        r_saran = p - bit_butuh
        n = 0 if p < prefix_induk else 1 << (p - prefix_induk)

        if n < m:
            if not gaya_modul:
                raise AppError(
                    FLSM_TIDAK_MUNGKIN,
                    field="prefix_induk",
                    p=prefix_induk,
                    n=n,
                    q=p,
                    m=m,
                    r=r_saran,
                )
            else:
                peringatan.append(MELEWATI_INDUK)
                total_subnets = m
        else:
            total_subnets = n

        for i in range(total_subnets):
            na_int = cursor
            ba_int = cursor + ukuran_blok - 1
            host_pertama_int = na_int + 1
            host_terakhir_int = ba_int - 1

            if i < m:
                r = ruangan_skenario[i]
                usulan_gw = int_to_ip(host_pertama_int) if gateway else None
                tabel.append({
                    "no": i + 1,
                    "nama": r["nama"],
                    "device": r["device"],
                    "cadangan_host": r["cadangan_host"],
                    "host_dibutuhkan": r["host_dibutuhkan"],
                    "host_tersedia": host_tersedia,
                    "prefix": p,
                    "subnet_mask": mask_str,
                    "subnet": int_to_ip(na_int),
                    "host_pertama": int_to_ip(host_pertama_int),
                    "host_terakhir": int_to_ip(host_terakhir_int),
                    "usulan_gateway": usulan_gw,
                    "broadcast": int_to_ip(ba_int),
                    "status": "Terpakai",
                    "ukuran_blok": ukuran_blok,
                    "warna": colors[i % len(colors)],
                    "bit_host": bit_h,
                })
            else:
                tabel.append({
                    "no": i + 1,
                    "nama": "Cadangan",
                    "device": 0,
                    "cadangan_host": 0,
                    "host_dibutuhkan": 0,
                    "host_tersedia": host_tersedia,
                    "prefix": p,
                    "subnet_mask": mask_str,
                    "subnet": int_to_ip(na_int),
                    "host_pertama": int_to_ip(host_pertama_int),
                    "host_terakhir": int_to_ip(host_terakhir_int),
                    "usulan_gateway": None,
                    "broadcast": int_to_ip(ba_int),
                    "status": "Cadangan",
                    "ukuran_blok": ukuran_blok,
                    "warna": "#D6D9E2",
                    "bit_host": bit_h,
                })
            cursor += ukuran_blok
            total_dialokasikan += ukuran_blok

    sisa_alamat = kapasitas_induk - total_dialokasikan
    if sisa_alamat < 0:
        sisa_alamat = 0

    sisa_rentang = None
    if sisa_alamat > 0:
        sisa_rentang = {
            "mulai": int_to_ip(cursor),
            "akhir": int_to_ip(ip_int + kapasitas_induk - 1),
            "jumlah": sisa_alamat,
        }

    ruangan_terakomodasi = sum(1 for row in tabel if row["status"] == "Terpakai")
    persen_terpakai = (total_dialokasikan * 100) // kapasitas_induk if kapasitas_induk else 0

    return {
        "mode": mode,
        "gateway": gateway,
        "total_ruangan": len(clean_ruangan),
        "ruangan_terakomodasi": ruangan_terakomodasi,
        "kapasitas_induk": kapasitas_induk,
        "total_alamat_dialokasikan": total_dialokasikan,
        "sisa_alamat": sisa_alamat,
        "persen_terpakai": persen_terpakai,
        "sisa_rentang": sisa_rentang,
        "ruangan_skenario": ruangan_skenario,
        "tabel": tabel,
        "peringatan": peringatan,
    }


def hitung_rencana(
    nim_dua_digit: Optional[Union[str, int]] = None,
    alamat_induk: Optional[str] = None,
    prefix_induk: Optional[int] = None,
    ruangan: List[Any] = None,
    gateway: bool = False,
    cadangan_persen: int = 0,
    mode: str = "vlsm",
    gaya_modul: bool = False,
) -> Dict[str, Any]:
    """
    Menghitung rencana alokasi subnet dari ruangan dan jumlah device:
    - Mendukung sumber jaringan induk dari dua digit NIM (192.168.XX.0/24) atau alamat_induk manual.
    - Menghitung cadangan integer ceiling: (device * cadangan_persen + 99) // 100.
    - Menghitung gateway (+1 host per ruangan, usulan host pertama) jika aktif.
    - Mendeteksi perbedaan prefix jika gateway dihitung (GATEWAY_MEMBEDAKAN_HASIL).
    - Menyediakan perbandingan tab 'Tanpa gateway' | 'Dengan gateway' dan 'VLSM' | 'FLSM'.
    """
    nim_str = None
    if nim_dua_digit is not None and str(nim_dua_digit).strip() != "":
        nim_str, xx = validate_nim_dua_digit(nim_dua_digit)
        alamat_induk = f"192.168.{xx}.0"
        if prefix_induk is None:
            prefix_induk = 24
        sumber = "nim"
    elif alamat_induk and str(alamat_induk).strip() != "":
        sumber = "manual"
        if prefix_induk is None:
            prefix_induk = 24
    else:
        raise AppError(NIM_TIDAK_VALID, field="nim_dua_digit", pesan="Isi dua digit terakhir NIM, misalnya 50")

    ip_int, mask_induk, mask_induk_str = validate_parent_network(alamat_induk, prefix_induk)

    if cadangan_persen is None or not isinstance(cadangan_persen, int) or cadangan_persen < 0 or cadangan_persen > 100:
        raise AppError(CADANGAN_TIDAK_VALID, field="cadangan_persen", pesan="Cadangan harus angka 0 sampai 100 (persen)")

    clean_ruangan = validate_ruangan_rencana(ruangan, cadangan_persen)

    mode_norm = (mode or "vlsm").lower()
    if mode_norm not in ("vlsm", "flsm"):
        mode_norm = "vlsm"

    # Simulasi perhitungan tanpa gateway dan dengan gateway untuk deteksi GATEWAY_MEMBEDAKAN_HASIL
    res_tanpa = _alokasikan_rencana_skenario(
        ip_int=ip_int,
        prefix_induk=prefix_induk,
        clean_ruangan=clean_ruangan,
        gateway=False,
        mode=mode_norm,
        gaya_modul=gaya_modul,
    )

    res_dengan = _alokasikan_rencana_skenario(
        ip_int=ip_int,
        prefix_induk=prefix_induk,
        clean_ruangan=clean_ruangan,
        gateway=True,
        mode=mode_norm,
        gaya_modul=gaya_modul,
    )

    dict_tanpa = {r["nama"]: r for r in res_tanpa["tabel"] if r["status"] != "Cadangan"}
    dict_dengan = {r["nama"]: r for r in res_dengan["tabel"] if r["status"] != "Cadangan"}

    ruangan_berubah = []
    for r in clean_ruangan:
        nama = r["nama"]
        row_t = dict_tanpa.get(nama)
        row_d = dict_dengan.get(nama)
        if row_t and row_d and row_t["prefix"] != row_d["prefix"]:
            ruangan_berubah.append({
                "nama": nama,
                "device": r["device"],
                "cadangan_host": r["cadangan_host"],
                "host_tanpa": row_t["host_dibutuhkan"],
                "prefix_tanpa": row_t["prefix"],
                "host_tersedia_tanpa": row_t["host_tersedia"],
                "host_dengan": row_d["host_dibutuhkan"],
                "prefix_dengan": row_d["prefix"],
                "host_tersedia_dengan": row_d["host_tersedia"],
            })

    # Hasil utama sesuai pilihan gateway pengguna
    primary = res_dengan if gateway else res_tanpa
    peringatan_list = list(primary["peringatan"])

    if len(ruangan_berubah) > 0:
        if GATEWAY_MEMBEDAKAN_HASIL not in peringatan_list:
            peringatan_list.append(GATEWAY_MEMBEDAKAN_HASIL)
        if GATEWAY_MEMBEDAKAN_HASIL not in res_tanpa["peringatan"]:
            res_tanpa["peringatan"].append(GATEWAY_MEMBEDAKAN_HASIL)
        if GATEWAY_MEMBEDAKAN_HASIL not in res_dengan["peringatan"]:
            res_dengan["peringatan"].append(GATEWAY_MEMBEDAKAN_HASIL)

    # Perbandingan VLSM dan FLSM
    res_vlsm = _alokasikan_rencana_skenario(
        ip_int=ip_int,
        prefix_induk=prefix_induk,
        clean_ruangan=clean_ruangan,
        gateway=gateway,
        mode="vlsm",
        gaya_modul=gaya_modul,
    )

    try:
        res_flsm = _alokasikan_rencana_skenario(
            ip_int=ip_int,
            prefix_induk=prefix_induk,
            clean_ruangan=clean_ruangan,
            gateway=gateway,
            mode="flsm",
            gaya_modul=False,
        )
    except AppError as err:
        if err.kode == FLSM_TIDAK_MUNGKIN:
            res_flsm = {
                "status": FLSM_TIDAK_MUNGKIN,
                "pesan": err.pesan,
                "prefix_saran": err.extra.get("prefix_saran"),
                "tabel": [],
                "peringatan": [FLSM_TIDAK_MUNGKIN],
            }
        else:
            raise

    # Jika mode yang diminta adalah FLSM dan gagal (gaya_modul False), raise error utamanya
    if mode_norm == "flsm" and isinstance(res_flsm, dict) and res_flsm.get("status") == FLSM_TIDAK_MUNGKIN and not gaya_modul:
        _alokasikan_rencana_skenario(
            ip_int=ip_int,
            prefix_induk=prefix_induk,
            clean_ruangan=clean_ruangan,
            gateway=gateway,
            mode="flsm",
            gaya_modul=False,
        )

    return {
        "fitur": "rencana",
        "sumber": sumber,
        "nim_str": nim_str,
        "alamat_induk": alamat_induk,
        "prefix_induk": prefix_induk,
        "mask_induk": mask_induk_str,
        "kapasitas_induk": primary["kapasitas_induk"],
        "gateway": gateway,
        "cadangan_persen": cadangan_persen,
        "mode": mode_norm,
        "gaya_modul": gaya_modul,
        "clean_ruangan": clean_ruangan,
        "ruangan_skenario": primary["ruangan_skenario"],
        "tabel": primary["tabel"],
        "ringkasan": {
            "metode": mode_norm.upper(),
            "total_ruangan": len(clean_ruangan),
            "ruangan_terakomodasi": primary["ruangan_terakomodasi"],
            "kapasitas_induk": primary["kapasitas_induk"],
            "total_alamat_dialokasikan": primary["total_alamat_dialokasikan"],
            "sisa_alamat": primary["sisa_alamat"],
            "persen_terpakai": primary["persen_terpakai"],
            "sisa_rentang": primary["sisa_rentang"],
            "gateway_aktif": gateway,
            "cadangan_persen": cadangan_persen,
        },
        "perbandingan_gateway": {
            "tanpa_gateway": res_tanpa,
            "dengan_gateway": res_dengan,
            "ruangan_berubah": ruangan_berubah,
        },
        "perbandingan_mode": {
            "vlsm": res_vlsm,
            "flsm": res_flsm,
        },
        "peringatan": peringatan_list,
    }


def hitung_dhcp(
    alamat_router: str,
    prefix: int,
    interface: Optional[str] = "fastEthernet0/0",
    nama_pool: Optional[str] = "dhcp_server",
    excluded_awal: str = "",
    excluded_akhir: str = "",
) -> Dict[str, Any]:
    """
    Menghitung parameter DHCP Server Cisco Packet Tracer:
    - Menentukan NA, BA, Subnet Mask dari IP Router & Prefix
    - Memvalidasi IP Router adalah alamat host valid (bukan NA / BA)
    - Memvalidasi rentang excluded address berada dalam subnet dan menyisakan host
    - Menghitung prediksi IP klien pertama: excluded_akhir + 1
    - Menyusun 10 baris perintah CLI Cisco IOS beserta penjelasannya
    """
    # 1. Validasi IP Router
    router_octets = validate_ipv4_format(alamat_router, field_name="alamat_router")
    router_int = (router_octets[0] << 24) | (router_octets[1] << 16) | (router_octets[2] << 8) | router_octets[3]
    router_str = int_to_ip(router_int)

    # 2. Validasi Prefix (0..30)
    if prefix is None or not isinstance(prefix, int) or prefix < 0 or prefix > 30:
        raise AppError(PREFIX_TIDAK_VALID, field="prefix")

    mask_int, subnet_mask = prefix_to_mask(prefix)
    na_int = router_int & mask_int
    invers_mask_int = (~mask_int) & 0xFFFFFFFF
    ba_int = na_int | invers_mask_int

    network_address = int_to_ip(na_int)
    broadcast_address = int_to_ip(ba_int)
    net_str = f"{network_address}/{prefix}"

    # Pastikan alamat_router adalah host valid dalam jaringan (bukan NA atau BA)
    if router_int <= na_int or router_int >= ba_int:
        raise AppError(
            IP_TIDAK_VALID,
            pesan="Alamat IP router tidak boleh berupa Network Address atau Broadcast Address",
            field="alamat_router",
        )

    # 3. Default interface dan nama_pool jika kosong
    clean_interface = (
        interface.strip()
        if (interface and isinstance(interface, str) and interface.strip())
        else "fastEthernet0/0"
    )
    clean_nama_pool = (
        nama_pool.strip()
        if (nama_pool and isinstance(nama_pool, str) and nama_pool.strip())
        else "dhcp_server"
    )

    # 4. Validasi Format Excluded Awal & Akhir
    excl_awal_octets = validate_ipv4_format(excluded_awal, field_name="excluded_awal")
    excl_awal_int = (
        (excl_awal_octets[0] << 24)
        | (excl_awal_octets[1] << 16)
        | (excl_awal_octets[2] << 8)
        | excl_awal_octets[3]
    )
    excl_awal_str = int_to_ip(excl_awal_int)

    excl_akhir_octets = validate_ipv4_format(excluded_akhir, field_name="excluded_akhir")
    excl_akhir_int = (
        (excl_akhir_octets[0] << 24)
        | (excl_akhir_octets[1] << 16)
        | (excl_akhir_octets[2] << 8)
        | excl_akhir_octets[3]
    )
    excl_akhir_str = int_to_ip(excl_akhir_int)

    # 5. Validasi Rentang Excluded (DHCP_EXCLUDED_TIDAK_VALID)
    # - excl_awal_int dan excl_akhir_int harus berada dalam rentang host valid (na_int < excl_awal_int <= excl_akhir_int < ba_int)
    # - excl_awal_int <= excl_akhir_int
    # - Harus menyisakan minimal satu host untuk klien: klien_pertama = excl_akhir_int + 1 <= ba_int - 1 (sehingga excl_akhir_int < ba_int - 1)
    if excl_awal_int <= na_int or excl_awal_int >= ba_int:
        raise AppError(DHCP_EXCLUDED_TIDAK_VALID, field="excluded_awal", n=net_str)
    if excl_akhir_int <= na_int or excl_akhir_int >= ba_int:
        raise AppError(DHCP_EXCLUDED_TIDAK_VALID, field="excluded_akhir", n=net_str)
    if excl_awal_int > excl_akhir_int:
        raise AppError(DHCP_EXCLUDED_TIDAK_VALID, field="excluded_akhir", n=net_str)
    if excl_akhir_int >= ba_int - 1:
        raise AppError(DHCP_EXCLUDED_TIDAK_VALID, field="excluded_akhir", n=net_str)

    # 6. Perhitungan Host dan Prediksi Klien Pertama
    host_pertama = int_to_ip(na_int + 1)
    host_terakhir = int_to_ip(ba_int - 1)

    klien_pertama_int = excl_akhir_int + 1
    klien_pertama = int_to_ip(klien_pertama_int)
    rentang_dinamis = f"{klien_pertama} - {host_terakhir}"
    jumlah_klien_dinamis = (ba_int - 1) - klien_pertama_int + 1

    # 7. Susun 10 Perintah CLI Cisco IOS
    cli_baris = [
        {"perintah": "enable", "penjelasan": "Masuk ke Privileged EXEC mode"},
        {"perintah": "configure terminal", "penjelasan": "Masuk ke Global Configuration mode"},
        {
            "perintah": f"interface {clean_interface}",
            "penjelasan": "Pilih interface router yang terhubung ke jaringan lokal",
        },
        {
            "perintah": f"ip address {router_str} {subnet_mask}",
            "penjelasan": "Pasang alamat IP router dan subnet mask pada interface",
        },
        {"perintah": "no shutdown", "penjelasan": "Aktifkan interface agar berstatus menyala (up)"},
        {
            "perintah": f"ip dhcp pool {clean_nama_pool}",
            "penjelasan": "Buat dan beri nama DHCP pool pada router",
        },
        {
            "perintah": f"default-router {router_str}",
            "penjelasan": "Tentukan alamat default gateway untuk klien DHCP",
        },
        {
            "perintah": f"network {network_address} {subnet_mask}",
            "penjelasan": "Tentukan alamat jaringan dan subnet mask yang dibagikan",
        },
        {"perintah": "exit", "penjelasan": "Keluar dari mode konfigurasi DHCP pool"},
        {
            "perintah": f"ip dhcp excluded-address {excl_awal_str} {excl_akhir_str}",
            "penjelasan": "Kecualikan rentang alamat IP agar tidak dibagikan ke klien",
        },
    ]
    cli_script = "\n".join(b["perintah"] for b in cli_baris)

    return {
        "fitur": "dhcp",
        "alamat_router": router_str,
        "prefix": prefix,
        "subnet_mask": subnet_mask,
        "network_address": network_address,
        "broadcast_address": broadcast_address,
        "host_pertama": host_pertama,
        "host_terakhir": host_terakhir,
        "interface": clean_interface,
        "nama_pool": clean_nama_pool,
        "excluded_awal": excl_awal_str,
        "excluded_akhir": excl_akhir_str,
        "klien_pertama": klien_pertama,
        "rentang_dinamis": rentang_dinamis,
        "jumlah_klien_dinamis": jumlah_klien_dinamis,
        "cli_baris": cli_baris,
        "cli_script": cli_script,
        "peringatan": [],
    }


def _buat_tabel_bit_8(val: int) -> Tuple[List[Dict[str, Any]], List[int], str]:
    """Menghasilkan tabel posisi bit 8-bit (128 sampai 1) untuk nilai integer 0..255."""
    target_val = val & 255 if val > 255 else val
    tabel_bit: List[Dict[str, Any]] = []
    bobot_aktif: List[int] = []
    weights = [128, 64, 32, 16, 8, 4, 2, 1]

    for i, w in enumerate(weights):
        bit_val = 1 if (target_val & w) else 0
        aktif = bool(bit_val == 1)
        if aktif:
            bobot_aktif.append(w)
        tabel_bit.append({
            "pangkat": f"2^{7 - i}",
            "bobot": w,
            "bit": bit_val,
            "aktif": aktif,
            "nilai": w if aktif else 0,
        })

    if bobot_aktif:
        rumus_penjumlahan = " + ".join(str(w) for w in bobot_aktif) + f" = {sum(bobot_aktif)}"
    else:
        rumus_penjumlahan = "0 = 0"

    return tabel_bit, bobot_aktif, rumus_penjumlahan


def _hitung_pembagian_berulang(val: int, basis: int) -> List[Dict[str, Any]]:
    """Menghasilkan baris-baris pembagian integer berulang untuk konversi basis."""
    hex_map = "0123456789ABCDEF"
    langkah: List[Dict[str, Any]] = []
    temp = val

    if temp == 0:
        sisa_str = "0"
        langkah.append({
            "nilai_awal": 0,
            "pembagi": basis,
            "hasil_bagi": 0,
            "sisa": sisa_str,
        })
        return langkah

    while temp > 0:
        rem = temp % basis
        hasil_bagi = temp // basis
        if basis == 16 and rem >= 10:
            sisa_str = f"{rem} ({hex_map[rem]})"
        else:
            sisa_str = str(rem)

        langkah.append({
            "nilai_awal": temp,
            "pembagi": basis,
            "hasil_bagi": hasil_bagi,
            "sisa": sisa_str,
        })
        temp = hasil_bagi

    return langkah


def _int_ke_biner_str(val: int) -> str:
    """Mengubah integer ke string biner deterministik murni."""
    if val == 0:
        return "00000000"
    bits = []
    temp = val
    while temp > 0:
        bits.append(str(temp % 2))
        temp //= 2
    raw = "".join(reversed(bits))
    if 0 <= val <= 255:
        return raw.zfill(8)
    return raw


def _int_ke_oktal_str(val: int) -> str:
    """Mengubah integer ke string basis 8 deterministik murni."""
    if val == 0:
        return "0"
    octs = []
    temp = val
    while temp > 0:
        octs.append(str(temp % 8))
        temp //= 8
    return "".join(reversed(octs))


def _int_ke_heksa_str(val: int) -> str:
    """Mengubah integer ke string heksadesimal huruf besar tanpa prefix."""
    if val == 0:
        return "0"
    hex_chars = "0123456789ABCDEF"
    hx = []
    temp = val
    while temp > 0:
        hx.append(hex_chars[temp % 16])
        temp //= 16
    return "".join(reversed(hx))


def hitung_konversi(
    nilai: str,
    basis_asal: int,
    mode_ipv4: bool = False,
) -> Dict[str, Any]:
    """
    Menghitung konversi bilangan antar basis (2, 8, 10, 16) secara deterministik:
    - Tanpa float, menggunakan Python murni dan operasi integer/bitwise.
    - Menghasilkan representasi biner, oktal, desimal, dan heksadesimal.
    - Menghasilkan tabel posisi bit 8-bit (128 sampai 1) dan pembagian berulang.
    - Mendukung mode 4 oktet IPv4 jika mode_ipv4 == True.
    """
    # 1. Validasi basis_asal (harus 2, 8, 10, atau 16)
    if basis_asal not in (2, 8, 10, 16):
        raise AppError(BASIS_TIDAK_VALID, field="basis_asal", pesan="Basis harus 2, 8, 10, atau 16")

    # 2. Validasi nilai input tidak kosong
    if not isinstance(nilai, str) or not nilai.strip():
        raise AppError(DIGIT_TIDAK_VALID, field="nilai", pesan="Nilai masukan tidak boleh kosong")

    raw_nilai = nilai.strip()

    allowed_digits = {
        2: set("01"),
        8: set("01234567"),
        10: set("0123456789"),
        16: set("0123456789abcdefABCDEF"),
    }

    # 3. Mode IPv4 (4 Oktet)
    if mode_ipv4:
        parts = raw_nilai.split(".")
        if len(parts) != 4:
            raise AppError(
                IP_TIDAK_VALID,
                field="nilai",
                pesan="Alamat IP harus empat angka 0–255 dipisah titik, misalnya 192.168.1.10",
            )

        oktet_list = []
        for i, part in enumerate(parts):
            p = part.strip()
            if not p:
                raise AppError(DIGIT_TIDAK_VALID, field="nilai", d=" ", b=basis_asal)
            # Cek tanda negatif atau pecahan di segmen
            for ch in p:
                if ch in ("-", ",", "/"):
                    raise AppError(DIGIT_TIDAK_VALID, field="nilai", d=ch, b=basis_asal)

            clean_part = p
            if basis_asal == 16 and clean_part.startswith(("0x", "0X")):
                clean_part = clean_part[2:]
            if not clean_part:
                raise AppError(DIGIT_TIDAK_VALID, field="nilai", d="x", b=16)

            for ch in clean_part:
                if ch not in allowed_digits[basis_asal]:
                    raise AppError(DIGIT_TIDAK_VALID, field="nilai", d=ch, b=basis_asal)

            # Konversi segmen ke integer
            val = 0
            for ch in clean_part:
                if "0" <= ch <= "9":
                    d = ord(ch) - ord("0")
                elif "a" <= ch <= "f":
                    d = ord(ch) - ord("a") + 10
                elif "A" <= ch <= "F":
                    d = ord(ch) - ord("A") + 10
                else:
                    raise AppError(DIGIT_TIDAK_VALID, field="nilai", d=ch, b=basis_asal)
                val = val * basis_asal + d

            if val < 0 or val > 255:
                raise AppError(
                    IP_TIDAK_VALID,
                    field="nilai",
                    pesan=f"Nilai segmen '{p}' ({val}) di luar rentang 0–255",
                )

            t_bit, b_aktif, r_jumlah = _buat_tabel_bit_8(val)
            p_bin = _hitung_pembagian_berulang(val, 2)
            p_oct = _hitung_pembagian_berulang(val, 8)
            p_hex = _hitung_pembagian_berulang(val, 16)

            oktet_list.append({
                "oktet_ke": i + 1,
                "nilai_asli": p,
                "desimal": str(val),
                "desimal_int": val,
                "biner": f"{val:08b}",
                "oktal": f"{val:o}",
                "heksadesimal": f"{val:02X}",
                "tabel_bit": t_bit,
                "bobot_aktif": b_aktif,
                "rumus_penjumlahan": r_jumlah,
                "pembagian_biner": p_bin,
                "pembagian_oktal": p_oct,
                "pembagian_heksa": p_hex,
            })

        biner_gabung = ".".join(o["biner"] for o in oktet_list)
        desimal_gabung = ".".join(o["desimal"] for o in oktet_list)
        heksa_gabung = ".".join(o["heksadesimal"] for o in oktet_list)
        oktal_gabung = ".".join(o["oktal"] for o in oktet_list)

        return {
            "fitur": "konversi",
            "nilai_input": raw_nilai,
            "basis_asal": basis_asal,
            "mode_ipv4": True,
            "desimal": desimal_gabung,
            "biner": biner_gabung,
            "oktal": oktal_gabung,
            "heksadesimal": heksa_gabung,
            "heksadesimal_prefixed": "0x" + "".join(o["heksadesimal"] for o in oktet_list),
            "tabel_bit": oktet_list[0]["tabel_bit"],
            "bobot_aktif": oktet_list[0]["bobot_aktif"],
            "rumus_penjumlahan": oktet_list[0]["rumus_penjumlahan"],
            "pembagian_biner": oktet_list[0]["pembagian_biner"],
            "pembagian_oktal": oktet_list[0]["pembagian_oktal"],
            "pembagian_heksa": oktet_list[0]["pembagian_heksa"],
            "oktet_list": oktet_list,
            "peringatan": [],
        }

    # 4. Mode Tunggal (Satu Nilai)
    # Tolak bilangan negatif atau pecahan
    for ch in raw_nilai:
        if ch in ("-", ",", "."):
            raise AppError(DIGIT_TIDAK_VALID, field="nilai", d=ch, b=basis_asal)

    clean_str = raw_nilai
    if basis_asal == 16:
        if clean_str.startswith(("0x", "0X")):
            clean_str = clean_str[2:]
        if not clean_str:
            raise AppError(DIGIT_TIDAK_VALID, field="nilai", d="x", b=16)

    # Validasi karakter
    for ch in clean_str:
        if ch not in allowed_digits[basis_asal]:
            raise AppError(DIGIT_TIDAK_VALID, field="nilai", d=ch, b=basis_asal)

    # Konversi ke desimal_int dengan aritmetika murni
    desimal_int = 0
    for ch in clean_str:
        if "0" <= ch <= "9":
            digit = ord(ch) - ord("0")
        elif "a" <= ch <= "f":
            digit = ord(ch) - ord("a") + 10
        elif "A" <= ch <= "F":
            digit = ord(ch) - ord("A") + 10
        else:
            raise AppError(DIGIT_TIDAK_VALID, field="nilai", d=ch, b=basis_asal)
        desimal_int = desimal_int * basis_asal + digit

    # Batas 64-bit
    if desimal_int >= (1 << 64):
        raise AppError(BATAS_UKURAN_LEWAT, field="nilai", n="64 bit")

    desimal_str = str(desimal_int)
    biner_str = _int_ke_biner_str(desimal_int)
    oktal_str = _int_ke_oktal_str(desimal_int)
    heksa_str = _int_ke_heksa_str(desimal_int)

    tabel_bit, bobot_aktif, rumus_penjumlahan = _buat_tabel_bit_8(desimal_int)
    pembagian_biner = _hitung_pembagian_berulang(desimal_int, 2)
    pembagian_oktal = _hitung_pembagian_berulang(desimal_int, 8)
    pembagian_heksa = _hitung_pembagian_berulang(desimal_int, 16)

    return {
        "fitur": "konversi",
        "nilai_input": raw_nilai,
        "clean_input": clean_str,
        "basis_asal": basis_asal,
        "mode_ipv4": False,
        "desimal_int": desimal_int,
        "desimal": desimal_str,
        "biner": biner_str,
        "oktal": oktal_str,
        "heksadesimal": heksa_str,
        "heksadesimal_prefixed": f"0x{heksa_str}",
        "tabel_bit": tabel_bit,
        "bobot_aktif": bobot_aktif,
        "rumus_penjumlahan": rumus_penjumlahan,
        "pembagian_biner": pembagian_biner,
        "pembagian_oktal": pembagian_oktal,
        "pembagian_heksa": pembagian_heksa,
        "peringatan": [],
    }



