import React from 'react';

export const Tentang: React.FC = () => {
  return (
    <div className="flex flex-col gap-6 w-full max-w-[720px]">
      <div className="rounded-[28px] border-2 border-[#1F1E22] bg-[#FCE76C] p-6 sm:p-8 shadow-[6px_6px_0px_#1F1E22]">
        <h1 className="font-display-xl text-[28px] sm:text-[34px] font-extrabold text-[#1F1E22]">
          Tentang Asisten Praktikum Jaringan
        </h1>
        <p className="font-body-md text-[15px] text-[#1F1E22] mt-2">
          Alat bantu praktikum mandiri dan persiapan kuis Jaringan Komputer dengan format lembar jawaban lengkap serta presisi tinggi.
        </p>
      </div>

      <div className="bg-[#FFFFFF] border-2 border-[#1F1E22] rounded-[20px] p-6 shadow-xs flex flex-col gap-5">
        <div className="pb-4 border-b border-[#E3E5EA] flex items-center justify-center sm:justify-start">
          <img
            src="/logo.png"
            alt="Logo Asisten Praktikum Jaringan"
            className="h-12 sm:h-14 w-auto object-contain"
          />
        </div>

        <div>
          <h2 className="font-title text-[18px] font-bold text-[#1F1E22] mb-1">
            Cara Memakai
          </h2>
          <p className="text-[#5B5F6B] text-[14px] leading-relaxed">
            Pilih modul perhitungan yang sesuai dari menu samping. Masukkan data soal atau klik &quot;Coba contoh&quot; untuk mengisi otomatis data latihan standar praktikum. Hasil akan dihitung secara deterministik dan ditampilkan langkah demi langkah.
          </p>
        </div>

        <div>
          <h2 className="font-title text-[18px] font-bold text-[#1F1E22] mb-1">
            Rujukan Modul
          </h2>
          <p className="text-[#5B5F6B] text-[14px] leading-relaxed">
            Disusun mengacu pada Modul Praktikum Jaringan Komputer (Modul 2: Konfigurasi Dasar, Modul 3: Jaringan Nirkabel & DHCP, Modul 4: Server Web dan DNS).
          </p>
        </div>

        <div>
          <h2 className="font-title text-[18px] font-bold text-[#1F1E22] mb-1">
            Keterbatasan
          </h2>
          <p className="text-[#5B5F6B] text-[14px] leading-relaxed">
            Perintah konfigurasi CLI Cisco mengikuti panduan praktikum dan belum diuji di semua versi IOS atau Cisco Packet Tracer. Gunakan sebagai alat bantu belajar dan verifikasi mandiri.
          </p>
        </div>
      </div>
    </div>
  );
};
