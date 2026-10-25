import React, { useState } from 'react';
import { api, ApiException } from '../services/api';
import type { StrukturJawaban } from '../types/api';
import { Banner } from '../components/Banner';
import { StepCard } from '../components/StepCard';
import { ResultTable } from '../components/ResultTable';
import { ConclusionBlock } from '../components/ConclusionBlock';
import {
  Plus,
  Trash2,
  HardDrive,
  Laptop,
  Layers,
  Network,
  RotateCw,
  Sparkles,
  Loader2,
  AlertTriangle,
} from 'lucide-react';

interface DeviceFormRow {
  id: string;
  nama: string;
  mode: 'static' | 'dhcp';
  ip: string;
  maskOrPrefix: string;
  gateway: string;
  dns: string;
}

// Data Uji Emas G-JAR-09 (Modul 4)
const CONTOH_G_JAR_09: DeviceFormRow[] = [
  {
    id: 'row-1',
    nama: 'Server',
    mode: 'static',
    ip: '192.168.1.1',
    maskOrPrefix: '255.255.255.0',
    gateway: '-',
    dns: '-',
  },
  {
    id: 'row-2',
    nama: 'PC0',
    mode: 'static',
    ip: '192.168.1.2',
    maskOrPrefix: '255.255.255.0',
    gateway: '-',
    dns: '192.168.1.1',
  },
  {
    id: 'row-3',
    nama: 'PC1',
    mode: 'static',
    ip: '192.168.1.3',
    maskOrPrefix: '255.255.255.0',
    gateway: '-',
    dns: '192.168.1.1',
  },
];

function parseMaskOrPrefix(inputStr: string): { prefix?: number; subnet_mask?: string } {
  const trimmed = inputStr.trim();
  if (!trimmed) return {};
  if (trimmed.startsWith('/')) {
    const p = parseInt(trimmed.slice(1), 10);
    return !isNaN(p) ? { prefix: p } : { subnet_mask: trimmed };
  }
  if (/^\d{1,2}$/.test(trimmed)) {
    const p = parseInt(trimmed, 10);
    return { prefix: p };
  }
  return { subnet_mask: trimmed };
}

export const TabelIp: React.FC = () => {
  const [devices, setDevices] = useState<DeviceFormRow[]>(CONTOH_G_JAR_09);
  const [loading, setLoading] = useState<boolean>(false);
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [hasil, setHasil] = useState<StrukturJawaban | null>(null);

  // Tambah baris perangkat baru
  const handleAddDevice = () => {
    if (devices.length >= 50) return;
    const nextIdx = devices.length;
    const newDevice: DeviceFormRow = {
      id: `row-${Date.now()}-${nextIdx}`,
      nama: `PC${nextIdx}`,
      mode: 'static',
      ip: `192.168.1.${nextIdx + 1}`,
      maskOrPrefix: '255.255.255.0',
      gateway: '-',
      dns: '192.168.1.1',
    };
    setDevices((prev) => [...prev, newDevice]);
  };

  // Hapus satu baris perangkat
  const handleRemoveDevice = (id: string) => {
    if (devices.length <= 1) return;
    setDevices((prev) => prev.filter((d) => d.id !== id));
  };

  // Ubah nilai field tertentu
  const handleUpdateDevice = (
    id: string,
    field: keyof DeviceFormRow,
    value: string
  ) => {
    setDevices((prev) =>
      prev.map((d) => (d.id === id ? { ...d, [field]: value } : d))
    );
  };

  // Ubah mode Static/DHCP
  const handleToggleMode = (id: string, mode: 'static' | 'dhcp') => {
    setDevices((prev) =>
      prev.map((d) => (d.id === id ? { ...d, mode } : d))
    );
  };

  // Muat contoh emas G-JAR-09
  const handleLoadContoh = () => {
    setDevices(CONTOH_G_JAR_09);
    setGeneralError(null);
  };

  // Submit form ke API
  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setGeneralError(null);

    if (devices.length === 0) {
      setGeneralError('Minimal harus ada 1 perangkat dalam tabel.');
      return;
    }

    if (devices.length > 50) {
      setGeneralError('Jumlah perangkat melebihi batas 50.');
      return;
    }

    // Susun payload untuk backend
    const perangkatPayload = devices.map((d) => {
      const { prefix, subnet_mask } = parseMaskOrPrefix(d.maskOrPrefix);
      return {
        nama: d.nama.trim(),
        mode: d.mode,
        ip: d.mode === 'static' ? d.ip.trim() : null,
        prefix: d.mode === 'static' ? (prefix ?? null) : null,
        subnet_mask: d.mode === 'static' ? (subnet_mask ?? null) : null,
        gateway: d.gateway.trim() !== '' ? d.gateway.trim() : '-',
        dns: d.dns.trim() !== '' ? d.dns.trim() : '-',
      };
    });

    setLoading(true);
    try {
      const response = await api.hitungTabelIp({ perangkat: perangkatPayload });
      setHasil(response);
    } catch (err) {
      if (err instanceof ApiException) {
        setGeneralError(err.message);
      } else {
        setGeneralError((err as Error).message || 'Terjadi kesalahan pada server.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 w-full max-w-[1240px] mx-auto">
      {/* Header Band */}
      <div className="rounded-[28px] border-2 border-[#1F1E22] bg-[#FCE76C] p-6 sm:p-8 shadow-[4px_4px_0px_#1F1E22]">
        <h1 className="font-sans text-[28px] sm:text-[38px] font-extrabold text-[#1F1E22] leading-tight tracking-tight">
          Tabel IP perangkat
        </h1>
        <p className="font-sans text-[15px] sm:text-[16px] text-[#1F1E22] font-medium mt-2">
          Rekap alamat IP, subnet mask, default gateway, dan DNS perangkat ke dalam tabel siap salin dan cetak.
        </p>
      </div>

      {/* Grid 2 Kolom: Formulir (5/12) & Hasil (7/12) */}
      <div className="grid grid-cols-12 gap-6 items-start">
        {/* KOLOM KIRI (5/12, Sticky Desktop) */}
        <div className="col-span-12 lg:col-span-5 space-y-4 lg:sticky lg:top-20">
          <form
            onSubmit={handleSubmit}
            className="bg-[#FFFFFF] rounded-[20px] border-2 border-[#1F1E22] p-5 sm:p-6 shadow-[4px_4px_0px_#1F1E22] space-y-5"
          >
            {/* Header Formulir & Tombol Tambah */}
            <div className="flex items-center justify-between pb-3 border-b-2 border-[#E3E5EA]">
              <div>
                <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-[#5B5F6B]">
                  Konfigurasi Node
                </span>
                <h2 className="font-sans text-[18px] font-bold text-[#1F1E22]">
                  Kelola Baris Perangkat
                </h2>
              </div>
              <button
                type="button"
                onClick={handleAddDevice}
                disabled={devices.length >= 50}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-[10px] bg-[#FFFFFF] hover:bg-[#F5F6F8] text-[#1F1E22] border-2 border-[#1F1E22] text-[13px] font-bold font-sans shadow-[2px_2px_0px_#1F1E22] active:translate-y-0.5 transition-all disabled:opacity-50 cursor-pointer"
              >
                <Plus size={16} />
                <span>Tambah perangkat</span>
              </button>
            </div>

            {/* General Error Banner bila ada */}
            {generalError && (
              <div className="p-3 bg-[#FCE8E6] border-2 border-[#B3261E] rounded-[12px] flex items-start gap-2.5 text-[#B3261E]">
                <AlertTriangle size={18} className="shrink-0 mt-0.5" />
                <p className="font-sans text-[13px] font-semibold leading-snug">
                  {generalError}
                </p>
              </div>
            )}

            {/* Daftar Kartu Baris Perangkat */}
            <div className="space-y-3.5 max-h-[580px] overflow-y-auto pr-1">
              {devices.map((device, idx) => {
                const isStatic = device.mode === 'static';
                return (
                  <div
                    key={device.id}
                    className="relative rounded-[16px] border-2 border-[#1F1E22] p-4 bg-[#F9F8F6] shadow-[2px_2px_0px_#1F1E22] space-y-3 transition-all"
                  >
                    {/* Header Baris Perangkat */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-2 py-0.5 rounded-[6px] text-[11px] font-sans font-extrabold border ${
                            device.nama.toLowerCase().includes('server')
                              ? 'bg-[#8BD0FC] text-[#1F1E22] border-[#1F1E22]'
                              : 'bg-[#FCE76C] text-[#1F1E22] border-[#1F1E22]'
                          }`}
                        >
                          {device.nama.toLowerCase().includes('server')
                            ? 'SERVER'
                            : 'NODE'}
                        </span>
                        <span className="font-sans text-[14px] font-bold text-[#1F1E22]">
                          Perangkat #{idx + 1}
                        </span>
                      </div>

                      {devices.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveDevice(device.id)}
                          className="text-[#5B5F6B] hover:text-[#B3261E] p-1 rounded transition-colors cursor-pointer"
                          title="Hapus Perangkat"
                          aria-label={`Hapus ${device.nama}`}
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>

                    {/* Input Nama & Toggle Mode */}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block font-sans text-[12px] font-bold text-[#1F1E22] mb-1">
                          Nama perangkat
                        </label>
                        <input
                          type="text"
                          value={device.nama}
                          maxLength={30}
                          onChange={(e) =>
                            handleUpdateDevice(device.id, 'nama', e.target.value)
                          }
                          className="w-full px-3 py-1.5 rounded-[8px] border-2 border-[#1F1E22] font-sans text-[13px] text-[#1F1E22] bg-[#FFFFFF] focus:outline-none focus:ring-2 focus:ring-[#1F1E22]"
                          placeholder="mis. Server, PC0"
                          required
                        />
                      </div>

                      <div>
                        <label className="block font-sans text-[12px] font-bold text-[#1F1E22] mb-1">
                          Mode pengalamatan
                        </label>
                        <div className="grid grid-cols-2 p-0.5 rounded-[8px] border-2 border-[#1F1E22] bg-[#FFFFFF] font-sans text-[12px] font-bold">
                          <button
                            type="button"
                            onClick={() => handleToggleMode(device.id, 'static')}
                            className={`py-1 rounded text-center transition-all cursor-pointer ${
                              isStatic
                                ? 'bg-[#1F1E22] text-[#FFFFFF]'
                                : 'text-[#5B5F6B] hover:text-[#1F1E22]'
                            }`}
                          >
                            Static
                          </button>
                          <button
                            type="button"
                            onClick={() => handleToggleMode(device.id, 'dhcp')}
                            className={`py-1 rounded text-center transition-all cursor-pointer ${
                              !isStatic
                                ? 'bg-[#1F1E22] text-[#FFFFFF]'
                                : 'text-[#5B5F6B] hover:text-[#1F1E22]'
                            }`}
                          >
                            DHCP
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Parameter Jaringan */}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block font-sans text-[12px] font-bold text-[#1F1E22] mb-1">
                          Alamat IP
                        </label>
                        <input
                          type="text"
                          disabled={!isStatic}
                          value={isStatic ? device.ip : 'Otomatis (DHCP)'}
                          onChange={(e) =>
                            handleUpdateDevice(device.id, 'ip', e.target.value)
                          }
                          className={`w-full px-3 py-1.5 rounded-[8px] border-2 border-[#1F1E22] font-mono text-[13px] ${
                            isStatic
                              ? 'bg-[#FFFFFF] text-[#1F1E22] focus:outline-none focus:ring-2 focus:ring-[#1F1E22]'
                              : 'bg-[#E3E5EA] text-[#5B5F6B] cursor-not-allowed select-none'
                          }`}
                          placeholder="192.168.1.1"
                          required={isStatic}
                        />
                      </div>

                      <div>
                        <label className="block font-sans text-[12px] font-bold text-[#1F1E22] mb-1">
                          Subnet mask / Prefix
                        </label>
                        <input
                          type="text"
                          disabled={!isStatic}
                          value={isStatic ? device.maskOrPrefix : 'Otomatis (DHCP)'}
                          onChange={(e) =>
                            handleUpdateDevice(
                              device.id,
                              'maskOrPrefix',
                              e.target.value
                            )
                          }
                          className={`w-full px-3 py-1.5 rounded-[8px] border-2 border-[#1F1E22] font-mono text-[13px] ${
                            isStatic
                              ? 'bg-[#FFFFFF] text-[#1F1E22] focus:outline-none focus:ring-2 focus:ring-[#1F1E22]'
                              : 'bg-[#E3E5EA] text-[#5B5F6B] cursor-not-allowed select-none'
                          }`}
                          placeholder="255.255.255.0 / /24"
                          required={isStatic}
                        />
                      </div>

                      <div>
                        <label className="block font-sans text-[12px] font-bold text-[#1F1E22] mb-1">
                          Default gateway (opsional)
                        </label>
                        <input
                          type="text"
                          disabled={!isStatic}
                          value={isStatic ? device.gateway : 'Otomatis (DHCP)'}
                          onChange={(e) =>
                            handleUpdateDevice(device.id, 'gateway', e.target.value)
                          }
                          className={`w-full px-3 py-1.5 rounded-[8px] border-2 border-[#1F1E22] font-mono text-[13px] ${
                            isStatic
                              ? 'bg-[#FFFFFF] text-[#1F1E22] focus:outline-none focus:ring-2 focus:ring-[#1F1E22]'
                              : 'bg-[#E3E5EA] text-[#5B5F6B] cursor-not-allowed select-none'
                          }`}
                          placeholder="-"
                        />
                      </div>

                      <div>
                        <label className="block font-sans text-[12px] font-bold text-[#1F1E22] mb-1">
                          DNS server (opsional)
                        </label>
                        <input
                          type="text"
                          disabled={!isStatic}
                          value={isStatic ? device.dns : 'Otomatis (DHCP)'}
                          onChange={(e) =>
                            handleUpdateDevice(device.id, 'dns', e.target.value)
                          }
                          className={`w-full px-3 py-1.5 rounded-[8px] border-2 border-[#1F1E22] font-mono text-[13px] ${
                            isStatic
                              ? 'bg-[#FFFFFF] text-[#1F1E22] focus:outline-none focus:ring-2 focus:ring-[#1F1E22]'
                              : 'bg-[#E3E5EA] text-[#5B5F6B] cursor-not-allowed select-none'
                          }`}
                          placeholder="-"
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Tombol Aksi Formulir */}
            <div className="space-y-2.5 pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full h-12 bg-[#FCE76C] hover:bg-[#F2D640] text-[#1F1E22] border-2 border-[#1F1E22] rounded-[12px] font-sans font-extrabold text-[15px] flex items-center justify-center gap-2 shadow-[3px_3px_0px_#1F1E22] active:translate-x-0.5 active:translate-y-0.5 transition-all disabled:opacity-50 cursor-pointer"
              >
                {loading ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    <span>Menghitung...</span>
                  </>
                ) : (
                  <>
                    <RotateCw size={18} />
                    <span>Buat tabel IP</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleLoadContoh}
                className="w-full py-2.5 bg-[#FFFFFF] hover:bg-[#F5F6F8] text-[#1F1E22] border-2 border-[#1F1E22] rounded-[12px] font-sans font-bold text-[14px] flex items-center justify-center gap-2 shadow-[2px_2px_0px_#1F1E22] active:translate-x-0.5 active:translate-y-0.5 transition-all cursor-pointer"
              >
                <Sparkles size={16} />
                <span>Isi contoh (Modul 4)</span>
              </button>
            </div>
          </form>
        </div>

        {/* KOLOM KANAN (7/12, Area Hasil Terstruktur Sesuai DESIGN.md & PRD.md) */}
        <div className="col-span-12 lg:col-span-7 space-y-6">
          {hasil ? (
            <>
              {/* 1. Banner Peringatan (bila ada) */}
              {hasil.peringatan && hasil.peringatan.length > 0 && (
                <div className="space-y-3">
                  {hasil.peringatan.map((warn, i) => (
                    <Banner
                      key={i}
                      variant="warning"
                      pesan={warn}
                    />
                  ))}
                </div>
              )}

              {/* 2. Ringkasan Hasil */}
              <div className="relative">
                <div className="absolute inset-0 bg-[#8BD0FC] rounded-[20px] translate-x-1.5 translate-y-1.5 border-2 border-[#1F1E22]" />
                <div className="relative bg-[#FFFFFF] rounded-[20px] border-2 border-[#1F1E22] p-5">
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-[10px] bg-[#FCE76C] border-2 border-[#1F1E22] flex items-center justify-center shrink-0">
                        <HardDrive size={20} className="text-[#1F1E22]" />
                      </div>
                      <div>
                        <span className="block text-[11px] font-mono font-bold text-[#5B5F6B] uppercase">
                          PERANGKAT
                        </span>
                        <span className="font-mono font-bold text-[16px] text-[#1F1E22]">
                          {hasil.hasil_akhir.ringkasan?.total_perangkat ?? hasil.hasil_akhir.tabel?.length ?? 0} Node Terdaftar
                        </span>
                        <span className="block text-[12px] text-[#5B5F6B] font-sans font-medium">
                          ({hasil.hasil_akhir.ringkasan?.total_static ?? 0} Static, {hasil.hasil_akhir.ringkasan?.total_dhcp ?? 0} DHCP)
                        </span>
                      </div>
                    </div>

                    <div className="h-10 w-0.5 bg-[#E3E5EA] hidden sm:block" />

                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-[10px] bg-[#E3F4EA] border-2 border-[#1F1E22] flex items-center justify-center shrink-0">
                        <Network size={20} className="text-[#16794C]" />
                      </div>
                      <div>
                        <span className="block text-[11px] font-mono font-bold text-[#5B5F6B] uppercase">
                          SUBNET AKTIF
                        </span>
                        <span className="font-mono font-bold text-[16px] text-[#1F1E22]">
                          {hasil.hasil_akhir.ringkasan?.segmen_jaringan?.length ?? 0} Segmen
                        </span>
                        <span className="block text-[12px] text-[#5B5F6B] font-mono">
                          {hasil.hasil_akhir.ringkasan?.segmen_jaringan?.join(', ') || '-'}
                        </span>
                      </div>
                    </div>

                    <div className="h-10 w-0.5 bg-[#E3E5EA] hidden sm:block" />

                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-[10px] bg-[#FFE6DA] border-2 border-[#1F1E22] flex items-center justify-center shrink-0">
                        <Layers size={20} className="text-[#1F1E22]" />
                      </div>
                      <div>
                        <span className="block text-[11px] font-mono font-bold text-[#5B5F6B] uppercase">
                          GATEWAY / DNS
                        </span>
                        <span className="font-mono font-bold text-[15px] text-[#1F1E22]">
                          {hasil.hasil_akhir.ringkasan?.daftar_gateway?.join(', ') || '-'}
                        </span>
                        <span className="block text-[12px] text-[#5B5F6B] font-mono">
                          DNS: {hasil.hasil_akhir.ringkasan?.daftar_dns?.join(', ') || '-'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* 3. Diketahui */}
              <div className="bg-[#FFFFFF] border-2 border-[#1F1E22] rounded-[20px] p-5 shadow-xs">
                <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-[#5B5F6B]">
                  Parameter Awal
                </span>
                <h3 className="font-sans text-[17px] font-bold text-[#1F1E22] mb-3">
                  Diketahui
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {hasil.diketahui.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-3 bg-[#F9F8F6] rounded-[10px] border border-[#1F1E22]/15"
                    >
                      <span className="block text-[12px] font-sans font-bold text-[#5B5F6B]">
                        {item.label}
                      </span>
                      <span className="font-mono text-[14px] font-bold text-[#1F1E22]">
                        {item.nilai}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* 4. Kartu Langkah 1..N (StepCard) */}
              <div className="space-y-4">
                {hasil.langkah.map((step, idx) => (
                  <StepCard
                    key={idx}
                    nomor={idx + 1}
                    langkah={step}
                  />
                ))}
              </div>

              {/* 5. Tabel Hasil Akhir (ResultTable) */}
              <ResultTable
                tabel={hasil.hasil_akhir.tabel || []}
                mode="tabel_ip"
                judul="Format Lembar Kerja Praktikum"
              />

              {/* 6. Kesimpulan (ConclusionBlock) */}
              <ConclusionBlock kesimpulan={hasil.kesimpulan} />
            </>
          ) : (
            /* State Awal / Kosong Sebelum Tombol Ditekan */
            <div className="bg-[#FFFFFF] border-2 border-[#1F1E22] rounded-[20px] p-8 shadow-[4px_4px_0px_#1F1E22] text-center space-y-4">
              <div className="w-16 h-16 bg-[#FCE76C] border-2 border-[#1F1E22] rounded-full flex items-center justify-center mx-auto shadow-sm">
                <Laptop size={32} className="text-[#1F1E22]" />
              </div>
              <div className="max-w-md mx-auto space-y-2">
                <h3 className="font-sans text-[20px] font-bold text-[#1F1E22]">
                  Belum ada tabel yang dibuat
                </h3>
                <p className="font-sans text-[14px] text-[#5B5F6B] leading-relaxed">
                  Tambahkan atau sesuaikan daftar perangkat di formulir sebelah kiri, lalu klik tombol{' '}
                  <strong className="text-[#1F1E22]">Buat tabel IP</strong> untuk menyusun tabel rekapitulasi konfigurasi praktikum.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
