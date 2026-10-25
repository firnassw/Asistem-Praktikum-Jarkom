import React, { useState } from 'react';
import { api, ApiException } from '../services/api';
import type {
  RencanaPayload,
  RuanganPayloadItem,
  StrukturJawaban,
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
  Trash2,
  AlertTriangle,
  ArrowRight,
  CopyCheck,
  Info,
} from 'lucide-react';

// Menghitung preview IP Global dari dua digit NIM
export function getNimPreview(nim: string): string {
  const trimmed = nim.trim();
  if (trimmed.length === 2 && /^\d{2}$/.test(trimmed)) {
    const xx = parseInt(trimmed, 10);
    return `192.168.${xx}.0/24`;
  }
  return '192.168.XX.0/24';
}

export const Rencana: React.FC = () => {
  // Sumber IP Induk: 'nim' (default) | 'manual'
  const [sumberInduk, setSumberInduk] = useState<'nim' | 'manual'>('nim');
  const [nimDuaDigit, setNimDuaDigit] = useState<string>('50');
  const [alamatIndukManual, setAlamatIndukManual] = useState<string>('192.168.50.0');
  const [prefixIndukManual, setPrefixIndukManual] = useState<number>(24);

  // Daftar Ruangan (1 sampai 20 ruangan)
  const [ruangan, setRuangan] = useState<RuanganPayloadItem[]>([
    { nama: 'Lab Basis Data', device: 60 },
    { nama: 'Lab PPSI', device: 34 },
    { nama: 'Ruang Dosen', device: 30 },
    { nama: 'Ruang Seminar', device: 8 },
    { nama: 'Server', device: 1 },
  ]);

  // Pengaturan Tambahan
  const [gateway, setGateway] = useState<boolean>(false);
  const [cadanganPersen, setCadanganPersen] = useState<number>(0);
  const [mode, setMode] = useState<'vlsm' | 'flsm'>('vlsm');

  // Validasi Error
  const [fieldErrors, setFieldErrors] = useState<{
    nim_dua_digit?: string;
    alamat_induk?: string;
    prefix_induk?: string;
    ruangan?: string;
    cadangan_persen?: string;
  }>({});
  const [generalError, setGeneralError] = useState<string | null>(null);

  // Status Perhitungan
  const [loading, setLoading] = useState<boolean>(false);
  const [hasil, setHasil] = useState<StrukturJawaban | null>(null);

  // Status Tab Perbandingan Aktif
  const [activeGatewayTab, setActiveGatewayTab] = useState<'tanpa' | 'dengan'>('tanpa');
  const [activeModeTab, setActiveModeTab] = useState<'vlsm' | 'flsm'>('vlsm');

  // Handler Stepper Jumlah Ruangan
  const handleKurangiRuangan = () => {
    if (ruangan.length <= 1) return;
    setRuangan(ruangan.slice(0, -1));
  };

  const handleTambahRuangan = () => {
    if (ruangan.length >= 20) return;
    const nextNum = ruangan.length + 1;
    setRuangan([...ruangan, { nama: `Ruang ${nextNum}`, device: 10 }]);
  };

  // Handler Samakan Semua Device
  const handleSamakanSemua = () => {
    if (ruangan.length === 0) return;
    const firstDevice = ruangan[0].device;
    setRuangan(ruangan.map((r) => ({ ...r, device: firstDevice })));
  };

  // Handler Ubah Baris Ruangan
  const handleUbahRuangan = (
    index: number,
    field: 'nama' | 'device',
    value: string
  ) => {
    const updated = [...ruangan];
    if (field === 'nama') {
      updated[index].nama = value;
    } else {
      const parsed = parseInt(value, 10);
      updated[index].device = isNaN(parsed) ? 0 : parsed;
    }
    setRuangan(updated);
    if (fieldErrors.ruangan) {
      setFieldErrors((prev) => ({ ...prev, ruangan: undefined }));
    }
  };

  // Handler Hapus Baris Ruangan
  const handleHapusBaris = (index: number) => {
    if (ruangan.length <= 1) return;
    setRuangan(ruangan.filter((_, i) => i !== index));
  };

  // Handler Isi Contoh Praktikum (G-JAR-06)
  const handleIsiContoh = () => {
    setSumberInduk('nim');
    setNimDuaDigit('50');
    setRuangan([
      { nama: 'Lab Basis Data', device: 60 },
      { nama: 'Lab PPSI', device: 34 },
      { nama: 'Ruang Dosen', device: 30 },
      { nama: 'Ruang Seminar', device: 8 },
      { nama: 'Server', device: 1 },
    ]);
    setGateway(false);
    setCadanganPersen(0);
    setMode('vlsm');
    setFieldErrors({});
    setGeneralError(null);
  };

  // Eksekusi Hitung Rencana Subnet
  const handleHitung = async () => {
    setFieldErrors({});
    setGeneralError(null);
    setLoading(true);

    const payload: RencanaPayload = {
      ruangan,
      gateway,
      cadangan_persen: cadanganPersen,
      mode,
    };

    if (sumberInduk === 'nim') {
      payload.nim_dua_digit = nimDuaDigit;
    } else {
      payload.alamat_induk = alamatIndukManual;
      payload.prefix_induk = prefixIndukManual;
    }

    try {
      const res = await api.hitungRencana(payload);
      setHasil(res);
      setActiveGatewayTab(gateway ? 'dengan' : 'tanpa');
      setActiveModeTab(mode);
    } catch (err: any) {
      if (err instanceof ApiException) {
        if (err.field) {
          setFieldErrors({ [err.field]: err.message });
        } else {
          setGeneralError(err.message);
        }
      } else {
        setGeneralError(err.message || 'Terjadi kesalahan pada perhitungan rencana.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Hitung Data yang Ditampilkan berdasarkan Tab Aktif
  const perbandinganGw = hasil?.hasil_akhir?.perbandingan_gateway;
  const perbandinganMode = hasil?.hasil_akhir?.perbandingan_mode;
  const hasGatewayDiff =
    hasil?.peringatan?.includes('GATEWAY_MEMBEDAKAN_HASIL') ||
    (perbandinganGw?.ruangan_berubah && perbandinganGw.ruangan_berubah.length > 0);

  // Ambil sub-skenario sesuai tab gateway / mode
  let currentSummary = hasil?.hasil_akhir?.ringkasan;
  let currentTable = hasil?.hasil_akhir?.tabel || [];
  let currentLangkah = hasil?.langkah || [];
  let currentKesimpulan = hasil?.kesimpulan || '';
  let isCurrentGatewayActive = gateway;

  if (activeModeTab === 'flsm' && perbandinganMode?.flsm) {
    if (perbandinganMode.flsm.status === 'FLSM_TIDAK_MUNGKIN') {
      // FLSM tidak mungkin
      currentSummary = null;
      currentTable = [];
    } else {
      currentSummary = perbandinganMode.flsm;
      currentTable = perbandinganMode.flsm.tabel || [];
      currentLangkah = perbandinganMode.flsm.langkah || hasil?.langkah || [];
      currentKesimpulan = perbandinganMode.flsm.kesimpulan || hasil?.kesimpulan || '';
    }
  } else if (hasGatewayDiff && perbandinganGw) {
    if (activeGatewayTab === 'tanpa' && perbandinganGw.tanpa_gateway) {
      const tg = perbandinganGw.tanpa_gateway;
      currentSummary = tg;
      currentTable = tg.tabel || [];
      currentLangkah = tg.langkah || hasil?.langkah || [];
      currentKesimpulan = tg.kesimpulan || hasil?.kesimpulan || '';
      isCurrentGatewayActive = false;
    } else if (activeGatewayTab === 'dengan' && perbandinganGw.dengan_gateway) {
      const dg = perbandinganGw.dengan_gateway;
      currentSummary = dg;
      currentTable = dg.tabel || [];
      currentLangkah = dg.langkah || hasil?.langkah || [];
      currentKesimpulan = dg.kesimpulan || hasil?.kesimpulan || '';
      isCurrentGatewayActive = true;
    }
  }

  // Alamat Induk yang ditampilkan pada peta bar
  const displayAlamatInduk =
    hasil?.diketahui?.find((d) => d.label === 'Induk Jaringan')?.nilai.split('/')[0] ||
    (sumberInduk === 'nim'
      ? getNimPreview(nimDuaDigit).split('/')[0]
      : alamatIndukManual);

  return (
    <div className="flex flex-col gap-6 w-full max-w-[1280px] mx-auto pb-12">
      {/* HEADER BAND (Latar kuning #FCE76C, teks ink #1F1E22, border ink 2px) */}
      <section className="bg-[#FCE76C] border-2 border-[#1F1E22] rounded-[28px] p-6 sm:p-8 shadow-sm flex flex-col gap-2">
        <h1 className="font-extrabold text-3xl sm:text-4xl text-[#1F1E22] tracking-tight">
          Rencana ruangan
        </h1>
        <p className="font-medium text-[15px] sm:text-base text-[#1F1E22]">
          Isi jumlah device tiap ruangan, dapatkan pembagian subnet lengkap dengan langkahnya.
        </p>
      </section>

      {/* TWO-COLUMN WORKSPACE: FORMULIR (5/12) & HASIL (7/12) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* KOLOM FORMULIR (5/12, Sticky Desktop) */}
        <div className="lg:col-span-5 lg:sticky lg:top-6 space-y-4">
          <div className="bg-[#FFFFFF] border-2 border-[#1F1E22] rounded-[20px] p-6 shadow-sm space-y-5">
            <div className="flex items-center justify-between border-b border-[#E3E5EA] pb-3">
              <h2 className="font-extrabold text-lg text-[#1F1E22]">Formulir Alokasi</h2>
              <div className="flex bg-[#F5F6F8] p-1 rounded-[8px] border border-[#1F1E22]/15 text-xs font-bold font-sans">
                <button
                  type="button"
                  onClick={() => setSumberInduk('nim')}
                  className={`px-2.5 py-1 rounded-[6px] transition-all cursor-pointer ${
                    sumberInduk === 'nim'
                      ? 'bg-[#FCE76C] text-[#1F1E22] shadow-2xs'
                      : 'text-[#5B5F6B] hover:text-[#1F1E22]'
                  }`}
                >
                  NIM
                </button>
                <button
                  type="button"
                  onClick={() => setSumberInduk('manual')}
                  className={`px-2.5 py-1 rounded-[6px] transition-all cursor-pointer ${
                    sumberInduk === 'manual'
                      ? 'bg-[#FCE76C] text-[#1F1E22] shadow-2xs'
                      : 'text-[#5B5F6B] hover:text-[#1F1E22]'
                  }`}
                >
                  Manual
                </button>
              </div>
            </div>

            {/* Input Sumber Jaringan Induk */}
            {sumberInduk === 'nim' ? (
              <div>
                <label
                  htmlFor="nim-input"
                  className="block text-xs font-bold uppercase tracking-wider text-[#1F1E22] mb-1.5"
                >
                  Dua digit terakhir NIM
                </label>
                <div className="flex items-center space-x-3">
                  <input
                    id="nim-input"
                    type="text"
                    maxLength={2}
                    value={nimDuaDigit}
                    onChange={(e) => {
                      setNimDuaDigit(e.target.value);
                      if (fieldErrors.nim_dua_digit) {
                        setFieldErrors((prev) => ({ ...prev, nim_dua_digit: undefined }));
                      }
                    }}
                    placeholder="50"
                    className={`w-24 h-12 bg-white text-[#1F1E22] font-mono text-base font-bold text-center border-2 rounded-[12px] focus:outline-none focus:ring-2 focus:ring-[#1F1E22]/20 ${
                      fieldErrors.nim_dua_digit
                        ? 'border-[#B3261E] bg-[#FCE8E6]/20'
                        : 'border-[#8A8F9C] focus:border-[#1F1E22]'
                    }`}
                  />
                  <div className="flex-1 bg-[#FFF8D1] border-2 border-[#1F1E22] rounded-[12px] h-12 px-3 flex items-center justify-between shadow-2xs">
                    <span className="text-xs font-bold text-[#1F1E22]">IP Global:</span>
                    <span className="font-mono text-xs font-bold text-[#1F1E22] bg-white px-2 py-0.5 rounded border border-[#1F1E22]">
                      {getNimPreview(nimDuaDigit)}
                    </span>
                  </div>
                </div>
                {fieldErrors.nim_dua_digit ? (
                  <p className="text-xs text-[#B3261E] font-medium mt-1">
                    {fieldErrors.nim_dua_digit}
                  </p>
                ) : (
                  <p className="text-[12px] text-[#5B5F6B] mt-1.5 font-medium">
                    Blok jaringan induk otomatis disesuaikan dengan digit NIM.
                  </p>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-2">
                <div className="col-span-2">
                  <label
                    htmlFor="alamat-induk-input"
                    className="block text-xs font-bold uppercase tracking-wider text-[#1F1E22] mb-1"
                  >
                    Alamat Induk
                  </label>
                  <input
                    id="alamat-induk-input"
                    type="text"
                    value={alamatIndukManual}
                    onChange={(e) => {
                      setAlamatIndukManual(e.target.value);
                      if (fieldErrors.alamat_induk) {
                        setFieldErrors((prev) => ({ ...prev, alamat_induk: undefined }));
                      }
                    }}
                    placeholder="192.168.1.0"
                    className="w-full h-11 px-3 bg-white font-mono text-xs font-bold border-2 border-[#8A8F9C] rounded-[12px] focus:outline-none focus:border-[#1F1E22]"
                  />
                  {fieldErrors.alamat_induk && (
                    <p className="text-[11px] text-[#B3261E] font-medium mt-1">
                      {fieldErrors.alamat_induk}
                    </p>
                  )}
                </div>
                <div>
                  <label
                    htmlFor="prefix-induk-input"
                    className="block text-xs font-bold uppercase tracking-wider text-[#1F1E22] mb-1"
                  >
                    Prefix
                  </label>
                  <div className="flex items-center h-11 px-2 border-2 border-[#8A8F9C] rounded-[12px] bg-white">
                    <span className="font-mono text-xs font-bold text-[#5B5F6B]">/</span>
                    <input
                      id="prefix-induk-input"
                      type="number"
                      min={0}
                      max={30}
                      value={prefixIndukManual}
                      onChange={(e) => setPrefixIndukManual(parseInt(e.target.value, 10) || 0)}
                      className="w-full font-mono text-xs font-bold text-center focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Stepper Jumlah Ruangan */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#1F1E22] mb-1.5">
                Jumlah ruangan
              </label>
              <div className="flex items-center space-x-3">
                <div className="flex items-center border-2 border-[#1F1E22] rounded-[12px] overflow-hidden bg-white shadow-2xs">
                  <button
                    type="button"
                    aria-label="Kurangi ruangan"
                    onClick={handleKurangiRuangan}
                    disabled={ruangan.length <= 1}
                    className="w-11 h-11 flex items-center justify-center font-bold text-lg text-[#1F1E22] hover:bg-[#F5F6F8] active:bg-[#E3E5EA] transition-colors border-r-2 border-[#1F1E22] disabled:opacity-40 cursor-pointer"
                  >
                    −
                  </button>
                  <div className="w-14 text-center font-mono font-bold text-lg text-[#1F1E22]">
                    {ruangan.length}
                  </div>
                  <button
                    type="button"
                    aria-label="Tambah ruangan"
                    onClick={handleTambahRuangan}
                    disabled={ruangan.length >= 20}
                    className="w-11 h-11 flex items-center justify-center font-bold text-lg text-[#1F1E22] hover:bg-[#F5F6F8] active:bg-[#E3E5EA] transition-colors border-l-2 border-[#1F1E22] disabled:opacity-40 cursor-pointer"
                  >
                    +
                  </button>
                </div>

                <button
                  type="button"
                  onClick={handleSamakanSemua}
                  title="Salin jumlah device baris pertama ke semua baris ruangan"
                  className="h-11 px-3.5 bg-white hover:bg-[#F5F6F8] text-[#1F1E22] font-bold text-xs rounded-[12px] border-2 border-[#1F1E22] flex items-center gap-1.5 ml-auto shadow-2xs active:translate-y-0.5 transition-all cursor-pointer"
                >
                  <CopyCheck size={15} className="text-[#1F1E22]" />
                  <span>Samakan semua</span>
                </button>
              </div>
              {fieldErrors.ruangan && (
                <p className="text-xs text-[#B3261E] font-medium mt-1">{fieldErrors.ruangan}</p>
              )}
            </div>

            {/* Daftar Ruangan dan Device */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-[#5B5F6B] px-1">
                <span>Daftar Ruangan & Warna Subnet</span>
                <span>Jumlah Device</span>
              </div>

              <div className="space-y-2 max-h-[360px] overflow-y-auto pr-1">
                {ruangan.map((r, idx) => {
                  const color = getSubnetColor(idx);
                  return (
                    <div
                      key={idx}
                      className="flex items-center space-x-2 bg-[#F5F6F8] p-2 rounded-[12px] border border-[#E3E5EA]"
                    >
                      {/* Penanda Warna Subnet */}
                      <div
                        style={{ backgroundColor: color }}
                        className="w-3.5 h-9 rounded-sm border border-[#1F1E22] shrink-0"
                        title={`Subnet ${idx + 1}`}
                      />
                      <input
                        type="text"
                        value={r.nama}
                        onChange={(e) => handleUbahRuangan(idx, 'nama', e.target.value)}
                        placeholder={`Nama Ruangan ${idx + 1}`}
                        className="flex-1 h-9 px-2.5 bg-white border border-[#8A8F9C] rounded-[6px] text-xs font-bold text-[#1F1E22] focus:outline-none focus:border-[#1F1E22]"
                      />
                      <div className="relative w-20 shrink-0">
                        <input
                          type="number"
                          min={1}
                          value={r.device || ''}
                          onChange={(e) => handleUbahRuangan(idx, 'device', e.target.value)}
                          placeholder="Device"
                          className="w-full h-9 px-2 bg-white border border-[#8A8F9C] rounded-[6px] text-xs font-mono font-bold text-right text-[#1F1E22] focus:outline-none focus:border-[#1F1E22]"
                        />
                      </div>
                      <button
                        type="button"
                        aria-label={`Hapus ${r.nama}`}
                        disabled={ruangan.length <= 1}
                        onClick={() => handleHapusBaris(idx)}
                        className="p-1.5 text-[#5B5F6B] hover:text-[#B3261E] rounded hover:bg-[#FCE8E6] transition-colors disabled:opacity-30 cursor-pointer"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Gateway Toggle & Cadangan Pertumbuhan */}
            <div className="pt-2 border-t border-[#E3E5EA] space-y-4">
              {/* Gateway Toggle */}
              <div className="flex items-start justify-between gap-3">
                <div>
                  <span className="text-xs font-bold text-[#1F1E22] block">
                    Hitung gateway (+1 host per ruangan)
                  </span>
                  <span className="text-[11px] text-[#5B5F6B] font-medium leading-tight block mt-0.5">
                    Tambahkan 1 IP interface router pada setiap subnet.
                  </span>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={gateway}
                  onClick={() => setGateway(!gateway)}
                  className={`w-12 h-6 border-2 border-[#1F1E22] rounded-full p-0.5 flex items-center transition-colors cursor-pointer shrink-0 ${
                    gateway ? 'bg-[#FCE76C]' : 'bg-[#D6D9E2]'
                  }`}
                >
                  <div
                    className={`w-4 h-4 bg-white rounded-full border border-[#1F1E22] shadow-sm transform transition-transform ${
                      gateway ? 'translate-x-6' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* Cadangan Pertumbuhan & Mode Alokasi */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label
                    htmlFor="cadangan-input"
                    className="block text-xs font-bold uppercase tracking-wider text-[#1F1E22] mb-1"
                  >
                    Cadangan
                  </label>
                  <div className="flex items-center border-2 border-[#8A8F9C] rounded-[12px] px-3 h-11 bg-white focus-within:border-[#1F1E22]">
                    <input
                      id="cadangan-input"
                      type="number"
                      min={0}
                      max={100}
                      value={cadanganPersen}
                      onChange={(e) => {
                        const val = parseInt(e.target.value, 10);
                        setCadanganPersen(isNaN(val) ? 0 : val);
                        if (fieldErrors.cadangan_persen) {
                          setFieldErrors((prev) => ({ ...prev, cadangan_persen: undefined }));
                        }
                      }}
                      className="w-full text-right font-mono font-bold text-xs text-[#1F1E22] focus:outline-none"
                    />
                    <span className="text-xs font-bold text-[#5B5F6B] ml-1">%</span>
                  </div>
                  {fieldErrors.cadangan_persen && (
                    <p className="text-[11px] text-[#B3261E] font-medium mt-1">
                      {fieldErrors.cadangan_persen}
                    </p>
                  )}
                </div>

                <div>
                  <span className="block text-xs font-bold uppercase tracking-wider text-[#1F1E22] mb-1">
                    Mode Alokasi
                  </span>
                  <div className="h-11 border-2 border-[#1F1E22] rounded-[12px] p-1 flex bg-[#F5F6F8]">
                    <button
                      type="button"
                      onClick={() => setMode('vlsm')}
                      className={`flex-1 rounded-[8px] font-bold text-xs transition-all cursor-pointer ${
                        mode === 'vlsm'
                          ? 'bg-[#FCE76C] text-[#1F1E22] border border-[#1F1E22] shadow-2xs'
                          : 'text-[#5B5F6B] hover:text-[#1F1E22]'
                      }`}
                    >
                      VLSM
                    </button>
                    <button
                      type="button"
                      onClick={() => setMode('flsm')}
                      className={`flex-1 rounded-[8px] font-bold text-xs transition-all cursor-pointer ${
                        mode === 'flsm'
                          ? 'bg-[#FCE76C] text-[#1F1E22] border border-[#1F1E22] shadow-2xs'
                          : 'text-[#5B5F6B] hover:text-[#1F1E22]'
                      }`}
                    >
                      FLSM
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Error Global */}
            {generalError && (
              <div className="p-3 bg-[#FCE8E6] border-2 border-[#B3261E] rounded-[12px] text-xs font-medium text-[#B3261E] flex items-start gap-2">
                <AlertTriangle size={16} className="shrink-0 mt-0.5 text-[#B3261E]" />
                <span>{generalError}</span>
              </div>
            )}

            {/* Action Buttons: Satu Primary Hitung & Satu Secondary Isi contoh */}
            <div className="pt-2 space-y-2.5">
              <button
                type="button"
                onClick={handleHitung}
                disabled={loading}
                className="w-full h-12 bg-[#FCE76C] hover:bg-[#F2D640] text-[#1F1E22] font-extrabold text-sm rounded-[12px] border-2 border-[#1F1E22] flex items-center justify-center space-x-2 shadow-2xs active:translate-y-0.5 transition-all disabled:opacity-60 cursor-pointer"
              >
                {loading ? (
                  <Loader2 size={18} className="animate-spin text-[#1F1E22]" />
                ) : (
                  <Calculator size={18} className="text-[#1F1E22]" />
                )}
                <span>{loading ? 'Menghitung...' : 'Hitung'}</span>
              </button>

              <button
                type="button"
                onClick={handleIsiContoh}
                disabled={loading}
                className="w-full h-11 bg-white hover:bg-[#F5F6F8] text-[#1F1E22] font-bold text-xs rounded-[12px] border-2 border-[#1F1E22] flex items-center justify-center space-x-2 shadow-2xs active:translate-y-0.5 transition-all cursor-pointer"
              >
                <PlayCircle size={16} className="text-[#5B5F6B]" />
                <span>Isi contoh</span>
              </button>
            </div>
          </div>
        </div>

        {/* KOLOM HASIL (7/12) */}
        <div className="lg:col-span-7 space-y-6">
          {!hasil && !loading && (
            <div className="bg-white border-2 border-[#1F1E22] rounded-[20px] p-8 text-center space-y-4 shadow-sm">
              <div className="w-14 h-14 rounded-full bg-[#FFF8D1] border-2 border-[#1F1E22] flex items-center justify-center mx-auto text-[#1F1E22]">
                <Calculator size={28} />
              </div>
              <div className="space-y-1">
                <h3 className="font-title text-lg font-bold text-[#1F1E22]">
                  Belum Ada Hasil Alokasi
                </h3>
                <p className="font-body-sm text-sm text-[#5B5F6B] max-w-md mx-auto">
                  Isi dua digit terakhir NIM dan jumlah device pada formulir di sebelah kiri,
                  lalu klik tombol <strong>Hitung</strong> atau coba klik <strong>Isi contoh</strong>.
                </p>
              </div>
            </div>
          )}

          {loading && (
            <div className="bg-white border-2 border-[#1F1E22] rounded-[20px] p-12 text-center space-y-4 shadow-sm">
              <Loader2 size={36} className="animate-spin mx-auto text-[#1F1E22]" />
              <p className="font-bold text-sm text-[#1F1E22]">
                Menghitung rencana alokasi subnet deterministik...
              </p>
            </div>
          )}

          {hasil && !loading && (
            <>
              {/* 1. BANNER PERINGATAN (jika ada) */}
              {hasGatewayDiff && (
                <div
                  data-testid="banner-peringatan-gateway"
                  className="bg-[#FFF4D6] border-2 border-[#8A5A00] rounded-[16px] p-4 flex items-start space-x-3.5 shadow-2xs"
                >
                  <div className="w-8 h-8 rounded-full bg-[#8A5A00] text-white flex items-center justify-center font-bold text-base shrink-0 mt-0.5">
                    !
                  </div>
                  <div className="flex-1 space-y-1.5">
                    <h4 className="font-extrabold text-sm text-[#1F1E22]">
                      Perhatian: Penambahan Alamat Gateway
                    </h4>
                    <div className="text-xs text-[#1F1E22] font-medium leading-relaxed space-y-1">
                      {perbandinganGw?.ruangan_berubah && perbandinganGw.ruangan_berubah.length > 0 ? (
                        perbandinganGw.ruangan_berubah.map((rb: any, idx: number) => (
                          <p key={idx}>
                            Jika gateway dihitung (+1 router host),{' '}
                            <span className="font-bold underline">
                              {rb.nama} ({rb.device} device)
                            </span>{' '}
                            membutuhkan {rb.host_dengan} host yang mengharuskan penggunaan prefix{' '}
                            <strong className="font-mono">/{rb.prefix_dengan}</strong> (kapasitas{' '}
                            {rb.host_tersedia_dengan} host), bukan{' '}
                            <strong className="font-mono">/{rb.prefix_tanpa}</strong> (kapasitas{' '}
                            {rb.host_tersedia_tanpa} host).
                          </p>
                        ))
                      ) : (
                        <p>
                          Terdapat perbedaan alokasi prefix antara perhitungan tanpa gateway dan dengan gateway (+1 router host per ruangan).
                        </p>
                      )}
                    </div>
                    <div>
                      <button
                        type="button"
                        onClick={() =>
                          setActiveGatewayTab(activeGatewayTab === 'tanpa' ? 'dengan' : 'tanpa')
                        }
                        className="inline-flex items-center text-xs font-bold text-[#8A5A00] hover:text-[#1F1E22] underline gap-1 cursor-pointer"
                      >
                        <span>
                          {activeGatewayTab === 'tanpa'
                            ? 'Lihat hasil dengan gateway'
                            : 'Lihat hasil tanpa gateway'}
                        </span>
                        <ArrowRight size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {hasil.peringatan.includes('VLSM_RUANG_KURANG') && (
                <Banner
                  variant="warning"
                  kode="VLSM_RUANG_KURANG"
                  pesan="Total kebutuhan host melebihi kapasitas jaringan induk. Sebagian ruangan tidak dapat dialokasikan (status: Tidak muat)."
                />
              )}

              {hasil.peringatan.includes('MELEWATI_INDUK') && (
                <Banner
                  variant="warning"
                  kode="MELEWATI_INDUK"
                  pesan="Alokasi subnet berlanjut melampaui kapasitas induk sesuai opsi gaya modul praktikum."
                />
              )}

              {/* 2. RINGKASAN HASIL + BAR BLOK ALAMAT (AddressBar) */}
              {currentSummary && (
                <div
                  data-testid="ringkasan-rencana"
                  className="bg-white border-2 border-[#1F1E22] rounded-[20px] p-6 shadow-sm space-y-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <span className="text-xs font-bold uppercase tracking-wider text-[#5B5F6B]">
                        Ringkasan Alokasi IP
                      </span>
                      <h3 className="font-extrabold text-xl text-[#1F1E22] mt-0.5">
                        {currentSummary.ruangan_terakomodasi} subnet dialokasikan,{' '}
                        {currentSummary.total_alamat_dialokasikan} dari{' '}
                        {currentSummary.kapasitas_induk} alamat terpakai.
                      </h3>
                    </div>
                    <div className="self-start sm:self-auto">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-[#E3F4EA] text-[#16794C] border border-[#16794C]">
                        Sisa {currentSummary.sisa_alamat} IP
                      </span>
                    </div>
                  </div>

                  {/* Visual Bar Proporsional AddressBar */}
                  <AddressBar
                    proportionalData={{
                      kapasitasInduk: currentSummary.kapasitas_induk,
                      alamatInduk: displayAlamatInduk,
                      prefixInduk: 24,
                      totalAlamatDialokasikan: currentSummary.total_alamat_dialokasikan,
                      sisaAlamat: currentSummary.sisa_alamat,
                      blocks: currentTable as any,
                    }}
                  />
                </div>
              )}

              {/* 3. TAB PERBANDINGAN (Tanpa gateway | Dengan gateway & VLSM | FLSM) */}
              <div className="flex flex-wrap items-center justify-between gap-3">
                {/* Gateway Tab */}
                {hasGatewayDiff ? (
                  <div
                    data-testid="tabs-gateway"
                    className="inline-flex bg-white border-2 border-[#1F1E22] rounded-[12px] p-1 shadow-2xs"
                  >
                    <button
                      type="button"
                      onClick={() => setActiveGatewayTab('tanpa')}
                      className={`px-3.5 py-1.5 rounded-[8px] font-bold text-xs transition-all cursor-pointer ${
                        activeGatewayTab === 'tanpa'
                          ? 'bg-[#1F1E22] text-white shadow-2xs'
                          : 'text-[#5B5F6B] hover:text-[#1F1E22]'
                      }`}
                    >
                      Tanpa gateway
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveGatewayTab('dengan')}
                      className={`px-3.5 py-1.5 rounded-[8px] font-bold text-xs transition-all cursor-pointer ${
                        activeGatewayTab === 'dengan'
                          ? 'bg-[#1F1E22] text-white shadow-2xs'
                          : 'text-[#5B5F6B] hover:text-[#1F1E22]'
                      }`}
                    >
                      Dengan gateway
                    </button>
                  </div>
                ) : (
                  <div />
                )}

                {/* Mode Tab */}
                <div
                  data-testid="tabs-mode"
                  className="inline-flex bg-white border-2 border-[#1F1E22] rounded-[12px] p-1 shadow-2xs"
                >
                  <button
                    type="button"
                    onClick={() => setActiveModeTab('vlsm')}
                    className={`px-3.5 py-1.5 rounded-[8px] font-bold text-xs transition-all cursor-pointer ${
                      activeModeTab === 'vlsm'
                        ? 'bg-[#FCE76C] text-[#1F1E22] border border-[#1F1E22] shadow-2xs'
                        : 'text-[#5B5F6B] hover:text-[#1F1E22]'
                    }`}
                  >
                    Mode VLSM
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveModeTab('flsm')}
                    className={`px-3.5 py-1.5 rounded-[8px] font-bold text-xs transition-all cursor-pointer ${
                      activeModeTab === 'flsm'
                        ? 'bg-[#FCE76C] text-[#1F1E22] border border-[#1F1E22] shadow-2xs'
                        : 'text-[#5B5F6B] hover:text-[#1F1E22]'
                    }`}
                  >
                    Mode FLSM
                  </button>
                </div>
              </div>

              {/* Peringatan jika FLSM tidak muat saat tab FLSM dipilih */}
              {activeModeTab === 'flsm' && perbandinganMode?.flsm?.status === 'FLSM_TIDAK_MUNGKIN' && (
                <div className="p-4 bg-[#FFF4D6] border-2 border-[#8A5A00] rounded-[16px] space-y-2">
                  <div className="flex items-center gap-2 text-[#8A5A00] font-bold text-sm">
                    <AlertTriangle size={18} />
                    <span>FLSM Tidak Dapat Diterapkan pada Induk Ini</span>
                  </div>
                  <p className="text-xs text-[#1F1E22] leading-relaxed">
                    {perbandinganMode.flsm.pesan}
                  </p>
                  <p className="text-xs text-[#5B5F6B]">
                    Gunakan tab <strong>Mode VLSM</strong> untuk alokasi subnet yang muat pada jaringan induk ini.
                  </p>
                </div>
              )}

              {/* 4. DIKETAHUI */}
              <div
                data-testid="diketahui-rencana"
                className="bg-white border-2 border-[#1F1E22] rounded-[20px] p-6 shadow-sm space-y-3"
              >
                <div className="flex items-center gap-2">
                  <Info size={18} className="text-[#1F1E22]" />
                  <h3 className="font-extrabold text-base text-[#1F1E22]">Diketahui</h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 pt-1">
                  {hasil.diketahui.map((d, i) => (
                    <div
                      key={i}
                      className="p-3 bg-[#F5F6F8] rounded-[12px] border border-[#E3E5EA] space-y-0.5"
                    >
                      <span className="text-[11px] font-bold uppercase tracking-wider text-[#5B5F6B] block">
                        {d.label}
                      </span>
                      <span className="font-mono text-xs font-bold text-[#1F1E22] block truncate">
                        {d.nilai}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* 5. KARTU LANGKAH 1..N (StepCard) */}
              <div className="space-y-6 pt-1">
                <div className="flex items-center space-x-2">
                  <span className="w-3 h-3 bg-[#1F1E22] rounded-full" />
                  <h3 className="font-extrabold text-lg text-[#1F1E22]">Langkah Pengerjaan Soal</h3>
                  <span className="text-xs text-[#5B5F6B] font-medium">
                    (Sesuai Lembar Jawaban Ujian Praktikum)
                  </span>
                </div>

                {currentLangkah.map((step, idx) => {
                  const fadedLabels = ['/26', '/27', '/30'];
                  return (
                    <StepCard
                      key={idx}
                      nomor={idx + 1}
                      langkah={step}
                      fadedLabel={fadedLabels[idx % fadedLabels.length]}
                    />
                  );
                })}
              </div>

              {/* 6. HASIL AKHIR (ResultTable) */}
              {currentTable.length > 0 && (
                <ResultTable
                  tabel={currentTable}
                  mode="rencana"
                  showGateway={isCurrentGatewayActive}
                  judul={`Tabel Alokasi Subnet (${activeModeTab.toUpperCase()})`}
                />
              )}

              {/* 7. KESIMPULAN (ConclusionBlock) */}
              {currentKesimpulan && (
                <ConclusionBlock kesimpulan={currentKesimpulan} />
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
