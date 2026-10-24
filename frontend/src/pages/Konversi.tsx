import React, { useState } from 'react';
import { api, ApiException } from '../services/api';
import type { StrukturJawaban, BitPositionItem } from '../types/api';
import { Banner } from '../components/Banner';
import { StepCard } from '../components/StepCard';
import { ResultTable } from '../components/ResultTable';
import { ConclusionBlock } from '../components/ConclusionBlock';
import { Binary, PlayCircle, Loader2, Sparkles } from 'lucide-react';

const BASIS_OPTIONS = [
  { label: 'Basis 2 (Biner)', value: 2 },
  { label: 'Basis 8 (Oktal)', value: 8 },
  { label: 'Basis 10 (Desimal)', value: 10 },
  { label: 'Basis 16 (Heksa)', value: 16 },
];

export const Konversi: React.FC = () => {
  // State Input Formulir
  const [nilai, setNilai] = useState<string>('10101100');
  const [basisAsal, setBasisAsal] = useState<number>(2);
  const [modeIpv4, setModeIpv4] = useState<boolean>(false);

  // Status Validasi dan Loading
  const [fieldErrors, setFieldErrors] = useState<{ nilai?: string; basis_asal?: string }>({});
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [hasil, setHasil] = useState<StrukturJawaban | null>(null);

  const jalankanHitung = async (
    nilaiVal: string,
    basisVal: number,
    ipv4Val: boolean
  ) => {
    setFieldErrors({});
    setGeneralError(null);

    const cleanNilai = nilaiVal.trim();
    if (!cleanNilai) {
      setFieldErrors({ nilai: 'Nilai masukan tidak boleh kosong.' });
      return;
    }

    setLoading(true);
    try {
      const response = await api.hitungKonversi({
        nilai: cleanNilai,
        basis_asal: basisVal,
        mode_ipv4: ipv4Val,
      });
      setHasil(response);
    } catch (err: any) {
      if (err instanceof ApiException) {
        if (err.field === 'nilai') {
          setFieldErrors({ nilai: err.message });
        } else if (err.field === 'basis_asal') {
          setFieldErrors({ basis_asal: err.message });
        } else {
          setGeneralError(err.message);
        }
      } else {
        setGeneralError('Gagal menghubungi server perhitungan konversi basis.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    jalankanHitung(nilai, basisAsal, modeIpv4);
  };

  const handleIsiContohModul = () => {
    setNilai('10101100');
    setBasisAsal(2);
    setModeIpv4(false);
    jalankanHitung('10101100', 2, false);
  };

  const handlePilihContohCepat = (val: string, basis: number, ipv4 = false) => {
    setNilai(val);
    setBasisAsal(basis);
    setModeIpv4(ipv4);
    jalankanHitung(val, basis, ipv4);
  };

  return (
    <div className="flex flex-col gap-8 w-full max-w-7xl mx-auto pb-12">
      {/* 1. Header Band Kuning Bersih (Tanpa Badge / Box Karangan Stitch) */}
      <header className="rounded-[28px] border-2 border-[#1F1E22] bg-[#FCE76C] p-6 sm:p-8 shadow-[6px_6px_0px_#1F1E22]">
        <h1 className="font-display-xl text-[28px] sm:text-[34px] font-extrabold text-[#1F1E22] tracking-tight">
          Konversi basis
        </h1>
        <p className="font-body-md text-[15px] sm:text-[16px] text-[#1F1E22] mt-2 font-medium leading-relaxed max-w-3xl">
          Ubah bilangan antar basis biner, oktal, desimal, dan heksadesimal lengkap dengan tabel bit dan langkah pembagian.
        </p>
      </header>

      {/* 2. Layout Dua Kolom: 5/12 Kiri (Formulir) & 7/12 Kanan (Hasil) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* KOLOM KIRI: FORMULIR STICKY (5 Kolom) */}
        <div className="lg:col-span-5 lg:sticky lg:top-24 space-y-6">
          <div className="bg-[#FFFFFF] border-2 border-[#1F1E22] rounded-[20px] p-6 shadow-[4px_4px_0px_#1F1E22] flex flex-col gap-5">
            <div className="flex items-center justify-between pb-3 border-b border-[#E3E5EA]">
              <div>
                <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-[#5B5F6B]">
                  Parameter Input
                </span>
                <h2 className="font-title text-[18px] font-bold text-[#1F1E22]">
                  Formulir Konversi
                </h2>
              </div>
              <span className="text-[12px] font-mono font-bold px-2.5 py-1 bg-[#FFF8D1] border border-[#FCE76C] rounded-md text-[#1F1E22]">
                Basis {basisAsal}
              </span>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              {/* Field 1: Nilai Masukan */}
              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="nilai"
                  className="font-sans font-bold text-[13px] uppercase tracking-wider text-[#1F1E22]"
                >
                  Nilai Masukan
                </label>
                <input
                  id="nilai"
                  type="text"
                  value={nilai}
                  onChange={(e) => {
                    setNilai(e.target.value);
                    if (fieldErrors.nilai) {
                      setFieldErrors((prev) => ({ ...prev, nilai: undefined }));
                    }
                  }}
                  placeholder="Contoh: 10101100 atau 234"
                  className={`w-full h-12 px-4 font-mono font-bold text-[17px] text-[#1F1E22] bg-[#FFFFFF] rounded-[12px] border-2 transition-all ${
                    fieldErrors.nilai
                      ? 'border-[#B3261E] focus:outline-none focus:ring-2 focus:ring-[#B3261E]/20'
                      : 'border-[#8A8F9C] focus:border-[#1F1E22] focus:outline-none'
                  }`}
                />
                {fieldErrors.nilai ? (
                  <p className="text-[12px] text-[#B3261E] font-medium leading-tight">
                    {fieldErrors.nilai}
                  </p>
                ) : (
                  <p className="text-[12px] text-[#5B5F6B] leading-tight">
                    {basisAsal === 2 && 'Menerima digit biner 0 dan 1 (maksimal 64 bit).'}
                    {basisAsal === 8 && 'Menerima digit oktal 0 sampai 7.'}
                    {basisAsal === 10 && 'Menerima bilangan bulat positif 0 sampai 255 (atau hingga 64-bit).'}
                    {basisAsal === 16 && 'Menerima digit 0–9, huruf A–F (huruf kecil maupun awalan 0x didukung).'}
                  </p>
                )}
              </div>

              {/* Field 2: Pemilih Basis Asal (Segmented Tab Control - Tidak Menyaingi Tombol Primary) */}
              <div className="flex flex-col gap-1.5">
                <span className="font-sans font-bold text-[13px] uppercase tracking-wider text-[#1F1E22]">
                  Basis Asal
                </span>
                <div className="grid grid-cols-2 gap-2 select-none">
                  {BASIS_OPTIONS.map((opt) => {
                    const isSelected = basisAsal === opt.value;
                    return (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => {
                          setBasisAsal(opt.value);
                          if (fieldErrors.basis_asal) {
                            setFieldErrors((prev) => ({ ...prev, basis_asal: undefined }));
                          }
                        }}
                        className={`py-2.5 px-3 rounded-[12px] font-sans font-bold text-[13px] border-2 transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-[#1F1E22] text-[#FFFFFF] border-[#1F1E22] shadow-2xs'
                            : 'bg-[#FFFFFF] text-[#5B5F6B] border-[#E3E5EA] hover:border-[#8A8F9C] hover:text-[#1F1E22]'
                        }`}
                      >
                        {opt.label}
                      </button>
                    );
                  })}
                </div>
                {fieldErrors.basis_asal && (
                  <p className="text-[12px] text-[#B3261E] font-medium leading-tight">
                    {fieldErrors.basis_asal}
                  </p>
                )}
              </div>

              {/* Field 3: Toggle Mode IPv4 (4 Oktet) */}
              <div className="pt-1">
                <label className="flex items-start gap-3 p-3 bg-[#F5F6F8] border border-[#E3E5EA] rounded-[12px] cursor-pointer hover:bg-[#EDF2EE] transition-colors select-none">
                  <input
                    type="checkbox"
                    checked={modeIpv4}
                    onChange={(e) => setModeIpv4(e.target.checked)}
                    className="w-4 h-4 rounded border-2 border-[#1F1E22] text-[#1F1E22] focus:ring-0 mt-0.5 cursor-pointer"
                  />
                  <div className="flex flex-col">
                    <span className="font-sans font-bold text-[13px] text-[#1F1E22]">
                      Mode IPv4 (Konversi 4 Oktet)
                    </span>
                    <span className="text-[11px] text-[#5B5F6B] leading-tight mt-0.5">
                      Evaluasi nilai per oktet dipisahkan titik (misal: 172.16.0.1 atau AC.10.00.01).
                    </span>
                  </div>
                </label>
              </div>

              {/* Tombol Aksi: Aturan Satu Tombol Primary Kuning #FCE76C */}
              <div className="flex flex-col gap-2.5 pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full h-12 bg-[#FCE76C] hover:bg-[#F2D640] text-[#1F1E22] font-sans font-extrabold text-[15px] rounded-[12px] border-2 border-[#1F1E22] shadow-[2px_2px_0px_#1F1E22] active:translate-y-0.5 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      <span>Mengonversi...</span>
                    </>
                  ) : (
                    <>
                      <Binary size={18} />
                      <span>Hitung</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={handleIsiContohModul}
                  className="w-full h-11 bg-[#FFFFFF] hover:bg-[#F5F6F8] text-[#1F1E22] font-sans font-bold text-[13px] rounded-[12px] border border-[#1F1E22]/30 active:translate-y-0.5 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <PlayCircle size={16} />
                  <span>Isi contoh Modul 2 (10101100 Biner)</span>
                </button>
              </div>

              {/* Chips Contoh Cepat untuk Kasus Emas G-JAR-03 */}
              <div className="pt-2 border-t border-[#E3E5EA] flex flex-col gap-1.5">
                <span className="text-[11px] font-mono font-bold uppercase text-[#5B5F6B] flex items-center gap-1">
                  <Sparkles size={12} className="text-[#1F1E22]" />
                  Uji Cepat Data Emas (G-JAR-03):
                </span>
                <div className="flex flex-wrap gap-1.5">
                  <button
                    type="button"
                    onClick={() => handlePilihContohCepat('10101100', 2, false)}
                    className="px-2.5 py-1 text-[11px] font-mono font-bold rounded-[8px] bg-[#E3F4FE] hover:bg-[#8BD0FC] text-[#1F1E22] border border-[#1F1E22]/30 transition-colors cursor-pointer"
                  >
                    10101100 (Biner)
                  </button>
                  <button
                    type="button"
                    onClick={() => handlePilihContohCepat('234', 10, false)}
                    className="px-2.5 py-1 text-[11px] font-mono font-bold rounded-[8px] bg-[#FFF8D1] hover:bg-[#FCE76C] text-[#1F1E22] border border-[#1F1E22]/30 transition-colors cursor-pointer"
                  >
                    234 (Desimal)
                  </button>
                  <button
                    type="button"
                    onClick={() => handlePilihContohCepat('FF', 16, false)}
                    className="px-2.5 py-1 text-[11px] font-mono font-bold rounded-[8px] bg-[#FFE6DA] hover:bg-[#FF8F5C] text-[#1F1E22] border border-[#1F1E22]/30 transition-colors cursor-pointer"
                  >
                    FF (Heksa)
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>

        {/* KOLOM KANAN: AREA HASIL (7 Kolom) */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          {/* Banner Error Global */}
          {generalError && (
            <Banner
              variant="error"
              pesan={generalError}
              onClose={() => setGeneralError(null)}
            />
          )}

          {/* State Loading */}
          {loading && (
            <div className="bg-[#FFFFFF] border-2 border-[#1F1E22] rounded-[20px] p-8 flex flex-col items-center justify-center gap-3 min-h-[300px]">
              <Loader2 size={32} className="animate-spin text-[#1F1E22]" />
              <p className="font-sans font-bold text-[15px] text-[#1F1E22]">
                Mengonversi bilangan dan menyusun tabel bit...
              </p>
            </div>
          )}

          {/* State Kosong */}
          {!loading && !hasil && (
            <div className="bg-[#FFFFFF] border-2 border-[#1F1E22] rounded-[20px] p-8 flex flex-col items-center text-center justify-center gap-4 min-h-[320px]">
              <div className="w-12 h-12 rounded-[16px] bg-[#FFF8D1] border-2 border-[#1F1E22] flex items-center justify-center text-[#1F1E22]">
                <Binary size={24} />
              </div>
              <div className="max-w-md flex flex-col gap-1.5">
                <h3 className="font-title text-[18px] font-bold text-[#1F1E22]">
                  Belum Ada Hasil Perhitungan
                </h3>
                <p className="font-body-sm text-[14px] text-[#5B5F6B] leading-relaxed">
                  Pilih basis asal dan masukkan bilangan pada formulir di sebelah kiri, lalu klik{' '}
                  <strong className="text-[#1F1E22]">Hitung</strong> untuk melihat dekomposisi tabel bit 8-bit dan langkah pembagian berulang.
                </p>
              </div>
              <button
                type="button"
                onClick={handleIsiContohModul}
                className="px-5 py-2.5 bg-[#FCE76C] hover:bg-[#F2D640] text-[#1F1E22] font-bold text-[14px] rounded-[10px] border-2 border-[#1F1E22] shadow-2xs active:translate-y-0.5 transition-all cursor-pointer"
              >
                Coba Contoh 10101100 (Biner)
              </button>
            </div>
          )}

          {/* State Hasil: Urutan Wajib (Ringkasan -> Diketahui -> Langkah -> Hasil Akhir -> Kesimpulan) */}
          {!loading && hasil && (
            <div className="flex flex-col gap-6">
              {/* Step 1: Ringkasan Hasil (4 Kartu Lapisan Warna Bergeser + Tabel Posisi Bit 8-Bit) */}
              <section className="flex flex-col gap-6">
                {/* 4 Kartu Nilai Hasil dengan Lapisan Bergeser */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {/* Kartu 1: Biner (Lapisan Biru #8BD0FC) */}
                  <div className="relative group">
                    <div
                      className="absolute inset-0 translate-x-2 translate-y-2 bg-[#8BD0FC] border-2 border-[#1F1E22] rounded-[20px] transition-transform"
                      aria-hidden="true"
                    />
                    <div className="relative bg-[#FFFFFF] border-2 border-[#1F1E22] rounded-[20px] p-5 flex flex-col justify-between h-full">
                      <div>
                        <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#5B5F6B] block mb-1">
                          Biner (Base 2)
                        </span>
                        <div className="font-mono text-2xl sm:text-3xl font-black text-[#1F1E22] tracking-wider my-1 break-all">
                          {hasil.hasil_akhir.biner}
                        </div>
                      </div>
                      <div className="mt-3 pt-2.5 border-t border-[#1F1E22]/15 flex items-center justify-between text-[11px] font-bold text-[#5B5F6B]">
                        <span>{hasil.hasil_akhir.mode_ipv4 ? '4 oktet x 8-bit' : '8 bit (1 oktet)'}</span>
                        <span className="font-mono text-[#1F1E22]">2^n</span>
                      </div>
                    </div>
                  </div>

                  {/* Kartu 2: Desimal (Lapisan Kuning #FCE76C) */}
                  <div className="relative group">
                    <div
                      className="absolute inset-0 translate-x-2 translate-y-2 bg-[#FCE76C] border-2 border-[#1F1E22] rounded-[20px] transition-transform"
                      aria-hidden="true"
                    />
                    <div className="relative bg-[#FFFFFF] border-2 border-[#1F1E22] rounded-[20px] p-5 flex flex-col justify-between h-full">
                      <div>
                        <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#5B5F6B] block mb-1">
                          Desimal (Base 10)
                        </span>
                        <div className="font-mono text-2xl sm:text-3xl font-black text-[#1F1E22] tracking-wider my-1">
                          {hasil.hasil_akhir.desimal}
                        </div>
                      </div>
                      <div className="mt-3 pt-2.5 border-t border-[#1F1E22]/15 flex items-center justify-between text-[11px] font-bold text-[#5B5F6B]">
                        <span>{hasil.hasil_akhir.mode_ipv4 ? 'IPv4 Dotted-Decimal' : 'Rentang 0–255'}</span>
                        <span className="font-mono text-[#1F1E22]">10^n</span>
                      </div>
                    </div>
                  </div>

                  {/* Kartu 3: Heksadesimal (Lapisan Oranye #FF8F5C) */}
                  <div className="relative group">
                    <div
                      className="absolute inset-0 translate-x-2 translate-y-2 bg-[#FF8F5C] border-2 border-[#1F1E22] rounded-[20px] transition-transform"
                      aria-hidden="true"
                    />
                    <div className="relative bg-[#FFFFFF] border-2 border-[#1F1E22] rounded-[20px] p-5 flex flex-col justify-between h-full">
                      <div>
                        <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#5B5F6B] block mb-1">
                          Heksadesimal (Base 16)
                        </span>
                        <div className="font-mono text-2xl sm:text-3xl font-black text-[#1F1E22] tracking-wider my-1">
                          {hasil.hasil_akhir.heksadesimal_prefixed || `0x${hasil.hasil_akhir.heksadesimal}`}
                        </div>
                      </div>
                      <div className="mt-3 pt-2.5 border-t border-[#1F1E22]/15 flex items-center justify-between text-[11px] font-bold text-[#5B5F6B]">
                        <span>{hasil.hasil_akhir.mode_ipv4 ? 'Notasi Heksa IPv4' : 'Pemisahan 2 Nibble'}</span>
                        <span className="font-mono text-[#1F1E22]">16^n</span>
                      </div>
                    </div>
                  </div>

                  {/* Kartu 4: Oktal (Lapisan Netral #C9D0E4) */}
                  <div className="relative group">
                    <div
                      className="absolute inset-0 translate-x-2 translate-y-2 bg-[#C9D0E4] border-2 border-[#1F1E22] rounded-[20px] transition-transform"
                      aria-hidden="true"
                    />
                    <div className="relative bg-[#FFFFFF] border-2 border-[#1F1E22] rounded-[20px] p-5 flex flex-col justify-between h-full">
                      <div>
                        <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#5B5F6B] block mb-1">
                          Oktal (Base 8)
                        </span>
                        <div className="font-mono text-2xl sm:text-3xl font-black text-[#1F1E22] tracking-wider my-1">
                          {hasil.hasil_akhir.oktal}
                        </div>
                      </div>
                      <div className="mt-3 pt-2.5 border-t border-[#1F1E22]/15 flex items-center justify-between text-[11px] font-bold text-[#5B5F6B]">
                        <span>Kelompok 3-Bit</span>
                        <span className="font-mono text-[#1F1E22]">8^n</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Kartu Tabel Posisi Bit 8-Bit (128 sampai 1) */}
                <div
                  className="bg-[#FFFFFF] border-2 border-[#1F1E22] rounded-[20px] p-6 shadow-sm flex flex-col gap-4"
                  id="bitTableCard"
                  data-testid="bit-table-card"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-[#E3E5EA]">
                    <div>
                      <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-[#5B5F6B]">
                        Dekomposisi Bit Bobot Posisi
                      </span>
                      <h2 className="font-title text-[18px] font-bold text-[#1F1E22]">
                        Tabel Posisi Bit 8-Bit (128 sampai 1)
                      </h2>
                    </div>
                    <span className="text-[12px] font-mono font-bold bg-[#F5F6F8] border border-[#1F1E22]/20 px-3 py-1 rounded-md text-[#1F1E22] self-start sm:self-auto">
                      Total Akumulasi: {hasil.hasil_akhir.desimal}
                    </span>
                  </div>

                  <p className="text-[13px] text-[#5B5F6B] leading-relaxed">
                    Representasi bit order MSB (Most Significant Bit, bobot 128) ke LSB (Least Significant Bit, bobot 1).
                    Kolom bernilai <strong className="text-[#1F1E22]">1</strong> berlatar kuning dijumlahkan nilainya.
                  </p>

                  {/* Grid 8 Kolom Bit */}
                  <div className="overflow-x-auto pb-1">
                    <div className="min-w-[560px] grid grid-cols-8 gap-2 font-mono">
                      {hasil.hasil_akhir.tabel_bit.map((item: BitPositionItem) => {
                        const isAktif = item.aktif;
                        return (
                          <div
                            key={item.bobot}
                            className={`flex flex-col border-2 rounded-xl overflow-hidden transition-all ${
                              isAktif
                                ? 'border-[#1F1E22] bg-[#FCE76C] shadow-[2px_2px_0px_#1F1E22]'
                                : 'border-[#1F1E22]/30 bg-[#F5F6F8]'
                            }`}
                          >
                            <div
                              className={`text-[11px] py-1 text-center font-bold select-none ${
                                isAktif
                                  ? 'bg-[#1F1E22] text-[#FCE76C]'
                                  : 'bg-[#1F1E22]/15 text-[#5B5F6B]'
                              }`}
                            >
                              {item.pangkat}
                            </div>
                            <div
                              className={`py-1.5 text-center text-xs font-bold border-b ${
                                isAktif
                                  ? 'border-[#1F1E22] text-[#1F1E22]'
                                  : 'border-[#1F1E22]/20 text-[#5B5F6B]'
                              }`}
                            >
                              {item.bobot}
                            </div>
                            <div
                              className={`py-2 text-center text-xl font-black ${
                                isAktif ? 'text-[#1F1E22]' : 'text-[#8A8F9C]'
                              }`}
                            >
                              {item.bit}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Rumus Akumulasi Nilai Aktif */}
                  <div className="p-3.5 bg-[#F5F6F8] border border-[#E3E5EA] rounded-[12px] flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-[12px] font-sans font-bold text-[#5B5F6B]">
                        Rumus Akumulasi Bobot Aktif:
                      </span>
                      <span className="font-mono font-extrabold text-[15px] text-[#1F1E22]">
                        {hasil.hasil_akhir.rumus_penjumlahan}
                      </span>
                    </div>
                  </div>

                  {/* Legenda Bit */}
                  <div className="flex flex-wrap items-center gap-4 text-[12px] font-sans text-[#5B5F6B] pt-1">
                    <div className="flex items-center gap-1.5">
                      <span className="w-3.5 h-3.5 rounded bg-[#FCE76C] border border-[#1F1E22]" />
                      <span>Kuning: bit bernilai 1 yang dijumlahkan</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-3.5 h-3.5 rounded bg-[#F5F6F8] border border-[#1F1E22]/30" />
                      <span>Abu-abu: bit bernilai 0</span>
                    </div>
                  </div>
                </div>
              </section>

              {/* Step 2: Diketahui */}
              <section className="bg-[#FFFFFF] border-2 border-[#1F1E22] rounded-[20px] p-6 shadow-sm flex flex-col gap-3">
                <h3 className="font-sans font-extrabold text-[15px] uppercase tracking-wider text-[#1F1E22]">
                  Diketahui
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {hasil.diketahui.map((d) => (
                    <div
                      key={d.label}
                      className="p-3 bg-[#F5F6F8] border border-[#E3E5EA] rounded-[12px] flex flex-col"
                    >
                      <span className="font-sans text-[11px] font-bold uppercase text-[#5B5F6B]">
                        {d.label}
                      </span>
                      <span className="font-mono font-bold text-[14px] text-[#1F1E22] mt-0.5">
                        {d.nilai}
                      </span>
                    </div>
                  ))}
                </div>
              </section>

              {/* Step 3: Kartu Langkah 1..N (StepCard) */}
              <div className="flex flex-col gap-6">
                <div className="flex items-center gap-2 pt-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#1F1E22]" />
                  <h3 className="font-sans font-extrabold text-[16px] text-[#1F1E22] uppercase tracking-wide">
                    Langkah Pengerjaan Soal (Format Lembar Jawaban)
                  </h3>
                </div>

                {hasil.langkah.map((l, index) => {
                  const fadedNums = ['01', '02', '03', '04', '05'];
                  return (
                    <StepCard
                      key={l.judul}
                      nomor={index + 1}
                      langkah={l}
                      fadedLabel={fadedNums[index] || `#${index + 1}`}
                    />
                  );
                })}
              </div>

              {/* Step 4: Hasil Akhir (ResultTable) */}
              {hasil.hasil_akhir.tabel && (
                <ResultTable
                  tabel={hasil.hasil_akhir.tabel}
                  mode="konversi"
                  judul="Tabel Ringkasan Hasil Konversi Basis"
                />
              )}

              {/* Step 5: Kesimpulan (Blok Kuning) */}
              <ConclusionBlock kesimpulan={hasil.kesimpulan} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
