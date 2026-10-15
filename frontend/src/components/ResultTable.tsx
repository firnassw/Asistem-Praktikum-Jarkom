import React, { useState } from 'react';
import type { SubnetTableRow } from '../types/api';
import { getSubnetColor } from './AddressBar';
import { Copy, Check, Printer } from 'lucide-react';

interface ResultTableProps {
  tabel: SubnetTableRow[];
  targetIp?: string;
  prefix?: number;
  totalSubnets?: number;
  ringkasanTabel?: boolean;
}

export const ResultTable: React.FC<ResultTableProps> = ({
  tabel,
  targetIp,
  prefix,
  totalSubnets,
  ringkasanTabel = false,
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopyTable = () => {
    // Susun format teks tabel siap salin untuk laporan
    const header = ['No', 'Subnet (NA)', 'Host Awal', 'Host Akhir', 'Broadcast (BA)'].join('\t');
    const rows = tabel.map((r) =>
      [r.no, r.subnet, r.host_pertama, r.host_terakhir, r.broadcast].join('\t')
    );
    const textToCopy = [header, ...rows].join('\n');

    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <section className="bg-[#FFFFFF] border-2 border-[#1F1E22] rounded-[20px] p-6 shadow-sm flex flex-col gap-4 w-full">
      {/* Header Tabel & Tombol Aksi */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1 border-b border-[#E3E5EA]">
        <div>
          <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-[#5B5F6B]">
            Distribusi Lengkap
          </span>
          <h3 className="font-title text-[18px] font-bold text-[#1F1E22]">
            Tabel Alokasi Seluruh Subnet {prefix ? `(CIDR /${prefix})` : ''}
          </h3>
        </div>

        <div className="flex items-center gap-2 btn-print-hide">
          <button
            onClick={handleCopyTable}
            type="button"
            className="px-3.5 py-2 bg-[#F5F6F8] hover:bg-[#E3E5EA] text-[#1F1E22] text-[12px] font-bold font-sans rounded-[8px] border border-[#1F1E22]/20 flex items-center gap-1.5 transition-colors active:translate-y-0.5"
          >
            {copied ? <Check size={15} className="text-[#16794C]" /> : <Copy size={15} />}
            <span>{copied ? 'Tersalin' : 'Salin tabel'}</span>
          </button>
          <button
            onClick={handlePrint}
            type="button"
            className="px-3.5 py-2 bg-[#F5F6F8] hover:bg-[#E3E5EA] text-[#1F1E22] text-[12px] font-bold font-sans rounded-[8px] border border-[#1F1E22]/20 flex items-center gap-1.5 transition-colors active:translate-y-0.5"
          >
            <Printer size={15} />
            <span>Cetak</span>
          </button>
        </div>
      </div>

      {/* Wadah Tabel yang Menggulir di Wadahnya Sendiri (overflow-x-auto) */}
      <div className="w-full overflow-x-auto rounded-[12px] border border-[#1F1E22]/15">
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
            {tabel.map((row, idx) => {
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
      </div>

      {ringkasanTabel && (
        <p className="text-[12px] text-[#5B5F6B] italic">
          * Menampilkan 256 subnet pertama dari total {totalSubnets} subnet sesuai batas tampilan praktikum.
        </p>
      )}
    </section>
  );
};
