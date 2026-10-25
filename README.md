<div align="center">

  <img src="frontend/public/logo.png" alt="Asisten Praktikum Jaringan Logo" width="480"/>

  <p align="center">
    <strong>Alat bantu praktikum Jaringan Komputer mandiri langkah demi langkah — deterministik, presisi tanpa AI, dan siap salin/cetak untuk Cisco Packet Tracer.</strong>
  </p>

  <p align="center">
    <a href="#fitur-utama">Fitur Utama</a> •
    <a href="#arsitektur--tech-stack">Tech Stack</a> •
    <a href="#instalasi--menjalankan-aplikasi">Panduan Memulai</a> •
    <a href="#pengujian-testing">Pengujian</a> •
    <a href="#struktur-repositori">Struktur Repositori</a>
  </p>

  <p align="center">
    <img src="https://img.shields.io/badge/Python-3.12-3776AB?style=flat&logo=python&logoColor=white" alt="Python 3.12"/>
    <img src="https://img.shields.io/badge/FastAPI-0.110+-009688?style=flat&logo=fastapi&logoColor=white" alt="FastAPI"/>
    <img src="https://img.shields.io/badge/React-19-61DAFB?style=flat&logo=react&logoColor=black" alt="React 19"/>
    <img src="https://img.shields.io/badge/TypeScript-5.0+-3178C6?style=flat&logo=typescript&logoColor=white" alt="TypeScript"/>
    <img src="https://img.shields.io/badge/TailwindCSS-v4-38B2AC?style=flat&logo=tailwind-css&logoColor=white" alt="Tailwind CSS"/>
    <img src="https://img.shields.io/badge/Vite-8.3-646CFF?style=flat&logo=vite&logoColor=white" alt="Vite"/>
    <img src="https://img.shields.io/badge/Tests-116%20Passing-16794C?style=flat&logo=checkmarx&logoColor=white" alt="116 Tests Passing"/>
  </p>

</div>

---

## 📌 Tentang Proyek

**Asisten Praktikum Jaringan (APJ)** adalah aplikasi web yang dirancang khusus untuk mahasiswa yang sedang menempuh mata kuliah praktikum Jaringan Komputer (khususnya praktikum menggunakan simulasi **Cisco Packet Tracer**).

Aplikasi ini memecahkan berbagai perhitungan konfigurasi jaringan dan menyajikannya **langkah demi langkah seperti lembar jawaban ujian/responsi lab**, mengikuti format dan terminologi standar di Modul Praktikum Jaringan Komputer:
* **Modul 2**: Konfigurasi Dasar Jaringan & Subnetting CIDR
* **Modul 3**: Jaringan Nirkabel, Access Point & Konfigurasi DHCP Router
* **Modul 4**: Server Web dan Domain Name System (DNS)

### 7 Prinsip Utama Sistem
1. **Deterministik Tanpa AI**: Semua hitungan matematika bit dieksekusi dengan logika deterministik murni tanpa menggunakan LLM atau API eksternal.
2. **Hanya Bilangan Bulat**: Dihitung murni menggunakan operasi bitwise integer (`&`, `|`, `~`, `<<`, `>>`) tanpa pembulatan desimal `float`.
3. **Hasil Terverifikasi & Lolos Data Uji Emas**: Seluruh rumus diuji dan dicocokkan 100% terhadap kunci jawaban Data Uji Emas Modul (`G-JAR-01` sampai `G-JAR-12`).
4. **Jujur Tanpa Simulasi Palsu**: Tidak menampilkan output karangan. Jika parameter tidak ideal (mis. IP bentrok atau gateway di luar subnet), sistem menampilkan kartu peringatan transparan.
5. **Struktur Jawaban Seragam**: Seluruh fitur menyajikan struktur konsisten: *Diketahui*, *Kartu Langkah*, *Tabel Hasil Akhir*, dan *Kesimpulan*.
6. **Modular (Feature Registry)**: Modul-modul baru terdaftar via registry independen tanpa mengubah inti aplikasi (*FR-18*).
7. **Desain Neo-Brutalism Ramah & Responsif**: Palet warna berkarakter (*Primary Yellow* `#FCE76C`, *Sky Blue* `#8BD0FC`, *Ink Black* `#1F1E22`), bayangan datar offset, tipografi tegas (*Montserrat* & *JetBrains Mono*), dan nyaman digunakan baik di layar ponsel (360 px) maupun desktop.

---

## ✨ Fitur Utama

| Modul Fitur | Rute UI | Endpoint API | Deskripsi |
|---|---|---|---|
| **Analisis Subnetting** | `/subnetting` | `POST /api/jaringan/subnet` | Analisis satu alamat IPv4: hitung Network Address (NA), Broadcast Address (BA), invers mask, jumlah subnet, host valid per subnet, dan tabel blok subnet lengkap. |
| **FLSM dan VLSM** | `/flsm-vlsm` | `POST /api/jaringan/flsm`<br/>`POST /api/jaringan/vlsm` | Alokasi pembagian jaringan induk: ukuran seragam (FLSM) dengan deteksi batas induk, atau dinamis (VLSM) diurutkan dari host terbesar beserta bar blok visual. |
| **Rencana Ruangan** | `/rencana` | `POST /api/jaringan/rencana` | Alokasi subnet otomatis dari dua digit NIM (`192.168.XX.0/24`), opsi persentase cadangan host, penambahan gateway (+1 host), serta tab perbandingan langsung. |
| **Konversi Basis** | `/konversi` | `POST /api/jaringan/konversi` | Konversi angka antar basis (2, 8, 10, 16) dan IPv4 4-oktet dilengkapi tabel posisi bobot bit 128..1 serta langkah pembagian berulang. |
| **Generator DHCP** | `/dhcp` | `POST /api/jaringan/dhcp` | Pembuatan 10 baris skrip konfigurasi CLI Cisco IOS router lengkap (FastEthernet, pool, excluded) dan prediksi akurat alamat IP klien pertama. |
| **Tabel IP Perangkat** | `/tabel-ip` | `POST /api/jaringan/tabel-ip` | Rekapitulasi antarmuka seluruh perangkat node (Static & DHCP), deteksi konflik IP kembar, tombol **Salin Tabel (TSV)**, dan tombol **Cetak Laporan**. |

---

## 🏗️ Arsitektur & Tech Stack

```
Frontend (React 19 + TypeScript + Vite)
  │
  ├── Form & State Management (Formulir Responsif 5/12 Desktop, Sticky)
  └── Area Hasil Seragam (7/12 Desktop)
        ├── Banner Peringatan
        ├── Kartu Ringkasan
        ├── Parameter Diketahui
        ├── StepCard (Langkah 1..N)
        ├── ResultTable (Siap Salin & Cetak)
        └── ConclusionBlock (Kesimpulan Kalimat Utuh)
  │
  ▼ HTTP JSON (Proxy /api -> :8000)
Backend (Python 3.12 + FastAPI + Pydantic v2)
  │
  ├── app/core/registry.py        <- Pendaftaran modul dinamis (FR-18)
  ├── app/core/errors.py          <- Standarisasi error berkode (PRD Lampiran B)
  └── app/modules/jaringan/
        ├── schemas.py            <- Validasi ketat Pydantic & format IPv4
        ├── solver.py             <- Hitungan deterministik bitwise murni
        └── steps.py              <- Penyusun lembar jawaban & kesimpulan
```

### Rincian Teknologi
* **Frontend**:
  * [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
  * [Tailwind CSS v4](https://tailwindcss.com/) dengan token desain kustom
  * [Lucide React](https://lucide.dev/) (icon library)
  * [Vite 8](https://vitejs.dev/) (build tool & dev server)
  * [Vitest](https://vitest.dev/) + React Testing Library
* **Backend**:
  * [Python 3.12](https://www.python.org/)
  * [FastAPI](https://fastapi.tiangolo.com/) (asynchronous web framework)
  * [Pydantic v2](https://docs.pydantic.dev/) (skema data & validasi)
  * [Uvicorn](https://www.uvicorn.org/) (ASGI server)
  * [pytest](https://docs.pytest.org/) + anyio + httpx

---

## 🚀 Panduan Memulai

### Prasyarat
* **Python** versi 3.10 atau lebih baru (direkomendasikan Python 3.12)
* **Node.js** versi 18 atau lebih baru dan **npm**

### 1. Menjalankan Backend (FastAPI)
```bash
# Masuk ke direktori backend
cd backend

# Buat virtual environment (opsional namun disarankan)
python -m venv venv
# Windows:
venv\Scripts\activate
# Linux/macOS:
source venv/bin/activate

# Pasang dependensi
pip install -r requirements.txt

# Jalankan server FastAPI
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```
Backend akan aktif di `http://127.0.0.1:8000`. Dokumentasi interaktif Swagger UI tersedia di `http://127.0.0.1:8000/docs`.

---

### 2. Menjalankan Frontend (React + Vite)
Buka terminal baru:
```bash
# Masuk ke direktori frontend
cd frontend

# Pasang paket dependensi
npm install

# Jalankan server pengembangan Vite
npm run dev
```
Frontend akan aktif di `http://localhost:5173`. Semua panggilan rute `/api/*` otomatis di-proxy ke server backend di port 8000.

---

## 🧪 Pengujian (Testing)

Proyek ini menerapkan pengujian otomatis menyeluruh untuk menjamin seluruh perhitungan sesuai dengan kunci jawaban modul praktikum.

### Menjalankan Tes Backend (`pytest`)
```bash
cd backend
pytest
```
* **81 pengujian unit & integrasi** mencakup: analisis CIDR, FLSM, VLSM, rencana ruangan, konversi basis, generator DHCP, tabel IP perangkat, penanganan kode error, dan kasus batas.

### Menjalankan Tes Frontend (`Vitest`)
```bash
cd frontend
npm test
```
* **35 pengujian komponen & halaman** mencakup: interaksi formulir, pengisian data contoh modul, rendering kartu langkah, penyalinan tabel, dan validasi UI responsif.

---

## 📁 Struktur Repositori

```text
├── backend/
│   ├── app/
│   │   ├── main.py                     # Entry point FastAPI, CORS, & error handler
│   │   ├── core/
│   │   │   ├── errors.py               # Kode error terstruktur (PRD Lampiran B)
│   │   │   ├── registry.py             # Feature registry system (FR-18)
│   │   │   └── schemas.py              # Struktur jawaban seragam (StrukturJawaban)
│   │   └── modules/
│   │       └── jaringan/
│   │           ├── router.py           # Endpoint REST API jaringan
│   │           ├── schemas.py          # Validasi Pydantic per fitur
│   │           ├── solver.py           # Logika hitungan bitwise integer murni
│   │           └── steps.py            # Penyusun narasi langkah pengerjaan
│   ├── tests/                          # 81 Test case pytest (Data Uji Emas Modul)
│   └── requirements.txt                # Dependensi Python
├── frontend/
│   ├── public/
│   │   ├── favicon.svg                 # Favicon vektor partisi subnet
│   │   ├── logo-mark.png               # Ikon emblem aplikasi
│   │   └── logo.png                    # Logo horizontal lengkap
│   ├── src/
│   │   ├── components/                 # Komponen UI (StepCard, ResultTable, Banner, dll.)
│   │   ├── pages/                      # Halaman fitur (Subnetting, FLSM, Rencana, DHCP, dll.)
│   │   ├── services/                   # Klien API fetch terpadu
│   │   ├── types/                      # Definisi tipe data TypeScript
│   │   └── test/                       # 35 Test case Vitest
│   ├── package.json
│   └── vite.config.ts
├── docs/
│   ├── PRD.pdf                         # Dokumen Product Requirement Document v2.0
│   ├── design.md                       # Design System, token warna, & tipografi
│   ├── KONTEKS.md                      # Konteks domain praktikum jaringan
│   └── design/                         # Tangkapan layar & referensi layout
└── README.md
```

---

## 👥 Kontributor & Lisensi

Dibuat untuk menunjang praktikum **Jaringan Komputer**, Program Studi Informatika, UPN "Veteran" Yogyakarta.

* **Pengembang**: Wahid Firnas ([@firnassw](https://github.com/firnassw))
* **Lisensi**: Proyek ini dilisensikan di bawah [MIT License](LICENSE).
