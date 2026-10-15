import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api, ApiException } from '../services/api';
import type {
  KebutuhanItem,
  StrukturJawaban,
  VlsmTableRow,
} from '../types/api';
import { Banner } from '../components/Banner';
import { AddressBar, getSubnetColor } from '../components/AddressBar';
import { StepCard } from '../components/StepCard';
import { ResultTable } from '../components/ResultTable';
import { ConclusionBlock } from '../components/ConclusionBlock';
import {
  Calculator,
  PlayCircle,
  Loader2,
  PlusCircle,
  Trash2,
  AlertOctagon,
  ArrowRight,
  GitFork,
  Maximize2,
} from 'lucide-react';

// Hitung preview prefix otomatis dari host
function getPrefixPreview(host: number): number {
  if (host < 1) return 30;
  const bitH = (host + 1).toString(2).length;
  const p = 32 - bitH;
  return p > 30 ? 30 : p;
}

export const FlsmVlsm: React.FC = () => {
  const [searchParams] = useSearchParams();

  // Mode Alokasi: 'vlsm' (default) | 'flsm'
  const [metode, setMetode] = useState<'vlsm' | 'flsm'>('vlsm');
  const [alamatInduk, setAlamatInduk] = useState<string>('192.168.64.0');
  const [prefixInduk, setPrefixInduk] = useState<number>(24);
  const [gayaModul, setGayaModul] = useState<boolean>(false);

  // Daftar Kebutuhan (1 sampai 20 ruangan)
  const [kebutuhan, setKebutuhan] = useState<KebutuhanItem[]>([
    { nama: 'Lab Jaringan', host: 64 },
    { nama: 'Lab Komputasi', host: 24 },
    { nama: 'Lab Mulmed', host: 8 },
  ]);

  // Validasi error
  const [fieldErrors, setFieldErrors] = useState<{
    alamat_induk?: string;
    prefix_induk?: string;
    kebutuhan?: string;
  }>({});
  const [generalError, setGeneralError] = useState<string | null>(null);

  // Status error khusus FLSM_TIDAK_MUNGKIN
  const [flsmError, setFlsmError] = useState<{
    pesan: string;
    prefix_saran?: number;
  } | null>(null);

  // Status perhitungan
  const [loading, setLoading] = useState<boolean>(false);
  const [hasil, setHasil] = useState<StrukturJawaban | null>(null);

  // Handler tambah baris ruangan
  const handleTambahBaris = () => {
    if (kebutuhan.length >= 20) return;
    const nextNum = kebutuhan.length + 1;
    setKebutuhan([...kebutuhan, { nama: `Ruangan ${nextNum}`, host: 10 }]);
  };

  // Handler hapus baris ruangan
  const handleHapusBaris = (index: number) => {
    if (kebutuhan.length <= 1) return;
    setKebutuhan(kebutuhan.filter((_, i) => i !== index));
  };

  // Handler ubah field ruangan
  const handleUbahRuangan = (
    index: number,
    field: 'nama' | 'host',
    value: string
  ) => {
    const updated = [...kebutuhan];
    if (field === 'nama') {
      updated[index].nama = value;
    } else {
      const parsed = parseInt(value, 10);
      updated[index].host = isNaN(parsed) ? 0 : parsed;
    }
    setKebutuhan(updated);
    if (fieldErrors.kebutuhan) {
      setFieldErrors((prev) => ({ ...prev, kebutuhan: undefined }));
    }
  };

  // Fungsi eksekusi perhitungan
  const jalankanHitung = async (
    targetMetode = metode,
    targetInduk = alamatInduk,
    targetPrefix = prefixInduk,
    targetKebutuhan = kebutuhan,
    targetGayaModul = gayaModul
  ) => {
    setFieldErrors({});
    setGeneralError(null);
    setFlsmError(null);

    // Validasi ringan di frontend
    if (!targetInduk.trim()) {
      setFieldErrors({ alamat_induk: 'Alamat induk harus diisi.' });
      return;
    }

    if (isNaN(targetPrefix) || targetPrefix < 0 || targetPrefix > 30) {
      setFieldErrors({ prefix_induk: 'Prefix induk harus antara 0 sampai 30.' });
      return;
    }

    if (targetKebutuhan.length < 1 || targetKebutuhan.length > 20) {
      setFieldErrors({ kebutuhan: 'Jumlah ruangan harus antara 1 sampai 20.' });
      return;
    }

    setLoading(true);
    try {
      let response: StrukturJawaban;
      if (targetMetode === 'vlsm') {
        response = await api.hitungVlsm({
          alamat_induk: targetInduk.trim(),
          prefix_induk: targetPrefix,
          kebutuhan: targetKebutuhan.map((k) => ({
            nama: k.nama.trim(),
            host: Number(k.host),
          })),
        });
      } else {
        response = await api.hitungFlsm({
          alamat_induk: targetInduk.trim(),
          prefix_induk: targetPrefix,
          kebutuhan: targetKebutuhan.map((k) => ({
            nama: k.nama.trim(),
            host: Number(k.host),
          })),
          gaya_modul: targetGayaModul,
        });
      }
      setHasil(response);
    } catch (err: any) {
      setHasil(null);
      if (err instanceof ApiException) {
        if (err.kode === 'FLSM_TIDAK_MUNGKIN') {
          setFlsmError({
            pesan: err.message,
            prefix_saran: err.prefix_saran || 23,
          });
        } else if (err.field === 'alamat_induk') {
          setFieldErrors({ alamat_induk: err.message });
        } else if (err.field === 'prefix_induk') {
          setFieldErrors({ prefix_induk: err.message });
        } else if (err.field === 'kebutuhan') {
          setFieldErrors({ kebutuhan: err.message });
        } else {
          setGeneralError(err.message);
        }
      } else {
        setGeneralError('Gagal menghubungi server perhitungan.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Handler Isi Contoh Soal Modul 2
  const handleIsiContoh = () => {
    const contohInduk = '192.168.64.0';
    const contohPrefix = 24;
    const contohKebutuhan: KebutuhanItem[] = [
      { nama: 'Lab Jaringan', host: 64 },
      { nama: 'Lab Komputasi', host: 24 },
      { nama: 'Lab Mulmed', host: 8 },
    ];
    setAlamatInduk(contohInduk);
    setPrefixInduk(contohPrefix);
    setKebutuhan(contohKebutuhan);
    setGayaModul(false);
    jalankanHitung(metode, contohInduk, contohPrefix, contohKebutuhan, false);
  };

  // Aksi Cepat saat terjadi error FLSM_TIDAK_MUNGKIN
  const handleAksiPakaiIndukSaran = (saranPrefix: number) => {
    setPrefixInduk(saranPrefix);
    setFlsmError(null);
    jalankanHitung('flsm', alamatInduk, saranPrefix, kebutuhan, gayaModul);
  };

  const handleAksiPindahKeVlsm = () => {
    setMetode('vlsm');
    setFlsmError(null);
    jalankanHitung('vlsm', alamatInduk, prefixInduk, kebutuhan, gayaModul);
  };

  const handleAksiAktifkanGayaModul = () => {
    setGayaModul(true);
    setFlsmError(null);
    jalankanHitung('flsm', alamatInduk, prefixInduk, kebutuhan, true);
  };

  // Baca URL parameters (?contoh=1 atau ?mode=flsm/vlsm)
  useEffect(() => {
    const modeParam = searchParams.get('mode');
    if (modeParam === 'flsm') {
      setMetode('flsm');
    } else if (modeParam === 'vlsm') {
      setMetode('vlsm');
    }

    if (searchParams.get('contoh') === '1') {
      handleIsiContoh();
    }
  }, [searchParams]);

  // Hitung kapasitas induk saat ini
  const kapasitasIndukSaatIni = 1 << (32 - prefixInduk);

  return (
    <div className="flex flex-col gap-6 w-full max-w-[1280px] mx-auto">
      {/* 1. HEADER BAND (DESIGN.md & PRD.md: Tanpa badge dekoratif) */}
      <header className="relative w-full rounded-[28px] border-2 border-[#1F1E22] bg-[#FCE76C] p-6 sm:p-8 shadow-[6px_6px_0px_#1F1E22] flex flex-col justify-center gap-2">
        <h1 className="font-display-xl text-[28px] sm:text-[36px] font-extrabold text-[#1F1E22] leading-tight">
          FLSM dan VLSM
        </h1>
        <p className="font-body-md text-[15px] sm:text-[16px] text-[#1F1E22] leading-relaxed max-w-2xl font-medium">
          Bagi jaringan induk menjadi beberapa subnet ukuran tetap (FLSM) atau sesuai kebutuhan host (VLSM) langkah demi langkah.
        </p>
      </header>

      {/* 2. DUA KOLOM: FORMULIR (5/12) & AREA HASIL (7/12) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* KOLOM KIRI: FORMULIR PARAMETER (5 cols, sticky di desktop) */}
        <div className="lg:col-span-5 lg:sticky lg:top-6 flex flex-col gap-4">
          <section className="bg-[#FFFFFF] border-2 border-[#1F1E22] rounded-[20px] p-6 shadow-sm flex flex-col gap-5">
            <div className="flex items-center gap-2.5 pb-2 border-b border-[#E3E5EA]">
              <div className="w-8 h-8 rounded-[8px] bg-[#FCE76C] border-2 border-[#1F1E22] flex items-center justify-center text-[#1F1E22] font-bold font-mono text-sm shadow-2xs">
                #
              </div>
              <div>
                <h2 className="font-title text-[18px] font-bold text-[#1F1E22]">
                  Parameter Pembagian Subnet
                </h2>
                <p className="text-[12px] text-[#5B5F6B]">
                  Konfigurasi alamat induk &amp; kebutuhan ruang
                </p>
              </div>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                jalankanHitung();
              }}
              className="flex flex-col gap-4"
            >
              {/* Segmented Control: Metode Alokasi */}
              <div className="flex flex-col gap-1.5">
                <span className="font-sans font-bold text-[13px] uppercase tracking-wider text-[#1F1E22]">
                  Metode Alokasi
                </span>
                <div className="grid grid-cols-2 p-1 bg-[#F5F6F8] border-2 border-[#1F1E22] rounded-[12px] gap-1 select-none">
                  <button
                    type="button"
                    onClick={() => {
                      setMetode('vlsm');
                      setFlsmError(null);
                    }}
                    className={`py-2 text-[13px] font-bold rounded-[8px] transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                      metode === 'vlsm'
                        ? 'bg-[#FCE76C] text-[#1F1E22] border-2 border-[#1F1E22] shadow-2xs'
                        : 'text-[#5B5F6B] hover:text-[#1F1E22]'
                    }`}
                  >
                    <GitFork size={15} />
                    <span>VLSM (Variabel)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setMetode('flsm');
                      setFlsmError(null);
                    }}
                    className={`py-2 text-[13px] font-bold rounded-[8px] transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                      metode === 'flsm'
                        ? 'bg-[#FCE76C] text-[#1F1E22] border-2 border-[#1F1E22] shadow-2xs'
                        : 'text-[#5B5F6B] hover:text-[#1F1E22]'
                    }`}
                  >
                    <Maximize2 size={15} />
                    <span>FLSM (Tetap)</span>
                  </button>
                </div>
              </div>

              {/* Alamat Induk & Prefix */}
              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="alamat_induk"
                  className="font-sans font-bold text-[13px] uppercase tracking-wider text-[#1F1E22]"
                >
                  Alamat Induk &amp; Prefix Induk
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <div className="col-span-2">
                    <input
                      id="alamat_induk"
                      type="text"
                      value={alamatInduk}
                      onChange={(e) => {
                        setAlamatInduk(e.target.value);
                        if (fieldErrors.alamat_induk) {
                          setFieldErrors((prev) => ({
                            ...prev,
                            alamat_induk: undefined,
                          }));
                        }
                      }}
                      placeholder="192.168.64.0"
                      className={`w-full h-12 px-3.5 font-mono font-bold text-[14px] text-[#1F1E22] bg-[#FFFFFF] rounded-[12px] border-2 transition-all ${
                        fieldErrors.alamat_induk
                          ? 'border-[#B3261E] focus:outline-[#B3261E]'
                          : 'border-[#1F1E22] focus:border-[#1F1E22]'
                      }`}
                    />
                  </div>
                  <div>
                    <div className="relative flex items-center">
                      <span className="absolute left-3 font-mono font-bold text-[#1F1E22]">
                        /
                      </span>
                      <input
                        id="prefix_induk"
                        type="number"
                        min={0}
                        max={30}
                        value={prefixInduk}
                        onChange={(e) => {
                          const val = parseInt(e.target.value, 10);
                          setPrefixInduk(isNaN(val) ? 0 : val);
                          if (fieldErrors.prefix_induk) {
                            setFieldErrors((prev) => ({
                              ...prev,
                              prefix_induk: undefined,
                            }));
                          }
                        }}
                        className={`w-full h-12 pl-7 pr-3 font-mono font-bold text-[14px] text-[#1F1E22] bg-[#FFFFFF] rounded-[12px] border-2 transition-all ${
                          fieldErrors.prefix_induk
                            ? 'border-[#B3261E] focus:outline-[#B3261E]'
                            : 'border-[#1F1E22] focus:border-[#1F1E22]'
                        }`}
                      />
                    </div>
                  </div>
                </div>

                {fieldErrors.alamat_induk && (
                  <p className="text-[12px] text-[#B3261E] font-medium">
                    {fieldErrors.alamat_induk}
                  </p>
                )}
                {fieldErrors.prefix_induk && (
                  <p className="text-[12px] text-[#B3261E] font-medium">
                    {fieldErrors.prefix_induk}
                  </p>
                )}
                <p className="text-[11px] text-[#5B5F6B] font-mono">
                  Total Ruang: {kapasitasIndukSaatIni} IP (
                  {kapasitasIndukSaatIni > 2 ? kapasitasIndukSaatIni - 2 : 0} Host Valid)
                </p>
              </div>

              {/* Daftar Kebutuhan Subnet / Ruangan */}
              <div className="flex flex-col gap-2 pt-2 border-t border-[#E3E5EA]">
                <div className="flex items-center justify-between">
                  <span className="font-sans font-bold text-[13px] uppercase tracking-wider text-[#1F1E22]">
                    Kebutuhan Host ({kebutuhan.length} Ruangan)
                  </span>
                  <button
                    type="button"
                    onClick={handleTambahBaris}
                    disabled={kebutuhan.length >= 20}
                    className="text-xs font-bold text-[#16794C] hover:underline flex items-center gap-1 cursor-pointer disabled:opacity-40 disabled:hover:no-underline"
                  >
                    <PlusCircle size={15} />
                    <span>Tambah baris</span>
                  </button>
                </div>

                {fieldErrors.kebutuhan && (
                  <p className="text-[12px] text-[#B3261E] font-medium">
                    {fieldErrors.kebutuhan}
                  </p>
                )}

                <div className="flex flex-col gap-2 max-h-[340px] overflow-y-auto pr-1">
                  {kebutuhan.map((item, idx) => {
                    const rowColor = getSubnetColor(idx);
                    const previewPrefix = getPrefixPreview(item.host);

                    return (
                      <div
                        key={idx}
                        className="p-3 bg-[#F5F6F8] rounded-[14px] border-2 border-[#1F1E22] flex items-center gap-3 transition-all"
                      >
                        {/* Penanda Warna Subnet di Sisi Kiri */}
                        <div
                          style={{ backgroundColor: rowColor }}
                          className="w-3.5 h-10 rounded border-2 border-[#1F1E22] shrink-0"
                          title={`Penanda warna subnet #${idx + 1}`}
                        />

                        {/* Input Nama & Host */}
                        <div className="flex-1 min-w-0 flex flex-col gap-1.5">
                          <div className="flex items-center justify-between gap-2">
                            <input
                              type="text"
                              value={item.nama}
                              onChange={(e) =>
                                handleUbahRuangan(idx, 'nama', e.target.value)
                              }
                              placeholder="Nama ruangan"
                              className="font-sans font-bold text-[13px] bg-transparent border-none p-0 focus:outline-none text-[#1F1E22] truncate w-full"
                            />
                            <span
                              style={{ backgroundColor: rowColor }}
                              className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded border border-[#1F1E22] text-[#1F1E22] shrink-0"
                            >
                              Req: /{previewPrefix}
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            <span className="text-[11px] text-[#5B5F6B] font-medium">
                              Kebutuhan:
                            </span>
                            <div className="flex items-center bg-[#FFFFFF] rounded-[8px] border border-[#1F1E22] px-2 py-0.5">
                              <input
                                type="number"
                                min={1}
                                value={item.host || ''}
                                onChange={(e) =>
                                  handleUbahRuangan(idx, 'host', e.target.value)
                                }
                                className="w-14 text-[13px] font-mono font-bold text-right border-none p-0 focus:outline-none text-[#1F1E22]"
                              />
                              <span className="text-[11px] font-medium text-[#5B5F6B] ml-1">
                                host
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Tombol Hapus */}
                        <button
                          type="button"
                          onClick={() => handleHapusBaris(idx)}
                          disabled={kebutuhan.length <= 1}
                          title="Hapus baris"
                          className="p-1 text-[#5B5F6B] hover:text-[#B3261E] transition-colors disabled:opacity-30 cursor-pointer"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Checkbox Gaya Modul Khusus FLSM */}
              {metode === 'flsm' && (
                <div className="pt-2 border-t border-[#E3E5EA] flex flex-col gap-1">
                  <label className="flex items-start gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={gayaModul}
                      onChange={(e) => setGayaModul(e.target.checked)}
                      className="mt-1 h-4 w-4 rounded border-2 border-[#1F1E22] text-[#1F1E22] focus:ring-[#FCE76C]"
                    />
                    <div className="flex flex-col">
                      <span className="font-sans font-bold text-[12px] text-[#1F1E22]">
                        Opsi gaya modul (lanjutkan melewati batas induk)
                      </span>
                      <span className="text-[11px] text-[#5B5F6B] leading-tight">
                        Izinkan alokasi subnet tetap berlanjut meskipun melampaui kapasitas prefix induk.
                      </span>
                    </div>
                  </label>
                </div>
              )}

              {/* Action Buttons: ATURAN SATU TOMBOL PRIMARY */}
              <div className="flex flex-col gap-2.5 pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full h-12 bg-[#FCE76C] hover:bg-[#F2D640] text-[#1F1E22] font-bold text-[14px] font-sans rounded-[12px] border-2 border-[#1F1E22] shadow-2xs active:translate-y-0.5 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <Loader2 size={18} className="animate-spin text-[#1F1E22]" />
                      <span>Menghitung alokasi...</span>
                    </>
                  ) : (
                    <>
                      <Calculator size={18} />
                      <span>Hitung {metode.toUpperCase()}</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={handleIsiContoh}
                  className="w-full h-12 bg-[#FFFFFF] hover:bg-[#F5F6F8] text-[#1F1E22] font-bold text-[13px] font-sans rounded-[12px] border-2 border-[#1F1E22] active:translate-y-0.5 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <PlayCircle size={16} />
                  <span>Isi contoh Modul 2 (64, 24, 8 host)</span>
                </button>
              </div>
            </form>
          </section>
        </div>

        {/* KOLOM KANAN: AREA HASIL (7 cols) */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          {/* General Error Banner */}
          {generalError && (
            <Banner
              variant="error"
              pesan={generalError}
              onClose={() => setGeneralError(null)}
            />
          )}

          {/* Error Khusus FLSM_TIDAK_MUNGKIN dengan 3 Tombol Aksi Secondary */}
          {flsmError && (
            <section className="bg-[#FCE8E6] border-2 border-[#B3261E] rounded-[20px] p-6 flex flex-col gap-4 shadow-sm">
              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-full bg-[#B3261E] text-white flex items-center justify-center shrink-0 shadow-xs">
                  <AlertOctagon size={24} />
                </div>
                <div className="flex flex-col gap-1">
                  <h2 className="font-title text-[18px] font-extrabold text-[#B3261E]">
                    Peringatan Batasan FLSM (Alokasi Tetap Tidak Muat)
                  </h2>
                  <p className="font-mono text-[13px] font-bold text-[#B3261E]">
                    {flsmError.pesan}
                  </p>
                </div>
              </div>

              <div className="bg-white/90 border border-[#B3261E]/30 p-3.5 rounded-[12px] text-xs font-sans text-[#1F1E22] leading-relaxed">
                Karena pada metode FLSM seluruh subnet harus menggunakan prefix seragam sesuai kebutuhan ruangan terbesar, kapasitas subnet pada jaringan induk /{prefixInduk} tidak mencukupi untuk memuat semua ruangan tanpa memperbesar prefix induk atau beralih ke VLSM.
              </div>

              {/* 3 Tombol Aksi Sekunder (Wajib button-secondary: putih, border 2px ink) */}
              <div className="flex flex-wrap items-center gap-2 pt-1">
                {flsmError.prefix_saran && (
                  <button
                    type="button"
                    onClick={() =>
                      handleAksiPakaiIndukSaran(flsmError.prefix_saran!)
                    }
                    className="px-3.5 py-2.5 bg-[#FFFFFF] hover:bg-[#F5F6F8] text-[#1F1E22] text-[12px] font-bold font-sans rounded-[10px] border-2 border-[#1F1E22] flex items-center gap-1.5 shadow-2xs active:translate-y-0.5 transition-all cursor-pointer"
                  >
                    <ArrowRight size={14} />
                    <span>Pakai induk /{flsmError.prefix_saran}</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={handleAksiPindahKeVlsm}
                  className="px-3.5 py-2.5 bg-[#FFFFFF] hover:bg-[#F5F6F8] text-[#1F1E22] text-[12px] font-bold font-sans rounded-[10px] border-2 border-[#1F1E22] flex items-center gap-1.5 shadow-2xs active:translate-y-0.5 transition-all cursor-pointer"
                >
                  <GitFork size={14} />
                  <span>Pindah ke VLSM</span>
                </button>

                <button
                  type="button"
                  onClick={handleAksiAktifkanGayaModul}
                  className="px-3.5 py-2.5 bg-[#FFFFFF] hover:bg-[#F5F6F8] text-[#1F1E22] text-[12px] font-bold font-sans rounded-[10px] border-2 border-[#1F1E22] flex items-center gap-1.5 shadow-2xs active:translate-y-0.5 transition-all cursor-pointer"
                >
                  <span>Aktifkan gaya modul</span>
                </button>
              </div>
            </section>
          )}

          {/* Loading State */}
          {loading && (
            <div className="bg-[#FFFFFF] border-2 border-[#1F1E22] rounded-[20px] p-8 flex flex-col items-center justify-center gap-3 min-h-[300px]">
              <Loader2 size={32} className="animate-spin text-[#1F1E22]" />
              <p className="font-sans font-bold text-[15px] text-[#1F1E22]">
                Menghitung alokasi {metode.toUpperCase()}...
              </p>
            </div>
          )}

          {/* Empty State */}
          {!loading && !hasil && !flsmError && (
            <div className="bg-[#FFFFFF] border-2 border-[#1F1E22] rounded-[20px] p-8 flex flex-col items-center text-center justify-center gap-4 min-h-[320px]">
              <div className="w-12 h-12 rounded-[16px] bg-[#FFF8D1] border-2 border-[#1F1E22] flex items-center justify-center text-[#1F1E22]">
                <Calculator size={24} />
              </div>
              <div className="max-w-md flex flex-col gap-1.5">
                <h3 className="font-title text-[18px] font-bold text-[#1F1E22]">
                  Belum Ada Hasil Alokasi
                </h3>
                <p className="font-body-sm text-[14px] text-[#5B5F6B] leading-relaxed">
                  Tentukan alamat induk, prefix, dan daftar kebutuhan host di formulir sebelah kiri, lalu klik{' '}
                  <strong className="text-[#1F1E22]">Hitung</strong> untuk menghasilkan lembar jawaban alokasi subnet.
                </p>
              </div>
              <button
                type="button"
                onClick={handleIsiContoh}
                className="px-5 py-2.5 bg-[#FFFFFF] hover:bg-[#F5F6F8] text-[#1F1E22] font-bold text-[13px] rounded-[10px] border-2 border-[#1F1E22] shadow-2xs active:translate-y-0.5 transition-all cursor-pointer"
              >
                Coba Contoh Modul 2 (Induk 192.168.64.0/24)
              </button>
            </div>
          )}

          {/* STATE HASIL (URUTAN WAJIB BAGIAN 11: Banner -> Ringkasan + AddressBar -> Diketahui -> Langkah -> Tabel -> Kesimpulan) */}
          {!loading && hasil && (
            <div className="flex flex-col gap-6">
              {/* 1. Banner Peringatan */}
              {hasil.peringatan && hasil.peringatan.length > 0 && (
                <div className="flex flex-col gap-2">
                  {hasil.peringatan.map((p) => {
                    let pesanPeringatan = p;
                    if (p === 'VLSM_RUANG_KURANG') {
                      pesanPeringatan =
                        'Kapasitas jaringan induk tidak mencukupi untuk menampung seluruh kebutuhan ruangan. Ruangan yang muat tetap dialokasikan, sedangkan ruangan sisanya ditandai "Tidak muat".';
                    } else if (p === 'MELEWATI_INDUK') {
                      pesanPeringatan =
                        'Alokasi subnet melampaui batas alamat jaringan induk sesuai opsi gaya modul praktikum.';
                    }
                    return (
                      <Banner
                        key={p}
                        variant="warning"
                        kode={p}
                        pesan={pesanPeringatan}
                      />
                    );
                  })}
                </div>
              )}

              {/* 2. Ringkasan Hasil + AddressBar */}
              {hasil.hasil_akhir.ringkasan && (
                <section className="bg-[#FFFFFF] border-2 border-[#1F1E22] rounded-[20px] p-6 shadow-sm flex flex-col gap-5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-[#E3E5EA]">
                    <div>
                      <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-[#5B5F6B]">
                        Ringkasan Alokasi
                      </span>
                      <h2 className="font-title text-[18px] font-bold text-[#1F1E22]">
                        Ringkasan Alokasi {hasil.hasil_akhir.ringkasan.metode}
                      </h2>
                    </div>
                    <span className="self-start sm:self-center px-3 py-1 bg-[#E3F4EA] border border-[#16794C]/30 text-[#16794C] text-[11px] font-mono font-bold rounded-full">
                      Induk /{prefixInduk}
                    </span>
                  </div>

                  {/* Stat Cards Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                    {/* Alamat Terpakai */}
                    <div className="p-3.5 bg-[#F5F6F8] border border-[#E3E5EA] rounded-[14px] flex flex-col gap-0.5">
                      <span className="text-[11px] font-bold uppercase text-[#5B5F6B]">
                        Alamat Terpakai
                      </span>
                      <span className="font-mono font-extrabold text-[16px] text-[#1F1E22]">
                        {hasil.hasil_akhir.ringkasan.total_alamat_dialokasikan} /{' '}
                        {hasil.hasil_akhir.ringkasan.kapasitas_induk} IP
                      </span>
                      <span className="text-[11px] text-[#16794C] font-semibold">
                        {(
                          (hasil.hasil_akhir.ringkasan.total_alamat_dialokasikan * 100) /
                          hasil.hasil_akhir.ringkasan.kapasitas_induk
                        ).toFixed(1)}
                        % Kapasitas Induk
                      </span>
                    </div>

                    {/* Sisa Bebas */}
                    <div className="p-3.5 bg-[#F5F6F8] border border-[#E3E5EA] rounded-[14px] flex flex-col gap-0.5">
                      <span className="text-[11px] font-bold uppercase text-[#5B5F6B]">
                        Sisa Alamat Bebas
                      </span>
                      <span className="font-mono font-extrabold text-[16px] text-[#1F1E22]">
                        {hasil.hasil_akhir.ringkasan.sisa_alamat} IP Bebas
                      </span>
                      <span className="text-[11px] text-[#5B5F6B] font-medium">
                        {(
                          (hasil.hasil_akhir.ringkasan.sisa_alamat * 100) /
                          hasil.hasil_akhir.ringkasan.kapasitas_induk
                        ).toFixed(1)}
                        % Tersedia
                      </span>
                    </div>

                    {/* Subnet Terbentuk */}
                    <div className="p-3.5 bg-[#FFF8D1] border border-[#1F1E22]/15 rounded-[14px] flex flex-col gap-0.5">
                      <span className="text-[11px] font-bold uppercase text-[#1F1E22]">
                        Subnet Terbentuk
                      </span>
                      <span className="font-mono font-extrabold text-[16px] text-[#1F1E22]">
                        {hasil.hasil_akhir.tabel?.length || 0} Subnet
                      </span>
                      <span className="text-[11px] text-[#1F1E22] font-medium">
                        {hasil.hasil_akhir.ringkasan.metode === 'VLSM'
                          ? `${hasil.hasil_akhir.ringkasan.ruangan_terakomodasi} terakomodasi`
                          : `${hasil.hasil_akhir.ringkasan.subnet_terpakai} terpakai, ${hasil.hasil_akhir.ringkasan.subnet_cadangan} cadangan`}
                      </span>
                    </div>
                  </div>

                  {/* Peta Pembagian Blok AddressBar Proporsional */}
                  <AddressBar
                    proportionalData={{
                      kapasitasInduk: hasil.hasil_akhir.ringkasan.kapasitas_induk,
                      alamatInduk: alamatInduk,
                      prefixInduk: prefixInduk,
                      totalAlamatDialokasikan:
                        hasil.hasil_akhir.ringkasan.total_alamat_dialokasikan,
                      sisaAlamat: hasil.hasil_akhir.ringkasan.sisa_alamat,
                      blocks: (hasil.hasil_akhir.tabel || []) as VlsmTableRow[],
                    }}
                  />
                </section>
              )}

              {/* 3. Diketahui */}
              {hasil.diketahui && hasil.diketahui.length > 0 && (
                <section className="bg-[#FFFFFF] border-2 border-[#1F1E22] rounded-[20px] p-6 shadow-sm flex flex-col gap-3">
                  <h3 className="font-title text-[18px] font-bold text-[#1F1E22] pb-2 border-b border-[#E3E5EA]">
                    Diketahui
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {hasil.diketahui.map((d, idx) => (
                      <div
                        key={idx}
                        className="p-3 bg-[#F5F6F8] rounded-[12px] border border-[#E3E5EA] flex flex-col gap-0.5"
                      >
                        <span className="text-[11px] font-sans font-bold uppercase text-[#5B5F6B]">
                          {d.label}
                        </span>
                        <span className="font-mono text-[13px] font-bold text-[#1F1E22]">
                          {d.nilai}
                        </span>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* 4. Kartu Langkah 1..N */}
              {hasil.langkah && hasil.langkah.length > 0 && (
                <section className="flex flex-col gap-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-sans font-bold text-[14px] uppercase tracking-wider text-[#1F1E22]">
                      Langkah Pengerjaan ({hasil.langkah.length} Langkah)
                    </h3>
                  </div>

                  <div className="flex flex-col gap-5">
                    {hasil.langkah.map((l, idx) => (
                      <StepCard
                        key={idx}
                        nomor={idx + 1}
                        langkah={l}
                        offsetColor={getSubnetColor(idx)}
                      />
                    ))}
                  </div>
                </section>
              )}

              {/* 5. Tabel Hasil Akhir (ResultTable) */}
              {hasil.hasil_akhir.tabel && (
                <ResultTable
                  tabel={hasil.hasil_akhir.tabel}
                  mode="vlsm_flsm"
                  judul={`Tabel Alokasi Subnet ${hasil.hasil_akhir.ringkasan?.metode || ''}`}
                />
              )}

              {/* 6. Kesimpulan (ConclusionBlock) */}
              {hasil.kesimpulan && (
                <ConclusionBlock kesimpulan={hasil.kesimpulan} />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
