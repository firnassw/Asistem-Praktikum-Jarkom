import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api, ApiException } from '../services/api';
import type { StrukturJawaban } from '../types/api';
import { Banner } from '../components/Banner';
import { AddressBar } from '../components/AddressBar';
import { StepCard } from '../components/StepCard';
import { ResultTable } from '../components/ResultTable';
import { ConclusionBlock } from '../components/ConclusionBlock';
import { Calculator, PlayCircle, Loader2 } from 'lucide-react';

// Pemetaan cepat prefix ke subnet mask untuk indikator interaktif di formulir
const PREFIX_TO_MASK_MAP: Record<number, string> = {
  8: '255.0.0.0',
  9: '255.128.0.0',
  10: '255.192.0.0',
  11: '255.224.0.0',
  12: '255.240.0.0',
  13: '255.248.0.0',
  14: '255.252.0.0',
  15: '255.254.0.0',
  16: '255.255.0.0',
  17: '255.255.128.0',
  18: '255.255.192.0',
  19: '255.255.224.0',
  20: '255.255.240.0',
  21: '255.255.248.0',
  22: '255.255.252.0',
  23: '255.255.254.0',
  24: '255.255.255.0',
  25: '255.255.255.128',
  26: '255.255.255.192',
  27: '255.255.255.224',
  28: '255.255.255.240',
  29: '255.255.255.248',
  30: '255.255.255.252',
  31: '255.255.255.254',
  32: '255.255.255.255',
};

export const Subnetting: React.FC = () => {
  const [searchParams] = useSearchParams();

  // Mode Masukan: 'prefix' | 'mask'
  const [mode, setMode] = useState<'prefix' | 'mask'>('prefix');
  const [alamatIp, setAlamatIp] = useState<string>('192.168.0.5');
  const [prefixInput, setPrefixInput] = useState<string>('27');
  const [maskInput, setMaskInput] = useState<string>('255.255.255.224');

  // Error per field
  const [fieldErrors, setFieldErrors] = useState<{
    alamat_ip?: string;
    prefix?: string;
    subnet_mask?: string;
  }>({});
  const [generalError, setGeneralError] = useState<string | null>(null);

  // Status perhitungan
  const [loading, setLoading] = useState<boolean>(false);
  const [hasil, setHasil] = useState<StrukturJawaban | null>(null);

  const jalankanHitung = async (
    ipVal: string,
    modeVal: 'prefix' | 'mask',
    pVal: string,
    mVal: string
  ) => {
    setFieldErrors({});
    setGeneralError(null);

    // Validasi ringan di frontend
    if (!ipVal.trim()) {
      setFieldErrors({ alamat_ip: 'Alamat IP harus diisi.' });
      return;
    }

    let payloadPrefix: number | null = null;
    let payloadMask: string | null = null;

    if (modeVal === 'prefix') {
      const cleanPrefix = pVal.replace('/', '').trim();
      if (!cleanPrefix) {
        setFieldErrors({ prefix: 'Prefix harus diisi (0-32).' });
        return;
      }
      const numPrefix = parseInt(cleanPrefix, 10);
      if (isNaN(numPrefix) || numPrefix < 0 || numPrefix > 32) {
        setFieldErrors({ prefix: 'Prefix harus bilangan bulat 0 sampai 32.' });
        return;
      }
      payloadPrefix = numPrefix;
    } else {
      if (!mVal.trim()) {
        setFieldErrors({ subnet_mask: 'Subnet mask harus diisi.' });
        return;
      }
      payloadMask = mVal.trim();
    }

    setLoading(true);
    try {
      const response = await api.hitungSubnet({
        alamat_ip: ipVal.trim(),
        prefix: payloadPrefix,
        subnet_mask: payloadMask,
      });
      setHasil(response);
    } catch (err: any) {
      if (err instanceof ApiException) {
        if (err.field === 'alamat_ip') {
          setFieldErrors({ alamat_ip: err.message });
        } else if (err.field === 'prefix') {
          setFieldErrors({ prefix: err.message });
        } else if (err.field === 'subnet_mask') {
          setFieldErrors({ subnet_mask: err.message });
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

  const handleIsiContoh = () => {
    setAlamatIp('192.168.0.5');
    setMode('prefix');
    setPrefixInput('27');
    setMaskInput('255.255.255.224');
    jalankanHitung('192.168.0.5', 'prefix', '27', '255.255.255.224');
  };

  // Cek apakah ada param ?contoh=1 dari Beranda
  useEffect(() => {
    if (searchParams.get('contoh') === '1') {
      handleIsiContoh();
    }
  }, [searchParams]);

  const parsedPrefix = parseInt(prefixInput.replace('/', '').trim(), 10);
  const matchedMask = !isNaN(parsedPrefix) ? PREFIX_TO_MASK_MAP[parsedPrefix] : undefined;

  return (
    <div className="flex flex-col gap-6 w-full max-w-[1280px] mx-auto">
      {/* 1. HEADER BAND (DESIGN.md) */}
      <header className="relative w-full rounded-[28px] border-2 border-[#1F1E22] bg-[#FCE76C] p-6 sm:p-8 shadow-[6px_6px_0px_#1F1E22] flex flex-col justify-center gap-2">
        <h1 className="font-display-xl text-[28px] sm:text-[36px] font-extrabold text-[#1F1E22] leading-tight">
          Subnetting
        </h1>
        <p className="font-body-md text-[15px] sm:text-[16px] text-[#1F1E22] leading-relaxed max-w-2xl">
          Hitung NA, BA, dan semua subnet dengan langkah sistematis sesuai modul praktikum.
        </p>
      </header>

      {/* 2. DUA KOLOM: FORMULIR (5/12) & AREA HASIL (7/12) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* KOLOM KIRI: FORMULIR PARAMETER (5 cols) */}
        <div className="lg:col-span-5 lg:sticky lg:top-6 flex flex-col gap-4">
          <section className="bg-[#FFFFFF] border-2 border-[#1F1E22] rounded-[20px] p-6 shadow-sm flex flex-col gap-5">
            <div className="flex items-center gap-2.5 pb-2 border-b border-[#E3E5EA]">
              <div className="w-8 h-8 rounded-[8px] bg-[#8BD0FC] border-2 border-[#1F1E22] flex items-center justify-center text-[#1F1E22] font-bold font-mono text-sm shadow-2xs">
                #
              </div>
              <h2 className="font-title text-[18px] font-bold text-[#1F1E22]">
                Parameter Subnetting
              </h2>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                jalankanHitung(alamatIp, mode, prefixInput, maskInput);
              }}
              className="flex flex-col gap-4"
            >
              {/* Field 1: Alamat IP */}
              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="alamat_ip"
                  className="font-sans font-bold text-[13px] uppercase tracking-wider text-[#1F1E22]"
                >
                  Alamat IP
                </label>
                <input
                  id="alamat_ip"
                  type="text"
                  value={alamatIp}
                  onChange={(e) => {
                    setAlamatIp(e.target.value);
                    if (fieldErrors.alamat_ip) {
                      setFieldErrors((prev) => ({ ...prev, alamat_ip: undefined }));
                    }
                  }}
                  placeholder="192.168.0.5"
                  className={`w-full h-12 px-3.5 font-mono font-medium text-[15px] text-[#1F1E22] bg-[#FFFFFF] rounded-[12px] border-2 transition-all ${
                    fieldErrors.alamat_ip
                      ? 'border-[#B3261E] focus:outline-[#B3261E]'
                      : 'border-[#8A8F9C] focus:border-[#1F1E22]'
                  }`}
                />
                {fieldErrors.alamat_ip ? (
                  <p className="text-[12px] text-[#B3261E] font-medium">
                    {fieldErrors.alamat_ip}
                  </p>
                ) : (
                  <p className="text-[12px] text-[#5B5F6B]">
                    Format desimal titik 4 oktet tanpa nol di depan (mis. 192.168.0.5).
                  </p>
                )}
              </div>

              {/* Field 2: Segmented Toggle Format Netmask */}
              <div className="flex flex-col gap-1.5">
                <span className="font-sans font-bold text-[13px] uppercase tracking-wider text-[#1F1E22]">
                  Format Penentu Netmask
                </span>
                <div className="grid grid-cols-2 p-1 bg-[#F5F6F8] border border-[#E3E5EA] rounded-[12px] gap-1 select-none">
                  <button
                    type="button"
                    onClick={() => setMode('prefix')}
                    className={`py-2 text-[13px] font-bold font-mono rounded-[8px] transition-all ${
                      mode === 'prefix'
                        ? 'bg-[#FCE76C] text-[#1F1E22] border-2 border-[#1F1E22] shadow-2xs'
                        : 'text-[#5B5F6B] hover:text-[#1F1E22]'
                    }`}
                  >
                    Prefix (/CIDR)
                  </button>
                  <button
                    type="button"
                    onClick={() => setMode('mask')}
                    className={`py-2 text-[13px] font-bold font-mono rounded-[8px] transition-all ${
                      mode === 'mask'
                        ? 'bg-[#FCE76C] text-[#1F1E22] border-2 border-[#1F1E22] shadow-2xs'
                        : 'text-[#5B5F6B] hover:text-[#1F1E22]'
                    }`}
                  >
                    Subnet Mask
                  </button>
                </div>
              </div>

              {/* Field 3: Input Nilai Netmask (Prefix atau Subnet Mask) */}
              {mode === 'prefix' ? (
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between">
                    <label
                      htmlFor="prefix"
                      className="font-sans font-bold text-[13px] uppercase tracking-wider text-[#1F1E22]"
                    >
                      Panjang Prefix
                    </label>
                    <span className="text-[11px] font-mono text-[#5B5F6B]">0 – 32</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-28 shrink-0">
                      <input
                        id="prefix"
                        type="text"
                        value={prefixInput}
                        onChange={(e) => {
                          setPrefixInput(e.target.value);
                          if (fieldErrors.prefix) {
                            setFieldErrors((prev) => ({ ...prev, prefix: undefined }));
                          }
                        }}
                        placeholder="27"
                        className={`w-full h-12 text-center font-mono font-bold text-[16px] text-[#1F1E22] bg-[#FFFFFF] rounded-[12px] border-2 transition-all ${
                          fieldErrors.prefix
                            ? 'border-[#B3261E]'
                            : 'border-[#8A8F9C] focus:border-[#1F1E22]'
                        }`}
                      />
                    </div>
                    <div className="flex-1 h-12 px-3 bg-[#F5F6F8] border border-[#E3E5EA] rounded-[12px] flex items-center justify-between text-xs">
                      <span className="text-[#5B5F6B] font-medium font-sans">Padanan:</span>
                      <span className="font-mono font-bold text-[#1F1E22]">
                        {matchedMask || 'Mask dinamis'}
                      </span>
                    </div>
                  </div>
                  {fieldErrors.prefix && (
                    <p className="text-[12px] text-[#B3261E] font-medium">
                      {fieldErrors.prefix}
                    </p>
                  )}
                </div>
              ) : (
                <div className="flex flex-col gap-1.5">
                  <label
                    htmlFor="subnet_mask"
                    className="font-sans font-bold text-[13px] uppercase tracking-wider text-[#1F1E22]"
                  >
                    Subnet Mask
                  </label>
                  <input
                    id="subnet_mask"
                    type="text"
                    value={maskInput}
                    onChange={(e) => {
                      setMaskInput(e.target.value);
                      if (fieldErrors.subnet_mask) {
                        setFieldErrors((prev) => ({ ...prev, subnet_mask: undefined }));
                      }
                    }}
                    placeholder="255.255.255.224"
                    className={`w-full h-12 px-3.5 font-mono font-medium text-[15px] text-[#1F1E22] bg-[#FFFFFF] rounded-[12px] border-2 transition-all ${
                      fieldErrors.subnet_mask
                        ? 'border-[#B3261E]'
                        : 'border-[#8A8F9C] focus:border-[#1F1E22]'
                    }`}
                  />
                  {fieldErrors.subnet_mask && (
                    <p className="text-[12px] text-[#B3261E] font-medium">
                      {fieldErrors.subnet_mask}
                    </p>
                  )}
                </div>
              )}

              {/* Action Buttons: Hitung & Isi contoh */}
              <div className="flex flex-col gap-2.5 pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full h-12 bg-[#FCE76C] hover:bg-[#F2D640] text-[#1F1E22] font-sans font-bold text-[15px] rounded-[12px] border-2 border-[#1F1E22] flex items-center justify-center gap-2 shadow-xs active:translate-y-0.5 transition-all disabled:opacity-50"
                >
                  {loading ? (
                    <Loader2 size={18} className="animate-spin text-[#1F1E22]" />
                  ) : (
                    <Calculator size={18} />
                  )}
                  <span>Hitung</span>
                </button>

                <button
                  type="button"
                  onClick={handleIsiContoh}
                  className="w-full h-12 bg-[#FFFFFF] hover:bg-[#F5F6F8] text-[#1F1E22] font-sans font-bold text-[14px] rounded-[12px] border-2 border-[#1F1E22] flex items-center justify-center gap-2 active:translate-y-0.5 transition-all"
                >
                  <PlayCircle size={17} className="text-[#5B5F6B]" />
                  <span>Isi contoh</span>
                </button>
              </div>
            </form>
          </section>
        </div>

        {/* KOLOM KANAN: AREA HASIL (7 cols) */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          {/* 1. General Error Banner jika ada */}
          {generalError && (
            <Banner
              variant="error"
              pesan={generalError}
              onClose={() => setGeneralError(null)}
            />
          )}

          {/* 2. State Loading */}
          {loading && (
            <div className="bg-[#FFFFFF] border-2 border-[#1F1E22] rounded-[20px] p-8 flex flex-col items-center justify-center gap-3 min-h-[300px]">
              <Loader2 size={32} className="animate-spin text-[#1F1E22]" />
              <p className="font-sans font-bold text-[15px] text-[#1F1E22]">
                Menghitung parameter subnetting...
              </p>
            </div>
          )}

          {/* 3. State Kosong */}
          {!loading && !hasil && (
            <div className="bg-[#FFFFFF] border-2 border-[#1F1E22] rounded-[20px] p-8 flex flex-col items-center text-center justify-center gap-4 min-h-[320px]">
              <div className="w-12 h-12 rounded-[16px] bg-[#FFF8D1] border-2 border-[#1F1E22] flex items-center justify-center text-[#1F1E22]">
                <Calculator size={24} />
              </div>
              <div className="max-w-md flex flex-col gap-1.5">
                <h3 className="font-title text-[18px] font-bold text-[#1F1E22]">
                  Belum Ada Hasil Perhitungan
                </h3>
                <p className="font-body-sm text-[14px] text-[#5B5F6B] leading-relaxed">
                  Masukkan alamat IP dan panjang prefix pada formulir di sebelah kiri, lalu klik{' '}
                  <strong className="text-[#1F1E22]">Hitung</strong> untuk menghasilkan lembar jawaban lengkap.
                </p>
              </div>
              <button
                type="button"
                onClick={handleIsiContoh}
                className="px-5 py-2.5 bg-[#FCE76C] hover:bg-[#F2D640] text-[#1F1E22] font-bold text-[14px] rounded-[10px] border-2 border-[#1F1E22] shadow-2xs active:translate-y-0.5 transition-all"
              >
                Coba Contoh 192.168.0.5 /27
              </button>
            </div>
          )}

          {/* 4. State Hasil (Urutan Wajib: Peringatan -> Ringkasan + AddressBar -> Diketahui -> Langkah 1..5 -> Tabel -> Kesimpulan) */}
          {!loading && hasil && (
            <div className="flex flex-col gap-6">
              {/* Step 4.1: Banner Peringatan bila ada */}
              {hasil.peringatan && hasil.peringatan.length > 0 && (
                <div className="flex flex-col gap-2">
                  {hasil.peringatan.map((p) => {
                    let pesanWarning = p;
                    if (p === 'PREFIX_31_32') {
                      pesanWarning =
                        'Prefix /31 dan /32 tidak memiliki alokasi alamat host valid pada praktikum jaringan standar.';
                    }
                    return (
                      <Banner
                        key={p}
                        variant="warning"
                        kode={p}
                        pesan={pesanWarning}
                      />
                    );
                  })}
                </div>
              )}

              {/* Step 4.2: Ringkasan Hasil + AddressBar */}
              {hasil.hasil_akhir.ringkasan && (
                <section className="bg-[#FFFFFF] border-2 border-[#1F1E22] rounded-[20px] p-6 shadow-sm flex flex-col gap-5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-[#E3E5EA]">
                    <div>
                      <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-[#5B5F6B]">
                        Output Instan
                      </span>
                      <h2 className="font-title text-[18px] font-bold text-[#1F1E22]">
                        Ringkasan Hasil Perhitungan
                      </h2>
                    </div>
                    <span className="self-start sm:self-center px-3 py-1 bg-[#E3F4EA] border border-[#16794C]/30 text-[#16794C] text-[11px] font-mono font-bold rounded-full">
                      Kelas {hasil.hasil_akhir.ringkasan.kelas}
                    </span>
                  </div>

                  {/* 4 Kartu Matriks Ringkasan */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    {/* NA */}
                    <div className="p-3.5 bg-[#F5F6F8] border border-[#E3E5EA] rounded-[14px] flex flex-col justify-between gap-1">
                      <div className="flex items-center justify-between">
                        <span className="text-[12px] font-sans font-bold text-[#5B5F6B]">
                          Network Address (NA)
                        </span>
                        <span className="w-2.5 h-2.5 rounded-full bg-[#8BD0FC] border border-[#1F1E22]/30" />
                      </div>
                      <div className="font-mono font-bold text-[18px] text-[#1F1E22]">
                        {hasil.hasil_akhir.ringkasan.na}
                      </div>
                      <span className="text-[11px] text-[#5B5F6B]">Alamat identitas subnet</span>
                    </div>

                    {/* BA */}
                    <div className="p-3.5 bg-[#F5F6F8] border border-[#E3E5EA] rounded-[14px] flex flex-col justify-between gap-1">
                      <div className="flex items-center justify-between">
                        <span className="text-[12px] font-sans font-bold text-[#5B5F6B]">
                          Broadcast Address (BA)
                        </span>
                        <span className="w-2.5 h-2.5 rounded-full bg-[#FF8F5C] border border-[#1F1E22]/30" />
                      </div>
                      <div className="font-mono font-bold text-[18px] text-[#1F1E22]">
                        {hasil.hasil_akhir.ringkasan.ba}
                      </div>
                      <span className="text-[11px] text-[#5B5F6B]">Alamat broadcast paket</span>
                    </div>

                    {/* Rentang Host Valid */}
                    <div className="p-3.5 bg-[#F5F6F8] border border-[#E3E5EA] rounded-[14px] flex flex-col justify-between gap-1">
                      <div className="flex items-center justify-between">
                        <span className="text-[12px] font-sans font-bold text-[#5B5F6B]">
                          Rentang Host Valid
                        </span>
                        <span className="w-2.5 h-2.5 rounded-full bg-[#16794C]" />
                      </div>
                      <div className="font-mono font-bold text-[14px] sm:text-[15px] text-[#1F1E22] truncate">
                        {hasil.hasil_akhir.ringkasan.host_pertama} – {hasil.hasil_akhir.ringkasan.host_terakhir}
                      </div>
                      <span className="text-[11px] text-[#5B5F6B]">Dapat dipasang ke PC / Host</span>
                    </div>

                    {/* Kapasitas Host */}
                    <div className="p-3.5 bg-[#F5F6F8] border border-[#E3E5EA] rounded-[14px] flex flex-col justify-between gap-1">
                      <div className="flex items-center justify-between">
                        <span className="text-[12px] font-sans font-bold text-[#5B5F6B]">
                          Jumlah Host Valid
                        </span>
                        <span className="w-2.5 h-2.5 rounded-full bg-[#FCE76C] border border-[#1F1E22]/30" />
                      </div>
                      <div className="font-mono font-bold text-[18px] text-[#1F1E22]">
                        {hasil.hasil_akhir.ringkasan.host_per_subnet}{' '}
                        <span className="text-[12px] font-normal text-[#5B5F6B] font-sans">
                          Host / subnet
                        </span>
                      </div>
                      <span className="text-[11px] text-[#5B5F6B]">Kapasitas usable host</span>
                    </div>
                  </div>

                  {/* Komponen Visual AddressBar */}
                  {hasil.hasil_akhir.tabel && (
                    <AddressBar
                      tabelSubnet={hasil.hasil_akhir.tabel}
                      alamatIp={hasil.hasil_akhir.ringkasan.alamat_ip}
                      prefix={hasil.hasil_akhir.ringkasan.prefix}
                    />
                  )}
                </section>
              )}

              {/* Step 4.3: Diketahui */}
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

              {/* Step 4.4: Kartu Langkah 1 sampai 5 */}
              <div className="flex flex-col gap-6">
                <div className="flex items-center gap-2 pt-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#1F1E22]" />
                  <h3 className="font-sans font-extrabold text-[16px] text-[#1F1E22] uppercase tracking-wide">
                    Langkah Pengerjaan Soal (Format Lembar Jawaban)
                  </h3>
                </div>

                {hasil.langkah.map((l, index) => {
                  const fadedLabels = [
                    `/${hasil.hasil_akhir.ringkasan?.prefix || 27}`,
                    'AND',
                    'NOT',
                    'OR',
                    '2^x',
                  ];
                  return (
                    <StepCard
                      key={l.judul}
                      nomor={index + 1}
                      langkah={l}
                      fadedLabel={fadedLabels[index] || `#${index + 1}`}
                    />
                  );
                })}
              </div>

              {/* Step 4.5: Hasil Akhir (Tabel Semua Subnet) */}
              {hasil.hasil_akhir.tabel && (
                <ResultTable
                  tabel={hasil.hasil_akhir.tabel}
                  targetIp={hasil.hasil_akhir.ringkasan?.alamat_ip}
                  prefix={hasil.hasil_akhir.ringkasan?.prefix}
                  totalSubnets={hasil.hasil_akhir.total_subnets}
                  ringkasanTabel={hasil.hasil_akhir.ringkasan_tabel}
                />
              )}

              {/* Step 4.6: Kesimpulan (Blok Kuning) */}
              <ConclusionBlock kesimpulan={hasil.kesimpulan} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
