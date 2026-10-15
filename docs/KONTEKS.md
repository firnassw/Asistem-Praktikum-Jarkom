# Konteks Proyek: Asisten Praktikum Jaringan

Dokumen ini adalah konteks awal untuk AI/agen yang mengerjakan proyek ini. Baca seluruhnya sebelum menulis kode. Jika ada yang bertentangan dengan `docs/PRD.md`, **PRD yang berlaku**; untuk tampilan, `docs/DESIGN.md` yang berlaku.

## 1. Proyek ini apa

Aplikasi web untuk mahasiswa yang mengerjakan praktikum Jaringan Komputer (Cisco Packet Tracer). Pengguna memasukkan data soal, lalu aplikasi menghitung dan menampilkan hasilnya **langkah demi langkah seperti lembar jawaban ujian**, mengikuti urutan di Modul Praktikum Jaringan Komputer (Modul 2, 3, 4; Prodi Informatika UPN "Veteran" Yogyakarta).

- Nama produk: Asisten Praktikum Jaringan (nama sementara).
- Cakupan: **hanya modul Jaringan**. SPK dan Statistika sudah dikeluarkan. Blueprint dan Product Brief lama masih menyebutnya dan sebagian sudah usang; abaikan.
- Pengguna: mahasiswa di lab (laptop) dan di jalan (ponsel). Mereka butuh jawaban cepat, jelas, dan bisa disalin ke Packet Tracer atau laporan.
- Status: **belum ada kode.** Yang ada hanya dokumen (PRD v2.0, DESIGN.md) dan desain di Stitch.

## 2. Fitur (rilis)

| Rilis | Isi |
|---|---|
| v1.0 (dibangun sekarang) | Subnetting satu IP, FLSM, VLSM, rencana ruangan dan device, IP Global dari NIM, konversi basis, generator DHCP, tabel IP perangkat, cetak |
| v1.1 (belum) | Panduan Packet Tracer (klik dan CLI), server web dan DNS, access point, latihan dan periksa, draf laporan |
| v1.2 (belum) | Routing, OSPF, VLAN, Mikrotik (menunggu modul), diagram topologi, IPv6 dasar |

Kerjakan hanya slice yang diminta. Jangan membuat fitur, file kosong, atau halaman untuk rilis lain.

## 3. Prinsip yang tidak boleh dilanggar

1. **Hitungan deterministik tanpa AI.** Jangan memakai AI atau API eksternal untuk menghitung.
2. **Hanya bilangan bulat.** Tanpa float dan tanpa `log2` desimal; pakai operasi bit.
3. **Hasil harus benar dan bisa diuji.** Alat belajar yang salah lebih buruk daripada tidak ada. Setiap fitur diuji dengan data uji di PRD Lampiran D.
4. **Jujur.** Tidak ada angka, statistik, riwayat, atau teks karangan. Jika asumsi dilanggar, tampilkan peringatan, jangan sembunyikan hasil.
5. **Seragam.** Semua fitur memakai satu struktur jawaban dan satu renderer.
6. **Modular.** Fitur baru tidak boleh mengubah fitur lain.
7. **Bahasa Indonesia** untuk semua teks antarmuka, dengan istilah modul: NA (network address), BA (broadcast), subnet mask, host pertama, host terakhir, blok subnet. Pakai hanya teks dari PRD, DESIGN.md, dan prompt; jika butuh teks baru, tanyakan.

## 4. Tech stack

| Lapisan | Teknologi |
|---|---|
| Frontend | React + TypeScript + Vite |
| Styling | Tailwind CSS, tema dari token `docs/DESIGN.md` |
| Font | Montserrat (teks), JetBrains Mono (angka, IP, biner, kode) |
| Backend | Python + FastAPI + Pydantic |
| Hitungan | Python murni, bilangan bulat |
| Tes | pytest (backend), Vitest (frontend) |
| Penyimpanan | Tanpa database di v1.0 (riwayat v1.1 hanya di localStorage browser) |
| Cetak | CSS print bawaan browser |
| Desain | Google Stitch (diakses lewat Stitch MCP) + `docs/DESIGN.md` |

Jangan menambah dependensi tanpa alasan; sebutkan alasannya jika menambah.

## 5. Struktur repositori

```
frontend/src/
  components/   StepCard, ResultTable, AddressBar, Banner, CodeBlock, ...
  pages/        Beranda, Subnetting, FLSM-VLSM, Rencana, Konversi, DHCP, TabelIP, Tentang
  services/     API client
  types/        tipe struktur jawaban
backend/app/
  main.py
  core/         skema jawaban, registry modul, format error
  modules/jaringan/   solver.py, steps.py, schemas.py
backend/tests/  kasus uji dari PRD Lampiran D
docs/           PRD.md, DESIGN.md, KONTEKS.md, design/ (referensi dari Stitch)
```

Tiap fitur mendaftar ke **registry** (nama, skema input, fungsi solver). Pisahkan **solver** (menghasilkan angka) dari **steps** (menyusun langkah), dan uji keduanya terpisah.

## 6. Cara kerja

```
Browser (React): formulir + validasi ringan
  -> POST /api/jaringan/<fitur>  (JSON)
  -> FastAPI + Pydantic: validasi ketat, error berkode bila salah
  -> solver: hitung (bilangan bulat)
  -> steps: susun langkah
  -> respons struktur jawaban seragam
  -> StepRenderer: kartu langkah, tabel, bar blok alamat, blok kesimpulan
```

Struktur jawaban (semua fitur):

```json
{
  "fitur": "vlsm",
  "diketahui": [{"label": "Induk", "nilai": "192.168.64.0/24"}],
  "langkah": [{"judul": "...", "penjelasan": "...", "tabel": null, "hasil": "..."}],
  "hasil_akhir": {"tabel": []},
  "kesimpulan": "Satu sampai tiga kalimat Bahasa Indonesia.",
  "peringatan": []
}
```

Format error: `{"kode": "IP_TIDAK_VALID", "pesan": "<Bahasa Indonesia, apa yang salah dan cara memperbaiki>", "field": "alamat_ip"}`. Daftar kode dan pesan ada di PRD Lampiran B.

Endpoint v1.0: `GET /api/health`, `GET /api/modul`, `POST /api/jaringan/subnet`, `/flsm`, `/vlsm`, `/rencana`, `/konversi`, `/dhcp`, `/tabel-ip`. Field input dan output ada di PRD Lampiran A.

## 7. Aturan hitung yang sering salah

| Hal | Aturan |
|---|---|
| NA dan BA | NA = IP AND mask; BA = NA OR invers mask (urutan langkah mengikuti Modul 2) |
| Host per subnet | 2^y - 2; NA dan BA tidak dipakai host; host valid = NA + 1 sampai BA - 1 |
| Prefix dari kebutuhan host | `prefix = 32 - (host + 1).bit_length()`. Contoh: 60 host menjadi /26, 64 host menjadi /25 (karena /26 hanya memuat 62), 30 host menjadi /27, 1 host menjadi /30 |
| Jumlah subnet | 2^x, x = bit yang dipinjam dari prefix default kelas (A /8, B /16, C /24) pada analisis satu IP; dari prefix induk pada FLSM dan rencana |
| VLSM | Urutkan dari kebutuhan terbesar (stabil untuk yang sama); blok berurutan dan sejajar dengan ukurannya; yang tidak muat ditandai Tidak muat plus peringatan `VLSM_RUANG_KURANG` |
| FLSM | `p = 32 - (host_terbesar + 1).bit_length()`; subnet tersedia = 2^(p - prefix_induk). Jika kurang dari jumlah kebutuhan: error `FLSM_TIDAK_MUNGKIN` dengan saran induk `/(p - (n - 1).bit_length())`. Opsi `gaya_modul` (default mati) tetap menghasilkan subnet berurutan melewati induk dengan peringatan `MELEWATI_INDUK`. Sisa subnet ditandai Cadangan |
| Gateway | **Default tidak dihitung** (mengikuti Modul 2). Jika aktif: +1 host per ruangan, usulan gateway = host pertama. Jika prefix berbeda antara dengan dan tanpa gateway, tampilkan keduanya plus peringatan `GATEWAY_MEMBEDAKAN_HASIL` |
| Cadangan | `ceil(device * persen / 100)` dengan integer; default 0 |
| IP Global dari NIM | `192.168.XX.0/24`, XX = dua digit terakhir NIM (00 sampai 99), nol di depan dibuang |
| DHCP | Nama pool default `dhcp_server`; klien pertama = excluded akhir + 1; excluded harus dalam jaringan |
| /31 dan /32 | Modul menyebut keduanya tidak dipakai. Analisis tetap dihitung dengan catatan `PREFIX_31_32`; rencana dan VLSM memakai minimum /30 |
| Format alamat | IPv4 titik-desimal, tanpa nol di depan, prefix 0 sampai 32 |
| Batas input | Maksimal 20 ruangan atau kebutuhan, nama 1 sampai 30 karakter dan unik, maksimal 50 perangkat di tabel IP, maksimal 256 baris daftar subnet |

## 8. Data uji emas (ringkasan; lengkap di PRD Lampiran D)

Semua dihitung manual dan **belum dijalankan terhadap kode**. Jika kode dan data uji berbeda, periksa hitungan manual dulu sebelum mengubah kode, lalu laporkan.

| ID | Input | Hasil kunci |
|---|---|---|
| G-JAR-01 | 192.168.0.5 dan 255.255.255.224 | NA 192.168.0.0; BA 192.168.0.31 |
| G-JAR-02 | 192.168.0.5 /27 | 8 subnet, 30 host, blok 32; subnet pertama host .1 sampai .30 |
| G-JAR-04 | VLSM, induk 192.168.64.0/24; 64, 24, 8 host | 192.168.64.0/25; 192.168.64.128/27; 192.168.64.160/28 |
| G-JAR-05 | FLSM, kebutuhan yang sama pada /24 | Ditolak `FLSM_TIDAK_MUNGKIN`, saran induk /23 |
| G-JAR-06 | NIM 50; 60, 34, 30, 8, 1 device; tanpa gateway | /26, /26, /27, /28, /30 mulai dari 192.168.50.0 |
| G-JAR-07 | Data G-JAR-06 dengan gateway | Ruang Dosen menjadi /26; peringatan gateway |
| G-JAR-08 | Router 192.168.10.1/24; excluded .1 sampai .5 | Klien pertama 192.168.10.6 |

## 9. Hal yang belum diputuskan (jangan memutuskan sendiri)

- Apakah dosen menghitung gateway sebagai kebutuhan host (default: tidak, ada opsi).
- Segmen server di latihan Modul 4: berapa host-nya (asumsi: 1 device).
- Apakah FLSM yang melampaui induk (gaya modul) dianggap benar oleh dosen.
- Apakah /31 dan /32 dianggap tidak valid atau sekadar tidak dipakai.
- Pilihan hosting dan nama produk final.

Jika sebuah tugas bergantung pada salah satunya, **tanyakan**, jangan menebak.

## 10. Modul punya inkonsistensi (waspada saat memakai contoh dari modul)

- Alamat contoh 192.168.64.0 di teks, tetapi 192.128.64.0 di gambar.
- Blok subnet ditulis "255 - mask = 32" padahal hasilnya 31; pakai `256 - nilai oktet mask`.
- Contoh FLSM memakai 3 subnet /25 dari induk /24, padahal /24 hanya memuat 2.

Kunci uji dari modul diperiksa ulang sebelum dipakai.

## 11. Tampilan (ringkas; sumber: `docs/DESIGN.md` dan `docs/design/`)

- Referensi tampilan diambil lewat **Stitch MCP** dan disimpan di `docs/design/`. Jangan berasumsi nama tool MCP; temukan yang setara. Jika pemanggilan MCP gagal, berhenti dan laporkan, jangan mengarang isi layar.
- HTML dari Stitch adalah **referensi, bukan kode untuk disalin.** Porting ke komponen React dengan token tema dari DESIGN.md. Buang teks karangan Stitch (misalnya nama versi, tips, atau label dokumentasi). Jika Stitch dan DESIGN.md berbeda, DESIGN.md yang berlaku; jika Stitch dan PRD berbeda, PRD yang berlaku.
- Warna: kuning #FCE76C (aksi utama), biru #8BD0FC, oranye #FF8F5C, ink #1F1E22. **Teks di atas kuning, biru, dan oranye selalu gelap, tidak pernah putih.** Tabel angka berada di kartu putih.
- Warna subnet (urutan): biru, kuning, oranye, #C9D0E4, lalu mengulang. Nama ruangan selalu tertulis di samping warnanya.
- Satu tombol primary per tampilan. Tidak ada maskot, ilustrasi dekoratif, koin, atau angka statistik.
- Urutan hasil selalu: Ringkasan, Diketahui, Langkah, Hasil akhir (tabel), Kesimpulan.
- Desktop: sidebar ink 264 px dan dua kolom (formulir 5/12, hasil 7/12). Mobile: satu kolom, bar tab bawah, tabel menggulir di wadahnya sendiri; halaman tidak boleh bergulir ke samping.

## 12. Cara bekerja

1. Satu slice per sesi. Slice v1.0: 0 Fondasi, 1 Renderer langkah, 2 Subnetting, 3 Konversi, 4 VLSM, 5A FLSM, 5B Rencana ruangan, 6 DHCP dan tabel IP, 7 Finalisasi.
2. Sebelum menulis kode: baca bagian PRD yang disebut di tugas, dan cek data uji untuk slice itu.
3. Tulis tes dari data uji lebih dulu atau bersamaan dengan kode.
4. Selesai jika semua tes (baru dan lama) lolos, input tidak valid menghasilkan pesan jelas tanpa crash, dan tampilan rapi di 360 px dan 1440 px.
5. Di akhir: ringkas file yang diubah, layar Stitch yang dipakai, dan cara menjalankan; lalu commit tersendiri.
6. Jika implementasi harus menyimpang dari PRD, hentikan dan tanyakan; jangan diam-diam mengubah.

## 13. Keterbatasan yang perlu diingat

- Perintah CLI mengikuti contoh modul dan belum diuji di semua versi Packet Tracer atau IOS; tandai sebagai belum terverifikasi.
- Aplikasi tidak menggantikan Packet Tracer dan tidak mengirim konfigurasi ke perangkat.
- Routing, OSPF, VLAN, dan Mikrotik belum bisa dibuat karena modulnya belum tersedia.
- Tanpa akun dan tanpa database; NIM hanya dua digit terakhir dan tidak disimpan.
