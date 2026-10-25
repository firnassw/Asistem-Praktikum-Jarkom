import React, { useState } from 'react';
import type { SubnetTableRow, VlsmTableRow } from '../types/api';
import { getSubnetColor } from './AddressBar';
import { Copy, Check, Printer } from 'lucide-react';

interface ResultTableProps {
  tabel: (SubnetTableRow | VlsmTableRow | any)[] | any[];
  targetIp?: string;
  prefix?: number;
  totalSubnets?: number;
  ringkasanTabel?: boolean;
  judul?: string;
  mode?: 'subnet' | 'vlsm_flsm' | 'rencana' | 'konversi' | 'tabel_ip';
  showGateway?: boolean;
}

export const ResultTable: React.FC<ResultTableProps> = ({
  tabel,
  targetIp,
  prefix,
  totalSubnets,
  ringkasanTabel = false,
  judul,
  mode,
  showGateway,
}) => {
  const [copied, setCopied] = useState(false);

  // Deteksi otomatis tipe tabel
  const isTabelIp =
    mode === 'tabel_ip' ||
    (tabel.length > 0 && ('subnet_mask' in tabel[0] && 'mode' in tabel[0] && 'dns' in tabel[0]));
  const isKonversi =
    !isTabelIp &&
    (mode === 'konversi' ||
      (tabel.length > 0 && ('basis' in tabel[0] || 'notasi' in tabel[0])));
  const isRencana =
    !isTabelIp &&
    !isKonversi &&
    (mode === 'rencana' ||
      (tabel.length > 0 && ('device' in tabel[0] || 'host_dibutuhkan' in tabel[0])));
  const isVlsmFlsm =
    !isTabelIp &&
    !isKonversi &&
    (isRencana ||
      mode === 'vlsm_flsm' ||
      (tabel.length > 0 && ('host_diminta' in tabel[0] || 'nama' in tabel[0])));
  const hasGateway =
    showGateway ??
    tabel.some((r) => r.usulan_gateway != null && r.usulan_gateway !== '' && r.usulan_gateway !== '-');


  const handleCopyTable = () => {
    let textToCopy = '';

    if (isTabelIp) {
      const header = ['No', 'Nama Perangkat', 'Mode', 'Alamat IP', 'Subnet Mask', 'Prefix', 'Default Gateway', 'DNS Server'].join('\t');
      const rows = tabel.map((r: any) =>
        [r.no, r.nama, r.mode, r.ip, r.subnet_mask, r.prefix, r.gateway, r.dns].join('\t')
      );
      textToCopy = [header, ...rows].join('\n');
    } else if (isKonversi) {
      const header = ['No', 'Basis Bilangan', 'Notasi Basis', 'Nilai Representasi', 'Keterangan'].join('\t');
      const rows = tabel.map((r: any) =>
        [r.no, r.basis, r.notasi, r.nilai, r.keterangan].join('\t')
      );
      textToCopy = [header, ...rows].join('\n');
    } else if (isRencana) {
      const headerCols = [
        'No',
        'Ruangan',
        'Device',
        'Host Dibutuhkan',
        'Host Tersedia',
        'Prefix',
        'Subnet Mask',
        'Subnet (NA)',
        'Host Pertama',
        'Host Terakhir',
      ];
      if (hasGateway) {
        headerCols.push('Usulan Gateway');
      }
      headerCols.push('Broadcast (BA)', 'Status');
      const header = headerCols.join('\t');

      const rows = tabel.map((r: any) => {
        const rowCols = [
          r.no,
          r.nama,
          r.device ?? '-',
          r.host_dibutuhkan ?? r.host_diminta ?? '-',
          r.host_tersedia ?? '-',
          `/${r.prefix}`,
          r.subnet_mask,
          r.subnet,
          r.host_pertama,
          r.host_terakhir,
        ];
        if (hasGateway) {
          rowCols.push(r.usulan_gateway || '-');
        }
        rowCols.push(r.broadcast, r.status);
        return rowCols.join('\t');
      });
      textToCopy = [header, ...rows].join('\n');
    } else if (isVlsmFlsm) {
      const header = [
        'No',
        'Ruangan',
        'Host Diminta',
        'Host Tersedia',
        'Prefix',
        'Subnet Mask',
        'Subnet (NA)',
        'Host Pertama',
        'Host Terakhir',
        'Broadcast (BA)',
        'Status',
      ].join('\t');
      const rows = (tabel as VlsmTableRow[]).map((r) =>
        [
          r.no,
          r.nama,
          r.host_diminta,
          r.host_tersedia,
          `/${r.prefix}`,
          r.subnet_mask,
          r.subnet,
          r.host_pertama,
          r.host_terakhir,
          r.broadcast,
          r.status,
        ].join('\t')
      );
      textToCopy = [header, ...rows].join('\n');
    } else {
      const header = ['No', 'Subnet (NA)', 'Host Awal', 'Host Akhir', 'Broadcast (BA)'].join('\t');
      const rows = (tabel as SubnetTableRow[]).map((r) =>
        [r.no, r.subnet, r.host_pertama, r.host_terakhir, r.broadcast].join('\t')
      );
      textToCopy = [header, ...rows].join('\n');
    }

    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  const displayJudul =
    judul ||
    (isTabelIp
      ? 'Tabel Konfigurasi IP Perangkat'
      : isKonversi
      ? 'Tabel Ringkasan Hasil Konversi'
      : isVlsmFlsm
      ? `Tabel Alokasi Subnet`
      : `Tabel Alokasi Seluruh Subnet ${prefix ? `(CIDR /${prefix})` : ''}`);

  return (
    <section className="bg-[#FFFFFF] border-2 border-[#1F1E22] rounded-[20px] p-6 shadow-sm flex flex-col gap-4 w-full">
      {/* Header Tabel & Tombol Aksi */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1 border-b border-[#E3E5EA]">
        <div>
          <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-[#5B5F6B]">
            {isTabelIp ? 'Format Lembar Kerja' : isKonversi ? 'Representasi Basis' : isVlsmFlsm ? 'Alokasi Subnet' : 'Distribusi Lengkap'}
          </span>
          <h3 className="font-title text-[18px] font-bold text-[#1F1E22]">
            {displayJudul}
          </h3>
        </div>

        <div className="flex items-center gap-2 btn-print-hide">
          <button
            onClick={handleCopyTable}
            type="button"
            className="px-3.5 py-2 bg-[#FFFFFF] hover:bg-[#F5F6F8] text-[#1F1E22] text-[12px] font-bold font-sans rounded-[8px] border-2 border-[#1F1E22] flex items-center gap-1.5 transition-colors active:translate-y-0.5 cursor-pointer shadow-xs"
          >
            {copied ? <Check size={15} className="text-[#16794C]" /> : <Copy size={15} />}
            <span>{copied ? 'Tersalin' : 'Salin tabel'}</span>
          </button>
          <button
            onClick={handlePrint}
            type="button"
            className="px-3.5 py-2 bg-[#FFFFFF] hover:bg-[#F5F6F8] text-[#1F1E22] text-[12px] font-bold font-sans rounded-[8px] border-2 border-[#1F1E22] flex items-center gap-1.5 transition-colors active:translate-y-0.5 cursor-pointer shadow-xs"
          >
            <Printer size={15} />
            <span>Cetak</span>
          </button>
        </div>
      </div>

      {/* Wadah Tabel yang Menggulir di Wadahnya Sendiri (overflow-x-auto) */}
      <div className="w-full overflow-x-auto rounded-[12px] border border-[#1F1E22]/15">
        {isTabelIp ? (
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="bg-[#1F1E22] text-[#FFFFFF] font-sans text-[12px] font-bold uppercase tracking-wider select-none">
                <th className="py-3 px-3.5 text-center w-12" scope="col">No</th>
                <th className="py-3 px-3.5" scope="col">Nama Perangkat</th>
                <th className="py-3 px-3.5 text-center w-24" scope="col">Mode</th>
                <th className="py-3 px-3.5" scope="col">Alamat IP</th>
                <th className="py-3 px-3.5" scope="col">Subnet Mask</th>
                <th className="py-3 px-3.5 text-center w-20" scope="col">Prefix</th>
                <th className="py-3 px-3.5" scope="col">Default Gateway</th>
                <th className="py-3 px-3.5" scope="col">DNS Server</th>
              </tr>
            </thead>
            <tbody className="font-mono text-[12px] sm:text-[13px] divide-y divide-[#E3E5EA]">
              {tabel.map((row: any, idx: number) => {
                const isStatic = row.mode?.toLowerCase() === 'static';
                return (
                  <tr key={idx} className="hover:bg-[#F9F8F6] transition-colors">
                    <td className="py-3 px-3.5 text-center text-[#5B5F6B] font-bold">{row.no}</td>
                    <td className="py-3 px-3.5 font-bold font-sans text-[#1F1E22]">
                      <div className="flex items-center gap-2">
                        <span className={`w-2.5 h-2.5 rounded-full border border-[#1F1E22]/30 ${isStatic ? 'bg-[#8BD0FC]' : 'bg-[#FCE76C]'}`} />
                        <span>{row.nama}</span>
                      </div>
                    </td>
                    <td className="py-3 px-3.5 text-center">
                      <span className={`inline-block px-2 py-0.5 rounded text-[11px] font-sans font-bold border ${
                        isStatic
                          ? 'bg-[#E3F4FE] text-[#1F1E22] border-[#8BD0FC]'
                          : 'bg-[#FFF8D1] text-[#1F1E22] border-[#FCE76C]'
                      }`}>
                        {row.mode}
                      </span>
                    </td>
                    <td className="py-3 px-3.5 font-bold text-[#1F1E22]">{row.ip}</td>
                    <td className="py-3 px-3.5 text-[#5B5F6B]">{row.subnet_mask}</td>
                    <td className="py-3 px-3.5 text-center font-bold text-[#1F1E22]">{row.prefix}</td>
                    <td className="py-3 px-3.5 text-[#5B5F6B]">{row.gateway}</td>
                    <td className="py-3 px-3.5 text-[#5B5F6B]">{row.dns}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        ) : isKonversi ? (
          <table className="w-full text-left border-collapse min-w-[540px]">
            <thead>
              <tr className="bg-[#1F1E22] text-[#FFFFFF] font-mono text-[11px] uppercase tracking-wider select-none">
                <th className="py-3 px-3.5 text-center w-14">No</th>
                <th className="py-3 px-3.5">Basis Bilangan</th>
                <th className="py-3 px-3 text-center">Notasi</th>
                <th className="py-3 px-3.5">Nilai Representasi</th>
                <th className="py-3 px-3.5">Keterangan</th>
              </tr>
            </thead>
            <tbody className="font-mono text-[12px] sm:text-[13px] divide-y divide-[#E3E5EA]">
              {tabel.map((row: any, idx: number) => (
                <tr key={idx} className="hover:bg-[#F5F6F8] transition-colors">
                  <td className="py-3 px-3.5 text-center text-[#5B5F6B] font-bold">#{row.no}</td>
                  <td className="py-3 px-3.5 font-bold font-sans text-[#1F1E22]">{row.basis}</td>
                  <td className="py-3 px-3 text-center">
                    <span className="px-2 py-0.5 bg-[#FFF8D1] border border-[#FCE76C] text-[#1F1E22] rounded font-bold text-xs">
                      Base {row.notasi}
                    </span>
                  </td>
                  <td className="py-3 px-3.5 font-black text-[14px] text-[#1F1E22]">{row.nilai}</td>
                  <td className="py-3 px-3.5 text-[12px] text-[#5B5F6B] font-sans">{row.keterangan}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : isVlsmFlsm ? (

          <table className="w-full text-left border-collapse min-w-[760px]">
            <thead>
              <tr className="bg-[#1F1E22] text-[#FFFFFF] font-mono text-[11px] uppercase tracking-wider select-none">
                <th className="py-3 px-3.5">Ruangan</th>
                {isRencana && <th className="py-3 px-3 text-right">Device</th>}
                <th className="py-3 px-3 text-right">
                  {isRencana ? 'Host Butuh' : 'Host Diminta'}
                </th>
                <th className="py-3 px-3 text-right">
                  {isRencana ? 'Host Ada' : 'Host Tersedia'}
                </th>
                <th className="py-3 px-3.5">Prefix / Mask</th>
                <th className="py-3 px-3.5">Subnet (NA)</th>
                <th className="py-3 px-3.5">Host Pertama</th>
                <th className="py-3 px-3.5">Host Terakhir</th>
                {isRencana && hasGateway && (
                  <th className="py-3 px-3.5 text-[#FCE76C]">Usulan Gateway</th>
                )}
                <th className="py-3 px-3.5">Broadcast (BA)</th>
                <th className="py-3 px-3.5 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="font-mono text-[12px] sm:text-[13px] divide-y divide-[#E3E5EA]">
              {tabel.map((row: any, idx: number) => {
                const color = row.warna || getSubnetColor(idx);
                const isTidakMuat = row.status === 'Tidak muat';
                const isCadangan = row.status === 'Cadangan';

                return (
                  <tr
                    key={row.no || idx}
                    className={`transition-colors ${
                      isTidakMuat
                        ? 'bg-[#FCE8E6]/40 text-[#1F1E22]'
                        : isCadangan
                        ? 'bg-[#F5F6F8]/60 text-[#5B5F6B]'
                        : 'hover:bg-[#F5F6F8]/80 text-[#1F1E22]'
                    }`}
                  >
                    <td className="py-2.5 px-3.5 font-sans">
                      <div className="flex items-center gap-2">
                        <span
                          style={{ backgroundColor: color }}
                          className="w-2.5 h-2.5 rounded-full border border-[#1F1E22]/30 shrink-0"
                        />
                        <span className="font-bold text-[#1F1E22]">{row.nama}</span>
                      </div>
                    </td>
                    {isRencana && (
                      <td className="py-2.5 px-3 text-right font-medium">
                        {isCadangan ? '-' : (row.device ?? '-')}
                      </td>
                    )}
                    <td className="py-2.5 px-3 text-right">
                      {isCadangan ? '-' : (row.host_dibutuhkan ?? row.host_diminta ?? '-')}
                    </td>
                    <td className="py-2.5 px-3 text-right font-medium">
                      {isTidakMuat ? '-' : row.host_tersedia}
                    </td>
                    <td className="py-2.5 px-3.5">
                      <div className="flex flex-col">
                        <span className="font-bold text-[#1F1E22]">/{row.prefix}</span>
                        <span className="text-[10px] text-[#5B5F6B]">{row.subnet_mask}</span>
                      </div>
                    </td>
                    <td className="py-2.5 px-3.5 font-bold text-[#16794C]">
                      {row.subnet}
                    </td>
                    <td className="py-2.5 px-3.5">{row.host_pertama}</td>
                    <td className="py-2.5 px-3.5">{row.host_terakhir}</td>
                    {isRencana && hasGateway && (
                      <td className="py-2.5 px-3.5 font-bold text-[#1F1E22] bg-[#FFF8D1]/50">
                        {row.usulan_gateway || '-'}
                      </td>
                    )}
                    <td className="py-2.5 px-3.5 font-bold text-[#B3261E]">
                      {row.broadcast}
                    </td>
                    <td className="py-2.5 px-3.5 text-center">
                      {row.status === 'Terpakai' && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-[6px] text-[11px] font-sans font-extrabold bg-[#E3F4EA] text-[#16794C] border border-[#16794C]/30">
                          Terpakai
                        </span>
                      )}
                      {row.status === 'Cadangan' && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-[6px] text-[11px] font-sans font-bold bg-[#D6D9E2] text-[#1F1E22] border border-[#1F1E22]/20">
                          Cadangan
                        </span>
                      )}
                      {row.status === 'Tidak muat' && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-[6px] text-[11px] font-sans font-bold bg-[#FCE8E6] text-[#B3261E] border border-[#B3261E]/30">
                          Tidak muat
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        ) : (
          <table className="w-full text-left border-collapse min-w-[640px]">
            <thead>
              <tr className="bg-[#1F1E22] text-[#FFFFFF] font-mono text-[11px] uppercase tracking-wider select-none">
                <th className="py-3 px-3.5 w-24">Subnet</th>
                <th className="py-3 px-3.5">Network (NA)</th>
                <th className="py-3 px-3.5">Host Awal</th>
                <th className="py-3 px-3.5">Host Akhir</th>
                <th className="py-3 px-3.5">Broadcast (BA)</th>
                <th className="py-3 px-3.5 text-center w-36">Status</th>
              </tr>
            </thead>
            <tbody className="font-mono text-[12px] sm:text-[13px] divide-y divide-[#E3E5EA]">
              {(tabel as SubnetTableRow[]).map((row, idx) => {
                const color = getSubnetColor(idx);
                const isTarget = row.aktif;

                return (
                  <tr
                    key={row.no}
                    className={`transition-colors ${
                      isTarget
                        ? 'bg-[#FFF8D1] font-bold text-[#1F1E22]'
                        : 'hover:bg-[#F5F6F8]/80 text-[#1F1E22]'
                    }`}
                  >
                    <td className="py-2.5 px-3.5">
                      <div className="flex items-center gap-2">
                        <span
                          style={{ backgroundColor: color }}
                          className="w-2.5 h-2.5 rounded-full border border-[#1F1E22]/30 shrink-0"
                        />
                        <span className="font-sans font-bold">#{row.no}</span>
                      </div>
                    </td>
                    <td className="py-2.5 px-3.5 font-bold">{row.na}</td>
                    <td className="py-2.5 px-3.5">{row.host_pertama}</td>
                    <td className="py-2.5 px-3.5">{row.host_terakhir}</td>
                    <td className="py-2.5 px-3.5 font-bold">{row.broadcast}</td>
                    <td className="py-2.5 px-3.5 text-center">
                      {isTarget ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-[6px] text-[11px] font-sans font-extrabold bg-[#FCE76C] text-[#1F1E22] border border-[#1F1E22]/20 shadow-2xs">
                          ● Target {targetIp ? `(${targetIp})` : ''}
                        </span>
                      ) : (
                        <span className="text-[#8A8F9C]">-</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {ringkasanTabel && (
        <p className="text-[12px] text-[#5B5F6B] italic">
          * Menampilkan 256 subnet pertama dari total {totalSubnets} subnet sesuai batas tampilan praktikum.
        </p>
      )}
    </section>
  );
};
