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

