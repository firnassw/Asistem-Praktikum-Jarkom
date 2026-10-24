"""
Penyusun langkah-langkah penyelesaian subnetting sesuai urutan Modul 2 praktikum.
Menghasilkan struktur jawaban seragam (StrukturJawaban).
"""

from typing import Any, Dict, List, Optional
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


def susun_langkah_vlsm(data: Dict[str, Any]) -> StrukturJawaban:
    """
    Menyusun langkah-langkah alokasi VLSM sesuai standar ujian praktikum:
    1. Urutkan kebutuhan host dari terbesar ke terkecil.
    2. Tentukan prefix dan ukuran blok tiap kebutuhan.
    3. Alokasikan blok alamat secara berurutan.
    """
    alamat_induk = data["alamat_induk"]
    prefix_induk = data["prefix_induk"]
    mask_induk = data["mask_induk"]
    kapasitas_induk = data["kapasitas_induk"]
    total_host_diminta = data["total_host_diminta"]
    total_alamat_dialokasikan = data["total_alamat_dialokasikan"]
    sisa_alamat = data["sisa_alamat"]
    sisa_rentang = data["sisa_rentang"]
    kebutuhan_input = data["kebutuhan_input"]
    kebutuhan_terurut = data["kebutuhan_terurut"]
    tabel = data["tabel"]
    peringatan = data["peringatan"]

    # 1. Diketahui
    daftar_kebutuhan_str = ", ".join(f"{k['nama']}: {k['host']} host" for k in kebutuhan_input)
    diketahui = [
        DiketahuiItem(label="Induk Jaringan", nilai=f"{alamat_induk}/{prefix_induk} (Mask: {mask_induk}, Kapasitas: {kapasitas_induk} IP)"),
        DiketahuiItem(label="Metode Alokasi", nilai="VLSM (Variable Length Subnet Mask)"),
        DiketahuiItem(label="Daftar Kebutuhan", nilai=daftar_kebutuhan_str),
    ]

    # 2. Langkah 1: Urutkan Kebutuhan
    urutan_str = " → ".join(f"{k['nama']} ({k['host']} host)" for k in kebutuhan_terurut)
    langkah1 = LangkahItem(
        judul="Urutkan kebutuhan host dari terbesar ke terkecil",
        penjelasan=(
            "Metode VLSM memprioritaskan alokasi dari blok subnet terbesar ke terkecil. "
            "Pengurutan ini menjamin bahwa setiap alamat jaringan (Network Address) selalu "
            "jatuh pada batas kelipatan ukuran bloknya (boundary alignment), sehingga tidak "
            "terjadi fragmentasi ruang alamat IP."
        ),
        rumus=None,
        tabel={
            "tipe": "urutan_kebutuhan",
            "daftar": [f"{i + 1}. {k['nama']} ({k['host']} host)" for i, k in enumerate(kebutuhan_terurut)],
        },
        hasil=f"Urutan alokasi: {urutan_str}",
    )

    # 3. Langkah 2: Tentukan Prefix dan Ukuran Blok
    perhitungan_prefix = []
    hasil_prefix_parts = []
    for r in tabel:
        if r["status"] != "Tidak muat":
            perhitungan_prefix.append({
                "nama": r["nama"],
                "host_diminta": r["host_diminta"],
                "rumus": f"{r['host_diminta']} + 2 = {r['host_diminta'] + 2} <= 2^{r['bit_host']} ({r['ukuran_blok']})",
                "prefix": f"/{r['prefix']}",
                "blok": r["ukuran_blok"],
                "mask": r["subnet_mask"],
            })
            hasil_prefix_parts.append(f"{r['nama']}: /{r['prefix']} ({r['ukuran_blok']} IP)")

    langkah2 = LangkahItem(
        judul="Tentukan prefix dan ukuran blok tiap kebutuhan",
        penjelasan=(
            "Untuk setiap ruangan, hitung jumlah bit host (y) yang memenuhi: "
            "host + 2 (Network + Broadcast) <= 2^y. Prefix dihitung dengan rumus "
            "prefix = 32 - y (dengan batas minimal /30 untuk alokasi host). "
            "Ukuran blok subnet adalah 2^y alamat."
        ),
        rumus="host + 2 <= 2^y, prefix = 32 - y, ukuran blok = 2^y",
        tabel={
            "tipe": "perhitungan_prefix",
            "baris": perhitungan_prefix,
        },
        hasil="; ".join(hasil_prefix_parts),
    )

    # 4. Langkah 3: Alokasikan Blok Alamat Berurutan
    alokasi_parts = []
    for r in tabel:
        if r["status"] != "Tidak muat":
            alokasi_parts.append(
                f"{r['nama']} ({r['subnet']}/{r['prefix']}): host {r['host_pertama']} - {r['host_terakhir']}, BA {r['broadcast']}"
            )
        else:
            alokasi_parts.append(f"{r['nama']} ({r['host_diminta']} host): Tidak muat di jaringan induk")

    langkah3 = LangkahItem(
        judul="Alokasikan blok alamat secara berurutan",
        penjelasan=(
            f"Tempatkan blok subnet secara kontigu (berdampingan tanpa celah) mulai dari "
            f"alamat induk {alamat_induk}. Setiap subnet memiliki Network Address (NA) di "
            f"awal blok, Broadcast Address (BA) di akhir blok, serta rentang host valid di antaranya."
        ),
        rumus="NA = cursor, BA = cursor + ukuran blok - 1, host = (NA + 1) s.d. (BA - 1)",
        tabel={
            "tipe": "alokasi_blok_vlsm",
            "baris": tabel,
        },
        hasil=f"Total dialokasikan: {total_alamat_dialokasikan}/{kapasitas_induk} IP | Sisa bebas: {sisa_alamat} IP",
    )

    langkah_list = [langkah1, langkah2, langkah3]

    # 5. Hasil Akhir
    ruangan_terakomodasi = sum(1 for r in tabel if r["status"] == "Terpakai")
    persen_terpakai = (total_alamat_dialokasikan * 100) // kapasitas_induk if kapasitas_induk else 0

    hasil_akhir = {
        "ringkasan": {
            "metode": "VLSM",
            "total_ruangan": len(kebutuhan_input),
            "ruangan_terakomodasi": ruangan_terakomodasi,
            "kapasitas_induk": kapasitas_induk,
            "total_alamat_dialokasikan": total_alamat_dialokasikan,
            "sisa_alamat": sisa_alamat,
            "persen_terpakai": persen_terpakai,
            "sisa_rentang": sisa_rentang,
        },
        "tabel": tabel,
    }

    # 6. Kesimpulan Utuh Bahasa Indonesia
    if ruangan_terakomodasi == len(kebutuhan_input):
        if sisa_rentang:
            kesimpulan = (
                f"Alokasi VLSM untuk jaringan induk {alamat_induk}/{prefix_induk} berhasil "
                f"mengakomodasi seluruh {len(kebutuhan_input)} ruangan dengan menggunakan "
                f"{total_alamat_dialokasikan} dari {kapasitas_induk} alamat IP ({persen_terpakai}%). "
                f"Tersisa {sisa_alamat} alamat IP bebas ({sisa_rentang['mulai']} s.d. {sisa_rentang['akhir']}) "
                f"yang siap digunakan untuk ekspansi jaringan mendatang."
            )
        else:
            kesimpulan = (
                f"Alokasi VLSM untuk jaringan induk {alamat_induk}/{prefix_induk} berhasil "
                f"mengakomodasi seluruh {len(kebutuhan_input)} ruangan dengan menggunakan "
                f"seluruh {total_alamat_dialokasikan} alamat IP induk tanpa menyisakan ruang bebas."
            )
    else:
        tidak_muat = [r["nama"] for r in tabel if r["status"] == "Tidak muat"]
        kesimpulan = (
            f"Alokasi VLSM untuk jaringan induk {alamat_induk}/{prefix_induk} (kapasitas {kapasitas_induk} IP) "
            f"hanya dapat menampung {ruangan_terakomodasi} dari {len(kebutuhan_input)} ruangan. "
            f"Sebanyak {len(tidak_muat)} ruangan ({', '.join(tidak_muat)}) tidak muat dan "
            f"memerlukan jaringan induk dengan prefix lebih kecil (kapasitas lebih besar)."
        )

    return StrukturJawaban(
        fitur="vlsm",
        diketahui=diketahui,
        langkah=langkah_list,
        hasil_akhir=hasil_akhir,
        kesimpulan=kesimpulan,
        peringatan=peringatan,
    )


def susun_langkah_flsm(data: Dict[str, Any]) -> StrukturJawaban:
    """
    Menyusun langkah-langkah alokasi FLSM sesuai standar ujian praktikum:
    1. Tentukan kebutuhan host terbesar dan prefix seragam.
    2. Periksa kecukupan subnet pada jaringan induk.
    3. Alokasikan blok subnet berukuran tetap.
    """
    alamat_induk = data["alamat_induk"]
    prefix_induk = data["prefix_induk"]
    mask_induk = data["mask_induk"]
    kapasitas_induk = data["kapasitas_induk"]
    host_terbesar = data["host_terbesar"]
    p = data["prefix_seragam"]
    mask_seragam = data["subnet_mask_seragam"]
    ukuran_blok = data["ukuran_blok"]
    host_tersedia = data["host_tersedia"]
    bit_host = data["bit_host"]
    m = data["m"]
    n = data["n"]
    r = data["r"]
    gaya_modul = data["gaya_modul"]
    total_alamat_dialokasikan = data["total_alamat_dialokasikan"]
    sisa_alamat = data["sisa_alamat"]
    kebutuhan_input = data["kebutuhan_input"]
    tabel = data["tabel"]
    peringatan = data["peringatan"]

    # 1. Diketahui
    daftar_kebutuhan_str = ", ".join(f"{k['nama']}: {k['host']} host" for k in kebutuhan_input)
    diketahui = [
        DiketahuiItem(label="Induk Jaringan", nilai=f"{alamat_induk}/{prefix_induk} (Kapasitas: {kapasitas_induk} IP)"),
        DiketahuiItem(label="Metode Alokasi", nilai="FLSM (Fixed Length Subnet Mask)"),
        DiketahuiItem(label="Kebutuhan Terbesar", nilai=f"{host_terbesar} host"),
        DiketahuiItem(label="Daftar Kebutuhan", nilai=daftar_kebutuhan_str),
    ]

    # 2. Langkah 1: Kebutuhan terbesar dan prefix seragam
    langkah1 = LangkahItem(
        judul="Tentukan kebutuhan host terbesar dan prefix seragam",
        penjelasan=(
            f"Pada metode FLSM, seluruh subnet menggunakan panjang subnet mask yang seragam. "
            f"Ukuran subnet ditentukan oleh kebutuhan host terbesar ({host_terbesar} host) "
            f"agar seluruh ruangan dapat tertampung. Rumus pemenuhan host: "
            f"{host_terbesar} + 2 <= 2^{bit_host} ({ukuran_blok} alamat/subnet), sehingga "
            f"prefix seragam yang digunakan adalah /{p} (subnet mask {mask_seragam})."
        ),
        rumus=f"host_terbesar + 2 <= 2^y, prefix = 32 - y (/{p})",
        tabel=None,
        hasil=f"Kebutuhan terbesar: {host_terbesar} host → Prefix seragam: /{p} (Ukuran blok: {ukuran_blok} IP, {host_tersedia} host valid)",
    )

    # 3. Langkah 2: Periksa kecukupan subnet
    if gaya_modul and "MELEWATI_INDUK" in peringatan:
        penjelasan_l2 = (
            f"Jaringan induk /{prefix_induk} hanya memuat {n} subnet /{p} (2^({p} - {prefix_induk}) = {n}), "
            f"sedangkan dibutuhkan {m} subnet. Opsi 'gaya modul praktikum' aktif, sehingga "
            f"alokasi {m} subnet tetap dilanjutkan secara berurutan meskipun melampaui batas alamat induk."
        )
        hasil_l2 = f"Subnet induk: {n} | Dibutuhkan: {m} subnet (Alokasi dilanjutkan gaya modul praktikum)"
    else:
        penjelasan_l2 = (
            f"Jumlah subnet berukuran /{p} yang dapat dibentuk dari jaringan induk /{prefix_induk} "
            f"adalah 2^({p} - {prefix_induk}) = {n} subnet. Karena jumlah ruangan yang diminta ({m}) "
            f"dapat ditampung dalam kapasitas {n} subnet, pembagian FLSM dapat dipenuhi."
        )
        hasil_l2 = f"Subnet tersedia: {n} | Dibutuhkan: {m} subnet"

    langkah2 = LangkahItem(
        judul="Periksa kecukupan subnet pada jaringan induk",
        penjelasan=penjelasan_l2,
        rumus=f"Jumlah subnet = 2^(prefix_subnet - prefix_induk) = 2^({p} - {prefix_induk}) = {n}",
        tabel=None,
        hasil=hasil_l2,
    )

    # 4. Langkah 3: Alokasikan blok subnet berukuran tetap
    cadangan_count = sum(1 for r_row in tabel if r_row["status"] == "Cadangan")
    langkah3 = LangkahItem(
        judul="Alokasikan blok subnet berukuran tetap",
        penjelasan=(
            f"Bagikan blok subnet berukuran /{p} ({ukuran_blok} alamat) secara berurutan mulai dari "
            f"alamat induk {alamat_induk}. Sebanyak {m} subnet awal dialokasikan untuk kebutuhan ruangan, "
            f"dan {cadangan_count} subnet berikutnya ditandai sebagai 'Cadangan'."
        ),
        rumus=f"Ukuran tiap blok = 2^(32 - {p}) = {ukuran_blok} alamat",
        tabel={
            "tipe": "alokasi_blok_flsm",
            "baris": tabel,
        },
        hasil=f"Terbentuk {len(tabel)} subnet berukuran /{p} ({m} terpakai, {cadangan_count} cadangan)",
    )

    langkah_list = [langkah1, langkah2, langkah3]

    # 5. Hasil Akhir
    hasil_akhir = {
        "ringkasan": {
            "metode": "FLSM",
            "host_terbesar": host_terbesar,
            "prefix_seragam": p,
            "subnet_mask_seragam": mask_seragam,
            "ukuran_blok": ukuran_blok,
            "host_tersedia": host_tersedia,
            "total_subnet_terbentuk": len(tabel),
            "subnet_terpakai": m,
            "subnet_cadangan": cadangan_count,
            "kapasitas_induk": kapasitas_induk,
            "total_alamat_dialokasikan": total_alamat_dialokasikan,
            "sisa_alamat": sisa_alamat,
            "gaya_modul": gaya_modul,
        },
        "tabel": tabel,
    }

    # 6. Kesimpulan Utuh Bahasa Indonesia
    if "MELEWATI_INDUK" in peringatan:
        kesimpulan = (
            f"Alokasi FLSM menghasilkan {len(tabel)} subnet berukuran /{p}. "
            f"Alokasi ini melampaui batas kapasitas induk {alamat_induk}/{prefix_induk} "
            f"sesuai opsi gaya modul praktikum. Disarankan menggunakan induk /{r} atau "
            f"beralih ke metode VLSM untuk efisiensi ruang alamat."
        )
    else:
        kesimpulan = (
            f"Pembagian FLSM dari induk {alamat_induk}/{prefix_induk} berhasil membentuk "
            f"{len(tabel)} subnet berukuran /{p} ({ukuran_blok} IP per subnet). Sebanyak {m} "
            f"subnet dialokasikan untuk kebutuhan ruangan dan {cadangan_count} subnet "
            f"ditandai sebagai cadangan."
        )

    return StrukturJawaban(
        fitur="flsm",
        diketahui=diketahui,
        langkah=langkah_list,
        hasil_akhir=hasil_akhir,
        kesimpulan=kesimpulan,
        peringatan=peringatan,
    )


def _susun_langkah_rencana_list(
    alamat_induk: str,
    prefix_induk: int,
    kapasitas_induk: int,
    nim_str: Optional[str],
    cadangan_persen: int,
    gateway: bool,
    mode: str,
    clean_ruangan: List[Dict[str, Any]],
    ruangan_skenario: List[Dict[str, Any]],
    tabel: List[Dict[str, Any]],
    total_alamat_dialokasikan: int,
    sisa_alamat: int,
) -> List[LangkahItem]:
    """Menyusun 3 kartu langkah untuk rencana ruangan."""
    # 1. Langkah 1: Tentukan IP Global induk dan urutkan kebutuhan ruangan dari terbesar
    daftar_urut = []
    if mode == "vlsm":
        ruangan_terurut = sorted(ruangan_skenario, key=lambda x: x["host_dibutuhkan"], reverse=True)
        judul_langkah1 = "Tentukan IP Global induk dan urutkan kebutuhan ruangan dari terbesar"
        penjelasan_langkah1 = (
            (f"Alamat jaringan induk dibentuk dari dua digit NIM {nim_str} menjadi {alamat_induk}/{prefix_induk} (kapasitas {kapasitas_induk} IP). "
             if nim_str else
             f"Alamat jaringan induk yang digunakan adalah {alamat_induk}/{prefix_induk} (kapasitas {kapasitas_induk} IP). ") +
            f"Kebutuhan tiap ruangan dihitung dari jumlah device" +
            (f", cadangan pertumbuhan {cadangan_persen}%" if cadangan_persen > 0 else "") +
            (f", serta tambahan 1 IP router (gateway)" if gateway else "") +
            f". Dalam metode VLSM, seluruh ruangan diurutkan dari kebutuhan host terbesar ke terkecil "
            f"agar penempatan blok subnet selalu sejajar dengan batas kelipatannya (boundary alignment)."
        )
    else:
        ruangan_terurut = ruangan_skenario
        judul_langkah1 = "Tentukan IP Global induk dan hitung kebutuhan ruangan"
        penjelasan_langkah1 = (
            (f"Alamat jaringan induk dibentuk dari dua digit NIM {nim_str} menjadi {alamat_induk}/{prefix_induk} (kapasitas {kapasitas_induk} IP). "
             if nim_str else
             f"Alamat jaringan induk yang digunakan adalah {alamat_induk}/{prefix_induk} (kapasitas {kapasitas_induk} IP). ") +
            f"Kebutuhan tiap ruangan dihitung dari jumlah device" +
            (f", cadangan pertumbuhan {cadangan_persen}%" if cadangan_persen > 0 else "") +
            (f", serta tambahan 1 IP router (gateway)" if gateway else "") +
            f". Dalam metode FLSM, subnet mask ditentukan seragam berdasarkan kebutuhan host terbesar."
        )

    for i, r in enumerate(ruangan_terurut):
        rincian = f"{i + 1}. {r['nama']}: {r['device']} device"
        if r['cadangan_host'] > 0:
            rincian += f" + {r['cadangan_host']} cadangan ({cadangan_persen}%)"
        if gateway:
            rincian += " + 1 gateway"
        rincian += f" = {r['host_dibutuhkan']} host"
        daftar_urut.append(rincian)

    urutan_str = " → ".join(f"{r['nama']} ({r['host_dibutuhkan']} host)" for r in ruangan_terurut)

    langkah1 = LangkahItem(
        judul=judul_langkah1,
        penjelasan=penjelasan_langkah1,
        rumus="host_dibutuhkan = device + cadangan" + (" + 1 (gateway)" if gateway else ""),
        tabel={
            "tipe": "urutan_kebutuhan_rencana",
            "daftar": daftar_urut,
        },
        hasil=f"Urutan alokasi: {urutan_str}",
    )

    # 2. Langkah 2: Tentukan Prefix dan Ukuran Blok Tiap Ruangan
    perhitungan_prefix = []
    hasil_prefix_parts = []
    for r in tabel:
        if r["status"] != "Tidak muat" and r["status"] != "Cadangan":
            perhitungan_prefix.append({
                "nama": r["nama"],
                "device": r["device"],
                "host_dibutuhkan": r["host_dibutuhkan"],
                "rumus": f"{r['host_dibutuhkan']} + 2 = {r['host_dibutuhkan'] + 2} <= 2^{r['bit_host']} ({r['ukuran_blok']})",
                "prefix": f"/{r['prefix']}",
                "host_tersedia": r["host_tersedia"],
                "blok": r["ukuran_blok"],
                "mask": r["subnet_mask"],
            })
            hasil_prefix_parts.append(f"{r['nama']}: /{r['prefix']} ({r['host_tersedia']} host)")

    langkah2 = LangkahItem(
        judul="Tentukan prefix dan kapasitas tiap ruangan",
        penjelasan=(
            "Untuk setiap ruangan, hitung jumlah bit host (y) yang memenuhi: "
            "host_dibutuhkan + 2 (Network + Broadcast) <= 2^y. Prefix dihitung dengan rumus "
            "prefix = 32 - y (dengan batas minimal /30 untuk alokasi host). "
            "Kapasitas host tersedia pada tiap subnet adalah 2^y - 2 host."
        ),
        rumus="host_dibutuhkan + 2 <= 2^y, prefix = 32 - y, host tersedia = 2^y - 2",
        tabel={
            "tipe": "perhitungan_prefix_rencana",
            "baris": perhitungan_prefix,
        },
        hasil="; ".join(hasil_prefix_parts),
    )

    # 3. Langkah 3: Alokasikan Blok Subnet Secara Berurutan
    alokasi_parts = []
    for r in tabel:
        if r["status"] == "Terpakai":
            gw_info = f", Gateway: {r['usulan_gateway']}" if r.get("usulan_gateway") else ""
            alokasi_parts.append(
                f"{r['nama']} ({r['subnet']}/{r['prefix']}): host {r['host_pertama']} - {r['host_terakhir']}{gw_info}, BA {r['broadcast']}"
            )
        elif r["status"] == "Cadangan":
            alokasi_parts.append(f"Cadangan ({r['subnet']}/{r['prefix']}): {r['host_tersedia']} host bebas")
        else:
            alokasi_parts.append(f"{r['nama']}: Tidak muat di jaringan induk")

    langkah3 = LangkahItem(
        judul="Alokasikan blok subnet secara berurutan",
        penjelasan=(
            f"Tempatkan blok subnet secara kontigu mulai dari alamat induk {alamat_induk}/{prefix_induk}. "
            f"Setiap subnet memiliki Network Address (NA) di awal blok, Broadcast Address (BA) di akhir blok, "
            f"serta rentang host valid di antaranya." +
            (" Alamat host pertama diusulkan sebagai default gateway interface router." if gateway else "")
        ),
        rumus="NA = cursor, BA = cursor + ukuran blok - 1, host = (NA + 1) s.d. (BA - 1)" + (", gateway = host pertama" if gateway else ""),
        tabel={
            "tipe": "alokasi_blok_rencana",
            "baris": tabel,
        },
        hasil=f"Total terpakai: {total_alamat_dialokasikan}/{kapasitas_induk} IP | Sisa bebas: {sisa_alamat} IP",
    )

    return [langkah1, langkah2, langkah3]


def susun_langkah_rencana(data: Dict[str, Any]) -> StrukturJawaban:
    """
    Menyusun langkah-langkah rencana ruangan dan device sesuai PRD Bagian 11 dan Lampiran A:
    - Menghasilkan diketahui, langkah 1..3, hasil_akhir (tabel, ringkasan, perbandingan),
      kesimpulan kalimat utuh Bahasa Indonesia, dan peringatan.
    """
    alamat_induk = data["alamat_induk"]
    prefix_induk = data["prefix_induk"]
    mask_induk = data["mask_induk"]
    kapasitas_induk = data["kapasitas_induk"]
    nim_str = data["nim_str"]
    cadangan_persen = data["cadangan_persen"]
    gateway = data["gateway"]
    mode = data["mode"]
    clean_ruangan = data["clean_ruangan"]
    ruangan_skenario = data["ruangan_skenario"]
    tabel = data["tabel"]
    ringkasan = data["ringkasan"]
    perbandingan_gateway = data["perbandingan_gateway"]
    perbandingan_mode = data["perbandingan_mode"]
    peringatan = data["peringatan"]

    # 1. Diketahui
    diketahui = [
        DiketahuiItem(
            label="Induk Jaringan",
            nilai=f"{alamat_induk}/{prefix_induk} (Mask: {mask_induk}, Kapasitas: {kapasitas_induk} IP)",
        ),
    ]
    if nim_str:
        diketahui.append(DiketahuiItem(label="Dua Digit NIM", nilai=nim_str))
    diketahui.append(DiketahuiItem(label="Jumlah Ruangan", nilai=f"{len(clean_ruangan)} ruangan"))
    diketahui.append(
        DiketahuiItem(
            label="Cadangan Pertumbuhan",
            nilai=f"{cadangan_persen}%" if cadangan_persen > 0 else "0% (tanpa cadangan)",
        )
    )
    diketahui.append(
        DiketahuiItem(
            label="Opsi Gateway",
            nilai="Aktif (+1 host, host pertama)" if gateway else "Tidak dihitung",
        )
    )
    diketahui.append(
        DiketahuiItem(
            label="Metode Alokasi",
            nilai=f"{mode.upper()} ({'Variable' if mode == 'vlsm' else 'Fixed'} Length Subnet Mask)",
        )
    )

    # 2. Susun 3 Kartu Langkah
    langkah_list = _susun_langkah_rencana_list(
        alamat_induk=alamat_induk,
        prefix_induk=prefix_induk,
        kapasitas_induk=kapasitas_induk,
        nim_str=nim_str,
        cadangan_persen=cadangan_persen,
        gateway=gateway,
        mode=mode,
        clean_ruangan=clean_ruangan,
        ruangan_skenario=ruangan_skenario,
        tabel=tabel,
        total_alamat_dialokasikan=ringkasan["total_alamat_dialokasikan"],
        sisa_alamat=ringkasan["sisa_alamat"],
    )

    # Susun juga langkah untuk perbandingan gateway jika tersedia
    if "tanpa_gateway" in perbandingan_gateway:
        tg = perbandingan_gateway["tanpa_gateway"]
        tg["langkah"] = _susun_langkah_rencana_list(
            alamat_induk=alamat_induk,
            prefix_induk=prefix_induk,
            kapasitas_induk=kapasitas_induk,
            nim_str=nim_str,
            cadangan_persen=cadangan_persen,
            gateway=False,
            mode=mode,
            clean_ruangan=clean_ruangan,
            ruangan_skenario=tg["ruangan_skenario"],
            tabel=tg["tabel"],
            total_alamat_dialokasikan=tg["total_alamat_dialokasikan"],
            sisa_alamat=tg["sisa_alamat"],
        )
    if "dengan_gateway" in perbandingan_gateway:
        dg = perbandingan_gateway["dengan_gateway"]
        dg["langkah"] = _susun_langkah_rencana_list(
            alamat_induk=alamat_induk,
            prefix_induk=prefix_induk,
            kapasitas_induk=kapasitas_induk,
            nim_str=nim_str,
            cadangan_persen=cadangan_persen,
            gateway=True,
            mode=mode,
            clean_ruangan=clean_ruangan,
            ruangan_skenario=dg["ruangan_skenario"],
            tabel=dg["tabel"],
            total_alamat_dialokasikan=dg["total_alamat_dialokasikan"],
            sisa_alamat=dg["sisa_alamat"],
        )

    # 3. Kesimpulan Kalimat Utuh Bahasa Indonesia
    total_dialokasikan = ringkasan["total_alamat_dialokasikan"]
    sisa_alamat = ringkasan["sisa_alamat"]
    persen_terpakai = ringkasan["persen_terpakai"]
    ruangan_terakomodasi = ringkasan["ruangan_terakomodasi"]

    if ruangan_terakomodasi == len(clean_ruangan):
        kesimpulan = (
            f"Alokasi {mode.upper()} untuk {len(clean_ruangan)} ruangan dengan IP dasar "
            f"{alamat_induk}/{prefix_induk} berhasil disusun dengan efisiensi tinggi, "
            f"menghabiskan {total_dialokasikan} dari {kapasitas_induk} alamat IP ({persen_terpakai}%) "
            f"dan menyisakan {sisa_alamat} alamat IP bebas untuk ekspansi jaringan mendatang."
        )
        if gateway:
            kesimpulan += " Usulan IP gateway router dikonfigurasi pada alamat host pertama setiap subnet."
    else:
        kesimpulan = (
            f"Alokasi {mode.upper()} untuk jaringan induk {alamat_induk}/{prefix_induk} hanya dapat "
            f"mengakomodasi {ruangan_terakomodasi} dari {len(clean_ruangan)} ruangan. "
            f"Diperlukan jaringan induk dengan prefix lebih besar untuk menampung seluruh kebutuhan."
        )

    # Tambahkan kesimpulan ke sub-skenario perbandingan
    if "tanpa_gateway" in perbandingan_gateway:
        perbandingan_gateway["tanpa_gateway"]["kesimpulan"] = (
            f"Alokasi {mode.upper()} tanpa gateway menghabiskan {perbandingan_gateway['tanpa_gateway']['total_alamat_dialokasikan']} "
            f"dari {kapasitas_induk} alamat IP, menyisakan {perbandingan_gateway['tanpa_gateway']['sisa_alamat']} IP bebas."
        )
    if "dengan_gateway" in perbandingan_gateway:
        perbandingan_gateway["dengan_gateway"]["kesimpulan"] = (
            f"Alokasi {mode.upper()} dengan gateway (+1 router host) menghabiskan {perbandingan_gateway['dengan_gateway']['total_alamat_dialokasikan']} "
            f"dari {kapasitas_induk} alamat IP, menyisakan {perbandingan_gateway['dengan_gateway']['sisa_alamat']} IP bebas. "
            f"Usulan gateway ditempatkan pada host pertama tiap subnet."
        )

    hasil_akhir = {
        "ringkasan": ringkasan,
        "tabel": tabel,
        "perbandingan_gateway": perbandingan_gateway,
        "perbandingan_mode": perbandingan_mode,
    }

    return StrukturJawaban(
        fitur="rencana",
        diketahui=diketahui,
        langkah=langkah_list,
        hasil_akhir=hasil_akhir,
        kesimpulan=kesimpulan,
        peringatan=peringatan,
    )


def susun_langkah_dhcp(data: Dict[str, Any]) -> StrukturJawaban:
    """
    Menyusun langkah penyelesaian konfigurasi DHCP router Cisco Packet Tracer:
    1. Tentukan alamat jaringan (NA) dan subnet mask dari IP router & prefix.
    2. Periksa rentang excluded address dan prediksi IP klien pertama.
    3. Susun urutan perintah CLI konfigurasi interface dan DHCP server.
    """
    alamat_router = data["alamat_router"]
    prefix = data["prefix"]
    subnet_mask = data["subnet_mask"]
    network_address = data["network_address"]
    broadcast_address = data["broadcast_address"]
    host_pertama = data["host_pertama"]
    host_terakhir = data["host_terakhir"]
    interface = data["interface"]
    nama_pool = data["nama_pool"]
    excluded_awal = data["excluded_awal"]
    excluded_akhir = data["excluded_akhir"]
    klien_pertama = data["klien_pertama"]
    rentang_dinamis = data["rentang_dinamis"]
    jumlah_klien_dinamis = data["jumlah_klien_dinamis"]
    cli_baris = data["cli_baris"]
    cli_script = data["cli_script"]
    peringatan = data.get("peringatan", [])

    # 1. Diketahui
    diketahui = [
        DiketahuiItem(label="IP Router (Default Gateway)", nilai=alamat_router),
        DiketahuiItem(label="Prefix & Subnet Mask", nilai=f"/{prefix} ({subnet_mask})"),
        DiketahuiItem(label="Interface Router", nilai=interface),
        DiketahuiItem(label="Nama DHCP Pool", nilai=nama_pool),
        DiketahuiItem(label="Rentang Excluded", nilai=f"{excluded_awal} s.d. {excluded_akhir}"),
    ]

    # 2. Langkah 1: Tentukan alamat jaringan (NA) dan subnet mask
    langkah1 = LangkahItem(
        judul="Tentukan alamat jaringan (NA) dan subnet mask dari IP router",
        penjelasan=(
            f"Tentukan Network Address (NA) dan subnet mask dari alamat IP router {alamat_router}/{prefix}. "
            f"Nilai Network Address dan subnet mask ini akan digunakan sebagai parameter pada perintah 'network' di konfigurasi DHCP pool."
        ),
        rumus="NA = IP Router AND Subnet Mask",
        tabel={
            "tipe": "dhcp_step1",
            "alamat_router": alamat_router,
            "prefix": prefix,
            "network_address": network_address,
            "subnet_mask": subnet_mask,
            "broadcast_address": broadcast_address,
            "host_pertama": host_pertama,
            "host_terakhir": host_terakhir,
        },
        hasil=f"Network Address (NA) = {network_address} | Subnet Mask = {subnet_mask}",
    )

    # 3. Langkah 2: Periksa rentang excluded address dan prediksi IP klien pertama
    langkah2 = LangkahItem(
        judul="Periksa rentang excluded address dan prediksi IP klien pertama",
        penjelasan=(
            f"Alamat IP {excluded_awal} sampai {excluded_akhir} dikecualikan (excluded) agar tidak dibagikan secara otomatis ke klien dinamis. "
            f"Router DHCP akan mengalokasikan alamat IP pertama yang tersedia tepat setelah batas akhir excluded address: {excluded_akhir} + 1."
        ),
        rumus=f"IP Klien Pertama = {excluded_akhir} + 1 = {klien_pertama}",
        tabel={
            "tipe": "dhcp_step2",
            "excluded_awal": excluded_awal,
            "excluded_akhir": excluded_akhir,
            "klien_pertama": klien_pertama,
            "rentang_dinamis": rentang_dinamis,
            "jumlah_klien_dinamis": jumlah_klien_dinamis,
        },
        hasil=f"Klien pertama mendapat IP {klien_pertama} (Rentang dinamis: {rentang_dinamis})",
    )

    # 4. Langkah 3: Susun urutan perintah CLI konfigurasi interface dan DHCP server
    langkah3 = LangkahItem(
        judul="Susun urutan perintah CLI konfigurasi interface dan DHCP server",
        penjelasan=(
            f"Susun perintah CLI Cisco IOS secara berurutan: masuk ke mode privileged dan konfigurasi global, aktifkan interface {interface} "
            f"dengan IP {alamat_router}, buat DHCP pool '{nama_pool}', tentukan default gateway dan network subnet, lalu kecualikan rentang IP {excluded_awal}–{excluded_akhir}."
        ),
        rumus=None,
        tabel={
            "tipe": "dhcp_step3",
            "total_baris": len(cli_baris),
            "interface": interface,
            "nama_pool": nama_pool,
        },
        hasil="10 baris perintah CLI Cisco IOS siap dieksekusi pada tab CLI router",
    )

    langkah_list = [langkah1, langkah2, langkah3]

    # 5. Kesimpulan
    kesimpulan = (
        f"Konfigurasi DHCP pool '{nama_pool}' pada interface {interface} berhasil disusun. "
        f"Klien pertama yang meminta alamat secara dinamis akan memperoleh IP {klien_pertama} "
        f"dengan subnet mask {subnet_mask} dan default gateway {alamat_router}."
    )

    hasil_akhir = {
        "klien_pertama": klien_pertama,
        "network_address": network_address,
        "subnet_mask": subnet_mask,
        "broadcast_address": broadcast_address,
        "host_pertama": host_pertama,
        "host_terakhir": host_terakhir,
        "interface": interface,
        "nama_pool": nama_pool,
        "excluded_awal": excluded_awal,
        "excluded_akhir": excluded_akhir,
        "rentang_dinamis": rentang_dinamis,
        "jumlah_klien_dinamis": jumlah_klien_dinamis,
        "cli_baris": cli_baris,
        "cli_script": cli_script,
    }

    return StrukturJawaban(
        fitur="dhcp",
        diketahui=diketahui,
        langkah=langkah_list,
        hasil_akhir=hasil_akhir,
        kesimpulan=kesimpulan,
        peringatan=peringatan,
    )


def susun_langkah_konversi(data: Dict[str, Any]) -> StrukturJawaban:
    """
    Menyusun langkah penyelesaian konversi basis sesuai lembar praktikum Modul 2:
    - Biner <-> Desimal dengan tabel bobot bit 128..1
    - Heksadesimal dengan pemisahan 4-bit nibble
    - Oktal dengan pemisahan 3-bit / pembagian berulang
    - Hasil akhir tabel 4 basis dan kesimpulan utuh
    """
    basis_map = {
        2: "Basis 2 (Biner)",
        8: "Basis 8 (Oktal)",
        10: "Basis 10 (Desimal)",
        16: "Basis 16 (Heksadesimal)",
    }
    basis_label = basis_map.get(data["basis_asal"], f"Basis {data['basis_asal']}")

    diketahui = [
        DiketahuiItem(label="Nilai Masukan", nilai=str(data["nilai_input"])),
        DiketahuiItem(label="Basis Asal", nilai=basis_label),
        DiketahuiItem(
            label="Mode Konversi",
            nilai="IPv4 (4 Oktet)" if data["mode_ipv4"] else "Tunggal (1 Oktet / Bilangan)",
        ),
    ]

    langkah_list: List[LangkahItem] = []

    if data["mode_ipv4"]:
        oktet_list = data["oktet_list"]
        # Langkah 1: Pemisahan dan Evaluasi 4 Oktet
        langkah_list.append(
            LangkahItem(
                judul="Pemisahan 4 Oktet IPv4 dan Evaluasi Rentang (0–255)",
                penjelasan=(
                    f"Alamat IPv4 '{data['nilai_input']}' dipisahkan menjadi 4 oktet: "
                    + ", ".join(f"Oktet {o['oktet_ke']} = {o['nilai_asli']} (desimal {o['desimal']})" for o in oktet_list)
                    + ". Setiap oktet dievaluasi berada dalam batas praktikum 0–255 (8-bit)."
                ),
                rumus="IPv4 = Oktet 1 . Oktet 2 . Oktet 3 . Oktet 4",
                tabel={
                    "tipe": "ipv4_oktet_summary",
                    "oktet_list": oktet_list,
                },
                hasil=f"Desimal lengkap: {data['desimal']}",
            )
        )

        # Langkah 2: Konversi Tiap Oktet ke Format 8-Bit Biner
        langkah_list.append(
            LangkahItem(
                judul="Konversi Setiap Oktet ke 8-Bit Biner dan Heksadesimal",
                penjelasan=(
                    "Setiap oktet diubah menjadi representasi biner 8-bit (padding nol di depan jika < 128) "
                    "dan heksadesimal 2 digit."
                ),
                rumus=" . ".join(f"Oktet {o['oktet_ke']}: {o['biner']} ({o['heksadesimal']})" for o in oktet_list),
                tabel={
                    "tipe": "tabel_bit_oktet",
                    "oktet_list": oktet_list,
                },
                hasil=f"Biner lengkap: {data['biner']}",
            )
        )
    else:
        basis_asal = data["basis_asal"]
        desimal = data["desimal"]
        biner = data["biner"]
        heksa = data["heksadesimal"]
        oktal = data["oktal"]
        rumus_penjumlahan = data["rumus_penjumlahan"]
        tabel_bit = data["tabel_bit"]
        bobot_aktif = data["bobot_aktif"]

        if basis_asal == 2:
            # Langkah 1: Pemetaan Bit ke Bobot Posisi 128..1
            langkah_list.append(
                LangkahItem(
                    judul="Petakan Digit Biner ke Bobot Posisi (128 sampai 1) dan Jumlahkan Bit 1",
                    penjelasan=(
                        f"Petakan bit biner '{data['clean_input']}' ke tabel bobot posisi pangkat dua "
                        f"(2^7 sampai 2^0). Bit yang bernilai 1 dijumlahkan untuk memperoleh nilai desimal: "
                        f"{rumus_penjumlahan}."
                    ),
                    rumus=rumus_penjumlahan,
                    tabel={
                        "tipe": "tabel_bit_8",
                        "tabel_bit": tabel_bit,
                        "bobot_aktif": bobot_aktif,
                        "rumus": rumus_penjumlahan,
                        "desimal": desimal,
                    },
                    hasil=f"Nilai desimal = {desimal}",
                )
            )

            # Langkah 2: Konversi ke Heksadesimal (Pemisahan 4-Bit Nibble)
            # Jika 8-bit (1 oktet), tampilkan rincian 2 nibble
            high_nibble = biner[:4] if len(biner) >= 8 else biner
            low_nibble = biner[4:8] if len(biner) >= 8 else ""
            langkah_list.append(
                LangkahItem(
                    judul="Konversi ke Heksadesimal (Pengelompokan 4-Bit / Nibble)",
                    penjelasan=(
                        "Kelompokkan digit biner menjadi kelompok 4-bit (nibble) dari kanan ke kiri. "
                        "Masing-masing kelompok bernilai 0–15 yang dipetakan ke simbol heksadesimal 0–9, A–F."
                        + (f" High nibble '{high_nibble}' dan Low nibble '{low_nibble}'." if low_nibble else "")
                    ),
                    rumus=f"Biner {biner} → Heksadesimal {heksa}",
                    tabel={
                        "tipe": "nibble_split",
                        "high_nibble": high_nibble,
                        "low_nibble": low_nibble,
                        "heksa": heksa,
                    },
                    hasil=f"Nilai heksadesimal = {heksa} (0x{heksa})",
                )
            )

            # Langkah 3: Konversi ke Oktal (Pengelompokan 3-Bit / Pembagian 8)
            langkah_list.append(
                LangkahItem(
                    judul="Konversi ke Oktal (Basis 8)",
                    penjelasan=(
                        f"Konversikan nilai desimal {desimal} ke oktal melalui pembagian berulang dengan 8 "
                        "atau pengelompokan bit biner tiap 3-bit dari kanan ke kiri."
                    ),
                    rumus=f"{desimal} (desimal) = {oktal} (oktal)",
                    tabel={
                        "tipe": "pembagian_berulang",
                        "baris": data["pembagian_oktal"],
                        "basis": 8,
                    },
                    hasil=f"Nilai oktal = {oktal}",
                )
            )

        elif basis_asal == 10:
            # Langkah 1: Pembagian Berulang dengan 2 & Pembuktian Bobot Posisi
            langkah_list.append(
                LangkahItem(
                    judul="Pembagian Berulang dengan 2 untuk Mendapatkan Nilai Biner",
                    penjelasan=(
                        f"Bagi bilangan desimal {desimal} secara berulang dengan 2. Sisa pembagian (0 atau 1) "
                        "dicatat dan dibaca dari hasil terakhir ke paling awal (bawah ke atas). "
                        f"Hasil pembagian diverifikasi menggunakan tabel bobot bit 128 sampai 1: {rumus_penjumlahan}."
                    ),
                    rumus=f"Sisa pembagian berulang dibaca dari bawah ke atas = {biner}",
                    tabel={
                        "tipe": "pembagian_berulang",
                        "baris": data["pembagian_biner"],
                        "basis": 2,
                    },
                    hasil=f"Nilai biner = {biner}",
                )
            )

            # Langkah 2: Konversi ke Heksadesimal (Pembagian Berulang dengan 16)
            langkah_list.append(
                LangkahItem(
                    judul="Konversi ke Heksadesimal lewat Pembagian Berulang dengan 16",
                    penjelasan=(
                        f"Bagi desimal {desimal} dengan 16. Sisa bagi 10–15 dipetakan ke simbol huruf A–F "
                        "(10=A, 11=B, 12=C, 13=D, 14=E, 15=F). Hasil dibaca dari bawah ke atas."
                    ),
                    rumus=f"{desimal} // 16 = ... sisa → {heksa}",
                    tabel={
                        "tipe": "pembagian_berulang",
                        "baris": data["pembagian_heksa"],
                        "basis": 16,
                    },
                    hasil=f"Nilai heksadesimal = {heksa} (0x{heksa})",
                )
            )

            # Langkah 3: Konversi ke Oktal (Pembagian Berulang dengan 8)
            langkah_list.append(
                LangkahItem(
                    judul="Konversi ke Oktal lewat Pembagian Berulang dengan 8",
                    penjelasan=(
                        f"Bagi desimal {desimal} secara berulang dengan 8. Sisa pembagian dibaca dari bawah ke atas."
                    ),
                    rumus=f"{desimal} // 8 = ... sisa → {oktal}",
                    tabel={
                        "tipe": "pembagian_berulang",
                        "baris": data["pembagian_oktal"],
                        "basis": 8,
                    },
                    hasil=f"Nilai oktal = {oktal}",
                )
            )

        elif basis_asal == 16:
            # Langkah 1: Pemetaan Digit Heksadesimal ke 4-Bit Biner (Nibble)
            langkah_list.append(
                LangkahItem(
                    judul="Konversi Tiap Digit Heksadesimal ke 4-Bit Biner (Nibble)",
                    penjelasan=(
                        f"Ubah masing-masing digit heksadesimal '{data['clean_input']}' ke bentuk 4 digit biner. "
                        "Gabungkan kelompok-kelompok nibble tersebut untuk menghasilkan bilangan biner utuh."
                    ),
                    rumus=f"Heksadesimal {heksa} → Biner {biner}",
                    tabel={
                        "tipe": "heksa_to_nibble",
                        "input": data["clean_input"],
                        "biner": biner,
                    },
                    hasil=f"Nilai biner = {biner}",
                )
            )

            # Langkah 2: Hitung Nilai Desimal lewat Tabel Posisi Bit (128 sampai 1)
            langkah_list.append(
                LangkahItem(
                    judul="Hitung Nilai Desimal lewat Tabel Posisi Bit (128 sampai 1)",
                    penjelasan=(
                        f"Petakan digit biner ke tabel bobot posisi 2^7 sampai 2^0, lalu jumlahkan seluruh bobot aktif: "
                        f"{rumus_penjumlahan}."
                    ),
                    rumus=rumus_penjumlahan,
                    tabel={
                        "tipe": "tabel_bit_8",
                        "tabel_bit": tabel_bit,
                        "bobot_aktif": bobot_aktif,
                        "rumus": rumus_penjumlahan,
                        "desimal": desimal,
                    },
                    hasil=f"Nilai desimal = {desimal}",
                )
            )

            # Langkah 3: Konversi ke Oktal
            langkah_list.append(
                LangkahItem(
                    judul="Konversi ke Oktal (Basis 8)",
                    penjelasan=(
                        f"Konversikan nilai desimal {desimal} ke basis 8 lewat pembagian berulang atau pengelompokan "
                        "bit biner per 3-bit dari kanan ke kiri."
                    ),
                    rumus=f"{desimal} (desimal) = {oktal} (oktal)",
                    tabel={
                        "tipe": "pembagian_berulang",
                        "baris": data["pembagian_oktal"],
                        "basis": 8,
                    },
                    hasil=f"Nilai oktal = {oktal}",
                )
            )

        else:  # basis_asal == 8
            # Langkah 1: Konversi Tiap Digit Oktal ke 3-Bit Biner
            langkah_list.append(
                LangkahItem(
                    judul="Konversi Tiap Digit Oktal ke Kelompok 3-Bit Biner",
                    penjelasan=(
                        f"Petakan setiap digit bilangan oktal '{data['clean_input']}' menjadi 3-bit biner "
                        "(bobot 4, 2, 1), lalu gabungkan."
                    ),
                    rumus=f"Oktal {oktal} → Biner {biner}",
                    tabel=None,
                    hasil=f"Nilai biner = {biner}",
                )
            )

            # Langkah 2: Hitung Nilai Desimal lewat Tabel Bobot Bit
            langkah_list.append(
                LangkahItem(
                    judul="Hitung Nilai Desimal lewat Akumulasi Bobot Bit",
                    penjelasan=(
                        f"Jumlahkan nilai bobot posisi biner yang bernilai 1: {rumus_penjumlahan}."
                    ),
                    rumus=rumus_penjumlahan,
                    tabel={
                        "tipe": "tabel_bit_8",
                        "tabel_bit": tabel_bit,
                        "bobot_aktif": bobot_aktif,
                        "rumus": rumus_penjumlahan,
                        "desimal": desimal,
                    },
                    hasil=f"Nilai desimal = {desimal}",
                )
            )

            # Langkah 3: Konversi ke Heksadesimal
            langkah_list.append(
                LangkahItem(
                    judul="Konversi ke Heksadesimal lewat Pengelompokan 4-Bit (Nibble)",
                    penjelasan=(
                        "Kelompokkan digit biner setiap 4-bit dari kanan ke kiri dan konversikan ke simbol heksadesimal."
                    ),
                    rumus=f"Biner {biner} → Heksadesimal {heksa}",
                    tabel={
                        "tipe": "pembagian_berulang",
                        "baris": data["pembagian_heksa"],
                        "basis": 16,
                    },
                    hasil=f"Nilai heksadesimal = {heksa} (0x{heksa})",
                )
            )

    # 4. Tabel Hasil Akhir Rangkuman 4 Basis
    tabel_ringkasan = [
        {
            "no": 1,
            "basis": "Basis 2 (Biner)",
            "notasi": "2",
            "nilai": data["biner"],
            "keterangan": f"{len(data['biner'])} bit" if not data["mode_ipv4"] else "4 oktet x 8-bit",
        },
        {
            "no": 2,
            "basis": "Basis 8 (Oktal)",
            "notasi": "8",
            "nilai": data["oktal"],
            "keterangan": "Kelompok 3 bit",
        },
        {
            "no": 3,
            "basis": "Basis 10 (Desimal)",
            "notasi": "10",
            "nilai": data["desimal"],
            "keterangan": "Rentang 0–255 (1 oktet)" if (not data["mode_ipv4"] and data.get("desimal_int", 0) <= 255) else "Format desimal",
        },
        {
            "no": 4,
            "basis": "Basis 16 (Heksadesimal)",
            "notasi": "16",
            "nilai": f"{data['heksadesimal']} ({data['heksadesimal_prefixed']})",
            "keterangan": "Kelompok 4 bit (nibble)",
        },
    ]

    hasil_akhir = {
        "biner": data["biner"],
        "oktal": data["oktal"],
        "desimal": data["desimal"],
        "heksadesimal": data["heksadesimal"],
        "heksadesimal_prefixed": data["heksadesimal_prefixed"],
        "tabel_bit": data["tabel_bit"],
        "bobot_aktif": data["bobot_aktif"],
        "rumus_penjumlahan": data["rumus_penjumlahan"],
        "pembagian_biner": data["pembagian_biner"],
        "pembagian_oktal": data["pembagian_oktal"],
        "pembagian_heksa": data["pembagian_heksa"],
        "mode_ipv4": data["mode_ipv4"],
        "oktet_list": data.get("oktet_list", []),
        "tabel": tabel_ringkasan,
    }

    # 5. Kesimpulan
    if data["mode_ipv4"]:
        kesimpulan = (
            f"Alamat IPv4 '{data['nilai_input']}' berhasil dikonversi ke semua basis: "
            f"Desimal {data['desimal']}, Biner {data['biner']}, "
            f"Heksadesimal {data['heksadesimal']} ({data['heksadesimal_prefixed']}), dan Oktal {data['oktal']}."
        )
    else:
        bobot_teks = ", ".join(str(w) for w in data["bobot_aktif"]) if data["bobot_aktif"] else "tidak ada"
        kesimpulan = (
            f"Bilangan {data['nilai_input']} ({basis_label}) setara dengan desimal {data['desimal']}, "
            f"heksadesimal {data['heksadesimal']} (0x{data['heksadesimal']}), dan oktal {data['oktal']}. "
            f"Bit aktif pada tabel posisi 8-bit adalah {bobot_teks} dengan total akumulasi {data['desimal']}."
        )

    return StrukturJawaban(
        fitur="konversi",
        diketahui=diketahui,
        langkah=langkah_list,
        hasil_akhir=hasil_akhir,
        kesimpulan=kesimpulan,
        peringatan=data["peringatan"],
    )



