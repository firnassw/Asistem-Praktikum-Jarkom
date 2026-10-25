import React from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Network,
  GitFork,
  LayoutGrid,
  Binary,
  Terminal,
  Table,
  Zap,
  ShieldCheck,
  Printer,
  Copy,
  ExternalLink,
  ChevronRight,
  Sparkles,
  Code2,
} from 'lucide-react';

interface ModulCard {
  nomor: string;
  modulLab: string;
  nama: string;
  deskripsi: string;
  contohInput: string;
  contohOutput: string;
  rute: string;
  warnaAksen: string;
  warnaBadge: string;
  icon: React.FC<{ size?: number; className?: string }>;
}

const modulCards: ModulCard[] = [
  {
    nomor: '01',
    modulLab: 'Modul 2 Lab',
    nama: 'Analisis Subnetting CIDR',
    deskripsi: 'Hitung Network Address (NA), Broadcast Address (BA), Subnet Mask, rentang host valid, dan blok subnet lengkap.',
    contohInput: '192.168.0.5 /27',
    contohOutput: 'NA: .0 • BA: .31 • 30 Host Valid',
    rute: '/subnetting',
    warnaAksen: 'bg-[#8BD0FC]',
    warnaBadge: 'bg-[#E3F4FE] text-[#1F1E22]',
    icon: Network,
  },
  {
    nomor: '02',
    modulLab: 'Modul 2 Lab',
    nama: 'Alokasi FLSM & VLSM',
    deskripsi: 'Bagi jaringan induk menjadi beberapa subnet berukuran tetap (FLSM) atau dinamis berdasarkan kebutuhan host tiap ruangan (VLSM).',
    contohInput: '192.168.64.0/24 • 64, 24, 8 host',
    contohOutput: 'Alokasi terurut bar visual proporsional',
    rute: '/flsm-vlsm',
    warnaAksen: 'bg-[#FCE76C]',
    warnaBadge: 'bg-[#FFF8D1] text-[#8A5A00]',
    icon: GitFork,
  },
  {
    nomor: '03',
    modulLab: 'Modul 2 Lab',
    nama: 'Rencana Ruangan NIM',
    deskripsi: 'Otomatisasi pengalamatan IP dari dua digit terakhir NIM (192.168.XX.0/24), cadangan host %, serta opsi +1 router gateway.',
    contohInput: 'NIM 50 • 5 Ruangan • Cadangan 10%',
    contohOutput: 'Peta blok subnet + Tab perbandingan',
    rute: '/rencana',
    warnaAksen: 'bg-[#FF8F5C]',
    warnaBadge: 'bg-[#FFEBE0] text-[#B83E00]',
    icon: LayoutGrid,
  },
  {
    nomor: '04',
    modulLab: 'Modul 2 Lab',
    nama: 'Konversi Antar-Basis',
    deskripsi: 'Konversi bilangan 4 basis (biner, oktal, desimal, heksadesimal) dan IPv4 4-oktet dilengkapi tabel posisi bobot bit 128..1.',
    contohInput: '10101100 (Basis 2)',
    contohOutput: '172 (Desimal) • AC (Heksa) • Tabel Bit',
    rute: '/konversi',
    warnaAksen: 'bg-[#8BD0FC]',
    warnaBadge: 'bg-[#E3F4FE] text-[#1F1E22]',
    icon: Binary,
  },
  {
    nomor: '05',
    modulLab: 'Modul 3 Lab',
    nama: 'Generator DHCP Router',
    deskripsi: 'Hasilkan 10 baris skrip konfigurasi CLI Cisco IOS router lengkap (FastEthernet, IP pool, excluded) dan prediksi IP klien pertama.',
    contohInput: '192.168.10.1/24 • Excluded .1 s.d .5',
    contohOutput: 'CLI Cisco IOS + Prediksi Klien Pertama',
    rute: '/dhcp',
    warnaAksen: 'bg-[#FCE76C]',
    warnaBadge: 'bg-[#FFF8D1] text-[#8A5A00]',
    icon: Terminal,
  },
  {
    nomor: '06',
    modulLab: 'Modul 4 Lab',
    nama: 'Tabel IP Antarmuka Node',
    deskripsi: 'Rekapitulasi antarmuka perangkat seluruh jaringan (Static & DHCP), deteksi IP kembar, serta tombol Salin TSV dan Cetak Laporan.',
    contohInput: 'Server, Router, PC0, PC1, Laptop',
    contohOutput: 'Tabel TSV Siap Salin & Layout Cetak',
    rute: '/tabel-ip',
    warnaAksen: 'bg-[#FF8F5C]',
    warnaBadge: 'bg-[#FFEBE0] text-[#B83E00]',
    icon: Table,
  },
];

export const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#F5F6F8] text-[#1F1E22] flex flex-col font-sans selection:bg-[#FCE76C] selection:text-[#1F1E22]">
      {/* =========================================================
          1. TOP NAVIGATION BAR (Clean, Sticky Neo-Brutalism)
         ========================================================= */}
      <header className="sticky top-0 z-50 bg-[#FFFFFF]/90 backdrop-blur-md border-b-2 border-[#1F1E22] px-4 sm:px-8 py-3.5 shadow-2xs">
        <div className="max-w-[1280px] mx-auto flex items-center justify-between gap-4">
          {/* Logo & Brand Title */}
          <Link to="/" className="flex items-center gap-3 group">
            <img
              src="/logo-mark.png"
              alt="Logo APJ"
              className="w-9 h-9 sm:w-10 sm:h-10 object-contain shrink-0 transition-transform group-hover:scale-105"
            />
            <div className="flex flex-col leading-tight">
              <span className="font-extrabold text-base sm:text-lg text-[#1F1E22] tracking-tight">
                Asisten Praktikum Jaringan
              </span>
              <span className="text-[11px] font-semibold text-[#5B5F6B] tracking-wide">
                Lab Jarkom Informatika
              </span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-6 text-[14px] font-bold text-[#1F1E22]">
            <a href="#fitur" className="hover:text-[#8A5A00] transition-colors">
              Modul Fitur
            </a>
            <a href="#keunggulan" className="hover:text-[#8A5A00] transition-colors">
              Keunggulan
            </a>
            <a href="#cara-kerja" className="hover:text-[#8A5A00] transition-colors">
              Alur Praktikum
            </a>
            <Link to="/tentang" className="hover:text-[#8A5A00] transition-colors">
              Tentang
            </Link>
          </nav>

          {/* Action Button: Buka Aplikasi */}
          <div className="flex items-center gap-3">
            <a
              href="https://github.com/firnassw/Asisten-Praktikum-Jarkom"
              target="_blank"
              rel="noreferrer"
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-[#1F1E22] bg-[#FFFFFF] border-2 border-[#1F1E22] rounded-[10px] hover:bg-[#F5F6F8] shadow-2xs transition-all"
            >
              <Code2 size={15} />
              <span>GitHub</span>
            </a>
            <Link
              to="/app"
              className="inline-flex items-center gap-2 px-4 sm:px-5 py-2.5 bg-[#FCE76C] text-[#1F1E22] font-extrabold text-xs sm:text-sm rounded-[12px] border-2 border-[#1F1E22] shadow-[3px_3px_0px_#1F1E22] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[4px_4px_0px_#1F1E22] active:translate-x-0 active:translate-y-0 transition-all cursor-pointer"
            >
              <span>Buka Aplikasi</span>
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </header>

      {/* =========================================================
          2. HERO SECTION (High Impact Headline, Value Badges, CTA)
         ========================================================= */}
      <section className="relative px-4 sm:px-8 pt-12 sm:pt-16 pb-16 sm:pb-24 overflow-hidden border-b-2 border-[#1F1E22] bg-radial from-[#FFFDF0] via-[#F5F6F8] to-[#F5F6F8]">
        <div className="max-w-[1280px] mx-auto flex flex-col items-center text-center gap-6 sm:gap-8">
          {/* Badge Pengumuman / Modul */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#FFFFFF] border-2 border-[#1F1E22] text-[#1F1E22] text-xs sm:text-sm font-extrabold shadow-[2px_2px_0px_#1F1E22]">
            <span className="w-2.5 h-2.5 rounded-full bg-[#16794C] animate-pulse" />
            <span>Alat Praktikum Mandiri Cisco Packet Tracer • v1.0 Live</span>
          </div>

          {/* Headline Utama */}
          <h1 className="font-extrabold text-3xl sm:text-5xl lg:text-6xl text-[#1F1E22] tracking-tight max-w-4xl leading-[1.15]">
            Kuasai Hitungan Jaringan Komputer,{' '}
            <span className="bg-[#FCE76C] px-3 py-0.5 rounded-[12px] border-2 border-[#1F1E22] inline-block shadow-[4px_4px_0px_#1F1E22] mt-1 sm:mt-0">
              Langkah demi Langkah.
            </span>
          </h1>

          {/* Subheadline Deskriptif */}
          <p className="font-medium text-base sm:text-lg lg:text-xl text-[#5B5F6B] max-w-3xl leading-relaxed">
            Selesaikan perhitungan <strong className="text-[#1F1E22]">Subnetting CIDR</strong>,{' '}
            <strong className="text-[#1F1E22]">FLSM & VLSM</strong>,{' '}
            <strong className="text-[#1F1E22]">Rencana Ruangan NIM</strong>,{' '}
            <strong className="text-[#1F1E22]">Konversi Basis</strong>,{' '}
            <strong className="text-[#1F1E22]">DHCP Router</strong>, dan{' '}
            <strong className="text-[#1F1E22]">Tabel IP</strong>. Presisi matematis deterministik tanpa AI, siap salin ke Packet Tracer, dan siap cetak untuk responsi lab.
          </p>

          {/* CTA Buttons Group */}
          <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto pt-2">
            <Link
              to="/app"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-8 py-4 bg-[#FCE76C] text-[#1F1E22] font-black text-base sm:text-lg rounded-[16px] border-2 border-[#1F1E22] shadow-[5px_5px_0px_#1F1E22] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[7px_7px_0px_#1F1E22] active:translate-x-0 active:translate-y-0 transition-all cursor-pointer"
            >
              <span>Mulai Praktikum Sekarang</span>
              <ArrowRight size={20} />
            </Link>

            <a
              href="#fitur"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-4 bg-[#FFFFFF] text-[#1F1E22] font-bold text-base rounded-[16px] border-2 border-[#1F1E22] shadow-[3px_3px_0px_#1F1E22] hover:bg-[#F5F6F8] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all cursor-pointer"
            >
              <Sparkles size={18} className="text-[#8A5A00]" />
              <span>Jelajahi 6 Modul Fitur</span>
            </a>
          </div>

          {/* 4 Pilar Trust Badges */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 w-full max-w-4xl pt-6 text-left">
            <div className="bg-[#FFFFFF] p-3.5 rounded-[14px] border-2 border-[#1F1E22] shadow-2xs flex items-center gap-2.5">
              <Zap size={20} className="text-[#8A5A00] shrink-0" />
              <div className="leading-tight">
                <span className="block font-extrabold text-xs text-[#1F1E22]">100% Deterministik</span>
                <span className="text-[11px] text-[#5B5F6B]">Tanpa AI / LLM</span>
              </div>
            </div>
            <div className="bg-[#FFFFFF] p-3.5 rounded-[14px] border-2 border-[#1F1E22] shadow-2xs flex items-center gap-2.5">
              <ShieldCheck size={20} className="text-[#16794C] shrink-0" />
              <div className="leading-tight">
                <span className="block font-extrabold text-xs text-[#1F1E22]">Data Uji Emas</span>
                <span className="text-[11px] text-[#5B5F6B]">116 Test Lolos 100%</span>
              </div>
            </div>
            <div className="bg-[#FFFFFF] p-3.5 rounded-[14px] border-2 border-[#1F1E22] shadow-2xs flex items-center gap-2.5">
              <Copy size={20} className="text-[#006699] shrink-0" />
              <div className="leading-tight">
                <span className="block font-extrabold text-xs text-[#1F1E22]">Cisco Packet Tracer</span>
                <span className="text-[11px] text-[#5B5F6B]">Siap Salin CLI & TSV</span>
              </div>
            </div>
            <div className="bg-[#FFFFFF] p-3.5 rounded-[14px] border-2 border-[#1F1E22] shadow-2xs flex items-center gap-2.5">
              <Printer size={20} className="text-[#B83E00] shrink-0" />
              <div className="leading-tight">
                <span className="block font-extrabold text-xs text-[#1F1E22]">Format Lembar Ujian</span>
                <span className="text-[11px] text-[#5B5F6B]">Siap Cetak Responsi</span>
              </div>
            </div>
          </div>

          {/* =========================================================
              SHOWCASE MOCKUP KARTU (Visual Preview Aplikasi)
             ========================================================= */}
          <div className="w-full max-w-4xl mt-6 relative">
            <div className="absolute inset-0 bg-[#8BD0FC] rounded-[24px] translate-x-2.5 translate-y-2.5 border-2 border-[#1F1E22]" />
            <div className="relative bg-[#FFFFFF] rounded-[24px] border-2 border-[#1F1E22] p-5 sm:p-7 shadow-sm text-left space-y-4">
              {/* Window Header */}
              <div className="flex items-center justify-between border-b-2 border-[#1F1E22]/10 pb-3">
                <div className="flex items-center gap-2">
                  <span className="w-3.5 h-3.5 rounded-full bg-[#FF8F5C] border border-[#1F1E22]" />
                  <span className="w-3.5 h-3.5 rounded-full bg-[#FCE76C] border border-[#1F1E22]" />
                  <span className="w-3.5 h-3.5 rounded-full bg-[#8BD0FC] border border-[#1F1E22]" />
                  <span className="ml-2 font-mono text-xs font-bold text-[#5B5F6B]">
                    preview_jawaban_subnetting.apj
                  </span>
                </div>
                <span className="font-mono text-xs font-extrabold bg-[#FFF8D1] text-[#8A5A00] px-2.5 py-0.5 rounded-md border border-[#8A5A00]">
                  G-JAR-01 Terverifikasi
                </span>
              </div>

              {/* Sample Calculation Result Box */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3 bg-[#F5F6F8] rounded-[12px] border border-[#1F1E22]/15">
                  <span className="text-[11px] font-bold text-[#5B5F6B] uppercase">Parameter Masukan</span>
                  <p className="font-mono font-bold text-sm text-[#1F1E22] mt-0.5">192.168.0.5 /27</p>
                </div>
                <div className="p-3 bg-[#E3F4FE] rounded-[12px] border border-[#8BD0FC]">
                  <span className="text-[11px] font-bold text-[#006699] uppercase">Network Address (NA)</span>
                  <p className="font-mono font-bold text-sm text-[#1F1E22] mt-0.5">192.168.0.0</p>
                </div>
                <div className="p-3 bg-[#FFEBE0] rounded-[12px] border border-[#FF8F5C]">
                  <span className="text-[11px] font-bold text-[#B83E00] uppercase">Broadcast Address (BA)</span>
                  <p className="font-mono font-bold text-sm text-[#1F1E22] mt-0.5">192.168.0.31</p>
                </div>
              </div>

              {/* Step Flow Preview */}
              <div className="p-4 bg-[#FFFDF0] rounded-[14px] border-2 border-[#1F1E22] space-y-2">
                <div className="flex items-center gap-2 text-xs font-extrabold text-[#1F1E22]">
                  <span className="w-5 h-5 rounded-full bg-[#FCE76C] border border-[#1F1E22] flex items-center justify-center text-[11px]">
                    ✓
                  </span>
                  <span>Langkah 1: Menghitung Subnet Mask & Invers Mask</span>
                </div>
                <p className="font-mono text-xs text-[#1F1E22] bg-[#FFFFFF] p-2.5 rounded-lg border border-[#1F1E22]/20">
                  Subnet Mask: 255.255.255.224 | Invers Mask: 0.0.0.31 | Host per Subnet: 2^(32-27) - 2 = 30 Host
                </p>
              </div>

              {/* Interactive Try Button */}
              <div className="flex items-center justify-between pt-1">
                <span className="text-xs text-[#5B5F6B] font-medium hidden sm:inline">
                  Tersedia untuk semua konfigurasi IPv4, FLSM, VLSM, DHCP, dan Tabel IP.
                </span>
                <Link
                  to="/subnetting?contoh=1"
                  className="inline-flex items-center gap-1.5 text-xs font-extrabold text-[#1F1E22] bg-[#FCE76C] px-3.5 py-1.5 rounded-[8px] border border-[#1F1E22] hover:bg-[#FFF4D6] transition-colors ml-auto cursor-pointer"
                >
                  <span>Buka Lembar Subnetting</span>
                  <ArrowRight size={13} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================
          3. KATALOG 6 MODUL PRAKTIKUM (Grid Kartu Fitur Lengkap)
         ========================================================= */}
      <section id="fitur" className="px-4 sm:px-8 py-16 sm:py-24 max-w-[1280px] mx-auto w-full space-y-12">
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <span className="text-xs font-extrabold uppercase tracking-widest text-[#8A5A00] bg-[#FFF8D1] px-3 py-1 rounded-full border border-[#8A5A00]/40">
            Katalog Modul Praktikum
          </span>
          <h2 className="font-extrabold text-3xl sm:text-4xl text-[#1F1E22] tracking-tight">
            6 Alat Bantu Praktikum Jaringan Komputer
          </h2>
          <p className="font-medium text-sm sm:text-base text-[#5B5F6B]">
            Setiap fitur dirancang mengikuti materi resmi praktikum lab Jarkom Informatika: Modul 2, Modul 3, dan Modul 4.
          </p>
        </div>

        {/* Grid 6 Modul Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-7">
          {modulCards.map((card) => {
            const Icon = card.icon;
            return (
              <div key={card.rute} className="relative group flex flex-col">
                {/* 8px Offset Layer */}
                <div
                  className={`absolute inset-0 translate-x-2 translate-y-2 ${card.warnaAksen} border-2 border-[#1F1E22] rounded-[20px] transition-transform group-hover:translate-x-2.5 group-hover:translate-y-2.5`}
                  aria-hidden="true"
                />

                {/* Card Surface */}
                <div className="relative bg-[#FFFFFF] border-2 border-[#1F1E22] rounded-[20px] p-6 flex flex-col justify-between gap-5 h-full transition-transform group-hover:-translate-x-0.5 group-hover:-translate-y-0.5 shadow-xs">
                  <div className="space-y-4">
                    {/* Top Row: Module Badge & Number */}
                    <div className="flex items-center justify-between">
                      <span className={`text-[11px] font-extrabold px-2.5 py-0.5 rounded-full border border-[#1F1E22] ${card.warnaBadge}`}>
                        {card.modulLab}
                      </span>
                      <span className="font-mono text-xs font-black text-[#5B5F6B]/60">
                        #{card.nomor}
                      </span>
                    </div>

                    {/* Icon & Title */}
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-[12px] bg-[#F5F6F8] border-2 border-[#1F1E22] flex items-center justify-center shrink-0 text-[#1F1E22]">
                        <Icon size={20} />
                      </div>
                      <h3 className="font-extrabold text-lg text-[#1F1E22] leading-snug">
                        {card.nama}
                      </h3>
                    </div>

                    {/* Description */}
                    <p className="text-xs sm:text-[13px] text-[#5B5F6B] leading-relaxed">
                      {card.deskripsi}
                    </p>

                    {/* Example Snippet */}
                    <div className="p-3 bg-[#F5F6F8] rounded-[12px] border border-[#1F1E22]/15 space-y-1">
                      <div className="flex items-center justify-between text-[10px] font-bold text-[#5B5F6B] uppercase">
                        <span>Contoh Input:</span>
                        <span className="font-mono text-[#1F1E22]">{card.contohInput}</span>
                      </div>
                      <div className="flex items-center justify-between text-[10px] font-bold text-[#5B5F6B] uppercase">
                        <span>Hasil:</span>
                        <span className="font-mono text-[#16794C] font-extrabold">{card.contohOutput}</span>
                      </div>
                    </div>
                  </div>

                  {/* Open Feature Link */}
                  <Link
                    to={card.rute}
                    className="inline-flex items-center justify-between w-full h-11 px-4 bg-[#FFFFFF] hover:bg-[#F5F6F8] text-[#1F1E22] font-bold text-xs rounded-[12px] border-2 border-[#1F1E22] shadow-2xs group-hover:bg-[#FCE76C] transition-all cursor-pointer"
                  >
                    <span>Buka Modul {card.nama.split(' ')[0]}</span>
                    <ChevronRight size={16} />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* =========================================================
          4. KEUNGGULAN (Mengapa Menggunakan APJ?)
         ========================================================= */}
      <section id="keunggulan" className="px-4 sm:px-8 py-16 sm:py-24 bg-[#FFFFFF] border-y-2 border-[#1F1E22]">
        <div className="max-w-[1280px] mx-auto space-y-12">
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <span className="text-xs font-extrabold uppercase tracking-widest text-[#006699] bg-[#E3F4FE] px-3 py-1 rounded-full border border-[#8BD0FC]">
              Kenapa Memilih APJ?
            </span>
            <h2 className="font-extrabold text-3xl sm:text-4xl text-[#1F1E22] tracking-tight">
              Bukan Sekadar Kalkulator Subnet Biasa
            </h2>
            <p className="font-medium text-sm sm:text-base text-[#5B5F6B]">
              Sebagian besar kalkulator online hanya memberikan angka akhir tanpa cara pengerjaan, atau menggunakan AI yang rawan berhalusinasi. APJ berbeda.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-6 bg-[#F5F6F8] rounded-[20px] border-2 border-[#1F1E22] shadow-2xs space-y-3">
              <div className="w-12 h-12 rounded-[14px] bg-[#FCE76C] border-2 border-[#1F1E22] flex items-center justify-center font-black text-xl">
                1
              </div>
              <h3 className="font-extrabold text-lg text-[#1F1E22]">Deterministik Murni</h3>
              <p className="text-xs text-[#5B5F6B] leading-relaxed">
                Tanpa AI atau LLM. Setiap angka dihitung murni dengan operasi bitwise integer (<code className="font-mono text-[#1F1E22]">&amp;, |, ~, &lt;&lt;, &gt;&gt;</code>) sehingga tidak ada angka halusinasi.
              </p>
            </div>

            <div className="p-6 bg-[#F5F6F8] rounded-[20px] border-2 border-[#1F1E22] shadow-2xs space-y-3">
              <div className="w-12 h-12 rounded-[14px] bg-[#8BD0FC] border-2 border-[#1F1E22] flex items-center justify-center font-black text-xl">
                2
              </div>
              <h3 className="font-extrabold text-lg text-[#1F1E22]">Format Lembar Ujian</h3>
              <p className="text-xs text-[#5B5F6B] leading-relaxed">
                Jawaban disajikan runut: <em>Diketahui</em>, <em>Langkah Perhitungan</em>, <em>Tabel Hasil Akhir</em>, hingga <em>Kesimpulan</em> siap salin ke lembar responsi lab.
              </p>
            </div>

            <div className="p-6 bg-[#F5F6F8] rounded-[20px] border-2 border-[#1F1E22] shadow-2xs space-y-3">
              <div className="w-12 h-12 rounded-[14px] bg-[#FF8F5C] border-2 border-[#1F1E22] flex items-center justify-center font-black text-xl">
                3
              </div>
              <h3 className="font-extrabold text-lg text-[#1F1E22]">Cisco Packet Tracer Ready</h3>
              <p className="text-xs text-[#5B5F6B] leading-relaxed">
                Skrip CLI router siap dipaste ke terminal Cisco IOS, dan seluruh tabel IP memiliki tombol salin TSV satu klik untuk laporan spreadsheet.
              </p>
            </div>

            <div className="p-6 bg-[#F5F6F8] rounded-[20px] border-2 border-[#1F1E22] shadow-2xs space-y-3">
              <div className="w-12 h-12 rounded-[14px] bg-[#FFFFFF] border-2 border-[#1F1E22] flex items-center justify-center font-black text-xl">
                4
              </div>
              <h3 className="font-extrabold text-lg text-[#1F1E22]">Jujur &amp; Transparan</h3>
              <p className="text-xs text-[#5B5F6B] leading-relaxed">
                Tidak ada data karangan. Jika terdapat IP yang bentrok atau gateway di luar rentang subnet, sistem memberikan kartu peringatan secara transparan.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================
          5. ALUR PRAKTIKUM (3 Langkah Mudah)
         ========================================================= */}
      <section id="cara-kerja" className="px-4 sm:px-8 py-16 sm:py-24 max-w-[1280px] mx-auto w-full space-y-12">
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <span className="text-xs font-extrabold uppercase tracking-widest text-[#16794C] bg-[#E3F4EA] px-3 py-1 rounded-full border border-[#16794C]">
            Alur Belajar Mandiri
          </span>
          <h2 className="font-extrabold text-3xl sm:text-4xl text-[#1F1E22] tracking-tight">
            3 Langkah Menyelesaikan Soal Praktikum
          </h2>
          <p className="font-medium text-sm sm:text-base text-[#5B5F6B]">
            Praktis, cepat, dan membantu Anda memahami alur logika di balik setiap konfigurasi.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          <div className="relative bg-[#FFFFFF] rounded-[20px] border-2 border-[#1F1E22] p-6 space-y-3 shadow-2xs">
            <span className="font-mono text-3xl font-black text-[#8A5A00]">01.</span>
            <h3 className="font-extrabold text-lg text-[#1F1E22]">Pilih Modul &amp; Input Data</h3>
            <p className="text-xs text-[#5B5F6B] leading-relaxed">
              Buka menu modul yang ingin dikerjakan, masukkan IP dan prefix atau langsung klik tombol <strong>"Isi contoh"</strong> sesuai studi kasus modul lab Anda.
            </p>
          </div>

          <div className="relative bg-[#FFFFFF] rounded-[20px] border-2 border-[#1F1E22] p-6 space-y-3 shadow-2xs">
            <span className="font-mono text-3xl font-black text-[#006699]">02.</span>
            <h3 className="font-extrabold text-lg text-[#1F1E22]">Pelajari Langkah Pengerjaan</h3>
            <p className="text-xs text-[#5B5F6B] leading-relaxed">
              Simak langkah demi langkah perhitungan yang disajikan dalam bahasa Indonesia, rumus eksak, konversi biner, dan kartu ringkasan visual.
            </p>
          </div>

          <div className="relative bg-[#FFFFFF] rounded-[20px] border-2 border-[#1F1E22] p-6 space-y-3 shadow-2xs">
            <span className="font-mono text-3xl font-black text-[#B83E00]">03.</span>
            <h3 className="font-extrabold text-lg text-[#1F1E22]">Salin ke Packet Tracer / Cetak</h3>
            <p className="text-xs text-[#5B5F6B] leading-relaxed">
              Salin skrip CLI ke terminal router Packet Tracer, salin tabel IP ke laporan praktikum, atau klik tombol <strong>"Cetak"</strong> untuk lembar cetak rapi.
            </p>
          </div>
        </div>
      </section>

      {/* =========================================================
          6. BOTTOM CALL TO ACTION (Neo-Brutalism Big Box)
         ========================================================= */}
      <section className="px-4 sm:px-8 pb-16 sm:pb-24 max-w-[1280px] mx-auto w-full">
        <div className="relative">
          <div className="absolute inset-0 bg-[#1F1E22] rounded-[28px] translate-x-2.5 translate-y-2.5" />
          <div className="relative bg-[#FCE76C] border-3 border-[#1F1E22] rounded-[28px] p-8 sm:p-12 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="space-y-3 text-center md:text-left max-w-2xl">
              <span className="text-xs font-black uppercase tracking-wider text-[#1F1E22] bg-[#FFFFFF] px-3 py-1 rounded-full border border-[#1F1E22] inline-block shadow-2xs">
                Mulai Sekarang • 100% Gratis
              </span>
              <h2 className="font-extrabold text-2xl sm:text-4xl text-[#1F1E22] tracking-tight">
                Siap Menyelesaikan Praktikum Jaringan Lebih Cepat &amp; Presisi?
              </h2>
              <p className="font-medium text-sm sm:text-base text-[#1F1E22]">
                Akses semua modul perhitungan jaringan secara interaktif di browser Anda tanpa perlu instalasi aplikasi tambahan.
              </p>
            </div>

            <div className="shrink-0 w-full sm:w-auto">
              <Link
                to="/app"
                className="inline-flex items-center justify-center gap-3 w-full sm:w-auto px-8 py-4 bg-[#FFFFFF] text-[#1F1E22] font-black text-base sm:text-lg rounded-[16px] border-2 border-[#1F1E22] shadow-[4px_4px_0px_#1F1E22] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[6px_6px_0px_#1F1E22] active:translate-x-0 active:translate-y-0 transition-all cursor-pointer"
              >
                <span>Buka Aplikasi Asisten</span>
                <ArrowRight size={20} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================
          7. FOOTER LENGKAP
         ========================================================= */}
      <footer className="bg-[#1F1E22] text-[#FFFFFF] border-t-2 border-[#1F1E22] px-4 sm:px-8 py-12">
        <div className="max-w-[1280px] mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-8 border-b border-[#3E3D44] pb-8">
          <div className="space-y-2 max-w-sm">
            <div className="flex items-center gap-3">
              <img
                src="/logo-mark.png"
                alt="Logo APJ"
                className="w-8 h-8 object-contain shrink-0"
              />
              <span className="font-extrabold text-lg text-white">
                Asisten Praktikum Jaringan
              </span>
            </div>
            <p className="text-xs text-[#8A8F9C] leading-relaxed">
              Alat bantu praktikum Jaringan Komputer mandiri langkah demi langkah — deterministik, presisi tanpa AI, dan siap salin/cetak untuk Cisco Packet Tracer.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 text-xs">
            <div className="space-y-2">
              <span className="font-bold text-[#FCE76C] uppercase tracking-wider block">
                Modul 2 Lab
              </span>
              <ul className="space-y-1.5 text-[#C9D0E4]">
                <li><Link to="/subnetting" className="hover:text-white transition-colors">Subnetting CIDR</Link></li>
                <li><Link to="/flsm-vlsm" className="hover:text-white transition-colors">FLSM &amp; VLSM</Link></li>
                <li><Link to="/rencana" className="hover:text-white transition-colors">Rencana Ruangan</Link></li>
                <li><Link to="/konversi" className="hover:text-white transition-colors">Konversi Basis</Link></li>
              </ul>
            </div>

            <div className="space-y-2">
              <span className="font-bold text-[#8BD0FC] uppercase tracking-wider block">
                Modul 3 &amp; 4
              </span>
              <ul className="space-y-1.5 text-[#C9D0E4]">
                <li><Link to="/dhcp" className="hover:text-white transition-colors">Generator DHCP</Link></li>
                <li><Link to="/tabel-ip" className="hover:text-white transition-colors">Tabel IP Node</Link></li>
                <li><Link to="/tentang" className="hover:text-white transition-colors">Tentang Proyek</Link></li>
              </ul>
            </div>

            <div className="space-y-2 col-span-2 sm:col-span-1">
              <span className="font-bold text-[#FF8F5C] uppercase tracking-wider block">
                Repositori
              </span>
              <ul className="space-y-1.5 text-[#C9D0E4]">
                <li>
                  <a
                    href="https://github.com/firnassw/Asisten-Praktikum-Jarkom"
                    target="_blank"
                    rel="noreferrer"
                    className="hover:text-white transition-colors inline-flex items-center gap-1"
                  >
                    <span>GitHub Repo</span>
                    <ExternalLink size={11} />
                  </a>
                </li>
                <li>
                  <a
                    href="/api/docs"
                    target="_blank"
                    rel="noreferrer"
                    className="hover:text-white transition-colors inline-flex items-center gap-1"
                  >
                    <span>API Swagger Docs</span>
                    <ExternalLink size={11} />
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="max-w-[1280px] mx-auto pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-[#8A8F9C] gap-2">
          <p>© 2026 Wahid Firnas • Informatika UPN "Veteran" Yogyakarta. Lisensi MIT.</p>
          <p className="font-mono text-[11px]">Asisten Praktikum Jaringan v1.0.0</p>
        </div>
      </footer>
    </div>
  );
};
