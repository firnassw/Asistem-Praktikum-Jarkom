import React from 'react';
import { Link } from 'react-router-dom';

interface FiturCardData {
  nama: string;
  deskripsi: string;
  contoh: string;
  rute: string;
  warnaOffset: string; // Hex color for the 8px offset layer
}

const fiturList: FiturCardData[] = [
  {
    nama: 'Analisis subnet',
    deskripsi: 'Hitung NA, BA, subnet mask, dan tabel rentang host dari satu alamat IP.',
    contoh: '192.168.0.5 /27',
    rute: '/subnetting',
    warnaOffset: 'bg-[#8BD0FC]', // Kolom 1: secondary (biru)
  },
  {
    nama: 'FLSM dan VLSM',
    deskripsi: 'Bagi jaringan induk menjadi beberapa subnet ukuran tetap atau sesuai kebutuhan host.',
    contoh: '192.168.64.0/24 • 64, 24, 8 host',
    rute: '/flsm-vlsm',
    warnaOffset: 'bg-[#FCE76C]', // Kolom 2: primary (kuning)
  },
  {
    nama: 'Rencana ruangan',
    deskripsi: 'Susun alokasi subnet otomatis dari dua digit NIM serta jumlah ruangan dan device.',
    contoh: 'NIM 50 • 5 ruangan',
    rute: '/rencana',
    warnaOffset: 'bg-[#FF8F5C]', // Kolom 3: tertiary (oranye)
  },
  {
    nama: 'Konversi basis',
    deskripsi: 'Ubah bilangan antar basis biner, oktal, desimal, dan heksadesimal dengan tabel bit.',
    contoh: '10101100 -> 172',
    rute: '/konversi',
    warnaOffset: 'bg-[#8BD0FC]', // Kolom 1: secondary (biru)
  },
  {
    nama: 'Generator DHCP',
    deskripsi: 'Susun perintah CLI DHCP router dan prediksi alamat IP klien pertama.',
    contoh: '192.168.10.1/24 • excluded .1-.5',
    rute: '/dhcp',
    warnaOffset: 'bg-[#FCE76C]', // Kolom 2: primary (kuning)
  },
  {
    nama: 'Tabel IP perangkat',
    deskripsi: 'Rekap alamat IP, subnet mask, gateway, dan DNS perangkat siap salin dan cetak.',
    contoh: 'Server 192.168.1.1 • 255.255.255.0',
    rute: '/tabel-ip',
    warnaOffset: 'bg-[#FF8F5C]', // Kolom 3: tertiary (oranye)
  },
];

export const Beranda: React.FC = () => {
  return (
    <div className="flex flex-col gap-8 w-full max-w-[1280px] mx-auto">
      {/* 1. HEADER BAND (DESIGN.md) */}
      <div className="relative w-full rounded-[28px] border-2 border-[#1F1E22] bg-[#FCE76C] p-6 sm:p-8 lg:p-8 shadow-[6px_6px_0px_#1F1E22] flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex flex-col gap-3 max-w-3xl">
          <h1 className="font-display-xl text-[26px] sm:text-[32px] md:text-[40px] font-extrabold text-[#1F1E22] leading-tight">
            Selesaikan hitungan jaringan, langkah demi langkah
          </h1>
          <p className="font-body-md text-[14px] sm:text-[16px] text-[#1F1E22] leading-relaxed">
            Alat bantu praktikum Jaringan Komputer untuk menyelesaikan subnetting, rencana IP, konversi basis, dan konfigurasi DHCP langkah demi langkah.
          </p>
        </div>

        <div className="shrink-0 w-full sm:w-auto">
          <Link
            to="/subnetting?contoh=1"
            className="inline-flex items-center justify-center h-12 px-6 bg-[#FFFFFF] text-[#1F1E22] border-2 border-[#1F1E22] rounded-[12px] font-bold text-[16px] hover:bg-[#F5F6F8] active:translate-x-0.5 active:translate-y-0.5 transition-all shadow-[2px_2px_0px_#1F1E22] w-full sm:w-auto"
          >
            Coba contoh
          </Link>
        </div>
      </div>

      {/* 2. GRID KARTU FITUR (3 Kolom Desktop, 2 Tablet, 1 Mobile, Jarak 24px) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-2">
        {fiturList.map((fitur) => (
          <div key={fitur.rute} className="relative group">
            {/* Lapisan Bergeser 8px (2 * 4px) ke kanan dan ke bawah, sudut lg 20px, border ink 2px */}
            <div
              className={`absolute inset-0 translate-x-2 translate-y-2 ${fitur.warnaOffset} border-2 border-[#1F1E22] rounded-[20px] transition-transform group-hover:translate-x-2.5 group-hover:translate-y-2.5`}
              aria-hidden="true"
            />

            {/* Kartu Utama: background surface (#FFFFFF), border ink 2px, rounded lg (20px), padding 24px */}
            <Link
              to={fitur.rute}
              className="relative block bg-[#FFFFFF] border-2 border-[#1F1E22] rounded-[20px] p-6 flex flex-col justify-between gap-4 h-full min-h-[200px] transition-transform group-hover:-translate-x-0.5 group-hover:-translate-y-0.5 focus:outline-none"
            >
              <div className="flex flex-col gap-2">
                {/* 1. Nama Fitur (title - 18px bold) */}
                <h2 className="font-title text-[18px] font-bold text-[#1F1E22]">
                  {fitur.nama}
                </h2>

                {/* 2. Deskripsi satu baris (body-sm - 14px, text-muted) */}
                <p className="font-body-sm text-[14px] text-[#5B5F6B] leading-relaxed">
                  {fitur.deskripsi}
                </p>
              </div>

              {/* 3. Contoh input dalam kotak monospace (mono-sm, background #F5F6F8, sudut md 12px) */}
              <div className="mt-auto font-mono-sm text-[13px] font-mono text-[#1F1E22] bg-[#F5F6F8] border border-[#E3E5EA] rounded-[12px] p-3 truncate">
                {fitur.contoh}
              </div>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
};
