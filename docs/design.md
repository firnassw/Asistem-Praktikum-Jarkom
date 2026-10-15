---
name: Asisten Praktikum Jaringan
description: Alat bantu praktikum Jaringan Komputer yang menyelesaikan subnetting, rencana IP, dan konfigurasi DHCP langkah demi langkah. Tampilannya ceria dan berani dengan blok warna datar, tetapi angka dan langkah tetap menjadi fokus utama.
colors:
  primary: "#FCE76C"
  primary-pressed: "#F2D640"
  secondary: "#8BD0FC"
  tertiary: "#FF8F5C"
  ink: "#1F1E22"
  ink-raised: "#2E2D33"
  on-ink: "#FFFFFF"
  background: "#F5F6F8"
  surface: "#FFFFFF"
  line: "#E3E5EA"
  line-strong: "#8A8F9C"
  text: "#1F1E22"
  text-muted: "#5B5F6B"
  faded: "#D6D9E2"
  secondary-soft: "#E3F4FE"
  primary-soft: "#FFF8D1"
  tertiary-soft: "#FFE6DA"
  subnet-4: "#C9D0E4"
  success: "#16794C"
  success-soft: "#E3F4EA"
  warning: "#8A5A00"
  warning-soft: "#FFF4D6"
  error: "#B3261E"
  error-soft: "#FCE8E6"
typography:
  display-xl:
    fontFamily: "Montserrat"
    fontSize: "40px"
    fontWeight: 800
    lineHeight: "48px"
    letterSpacing: "-0.02em"
  headline-lg:
    fontFamily: "Montserrat"
    fontSize: "28px"
    fontWeight: 800
    lineHeight: "36px"
    letterSpacing: "-0.01em"
  headline-md:
    fontFamily: "Montserrat"
    fontSize: "22px"
    fontWeight: 700
    lineHeight: "30px"
    letterSpacing: "-0.005em"
  title:
    fontFamily: "Montserrat"
    fontSize: "18px"
    fontWeight: 700
    lineHeight: "26px"
    letterSpacing: "0em"
  body-md:
    fontFamily: "Montserrat"
    fontSize: "16px"
    fontWeight: 500
    lineHeight: "26px"
    letterSpacing: "0em"
  body-sm:
    fontFamily: "Montserrat"
    fontSize: "14px"
    fontWeight: 500
    lineHeight: "22px"
    letterSpacing: "0em"
  label:
    fontFamily: "Montserrat"
    fontSize: "14px"
    fontWeight: 700
    lineHeight: "20px"
    letterSpacing: "0.01em"
  label-lg:
    fontFamily: "Montserrat"
    fontSize: "16px"
    fontWeight: 700
    lineHeight: "24px"
    letterSpacing: "0.01em"
  numeral-faded:
    fontFamily: "Montserrat"
    fontSize: "72px"
    fontWeight: 300
    lineHeight: "72px"
    letterSpacing: "-0.03em"
  mono-md:
    fontFamily: "JetBrains Mono"
    fontSize: "15px"
    fontWeight: 500
    lineHeight: "24px"
    letterSpacing: "0em"
  mono-sm:
    fontFamily: "JetBrains Mono"
    fontSize: "13px"
    fontWeight: 500
    lineHeight: "20px"
    letterSpacing: "0em"
rounded:
  none: "0px"
  sm: "6px"
  md: "12px"
  lg: "20px"
  xl: "28px"
  full: "9999px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "16px"
  lg: "24px"
  xl: "32px"
  2xl: "48px"
  3xl: "64px"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.ink}"
    typography: "{typography.label-lg}"
    rounded: "{rounded.md}"
    height: "48px"
    padding: "20px"
  button-primary-pressed:
    backgroundColor: "{colors.primary-pressed}"
    textColor: "{colors.ink}"
    typography: "{typography.label-lg}"
    rounded: "{rounded.md}"
    height: "48px"
    padding: "20px"
  button-secondary:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    typography: "{typography.label-lg}"
    rounded: "{rounded.md}"
    height: "48px"
    padding: "20px"
  input:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.text}"
    typography: "{typography.body-md}"
    rounded: "{rounded.md}"
    height: "48px"
    padding: "14px"
  input-numeric:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.text}"
    typography: "{typography.mono-md}"
    rounded: "{rounded.md}"
    height: "48px"
    padding: "14px"
  helper-text:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.text-muted}"
    typography: "{typography.body-sm}"
  divider:
    backgroundColor: "{colors.line}"
    height: "1px"
  control-border:
    backgroundColor: "{colors.line-strong}"
    height: "2px"
  sidebar:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.on-ink}"
    typography: "{typography.label}"
    width: "264px"
    padding: "16px"
  sidebar-item-hover:
    backgroundColor: "{colors.ink-raised}"
    textColor: "{colors.on-ink}"
    typography: "{typography.label}"
    rounded: "{rounded.md}"
    height: "44px"
    padding: "12px"
  sidebar-item-active:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.ink}"
    typography: "{typography.label}"
    rounded: "{rounded.md}"
    height: "44px"
    padding: "12px"
  page-header-band:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.ink}"
    typography: "{typography.display-xl}"
    rounded: "{rounded.xl}"
    padding: "32px"
  card:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.text}"
    typography: "{typography.body-md}"
    rounded: "{rounded.lg}"
    padding: "24px"
  layer-subnet-1:
    backgroundColor: "{colors.secondary}"
    textColor: "{colors.ink}"
    typography: "{typography.label}"
    rounded: "{rounded.lg}"
  layer-subnet-2:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.ink}"
    typography: "{typography.label}"
    rounded: "{rounded.lg}"
  layer-subnet-3:
    backgroundColor: "{colors.tertiary}"
    textColor: "{colors.ink}"
    typography: "{typography.label}"
    rounded: "{rounded.lg}"
  layer-subnet-4:
    backgroundColor: "{colors.subnet-4}"
    textColor: "{colors.ink}"
    typography: "{typography.label}"
    rounded: "{rounded.lg}"
  numeral-faded:
    textColor: "{colors.faded}"
    typography: "{typography.numeral-faded}"
  step-card:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.text}"
    typography: "{typography.body-md}"
    rounded: "{rounded.lg}"
    padding: "24px"
  step-number:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.on-ink}"
    typography: "{typography.label}"
    rounded: "{rounded.full}"
    size: "32px"
  formula-block:
    backgroundColor: "{colors.background}"
    textColor: "{colors.text}"
    typography: "{typography.mono-md}"
    rounded: "{rounded.md}"
    padding: "16px"
  code-block:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.on-ink}"
    typography: "{typography.mono-sm}"
    rounded: "{rounded.md}"
    padding: "16px"
  table-header:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.on-ink}"
    typography: "{typography.label}"
    rounded: "{rounded.sm}"
    padding: "12px"
  table-cell:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.text}"
    typography: "{typography.mono-sm}"
    padding: "12px"
  row-tint-1:
    backgroundColor: "{colors.secondary-soft}"
    textColor: "{colors.text}"
    typography: "{typography.mono-sm}"
    padding: "12px"
  row-tint-2:
    backgroundColor: "{colors.primary-soft}"
    textColor: "{colors.text}"
    typography: "{typography.mono-sm}"
    padding: "12px"
  row-tint-3:
    backgroundColor: "{colors.tertiary-soft}"
    textColor: "{colors.text}"
    typography: "{typography.mono-sm}"
    padding: "12px"
  conclusion-block:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.ink}"
    typography: "{typography.body-md}"
    rounded: "{rounded.lg}"
    padding: "24px"
  badge-success:
    backgroundColor: "{colors.success-soft}"
    textColor: "{colors.success}"
    typography: "{typography.label}"
    rounded: "{rounded.full}"
    padding: "8px"
  badge-warning:
    backgroundColor: "{colors.warning-soft}"
    textColor: "{colors.warning}"
    typography: "{typography.label}"
    rounded: "{rounded.full}"
    padding: "8px"
  badge-error:
    backgroundColor: "{colors.error-soft}"
    textColor: "{colors.error}"
    typography: "{typography.label}"
    rounded: "{rounded.full}"
    padding: "8px"
  toast:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.on-ink}"
    typography: "{typography.label}"
    rounded: "{rounded.md}"
    padding: "16px"
---

## Overview

Asisten Praktikum Jaringan membantu mahasiswa menyelesaikan hitungan praktikum Jaringan Komputer: subnetting, FLSM dan VLSM, rencana IP dari ruangan dan device, konversi basis, dan konfigurasi DHCP. Hasilnya selalu ditampilkan langkah demi langkah seperti lembar jawaban: Diketahui, Langkah, Hasil, Kesimpulan.

Karakter visual: **ceria, berani, tapi tetap presisi**. Gayanya terinspirasi referensi aplikasi dengan blok warna datar yang besar, kartu bertumpuk dengan blok warna bergeser di belakangnya, angka besar yang pudar, dan judul tebal. Warna dipakai untuk membantu membaca (membedakan subnet), bukan sekadar hiasan. Ini alat belajar, jadi angka, alamat, dan langkah tetap menjadi tokoh utama.

Yang diambil dari referensi hanya gayanya. Maskot, koin, kupon, hadiah, dan elemen permainan tidak dipakai.

Bahasa antarmuka: **Bahasa Indonesia**, kalimat biasa (sentence case), kata kerja aktif, nada ramah tetapi singkat. Istilah mengikuti modul praktikum: NA, BA, subnet mask, host pertama, host terakhir, blok subnet.

Cakupan visual: web responsif (360 px sampai desktop), tema terang. Mode gelap ditunda.

## Colors

Empat warna utama berasal dari referensi: kuning, biru, oranye, dan hitam tinta. Sisanya netral kebiruan dan warna status.

- **Primary (#FCE76C, kuning):** aksi utama (tombol Hitung), item menu aktif, blok kesimpulan, dan header halaman. **Primary pressed (#F2D640)** untuk tombol saat ditekan.
- **Secondary (#8BD0FC, biru)** dan **Tertiary (#FF8F5C, oranye):** warna pembeda subnet dan ruangan, serta aksen kartu.
- **Ink (#1F1E22):** semua teks utama, latar sidebar, header tabel, blok kode, dan nomor langkah. **Ink raised (#2E2D33)** untuk hover di sidebar.
- **Background (#F5F6F8)** latar halaman; **Surface (#FFFFFF)** kartu, input, dan tabel.
- **Line (#E3E5EA)** garis pemisah; **Line strong (#8A8F9C)** batas input dan kontrol (kontras sekitar 3,2:1 terhadap putih).
- **Text muted (#5B5F6B)** keterangan dan label sekunder (sekitar 6:1 pada putih).
- **Soft tints** (biru #E3F4FE, kuning #FFF8D1, oranye #FFE6DA) untuk latar baris tabel yang diberi warna subnet.
- **Status:** success (#16794C), warning (#8A5A00), error (#B3261E), masing-masing dengan latar lembut pasangannya.

### Warna subnet

Setiap subnet atau ruangan mendapat satu warna, dan warna itu konsisten di bar blok alamat, penanda baris tabel, lapisan kartu, dan chip nama ruangan.

| Urutan | Warna |
|---|---|
| 1 | Secondary (biru) |
| 2 | Primary (kuning) |
| 3 | Tertiary (oranye) |
| 4 | Subnet-4 (#C9D0E4) |
| 5 dan seterusnya | Mengulang dari urutan 1 |

Nama ruangan selalu tertulis di samping warnanya. Warna tidak pernah menjadi satu-satunya penanda.

### Aturan kontras

- **Teks di atas kuning, biru, oranye, dan abu-biru selalu memakai ink (#1F1E22)**, tidak pernah putih. Kontras ink terhadap ketiganya sekitar 7:1 atau lebih.
- Tabel angka berada di atas kartu putih, bukan langsung di atas latar berwarna.
- Tombol utama berlatar kuning diberi garis ink 2 px agar batasnya terlihat jelas di atas latar terang.

## Typography

Dua keluarga huruf: **Montserrat** (geometris, tebal) untuk teks dan judul, dan **JetBrains Mono** untuk alamat IP, biner, angka, tabel, dan perintah CLI. Cadangan: system-ui, sans-serif dan ui-monospace, monospace.

| Peran | Token | Pemakaian |
|---|---|---|
| Judul halaman | display-xl | Satu per halaman, di dalam header band |
| Judul bagian | headline-lg, headline-md | Diketahui, Langkah, Hasil, Kesimpulan |
| Judul langkah | title | Judul kartu langkah |
| Teks isi | body-md, body-sm | Penjelasan, keterangan, bantuan field |
| Label dan tombol | label, label-lg | Tombol, label field, header tabel |
| Angka pudar | numeral-faded | Prefix besar (misalnya /26) di belakang kartu subnet |
| Angka dan kode | mono-md, mono-sm | Input numerik, sel tabel, blok kode |

Aturan:

- Semua angka hitungan memakai monospace dan rata kanan di tabel agar digit sejajar.
- Angka pudar bersifat dekoratif: tidak dibaca pembaca layar (aria-hidden) dan informasinya selalu ada juga sebagai teks biasa.
- Rumus dirender dengan KaTeX atau blok monospace di tengah, lebih besar sedikit dari teks isi.
- Panjang baris teks isi maksimal 75 karakter.
- Kesimpulan ditulis sebagai kalimat utuh Bahasa Indonesia.

## Layout

Grid berbasis kelipatan 4 px. Skala spasi: 4, 8, 16, 24, 32, 48, 64.

**Desktop (1024 px ke atas):**

- Sidebar tetap di kiri (264 px, latar ink): Beranda, Subnetting, FLSM dan VLSM, Rencana ruangan, Konversi basis, Generator DHCP, Tabel IP, Tentang. Item aktif berlatar kuning dengan teks ink.
- Di atas area kerja ada **header band** kuning bersudut besar berisi judul halaman dan satu kalimat penjelasan.
- Di bawahnya dua kolom: formulir di kiri (sekitar 5/12), hasil di kanan (sekitar 7/12). Hasil bergulir sendiri, formulir tetap terlihat.
- Lebar maksimal konten sekitar 1280 px, rata kiri.

**Tablet (640 sampai 1023 px):** sidebar menjadi menu yang bisa dibuka; formulir di atas, hasil di bawah.

**Mobile (360 sampai 639 px):** satu kolom, bar atas dengan nama halaman, dan bar tab bawah berisi empat tujuan utama (Beranda, Subnet, Rencana, Lainnya). Tombol Hitung melekat di bawah saat formulir panjang. Tabel lebar digulir ke samping di dalam wadahnya sendiri; halaman tidak boleh bergulir ke samping.

Urutan hasil (sama untuk semua fitur):

1. Ringkasan hasil dengan bar blok alamat berwarna.
2. Diketahui.
3. Kartu langkah 1 sampai N.
4. Hasil akhir (tabel di kartu putih).
5. Kesimpulan (blok kuning).

Beranda berisi header band, satu kalimat penjelasan, tombol Coba contoh, lalu kartu fitur dalam grid. Tiap kartu fitur memuat nama, deskripsi satu baris, dan contoh input dalam monospace. Tidak ada statistik, testimoni, atau jumlah pengguna.

## Screen Layouts

Rangka dasar dan susunan tiap halaman. Ukuran memakai kelipatan 4 px dan token spasi di atas.

### Rangka halaman (desktop 1440 px)

| Elemen | Ukuran |
|---|---|
| Sidebar | Lebar 264 px, tinggi penuh, menempel di kiri |
| Area konten | Padding 32 px, lebar maksimal 1280 px |
| Header band | Tinggi sekitar 160 px, sudut xl, judul display-xl dan satu kalimat penjelasan |
| Jarak header ke isi | 24 px |
| Kolom formulir | 5 dari 12 kolom, menempel (sticky) 24 px dari atas |
| Kolom hasil | 7 dari 12 kolom, jarak antar kartu 16 px, jarak antar bagian 24 px |
| Jarak antar kolom | 24 px |

### Beranda

```
┌─────────┬──────────────────────────────────────────────────┐
│ SIDEBAR │ HEADER BAND (kuning)                              │
│ (ink)   │  Selesaikan hitungan jaringan, langkah demi langkah│
│         │  Satu kalimat penjelasan        [Coba contoh]      │
│ Beranda ├──────────────────────────────────────────────────┤
│ Subnet  │ ┌───────────┐ ┌───────────┐ ┌───────────┐         │
│ FLSM    │ │ Analisis  │ │ FLSM dan  │ │ Rencana   │  baris 1 │
│ Rencana │ │ subnet    │ │ VLSM      │ │ ruangan   │         │
│ Konversi│ │ 192.168.. │ │ 3 ruangan │ │ NIM 50    │         │
│ DHCP    │ └───────────┘ └───────────┘ └───────────┘         │
│ Tabel IP│ ┌───────────┐ ┌───────────┐ ┌───────────┐         │
│ Tentang │ │ Konversi  │ │ Generator │ │ Tabel IP  │  baris 2 │
│         │ │ basis     │ │ DHCP      │ │ perangkat │         │
└─────────┴─┴───────────┴─┴───────────┴─┴───────────┴─────────┘
```

Kartu fitur: nama (title), deskripsi satu baris, contoh input dalam monospace. Lapisan warna di belakang kartu bergantian biru, kuning, oranye. Grid 3 kolom di desktop, 2 di tablet, 1 di mobile.

### Halaman fitur (kerangka umum)

Dipakai oleh Subnetting, FLSM dan VLSM, Konversi basis, Generator DHCP, dan Tabel IP.

```
┌─────────┬──────────────────────────────────────────────────┐
│ SIDEBAR │ HEADER BAND: judul halaman + satu kalimat          │
│         ├───────────────────────┬──────────────────────────┤
│         │ KARTU FORMULIR (5/12) │ HASIL (7/12)              │
│         │  Label                │  1. Ringkasan + bar blok  │
│         │  [ field ]            │  2. Diketahui             │
│         │  Label                │  3. Kartu langkah 1..N    │
│         │  [ field ]            │  4. Hasil akhir (tabel)   │
│         │                       │  5. Kesimpulan (kuning)   │
│         │  [Hitung]             │  [Salin tabel] [Cetak]    │
│         │  [Isi contoh]         │                           │
└─────────┴───────────────────────┴──────────────────────────┘
```

Formulir menempel saat hasil panjang digulir. Tombol Hitung (primary) di atas Isi contoh (secondary), lebar penuh kartu.

### Rencana ruangan

```
FORMULIR                              HASIL
┌─────────────────────────────┐      ┌──────────────────────────────────────┐
│ Dua digit terakhir NIM [50] │      │ RINGKASAN: 5 subnet, 180 dari 256     │
│ chip: IP Global 192.168.50.0/24│   │ alamat terpakai                       │
│                             │      │ [biru|kuning|oranye|abu|biru|sisa]    │
│ Jumlah ruangan  [-] 5 [+]   │      ├──────────────────────────────────────┤
│ ┌─────────────────────────┐ │      │ BANNER PERINGATAN gateway (jika beda) │
│ │■ Lab Basis Data   [60] x│ │      ├──────────────────────────────────────┤
│ │■ Lab PPSI         [34] x│ │      │ Tab: Tanpa gateway | Dengan gateway   │
│ │■ Ruang Dosen      [30] x│ │      │ Tab: VLSM | FLSM                      │
│ │■ Ruang Seminar    [ 8] x│ │      ├──────────────────────────────────────┤
│ │■ Server           [ 1] x│ │      │ TABEL (kartu putih, header ink)       │
│ └─────────────────────────┘ │      │ Ruangan|Device|Prefix|Subnet|Host..|BA │
│ [Samakan semua]             │      ├──────────────────────────────────────┤
│ Gateway (toggle) [ ]        │      │ KARTU LANGKAH 1: Urutkan kebutuhan    │
│ Cadangan  [0] %             │      │ KARTU LANGKAH 2: Tentukan prefix      │
│ Mode: (VLSM) | FLSM         │      │ KARTU LANGKAH 3: Alokasikan blok      │
│ [Hitung]   [Isi contoh]     │      ├──────────────────────────────────────┤
└─────────────────────────────┘      │ KESIMPULAN (blok kuning) [Salin]      │
                                     └──────────────────────────────────────┘
```

Penanda warna di sisi kiri tiap baris ruangan sama dengan warna subnet di hasil. Tab perbandingan hanya muncul jika kedua hasil berbeda.

### Subnetting (analisis satu IP)

```
FORMULIR                       HASIL
IP address [192.168.0.5]       Ringkasan: NA 192.168.0.0, BA 192.168.0.31
Masukan: (Prefix)|Subnet mask  Langkah 1: IP dan mask dalam biner (dua warna)
Prefix [/27]                   Langkah 2: NA = IP AND mask
[Hitung]  [Isi contoh]         Langkah 3: Invers mask
                               Langkah 4: BA = NA OR invers mask
                               Langkah 5: Jumlah subnet, host, blok
                               Tabel semua subnet (8 baris)
                               Kesimpulan
```

### Generator DHCP

```
FORMULIR                        HASIL
IP router [192.168.10.1]        ┌ Klien pertama mendapat 192.168.10.6 ┐ (kartu kuning)
Prefix [/24]                    BLOK KODE (ink) dengan dua kolom:
Interface [fastEthernet0/0]       perintah CLI        | penjelasan singkat
Nama pool [dhcp_server]           [Salin]
Excluded awal [..1] akhir [..5] Catatan: mengikuti contoh Modul 3
[Buat konfigurasi] [Isi contoh] Tabel IP perangkat (opsional)
```

### Konversi basis dan Tabel IP

- **Konversi basis:** formulir (nilai, basis asal); hasil berupa tiga kartu nilai (biner, desimal, heksa) dan tabel bit 128 sampai 1 dengan bit bernyala diberi warna kuning, lalu langkah pembagian.
- **Tabel IP:** formulir berupa baris perangkat yang bisa ditambah (nama, IP, mask, gateway, DNS, static atau DHCP); hasil berupa satu tabel siap salin dan cetak.

### Tentang

Satu kolom selebar 720 px di bawah header band: cara memakai, rujukan modul, dan keterbatasan (hasil belum diverifikasi di semua versi Packet Tracer). Tanpa grid kartu.

### Mobile (390 px)

```
┌──────────────────────┐
│ Bar atas: ☰  Judul   │
├──────────────────────┤
│ HEADER BAND (120 px) │
├──────────────────────┤
│ KARTU FORMULIR       │
│  field satu kolom    │
├──────────────────────┤
│ HASIL                │
│  ringkasan           │
│  tabel (gulir ke     │
│  samping di dalam    │
│  wadahnya)           │
│  kartu langkah       │
│  kesimpulan          │
├──────────────────────┤
│ [ Hitung ] melekat   │
├──────────────────────┤
│ Beranda Subnet Rencana Lainnya │
└──────────────────────┘
```

Tombol Hitung melekat di atas bar tab saat formulir panjang. Tab Lainnya membuka daftar fitur sisanya. Padding halaman 16 px.

### Tablet (768 px)

Sidebar menjadi menu yang dibuka lewat ikon; formulir di atas dan hasil di bawah dengan lebar penuh; grid fitur di Beranda 2 kolom.

## Elevation & Depth

Kedalaman dibentuk oleh **lapisan warna bergeser**, bukan bayangan blur. Kartu putih diletakkan di atas blok warna dengan geseran sekitar 8 px ke kanan dan ke bawah, seperti referensi.

- **Kartu subnet dan kartu langkah:** lapisan di belakangnya berwarna sesuai warna subnet (biru, kuning, oranye, atau abu-biru).
- **Kartu biasa (formulir, tabel):** tanpa lapisan; cukup garis 1 px line di atas latar background.
- **Dialog, menu, toast:** satu-satunya yang memakai bayangan lembut.
- **Fokus keyboard:** cincin ink 3 px dengan jarak 2 px, terlihat di semua kontrol.

Bar blok alamat: satu bar horizontal bersudut bulat, tiap subnet satu segmen berwarna dengan label nama dan prefix, ditambah segmen abu-abu terang untuk sisa ruang.

## Shapes

Bentuk membulat besar, bertingkat sesuai hierarki.

- **sm (6 px):** sel dan header tabel.
- **md (12 px):** tombol, input, blok rumus, blok kode.
- **lg (20 px):** kartu, kartu langkah, blok kesimpulan, lapisan warna.
- **xl (28 px):** header band.
- **full:** nomor langkah, chip, dan badge.

## Components

**Tombol.** Primary: latar kuning, teks ink, garis ink 2 px, tinggi 48 px; hanya satu per tampilan (Hitung). Secondary: latar putih, teks ink, garis ink 2 px, untuk Isi contoh, Salin, dan Cetak. Saat permintaan berjalan, tombol nonaktif dan menampilkan indikator.

**Input.** Label selalu terlihat di atas field. Batas line strong 2 px; saat fokus cincin ink; saat error batas dan pesan berwarna error disertai ikon. Input numerik memakai monospace dan rata kanan. Stepper jumlah ruangan berupa tombol plus dan minus besar di kiri dan kanan angka.

**Baris ruangan.** Baris yang bisa diedit (nama dan jumlah device) dengan penanda warna subnet di sisi kiri dan tombol hapus berikon beserta label.

**Kartu subnet.** Kartu putih di atas lapisan warna subnet, berisi nama ruangan sebagai judul, angka pudar prefix di sudut (misalnya /26), alamat subnet, rentang host, dan BA dalam monospace.

**Kartu langkah.** Nomor langkah dalam lingkaran ink, judul langkah, satu kalimat penjelasan, blok rumus atau biner, tabel bila ada, dan baris hasil. Kartu tersusun vertikal dengan garis tipis penghubung.

**Biner dua warna.** Pada langkah biner, bit jaringan dan bit host memakai dua warna latar berbeda (biru dan kuning) dengan legenda singkat.

**Tabel hasil.** Header ink dengan teks putih dan menempel saat digulir; baris bergaris line; angka monospace rata kanan; penanda warna subnet di sel pertama dan nama ruangan tetap tertulis.

**Blok kode.** Latar ink, teks putih, tombol Salin di sudut, dan penjelasan singkat per baris perintah di kolom kedua yang lebih redup.

**Badge dan banner.** Pil dengan ikon dan teks: Benar, Peringatan, Error. Banner peringatan di atas hasil (latar warning soft); hasil tetap tampil di bawahnya.

**Blok kesimpulan.** Latar kuning, teks ink, kalimat utuh, tombol salin.

**State.**

| State | Tampilan |
|---|---|
| Kosong | Petunjuk satu kalimat dan tombol Isi contoh |
| Loading | Skeleton kartu dan tabel; tombol Hitung nonaktif |
| Error input | Pesan di bawah field; isian lain tidak terhapus |
| Error server | Banner error: apa yang gagal dan apa yang bisa dilakukan |
| Peringatan | Banner di atas hasil; hasil tetap tampil |

**Cetak.** Sidebar, tombol, dan lapisan warna bergeser disembunyikan; satu kolom, latar putih, penanda warna tetap sebagai teks atau pola agar terbaca di hitam putih.

## Motion

Gerakan singkat dan jelas, hanya sebagai respons aksi: hasil muncul setelah Hitung (di bawah 250 ms), kartu langkah masuk berurutan dengan jeda kecil, tombol turun 2 px saat ditekan. Tidak ada animasi berulang atau dekoratif. Hormati pengaturan reduced motion.

## Accessibility

- Kontras teks minimal WCAG AA; kontrol dan batas input minimal 3:1.
- Teks di atas warna latar selalu ink; tidak ada teks putih di atas kuning, biru, atau oranye.
- Semua kontrol dapat dijangkau dengan keyboard, urutan tab mengikuti urutan visual, fokus selalu terlihat.
- Setiap input punya label terhubung; pesan error terhubung ke field dan diumumkan pembaca layar.
- Warna subnet tidak pernah menjadi satu-satunya penanda; selalu ada nama atau teks.
- Angka pudar dekoratif dan tidak dibaca pembaca layar.
- Area sentuh minimal 44 px di mobile; tata letak tetap berfungsi pada zoom 200%.

## Do's and Don'ts

**Do**

- Pakai satu tombol primary kuning per tampilan.
- Beri setiap subnet satu warna dan pakai konsisten di bar, tabel, kartu, dan chip.
- Tampilkan angka dalam monospace dan rata kanan di tabel.
- Susun hasil dengan urutan tetap: ringkasan, diketahui, langkah, hasil akhir, kesimpulan.
- Gunakan lapisan warna bergeser untuk kedalaman, bukan bayangan blur.
- Tulis pesan error yang menyebut apa yang salah dan cara memperbaikinya.

**Don't**

- Jangan memakai maskot, ilustrasi dekoratif, koin, kupon, atau elemen permainan dari referensi.
- Jangan menampilkan angka statistik, jumlah pengguna, atau riwayat palsu.
- Jangan menaruh teks putih di atas kuning, biru, atau oranye.
- Jangan menaruh tabel padat langsung di atas latar berwarna.
- Jangan memakai warna sebagai satu-satunya penanda subnet atau status.
- Jangan membuat tombol yang hanya dekorasi.
- Jangan membuat halaman bergulir ke samping; hanya tabel yang bergulir di wadahnya.
