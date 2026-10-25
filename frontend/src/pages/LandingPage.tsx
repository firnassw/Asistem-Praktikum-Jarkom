import React from 'react';
import { Link } from 'react-router-dom';

interface FiturItem {
  nama: string;
  deskripsi: string;
  contoh: string;
  rute: string;
  warnaOffset: string; // #8BD0FC, #FCE76C, #FF8F5C
}

const daftarFitur: FiturItem[] = [
  {
    nama: 'Analisis subnet',
    deskripsi: 'Hitung NA, BA, subnet mask, dan tabel semua subnet dari satu alamat IP.',
    contoh: '192.168.0.5 /27',
    rute: '/subnetting',
    warnaOffset: 'bg-[#8BD0FC]',
  },
  {
    nama: 'FLSM dan VLSM',
    deskripsi: 'Bagi jaringan induk menjadi subnet ukuran tetap atau sesuai kebutuhan host.',
    contoh: '192.168.64.0/24 • 64, 24, 8 host',
    rute: '/flsm-vlsm',
    warnaOffset: 'bg-[#FCE76C]',
  },
  {
    nama: 'Rencana ruangan',
    deskripsi: 'Susun alokasi subnet otomatis dari dua digit NIM serta jumlah ruangan dan device.',
    contoh: 'NIM 50 -> 192.168.50.0/24',
    rute: '/rencana',
    warnaOffset: 'bg-[#FF8F5C]',
  },
  {
    nama: 'Konversi basis',
    deskripsi: 'Ubah bilangan biner, oktal, desimal, dan heksadesimal dengan tabel bit 128–1.',
    contoh: '10101100 -> 172 (0xAC)',
    rute: '/konversi',
    warnaOffset: 'bg-[#8BD0FC]',
  },
  {
    nama: 'Generator DHCP',
    deskripsi: 'Susun perintah CLI DHCP router dan prediksi alamat IP klien pertama.',
    contoh: '192.168.10.1/24 • klien .6',
    rute: '/dhcp',
    warnaOffset: 'bg-[#FCE76C]',
  },
  {
    nama: 'Tabel IP perangkat',
    deskripsi: 'Rekap alamat IP, subnet mask, gateway, dan DNS perangkat siap salin dan cetak.',
    contoh: 'Server 192.168.1.1 /24',
    rute: '/tabel-ip',
    warnaOffset: 'bg-[#FF8F5C]',
  },
];

export const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#F5F6F8] text-[#1F1E22] flex flex-col font-sans selection:bg-[#FCE76C] selection:text-[#1F1E22]">
      {/* =========================================================
          1. TOP NAVBAR (Tinggi 72px, latar surface #FFFFFF, border-b 2px ink #1F1E22)
         ========================================================= */}
      <header className="sticky top-0 z-50 w-full h-[72px] bg-[#FFFFFF] border-b-2 border-[#1F1E22] flex items-center">
        <div className="max-w-[1280px] w-full mx-auto px-4 sm:px-8 flex items-center justify-between">
          {/* Brand Logo & Name */}
          <Link to="/" className="flex items-center gap-3 group focus:outline-none">
            <div className="w-10 h-10 bg-[#FCE76C] border-2 border-[#1F1E22] rounded-[10px] flex items-center justify-center font-extrabold text-[#1F1E22] text-base tracking-tight group-hover:translate-x-0.5 group-hover:translate-y-0.5 transition-transform shrink-0">
              APJ
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-base sm:text-lg tracking-tight text-[#1F1E22] leading-tight">
                Asisten Praktikum Jaringan
              </span>
              <span className="text-[11px] font-semibold text-[#5B5F6B] leading-none hidden sm:inline">
                Modul 2, 3, &amp; 4 Cisco Packet Tracer Companion
              </span>
            </div>
          </Link>

          {/* Center Links (Desktop) */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-bold text-[#1F1E22]">
            <a href="#fitur" className="hover:text-[#5B5F6B] transition-colors py-1">
              Fitur
            </a>
            <a href="#contoh" className="hover:text-[#5B5F6B] transition-colors py-1">
              Contoh Lembar Jawaban
            </a>
            <Link to="/tentang" className="hover:text-[#5B5F6B] transition-colors py-1">
              Tentang
            </Link>
          </nav>

          {/* Right Button: Buka Dashboard (button-secondary, latar putih) */}
          <div className="flex items-center gap-3">
            <Link
              to="/beranda"
              className="inline-flex items-center justify-center h-11 px-5 rounded-[12px] bg-[#FFFFFF] text-[#1F1E22] font-bold text-sm border-2 border-[#1F1E22] hover:bg-[#F5F6F8] active:translate-y-0.5 transition-all shadow-none"
            >
              Buka Dashboard
            </Link>
          </div>
        </div>
      </header>

      {/* =========================================================
          MAIN WRAPPER (Maksimal 1280px)
         ========================================================= */}
      <main className="flex-1 w-full">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-8 py-10 sm:py-16 flex flex-col gap-16 sm:gap-20">

          {/* =========================================================
              2. HERO SECTION (2-Column Grid di Desktop, 1 Column di Mobile)
             ========================================================= */}
          <section className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
            
            {/* Kolom Kiri (6/12) */}
            <div className="lg:col-span-6 flex flex-col items-start gap-6">
              <h1 className="text-3xl sm:text-4xl lg:text-[44px] font-extrabold text-[#1F1E22] leading-[1.15] tracking-tight">
                Selesaikan hitungan jaringan, langkah demi langkah.
              </h1>

              <p className="text-base sm:text-lg text-[#5B5F6B] font-medium leading-relaxed max-w-xl">
                Alat bantu praktikum Jaringan Komputer untuk menghitung subnetting, FLSM, VLSM, rencana IP dari NIM, konversi basis, dan konfigurasi DHCP sesuai urutan lembar jawaban modul.
              </p>

              {/* Baris Tombol Aksi */}
              <div className="flex flex-wrap items-center gap-4 pt-2 w-full sm:w-auto">
                {/* SATU-SATUNYA TOMBOL PRIMARY DI HALAMAN: Mulai Praktikum (#FCE76C) */}
                <Link
                  to="/beranda"
                  className="inline-flex items-center justify-center h-12 px-7 rounded-[12px] bg-[#FCE76C] text-[#1F1E22] font-bold text-base border-2 border-[#1F1E22] hover:bg-[#F2D640] active:translate-y-0.5 shadow-[4px_4px_0px_#1F1E22] hover:shadow-[2px_2px_0px_#1F1E22] transition-all cursor-pointer"
                >
                  Mulai Praktikum
                </Link>

                {/* Tombol Secondary: Coba Contoh Soal (#FFFFFF) */}
                <Link
                  to="/subnetting?contoh=1"
                  className="inline-flex items-center justify-center h-12 px-7 rounded-[12px] bg-[#FFFFFF] text-[#1F1E22] font-bold text-base border-2 border-[#1F1E22] hover:bg-[#F5F6F8] active:translate-y-0.5 transition-all cursor-pointer"
                >
                  Coba Contoh Soal
                </Link>
              </div>
            </div>

            {/* Kolom Kanan (6/12) — Kartu Pratinjau Lembar Jawaban (id="contoh") */}
            <div id="contoh" className="lg:col-span-6 w-full scroll-mt-24">
              <div className="relative">
                {/* Lapisan Bergeser 8px Biru (#8BD0FC) */}
                <div
                  className="absolute inset-0 translate-x-2 translate-y-2 bg-[#8BD0FC] border-2 border-[#1F1E22] rounded-[20px]"
                  aria-hidden="true"
                />

                {/* Kartu Utama Putih (#FFFFFF) */}
                <div className="relative bg-[#FFFFFF] rounded-[20px] border-2 border-[#1F1E22] p-6 sm:p-7 flex flex-col gap-5 overflow-hidden">
                  
                  {/* Angka pudar dekoratif /27 di sudut kanan atas */}
                  <div
                    className="absolute -top-3 -right-2 font-sans font-light text-[88px] text-[#D6D9E2] select-none pointer-events-none leading-none opacity-80"
                    aria-hidden="true"
                  >
                    /27
                  </div>

                  {/* Top Card Meta: Chip header monospace */}
                  <div className="flex items-center justify-between relative z-10">
                    <span className="inline-flex items-center px-3 py-1 rounded-[8px] bg-[#F5F6F8] border-2 border-[#1F1E22] font-mono text-xs font-bold text-[#1F1E22]">
                      Contoh Analisis: 192.168.0.5 /27
                    </span>
                  </div>

                  {/* Pratinjau Dekomposisi Biner 2 Warna */}
                  <div className="flex flex-col gap-2 relative z-10">
                    <div className="flex items-center justify-between text-xs font-bold text-[#5B5F6B]">
                      <span>Dekomposisi Bit (IP &amp; Netmask):</span>
                      <span className="text-[11px] font-mono">Net (27) : Host (5)</span>
                    </div>

                    <div className="p-3 bg-[#1F1E22] text-[#FFFFFF] rounded-[12px] font-mono text-xs sm:text-[13px] tracking-wider overflow-x-auto flex items-center justify-between">
                      <div className="flex items-center flex-wrap gap-1">
                        <span className="bg-[#8BD0FC] text-[#1F1E22] px-1.5 py-0.5 rounded font-bold">
                          11000000.10101000.00000000.000
                        </span>
                        <span className="text-[#D6D9E2] px-0.5">|</span>
                        <span className="bg-[#FCE76C] text-[#1F1E22] px-1.5 py-0.5 rounded font-bold">
                          00101
                        </span>
                      </div>
                    </div>

                    {/* Legenda Bit Singkat */}
                    <div className="flex items-center gap-4 text-[11px] font-semibold text-[#5B5F6B]">
                      <span className="flex items-center gap-1.5">
                        <span className="w-3 h-3 rounded bg-[#8BD0FC] border border-[#1F1E22]" />
                        27 Bit Jaringan
                      </span>
                      <span className="flex items-center gap-1.5">
                        <span className="w-3 h-3 rounded bg-[#FCE76C] border border-[#1F1E22]" />
                        5 Bit Host
                      </span>
                    </div>
                  </div>

                  {/* Grid 2x2 Kotak Ringkasan Monospace */}
                  <div className="grid grid-cols-2 gap-3 relative z-10 pt-1">
                    <div className="p-3 rounded-[12px] bg-[#F5F6F8] border-2 border-[#1F1E22] flex flex-col">
                      <span className="text-[11px] font-bold text-[#5B5F6B] uppercase">Network Address (NA)</span>
                      <span className="font-mono text-sm sm:text-base font-bold text-[#1F1E22]">192.168.0.0</span>
                    </div>
                    <div className="p-3 rounded-[12px] bg-[#F5F6F8] border-2 border-[#1F1E22] flex flex-col">
                      <span className="text-[11px] font-bold text-[#5B5F6B] uppercase">Broadcast Address (BA)</span>
                      <span className="font-mono text-sm sm:text-base font-bold text-[#1F1E22]">192.168.0.31</span>
                    </div>
                    <div className="p-3 rounded-[12px] bg-[#F5F6F8] border-2 border-[#1F1E22] flex flex-col">
                      <span className="text-[11px] font-bold text-[#5B5F6B] uppercase">Host Valid</span>
                      <span className="font-mono text-sm sm:text-base font-bold text-[#1F1E22]">192.168.0.1 – .30</span>
                    </div>
                    <div className="p-3 rounded-[12px] bg-[#F5F6F8] border-2 border-[#1F1E22] flex flex-col">
                      <span className="text-[11px] font-bold text-[#5B5F6B] uppercase">Kapasitas</span>
                      <span className="font-mono text-sm sm:text-base font-bold text-[#1F1E22]">30 Host / 8 Subnet</span>
                    </div>
                  </div>

                  {/* Bar Visual Blok Alamat untuk 8 Blok /27 */}
                  <div className="flex flex-col gap-2 relative z-10 pt-1">
                    <div className="flex items-center justify-between text-xs font-bold text-[#5B5F6B]">
                      <span>Visualisasi Blok Subnet (/27 dalam /24):</span>
                      <span className="font-mono text-[11px]">8 Blok x 32 IP</span>
                    </div>
                    <div className="h-6 w-full rounded-full border-2 border-[#1F1E22] overflow-hidden flex bg-[#F5F6F8]">
                      <div className="h-full bg-[#8BD0FC] flex-1 flex items-center justify-center text-[10px] font-bold font-mono text-[#1F1E22] border-r border-[#1F1E22]" title="Subnet 0 (.0 - .31)">#1</div>
                      <div className="h-full bg-[#FCE76C] flex-1 flex items-center justify-center text-[10px] font-bold font-mono text-[#1F1E22] border-r border-[#1F1E22]" title="Subnet 1 (.32 - .63)">#2</div>
                      <div className="h-full bg-[#FF8F5C] flex-1 flex items-center justify-center text-[10px] font-bold font-mono text-[#1F1E22] border-r border-[#1F1E22]" title="Subnet 2 (.64 - .95)">#3</div>
                      <div className="h-full bg-[#C9D0E4] flex-1 flex items-center justify-center text-[10px] font-bold font-mono text-[#1F1E22] border-r border-[#1F1E22]" title="Subnet 3 (.96 - .127)">#4</div>
                      <div className="h-full bg-[#8BD0FC] flex-1 flex items-center justify-center text-[10px] font-bold font-mono text-[#1F1E22] border-r border-[#1F1E22]" title="Subnet 4 (.128 - .159)">#5</div>
                      <div className="h-full bg-[#FCE76C] flex-1 flex items-center justify-center text-[10px] font-bold font-mono text-[#1F1E22] border-r border-[#1F1E22]" title="Subnet 5 (.160 - .191)">#6</div>
                      <div className="h-full bg-[#FF8F5C] flex-1 flex items-center justify-center text-[10px] font-bold font-mono text-[#1F1E22] border-r border-[#1F1E22]" title="Subnet 6 (.192 - .223)">#7</div>
                      <div className="h-full bg-[#C9D0E4] flex-1 flex items-center justify-center text-[10px] font-bold font-mono text-[#1F1E22]" title="Subnet 7 (.224 - .255)">#8</div>
                    </div>
                  </div>

                </div>
              </div>
            </div>

          </section>

          {/* =========================================================
              3. GRID 6 ALAT HITUNG (id="fitur", 3 Kolom Desktop, 2 Tablet, 1 Mobile)
             ========================================================= */}
          <section id="fitur" className="flex flex-col gap-8 scroll-mt-24">
            
            <div className="flex flex-col gap-1">
              <h2 className="text-2xl sm:text-[28px] font-extrabold text-[#1F1E22] tracking-tight">
                Enam Alat Hitung Sesuai Modul Praktikum
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {daftarFitur.map((fitur) => (
                <div key={fitur.rute} className="relative group">
                  {/* Lapisan Bergeser 8px (Biru, Kuning, Oranye bergantian) */}
                  <div
                    className={`absolute inset-0 translate-x-2 translate-y-2 ${fitur.warnaOffset} border-2 border-[#1F1E22] rounded-[20px] transition-transform group-hover:translate-x-2.5 group-hover:translate-y-2.5`}
                    aria-hidden="true"
                  />

                  {/* Kartu Utama yang Dapat Diklik */}
                  <Link
                    to={fitur.rute}
                    className="relative block bg-[#FFFFFF] rounded-[20px] border-2 border-[#1F1E22] p-6 flex flex-col justify-between h-full gap-5 transition-transform group-hover:-translate-x-0.5 group-hover:-translate-y-0.5 focus:outline-none"
                  >
                    <div className="flex flex-col gap-2">
                      <h3 className="font-title text-[18px] font-bold text-[#1F1E22]">
                        {fitur.nama}
                      </h3>
                      <p className="font-body-sm text-sm text-[#5B5F6B] font-medium leading-relaxed">
                        {fitur.deskripsi}
                      </p>
                    </div>

                    {/* Kotak Contoh Monospace */}
                    <div className="p-3 bg-[#F5F6F8] rounded-[12px] border-2 border-[#1F1E22] font-mono text-sm text-[#1F1E22] font-semibold">
                      {fitur.contoh}
                    </div>
                  </Link>
                </div>
              ))}
            </div>

          </section>

          {/* =========================================================
              4. BAGIAN URUTAN LEMBAR JAWABAN (3 Kartu Horizontal)
             ========================================================= */}
          <section className="flex flex-col gap-8 scroll-mt-24">
            
            <div className="flex flex-col gap-1">
              <h2 className="text-2xl sm:text-[28px] font-extrabold text-[#1F1E22] tracking-tight">
                Format Seragam Seperti Lembar Jawaban Ujian
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Langkah 1 */}
              <div className="bg-[#FFFFFF] rounded-[20px] border-2 border-[#1F1E22] p-6 flex flex-col gap-4 relative">
                <div className="w-8 h-8 rounded-full bg-[#1F1E22] text-[#FFFFFF] flex items-center justify-center font-bold text-sm">
                  1
                </div>
                <h3 className="text-lg font-bold text-[#1F1E22]">
                  Isi Data Soal atau NIM
                </h3>
                <p className="text-sm text-[#5B5F6B] font-medium leading-relaxed">
                  Masukkan alamat IP, jumlah ruangan dan device, atau dua digit terakhir NIM untuk menghasilkan IP Global otomatis.
                </p>
              </div>

              {/* Langkah 2 */}
              <div className="bg-[#FFFFFF] rounded-[20px] border-2 border-[#1F1E22] p-6 flex flex-col gap-4 relative">
                <div className="w-8 h-8 rounded-full bg-[#1F1E22] text-[#FFFFFF] flex items-center justify-center font-bold text-sm">
                  2
                </div>
                <h3 className="text-lg font-bold text-[#1F1E22]">
                  Pelajari Langkah Biner &amp; Rumus
                </h3>
                <p className="text-sm text-[#5B5F6B] font-medium leading-relaxed">
                  Urutan pengerjaan mengikuti Modul 2, 3, dan 4: Diketahui, operasi biner AND/OR, penentuan prefix, hingga tabel alokasi.
                </p>
              </div>

              {/* Langkah 3 */}
              <div className="bg-[#FFFFFF] rounded-[20px] border-2 border-[#1F1E22] p-6 flex flex-col gap-4 relative">
                <div className="w-8 h-8 rounded-full bg-[#1F1E22] text-[#FFFFFF] flex items-center justify-center font-bold text-sm">
                  3
                </div>
                <h3 className="text-lg font-bold text-[#1F1E22]">
                  Salin ke Packet Tracer atau Cetak
                </h3>
                <p className="text-sm text-[#5B5F6B] font-medium leading-relaxed">
                  Salin tabel alamat IP dan perintah CLI router dua kolom langsung ke Cisco Packet Tracer atau cetak untuk laporan.
                </p>
              </div>

            </div>

          </section>

          {/* =========================================================
              5. BANNER CTA BAWAH
             ========================================================= */}
          <section className="w-full">
            <div className="w-full rounded-[20px] bg-[#FCE76C] border-2 border-[#1F1E22] p-8 sm:p-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 shadow-[6px_6px_0px_#1F1E22]">
              
              <div className="flex flex-col gap-2 max-w-2xl">
                <h3 className="text-2xl sm:text-3xl font-extrabold text-[#1F1E22] tracking-tight leading-tight">
                  Siap mengerjakan soal praktikum sekarang?
                </h3>
                <p className="text-base text-[#1F1E22] font-medium leading-relaxed">
                  Tanpa akun dan tanpa database. Langsung hitung, pelajari langkahnya, dan salin hasilnya.
                </p>
              </div>

              {/* Tombol Secondary pada banner CTA bawah (latar putih #FFFFFF) */}
              <Link
                to="/beranda"
                className="inline-flex items-center justify-center h-12 px-7 rounded-[12px] bg-[#FFFFFF] text-[#1F1E22] font-bold text-base border-2 border-[#1F1E22] hover:bg-[#F5F6F8] active:translate-y-0.5 transition-all whitespace-nowrap cursor-pointer"
              >
                Buka Aplikasi Sekarang
              </Link>

            </div>
          </section>

        </div>
      </main>

      {/* =========================================================
          6. FOOTER SEDERHANA
         ========================================================= */}
      <footer className="w-full bg-[#F5F6F8] border-t border-[#E3E5EA] py-8">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-semibold text-[#5B5F6B] text-center sm:text-left">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded bg-[#FCE76C] border border-[#1F1E22] inline-block" />
            <span className="text-[#1F1E22] font-bold">Asisten Praktikum Jaringan</span>
            <span>•</span>
            <span>Mengikuti acuan Modul Praktikum Jaringan Komputer (Modul 2, 3, 4)</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
