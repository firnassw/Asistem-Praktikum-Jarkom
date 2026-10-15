import React from 'react';
import type { LangkahItem } from '../types/api';
import { BinaryTwoColor } from './BinaryTwoColor';
import { CheckCircle2 } from 'lucide-react';

interface StepCardProps {
  nomor: number;
  langkah: LangkahItem;
  offsetColor?: string;
  fadedLabel?: string;
}

const STEP_COLORS = [
  'bg-[#8BD0FC]', // Langkah 1: biru
  'bg-[#FCE76C]', // Langkah 2: kuning
  'bg-[#FF8F5C]', // Langkah 3: oranye
  'bg-[#C9D0E4]', // Langkah 4: abu-biru
  'bg-[#8BD0FC]', // Langkah 5: biru
];

export const StepCard: React.FC<StepCardProps> = ({
  nomor,
  langkah,
  offsetColor,
  fadedLabel,
}) => {
  const chosenOffset = offsetColor || STEP_COLORS[(nomor - 1) % STEP_COLORS.length];

  // Helper render konten spesifik langkah
  const renderKontenLangkah = () => {
    const tabelData = langkah.tabel as Record<string, any> | undefined;

    if (tabelData?.tipe === 'biner_dua_warna') {
      return (
        <BinaryTwoColor
          ipBiner={tabelData.ip_biner}
          maskBiner={tabelData.mask_biner}
          prefix={tabelData.prefix}
          ipDesimal={tabelData.ip_desimal}
          maskDesimal={tabelData.mask_desimal}
        />
      );
    }

    if (tabelData?.tipe === 'operasi_biner') {
      return (
        <div className="p-4 bg-[#F5F6F8] border border-[#E3E5EA] rounded-[14px] font-mono text-[12px] sm:text-[13px] leading-relaxed overflow-x-auto text-[#1F1E22]">
          <div className="min-w-[500px] space-y-1">
            <div className="flex justify-between">
              <span>{tabelData.op1_label.padEnd(8)} : {tabelData.op1}</span>
            </div>
            {tabelData.op2 && (
              <div className="flex justify-between">
                <span>{tabelData.op2_label.padEnd(8)} : {tabelData.op2}</span>
              </div>
            )}
            <div className="text-[#8A8F9C] text-[11px] pt-1">
              ------------------------------------------------- (Operasi Bitwise {tabelData.operasi})
            </div>
            <div className="flex justify-between font-bold pt-1 text-[#1F1E22]">
              <span className="bg-[#FFF8D1] px-1 py-0.5 rounded border border-[#FCE76C]/60">
                {tabelData.hasil_label.padEnd(8)} : {tabelData.hasil_biner}
              </span>
            </div>
          </div>
        </div>
      );
    }

    if (tabelData?.tipe === 'karakteristik') {
      return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
          {/* Jumlah Subnet */}
          <div className="p-3.5 bg-[#F5F6F8] border border-[#E3E5EA] rounded-[12px] space-y-1">
            <span className="text-[11px] font-sans font-bold text-[#5B5F6B] uppercase tracking-wider">
              Jumlah Subnet
            </span>
            <div className="font-mono font-bold text-[16px] text-[#1F1E22]">
              {tabelData.x !== null ? (
                <>2<sup>x</sup> = 2<sup>{tabelData.x}</sup> = {tabelData.jumlah_subnet}</>
              ) : (
                'Tidak berlaku'
              )}
            </div>
            <p className="text-[11px] text-[#5B5F6B] leading-tight font-sans">
              {tabelData.x !== null
                ? `x = ${tabelData.x} bit yang dipinjam dari batas kelas.`
                : tabelData.catatan || 'Prefix di bawah default kelas.'}
            </p>
          </div>

          {/* Host per Subnet */}
          <div className="p-3.5 bg-[#F5F6F8] border border-[#E3E5EA] rounded-[12px] space-y-1">
            <span className="text-[11px] font-sans font-bold text-[#5B5F6B] uppercase tracking-wider">
              Host Valid / Subnet
            </span>
            <div className="font-mono font-bold text-[16px] text-[#1F1E22]">
              2<sup>y</sup> - 2 = {tabelData.host_per_subnet}
            </div>
            <p className="text-[11px] text-[#5B5F6B] leading-tight font-sans">
              y = {tabelData.y} bit host (bit 0 pada subnet mask).
            </p>
          </div>

          {/* Blok Subnet */}
          <div className="p-3.5 bg-[#F5F6F8] border border-[#E3E5EA] rounded-[12px] space-y-1">
            <span className="text-[11px] font-sans font-bold text-[#5B5F6B] uppercase tracking-wider">
              Ukuran Blok Subnet
            </span>
            <div className="font-mono font-bold text-[16px] text-[#1F1E22]">
              256 - {tabelData.nilai_oktet_mask} = {tabelData.blok_subnet}
            </div>
            <p className="text-[11px] text-[#5B5F6B] leading-tight font-sans">
              Lompatan oktet ke-{tabelData.oktet_ke}: kelipatan {tabelData.blok_subnet}.
            </p>
          </div>
        </div>
      );
    }

    if (langkah.rumus) {
      return (
        <div className="p-3 bg-[#F5F6F8] border border-[#E3E5EA] rounded-[12px] font-mono text-[13px] text-[#1F1E22]">
          {langkah.rumus}
        </div>
      );
    }

    return null;
  };

  return (
    <div className="relative group w-full">
      {/* Lapisan Bergeser 8px ke kanan dan ke bawah, sudut 20px, border 2px ink */}
      <div
        className={`absolute inset-0 translate-x-2 translate-y-2 ${chosenOffset} border-2 border-[#1F1E22] rounded-[20px] transition-transform`}
        aria-hidden="true"
      />

      {/* Kartu Utama: Surface putih, border 2px ink, rounded 20px, padding 24px */}
      <article className="relative bg-[#FFFFFF] border-2 border-[#1F1E22] rounded-[20px] p-6 flex flex-col gap-4">
        {/* Header Langkah */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-[#1F1E22] text-[#FFFFFF] font-mono font-bold text-[14px] flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
              {nomor}
            </div>
            <div className="flex flex-col">
              <h3 className="font-title text-[18px] font-bold text-[#1F1E22] leading-snug">
                {langkah.judul}
              </h3>
              <p className="font-body-sm text-[14px] text-[#5B5F6B] leading-relaxed mt-0.5">
                {langkah.penjelasan}
              </p>
            </div>
          </div>

          {/* Numeral / Label Faded Dekoratif di Sudut Kanan Atas */}
          {fadedLabel && (
            <span
              className="font-mono text-2xl sm:text-3xl font-extrabold text-[#D6D9E2] select-none shrink-0"
              aria-hidden="true"
            >
              {fadedLabel}
            </span>
          )}
        </div>

        {/* Konten Perhitungan & Rumus */}
        {renderKontenLangkah()}

        {/* Baris Hasil Langkah */}
        {langkah.hasil && (
          <div className="p-3 bg-[#E3F4FE] border border-[#8BD0FC] rounded-[10px] text-[13px] font-sans text-[#1F1E22] font-semibold flex items-center gap-2">
            <CheckCircle2 size={16} className="text-[#1F1E22] shrink-0" />
            <span>{langkah.hasil}</span>
          </div>
        )}
      </article>
    </div>
  );
};
