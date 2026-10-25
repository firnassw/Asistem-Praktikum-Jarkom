import React, { useState, useEffect } from 'react';
import { api, ApiException } from '../services/api';
import type { StrukturJawaban } from '../types/api';
import { Banner } from '../components/Banner';
import { StepCard } from '../components/StepCard';
import { CodeBlock } from '../components/CodeBlock';
import { ConclusionBlock } from '../components/ConclusionBlock';
import { Network, Zap, BookOpen, Loader2, Info } from 'lucide-react';

// Helper murni bitwise JS untuk preview langsung di formulir
function parseIp(ipStr: string): number | null {
  const parts = ipStr.trim().split('.');
  if (parts.length !== 4) return null;
  let res = 0;
  for (const part of parts) {
    if (!/^\d+$/.test(part)) return null;
    if (part.length > 1 && part[0] === '0') return null;
    const n = parseInt(part, 10);
    if (n < 0 || n > 255) return null;
    res = ((res << 8) | n) >>> 0;
  }
  return res;
}

function intToIp(val: number): string {
  return [
    (val >>> 24) & 255,
    (val >>> 16) & 255,
    (val >>> 8) & 255,
    val & 255,
  ].join('.');
}

function prefixToMask(p: number): string {
  if (p < 0 || p > 32) return '255.255.255.0';
  const mask = p === 0 ? 0 : ((0xffffffff << (32 - p)) >>> 0);
  return intToIp(mask);
}

function calculateNetwork(ipStr: string, prefix: number): string {
  const ipInt = parseIp(ipStr);
  if (ipInt === null || prefix < 0 || prefix > 32) return '-';
  const mask = prefix === 0 ? 0 : ((0xffffffff << (32 - prefix)) >>> 0);
  return intToIp((ipInt & mask) >>> 0);
}

export const Dhcp: React.FC = () => {
  // State Input Formulir
  const [alamatRouter, setAlamatRouter] = useState<string>('192.168.10.1');
  const [prefixInput, setPrefixInput] = useState<string>('24');
  const [ifaceName, setIfaceName] = useState<string>('fastEthernet0/0');
  const [poolName, setPoolName] = useState<string>('dhcp_server');
  const [excludedAwal, setExcludedAwal] = useState<string>('192.168.10.1');
  const [excludedAkhir, setExcludedAkhir] = useState<string>('192.168.10.5');

  // Error State
  const [fieldErrors, setFieldErrors] = useState<{
    alamat_router?: string;
    prefix?: string;
    interface?: string;
    nama_pool?: string;
    excluded_awal?: string;
    excluded_akhir?: string;
  }>({});
  const [generalError, setGeneralError] = useState<string | null>(null);

  // Status Perhitungan
  const [loading, setLoading] = useState<boolean>(false);
  const [hasil, setHasil] = useState<StrukturJawaban | null>(null);

  // Eksekusi API
  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setFieldErrors({});
    setGeneralError(null);

    const prefixNum = parseInt(prefixInput, 10);
    if (isNaN(prefixNum) || prefixNum < 0 || prefixNum > 30) {
      setFieldErrors((prev) => ({
        ...prev,
        prefix: 'Prefix harus bilangan bulat antara 0 sampai 30.',
      }));
      return;
    }

    setLoading(true);
    try {
      const response = await api.hitungDhcp({
        alamat_router: alamatRouter.trim(),
        prefix: prefixNum,
        interface: ifaceName.trim(),
        nama_pool: poolName.trim(),
        excluded_awal: excludedAwal.trim(),
        excluded_akhir: excludedAkhir.trim(),
      });
      setHasil(response);
    } catch (err) {
      if (err instanceof ApiException) {
        if (err.field && ['alamat_router', 'prefix', 'interface', 'nama_pool', 'excluded_awal', 'excluded_akhir'].includes(err.field)) {
          setFieldErrors((prev) => ({
            ...prev,
            [err.field as string]: err.message,
          }));
        } else {
          setGeneralError(err.message);
        }
      } else {
        setGeneralError((err as Error).message || 'Terjadi kesalahan sistem.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Tombol "Isi contoh" (data G-JAR-08)
  const handleIsiContoh = () => {
    setAlamatRouter('192.168.10.1');
    setPrefixInput('24');
    setIfaceName('fastEthernet0/0');
    setPoolName('dhcp_server');
    setExcludedAwal('192.168.10.1');
    setExcludedAkhir('192.168.10.5');
    setFieldErrors({});
    setGeneralError(null);

    // Langsung hitung menggunakan data contoh
    setLoading(true);
    api
      .hitungDhcp({
        alamat_router: '192.168.10.1',
        prefix: 24,
        interface: 'fastEthernet0/0',
        nama_pool: 'dhcp_server',
        excluded_awal: '192.168.10.1',
        excluded_akhir: '192.168.10.5',
      })
      .then((res) => {
        setHasil(res);
      })
      .catch((err) => {
        setGeneralError(err.message);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  // Preview dinamis Mask dan Network
  const prefixNumeric = parseInt(prefixInput, 10);
  const validPrefix = !isNaN(prefixNumeric) && prefixNumeric >= 0 && prefixNumeric <= 32;
  const previewMask = validPrefix ? prefixToMask(prefixNumeric) : '-';
  const previewNetwork = validPrefix ? calculateNetwork(alamatRouter, prefixNumeric) : '-';

  return (
    <div className="flex flex-col gap-6 w-full max-w-[1280px] pb-12">
      {/* 1. HEADER BAND (Kuning, display-xl, satu kalimat penjelasan) */}
      <header className="w-full bg-[#FCE76C] rounded-[28px] border-2 border-[#1F1E22] p-6 sm:p-8 shadow-sm">
        <h1 className="font-sans text-[28px] sm:text-[36px] lg:text-[40px] font-extrabold text-[#1F1E22] leading-tight tracking-tight">
          Generator DHCP
        </h1>
        <p className="font-sans text-[15px] sm:text-[16px] text-[#1F1E22] font-medium mt-2 max-w-3xl leading-relaxed">
          Susun perintah CLI DHCP server router Cisco Packet Tracer beserta prediksi alamat IP klien pertama.
        </p>
      </header>

      {/* 2. MAIN WORKSPACE (2 Kolom: 5/12 kiri, 7/12 kanan) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* KOLOM KIRI: KARTU FORMULIR (5/12) */}
        <div className="lg:col-span-5 lg:sticky lg:top-6">
          <section className="bg-[#FFFFFF] rounded-[20px] border-2 border-[#1F1E22] p-6 shadow-sm">
            {/* Header Formulir */}
            <div className="flex items-center gap-2 pb-4 border-b-2 border-[#1F1E22] mb-5">
              <Network size={20} className="text-[#1F1E22]" />
              <h2 className="font-sans font-bold text-[18px] text-[#1F1E22]">
                Parameter Konfigurasi DHCP
              </h2>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              {/* Field 1: IP Router (Default Gateway) */}
              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="alamat_router"
                  className="font-sans font-bold text-[13px] uppercase tracking-wider text-[#1F1E22]"
                >
                  IP Router (Default Gateway)
                </label>
                <div className="relative">
                  <input
                    id="alamat_router"
                    type="text"
                    value={alamatRouter}
                    onChange={(e) => {
                      setAlamatRouter(e.target.value);
                      if (fieldErrors.alamat_router) {
                        setFieldErrors((prev) => ({ ...prev, alamat_router: undefined }));
                      }
                    }}
                    placeholder="192.168.10.1"
                    className={`w-full h-12 px-3.5 font-mono font-medium text-[15px] text-[#1F1E22] bg-[#FFFFFF] rounded-[12px] border-2 transition-all ${
                      fieldErrors.alamat_router
                        ? 'border-[#B3261E]'
                        : 'border-[#8A8F9C] focus:border-[#1F1E22]'
                    }`}
                  />
                  <span className="absolute right-3 top-3 text-[12px] font-mono font-medium text-[#5B5F6B] pointer-events-none select-none">
                    Gateway
                  </span>
                </div>
                {fieldErrors.alamat_router ? (
                  <p className="text-[12px] text-[#B3261E] font-medium">
                    {fieldErrors.alamat_router}
                  </p>
                ) : (
                  <p className="text-[12px] text-[#5B5F6B]">
                    Alamat antarmuka router penghubung klien (LAN).
                  </p>
                )}
              </div>

              {/* Field 2: Panjang Prefix (/0 sampai /30) */}
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <label
                    htmlFor="prefix"
                    className="font-sans font-bold text-[13px] uppercase tracking-wider text-[#1F1E22]"
                  >
                    Panjang Prefix (/CIDR)
                  </label>
                  <span className="text-[11px] font-mono text-[#5B5F6B]">0 – 30</span>
                </div>

                {/* Tombol Pintasan Cepat Prefix */}
                <div className="grid grid-cols-4 gap-2">
                  {[24, 25, 26, 27].map((p) => {
                    const isSelected = prefixInput === p.toString();
                    return (
                      <button
                        key={p}
                        type="button"
                        onClick={() => {
                          setPrefixInput(p.toString());
                          if (fieldErrors.prefix) {
                            setFieldErrors((prev) => ({ ...prev, prefix: undefined }));
                          }
                        }}
                        className={`py-1.5 border-2 border-[#1F1E22] rounded-[8px] font-mono text-[13px] font-bold transition-all ${
                          isSelected
                            ? 'bg-[#FCE76C] text-[#1F1E22] shadow-2xs'
                            : 'bg-[#FFFFFF] text-[#1F1E22] hover:bg-[#F5F6F8]'
                        }`}
                      >
                        /{p}
                      </button>
                    );
                  })}
                </div>

                {/* Input Numerik Prefix */}
                <div className="flex items-center gap-2">
                  <div className="w-24 shrink-0">
                    <input
                      id="prefix"
                      type="number"
                      min={0}
                      max={30}
                      value={prefixInput}
                      onChange={(e) => {
                        setPrefixInput(e.target.value);
                        if (fieldErrors.prefix) {
                          setFieldErrors((prev) => ({ ...prev, prefix: undefined }));
                        }
                      }}
                      placeholder="24"
                      className={`w-full h-10 text-center font-mono font-bold text-[15px] text-[#1F1E22] bg-[#FFFFFF] rounded-[10px] border-2 transition-all ${
                        fieldErrors.prefix
                          ? 'border-[#B3261E]'
                          : 'border-[#8A8F9C] focus:border-[#1F1E22]'
                      }`}
                    />
                  </div>
                  {/* Live Preview Netmask & Network */}
                  <div className="flex-1 px-3 py-1.5 bg-[#F5F6F8] rounded-[10px] border border-[#E3E5EA] flex flex-col justify-center text-[11px] font-mono leading-tight">
                    <span className="text-[#5B5F6B] truncate">
                      Netmask: <strong className="text-[#1F1E22]">{previewMask}</strong>
                    </span>
                    <span className="text-[#5B5F6B] truncate">
                      Network: <strong className="text-[#1F1E22]">{previewNetwork}</strong>
                    </span>
                  </div>
                </div>
                {fieldErrors.prefix && (
                  <p className="text-[12px] text-[#B3261E] font-medium">
                    {fieldErrors.prefix}
                  </p>
                )}
              </div>

              {/* Field 3: Interface Router */}
              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="interface"
                  className="font-sans font-bold text-[13px] uppercase tracking-wider text-[#1F1E22]"
                >
                  Antarmuka (Interface) Router
                </label>
                <input
                  id="interface"
                  type="text"
                  value={ifaceName}
                  onChange={(e) => {
                    setIfaceName(e.target.value);
                    if (fieldErrors.interface) {
                      setFieldErrors((prev) => ({ ...prev, interface: undefined }));
                    }
                  }}
                  placeholder="fastEthernet0/0"
                  className={`w-full h-12 px-3.5 font-mono font-medium text-[15px] text-[#1F1E22] bg-[#FFFFFF] rounded-[12px] border-2 transition-all ${
                    fieldErrors.interface
                      ? 'border-[#B3261E]'
                      : 'border-[#8A8F9C] focus:border-[#1F1E22]'
                  }`}
                />
                <div className="flex flex-wrap items-center gap-1.5 pt-1 text-[11px] font-mono">
                  <span className="text-[#5B5F6B] font-sans font-medium">Bantuan cepat:</span>
                  {['fastEthernet0/0', 'fastEthernet0/1', 'gigabitEthernet0/0'].map((iface) => (
                    <button
                      key={iface}
                      type="button"
                      onClick={() => setIfaceName(iface)}
                      className="px-2 py-0.5 bg-[#F5F6F8] hover:bg-[#FFF8D1] rounded-[6px] border border-[#1F1E22] text-[#1F1E22] transition-colors"
                    >
                      {iface.startsWith('fast') ? iface.replace('fastEthernet', 'Fa') : iface.replace('gigabitEthernet', 'Gig')}
                    </button>
                  ))}
                </div>
                {fieldErrors.interface && (
                  <p className="text-[12px] text-[#B3261E] font-medium">
                    {fieldErrors.interface}
                  </p>
                )}
              </div>

              {/* Field 4: Nama DHCP Pool */}
              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="nama_pool"
                  className="font-sans font-bold text-[13px] uppercase tracking-wider text-[#1F1E22]"
                >
                  Nama DHCP Pool
                </label>
                <input
                  id="nama_pool"
                  type="text"
                  value={poolName}
                  onChange={(e) => {
                    setPoolName(e.target.value);
                    if (fieldErrors.nama_pool) {
                      setFieldErrors((prev) => ({ ...prev, nama_pool: undefined }));
                    }
                  }}
                  placeholder="dhcp_server"
                  className={`w-full h-12 px-3.5 font-mono font-medium text-[15px] text-[#1F1E22] bg-[#FFFFFF] rounded-[12px] border-2 transition-all ${
                    fieldErrors.nama_pool
                      ? 'border-[#B3261E]'
                      : 'border-[#8A8F9C] focus:border-[#1F1E22]'
                  }`}
                />
                {fieldErrors.nama_pool && (
                  <p className="text-[12px] text-[#B3261E] font-medium">
                    {fieldErrors.nama_pool}
                  </p>
                )}
              </div>

              {/* Field 5: Rentang Excluded Address */}
              <div className="flex flex-col gap-1.5">
                <label className="font-sans font-bold text-[13px] uppercase tracking-wider text-[#1F1E22]">
                  Rentang Excluded Address (Dikecualikan)
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1">
                    <span className="text-[11px] font-sans text-[#5B5F6B]">IP Awal</span>
                    <input
                      id="excluded_awal"
                      type="text"
                      value={excludedAwal}
                      onChange={(e) => {
                        setExcludedAwal(e.target.value);
                        if (fieldErrors.excluded_awal) {
                          setFieldErrors((prev) => ({ ...prev, excluded_awal: undefined }));
                        }
                      }}
                      placeholder="192.168.10.1"
                      className={`w-full h-10 px-2.5 font-mono text-[13px] text-[#1F1E22] bg-[#FFFFFF] rounded-[10px] border-2 transition-all ${
                        fieldErrors.excluded_awal
                          ? 'border-[#B3261E]'
                          : 'border-[#8A8F9C] focus:border-[#1F1E22]'
                      }`}
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-[11px] font-sans text-[#5B5F6B]">IP Akhir</span>
                    <input
                      id="excluded_akhir"
                      type="text"
                      value={excludedAkhir}
                      onChange={(e) => {
                        setExcludedAkhir(e.target.value);
                        if (fieldErrors.excluded_akhir) {
                          setFieldErrors((prev) => ({ ...prev, excluded_akhir: undefined }));
                        }
                      }}
                      placeholder="192.168.10.5"
                      className={`w-full h-10 px-2.5 font-mono text-[13px] text-[#1F1E22] bg-[#FFFFFF] rounded-[10px] border-2 transition-all ${
                        fieldErrors.excluded_akhir
                          ? 'border-[#B3261E]'
                          : 'border-[#8A8F9C] focus:border-[#1F1E22]'
                      }`}
                    />
                  </div>
                </div>
                {fieldErrors.excluded_awal && (
                  <p className="text-[12px] text-[#B3261E] font-medium">
                    {fieldErrors.excluded_awal}
                  </p>
                )}
                {fieldErrors.excluded_akhir && (
                  <p className="text-[12px] text-[#B3261E] font-medium">
                    {fieldErrors.excluded_akhir}
                  </p>
                )}
                <p className="text-[12px] text-[#5B5F6B]">
                  IP statis untuk router, switch manajemen, dan printer lab.
                </p>
              </div>

              {/* Action Buttons: Buat konfigurasi & Isi contoh */}
              <div className="flex flex-col gap-2.5 pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full h-12 bg-[#FCE76C] hover:bg-[#F2D640] text-[#1F1E22] font-sans font-bold text-[15px] rounded-[12px] border-2 border-[#1F1E22] flex items-center justify-center gap-2 shadow-xs active:translate-y-0.5 transition-all disabled:opacity-50"
                >
                  {loading ? (
                    <Loader2 size={18} className="animate-spin text-[#1F1E22]" />
                  ) : (
                    <Zap size={18} />
                  )}
                  <span>Buat konfigurasi</span>
                </button>

                <button
                  type="button"
                  onClick={handleIsiContoh}
                  className="w-full h-12 bg-[#FFFFFF] hover:bg-[#F5F6F8] text-[#1F1E22] font-sans font-bold text-[14px] rounded-[12px] border-2 border-[#1F1E22] flex items-center justify-center gap-2 active:translate-y-0.5 transition-all"
                >
                  <BookOpen size={17} className="text-[#5B5F6B]" />
                  <span>Isi contoh</span>
                </button>
              </div>
            </form>
          </section>
        </div>

        {/* KOLOM KANAN: AREA HASIL (7/12) */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          {/* Banner Error Umum jika ada */}
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
                Menyusun konfigurasi DHCP server router...
              </p>
            </div>
          )}

          {/* State Kosong */}
          {!loading && !hasil && (
            <div className="bg-[#FFFFFF] border-2 border-[#1F1E22] rounded-[20px] p-8 flex flex-col items-center text-center justify-center gap-4 min-h-[320px]">
              <div className="w-12 h-12 rounded-[16px] bg-[#FFF8D1] border-2 border-[#1F1E22] flex items-center justify-center text-[#1F1E22]">
                <Network size={24} />
              </div>
              <div className="max-w-md flex flex-col gap-1.5">
                <h3 className="font-sans text-[18px] font-bold text-[#1F1E22]">
                  Belum Ada Hasil Konfigurasi
                </h3>
                <p className="font-sans text-[14px] text-[#5B5F6B] leading-relaxed">
                  Masukkan parameter router dan rentang excluded pada formulir di sebelah kiri, lalu klik{' '}
                  <strong className="text-[#1F1E22]">Buat konfigurasi</strong> untuk menghasilkan skrip CLI router lengkap.
                </p>
              </div>
              <button
                type="button"
                onClick={handleIsiContoh}
                className="px-5 py-2.5 bg-[#FCE76C] hover:bg-[#F2D640] text-[#1F1E22] font-bold text-[14px] rounded-[10px] border-2 border-[#1F1E22] shadow-2xs active:translate-y-0.5 transition-all"
              >
                Coba Contoh Modul 3 (G-JAR-08)
              </button>
            </div>
          )}

          {/* State Hasil (Urutan Wajib: 1. Ringkasan Kuning -> 2. Diketahui -> 3. Langkah 1..3 -> 4. CodeBlock CLI -> 5. Kesimpulan) */}
          {!loading && hasil && (
            <div className="flex flex-col gap-6">
              {/* 1. Ringkasan Hasil (Kartu Kuning Prediksi Klien Pertama) */}
              <section
                data-testid="dhcp-summary-card"
                className="bg-[#FCE76C] rounded-[20px] border-2 border-[#1F1E22] p-6 shadow-sm space-y-5"
              >
                <div className="flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-[10px] bg-[#1F1E22] text-[#FCE76C] flex items-center justify-center shrink-0 border border-[#1F1E22] mt-0.5">
                    <Zap size={22} />
                  </div>
                  <div className="space-y-1">
                    <span className="text-[12px] font-mono uppercase tracking-wider text-[#1F1E22] font-bold block">
                      Hasil Alokasi Pertama
                    </span>
                    <h3
                      data-testid="client-first-highlight"
                      className="font-sans font-extrabold text-[20px] sm:text-[24px] text-[#1F1E22] leading-tight"
                    >
                      Klien pertama mendapat {hasil.hasil_akhir.klien_pertama}
                    </h3>
                    <p className="font-sans text-[13px] sm:text-[14px] text-[#1F1E22] font-medium">
                      (alamat {hasil.hasil_akhir.excluded_awal} sampai {hasil.hasil_akhir.excluded_akhir} dikecualikan untuk router dan perangkat statis)
                    </p>
                  </div>
                </div>

                {/* Micro Info Chips */}
                <div className="pt-4 border-t-2 border-[#1F1E22] grid grid-cols-1 sm:grid-cols-3 gap-3 text-center">
                  <div className="bg-[#FFFFFF] rounded-[12px] border-2 border-[#1F1E22] p-2.5">
                    <span className="text-[11px] font-sans font-bold text-[#5B5F6B] uppercase tracking-wider block">
                      Subnet (NA)
                    </span>
                    <span className="font-mono text-[13px] font-bold text-[#1F1E22]">
                      {hasil.hasil_akhir.network_address}/{hasil.hasil_akhir.prefix ?? prefixInput}
                    </span>
                  </div>

                  <div className="bg-[#FFFFFF] rounded-[12px] border-2 border-[#1F1E22] p-2.5">
                    <span className="text-[11px] font-sans font-bold text-[#5B5F6B] uppercase tracking-wider block">
                      Rentang Dinamis
                    </span>
                    <span className="font-mono text-[13px] font-bold text-[#1F1E22] truncate block">
                      {hasil.hasil_akhir.rentang_dinamis} ({hasil.hasil_akhir.jumlah_klien_dinamis} Host)
                    </span>
                  </div>

                  <div className="bg-[#FFFFFF] rounded-[12px] border-2 border-[#1F1E22] p-2.5">
                    <span className="text-[11px] font-sans font-bold text-[#5B5F6B] uppercase tracking-wider block">
                      Default Gateway
                    </span>
                    <span className="font-mono text-[13px] font-bold text-[#1F1E22]">
                      {hasil.hasil_akhir.alamat_router ?? alamatRouter}
                    </span>
                  </div>
                </div>
              </section>

              {/* 2. Diketahui */}
              <section className="bg-[#FFFFFF] rounded-[20px] border-2 border-[#1F1E22] p-5 sm:p-6 shadow-sm flex flex-col gap-3">
                <h3 className="font-sans font-extrabold text-[15px] uppercase tracking-wider text-[#1F1E22] flex items-center gap-2">
                  <Info size={18} className="text-[#1F1E22]" />
                  <span>Diketahui</span>
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-[13px]">
                  {hasil.diketahui.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-3 bg-[#F5F6F8] rounded-[10px] border border-[#E3E5EA] flex flex-col gap-0.5"
                    >
                      <span className="text-[11px] font-sans font-bold text-[#5B5F6B] uppercase">
                        {item.label}
                      </span>
                      <span className="font-mono font-bold text-[#1F1E22]">
                        {item.nilai}
                      </span>
                    </div>
                  ))}
                </div>
              </section>

              {/* 3. Kartu Langkah 1..N (StepCard) */}
              <div className="flex flex-col gap-6">
                <h3 className="font-sans font-extrabold text-[18px] text-[#1F1E22]">
                  Langkah Pengerjaan
                </h3>
                {hasil.langkah.map((l, index) => (
                  <StepCard
                    key={index}
                    nomor={index + 1}
                    langkah={l}
                    fadedLabel={`0${index + 1}`}
                  />
                ))}
              </div>

              {/* 4. Hasil Akhir (CodeBlock CLI Dua Kolom) */}
              <div className="flex flex-col gap-3">
                <h3 className="font-sans font-extrabold text-[18px] text-[#1F1E22]">
                  Hasil Akhir Konfigurasi CLI Router
                </h3>
                <CodeBlock
                  cliBaris={hasil.hasil_akhir.cli_baris}
                  cliScript={hasil.hasil_akhir.cli_script}
                  judul="Cisco IOS CLI Script (Router Config)"
                  catatan="Catatan: mengikuti contoh Modul 3; belum diverifikasi di semua versi Packet Tracer atau IOS."
                />
              </div>

              {/* 5. Kesimpulan (ConclusionBlock) */}
              <ConclusionBlock kesimpulan={hasil.kesimpulan} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
