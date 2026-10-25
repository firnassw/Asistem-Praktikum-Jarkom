import React, { useState } from 'react';
import { Copy, Check, Printer, Terminal, Info } from 'lucide-react';
import type { CliBaris } from '../types/api';

interface CodeBlockProps {
  cliBaris: CliBaris[];
  cliScript?: string;
  judul?: string;
  catatan?: string;
  onPrint?: () => void;
}

export const CodeBlock: React.FC<CodeBlockProps> = ({
  cliBaris,
  cliScript,
  judul = 'Cisco IOS CLI Script (Router Config)',
  catatan = 'Catatan: mengikuti contoh Modul 3; belum diverifikasi di semua versi Packet Tracer atau IOS.',
  onPrint,
}) => {
  const [copied, setCopied] = useState(false);

  const plainScript = cliScript || cliBaris.map((b) => b.perintah).join('\n');

  const handleCopy = () => {
    navigator.clipboard.writeText(plainScript);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    if (onPrint) {
      onPrint();
    } else {
      window.print();
    }
  };

  // Helper pewarnaan kata kunci perintah CLI
  const getPerintahColorClass = (perintah: string) => {
    if (
      perintah === 'enable' ||
      perintah === 'configure terminal' ||
      perintah.startsWith('ip dhcp pool')
    ) {
      return 'text-[#FCE76C] font-bold';
    }
    if (perintah.startsWith('ip dhcp excluded-address')) {
      return 'text-[#8BD0FC] font-bold';
    }
    if (perintah === 'no shutdown' || perintah === 'exit') {
      return 'text-[#8BD0FC] font-semibold';
    }
    return 'text-white font-medium';
  };

  return (
    <section
      data-testid="code-block"
      className="bg-[#1F1E22] text-[#FFFFFF] rounded-[20px] border-2 border-[#1F1E22] p-5 sm:p-6 shadow-sm space-y-4 w-full"
    >
      {/* Terminal Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3.5 border-b border-white/20 gap-3">
        <div className="flex items-center gap-2.5">
          <Terminal size={20} className="text-[#FCE76C] shrink-0" />
          <h4 className="font-mono font-bold text-[14px] sm:text-[15px] text-white">
            {judul}
          </h4>
        </div>

        <div className="flex items-center gap-2 btn-print-hide">
          <button
            onClick={handleCopy}
            type="button"
            className="px-3.5 py-1.5 bg-[#2E2D33] hover:bg-white/20 text-white rounded-[8px] border border-white/30 text-[12px] font-bold font-sans flex items-center gap-1.5 transition-colors active:translate-y-0.5"
            title="Salin skrip CLI tanpa penjelasan"
          >
            {copied ? (
              <>
                <Check size={14} className="text-[#16794C]" />
                <span className="text-[#16794C]">Tersalin!</span>
              </>
            ) : (
              <>
                <Copy size={14} />
                <span>Salin</span>
              </>
            )}
          </button>

          <button
            onClick={handlePrint}
            type="button"
            className="px-3.5 py-1.5 bg-[#2E2D33] hover:bg-white/20 text-white rounded-[8px] border border-white/30 text-[12px] font-bold font-sans flex items-center gap-1.5 transition-colors active:translate-y-0.5"
            title="Cetak lembar konfigurasi"
          >
            <Printer size={14} />
            <span>Cetak</span>
          </button>
        </div>
      </div>

      {/* CLI Two-Columns Grid */}
      <div className="overflow-x-auto rounded-[10px]">
        <div className="min-w-[560px] font-mono text-[12px] sm:text-[13px]">
          {/* Header Kolom */}
          <div className="grid grid-cols-12 py-2.5 px-3 bg-[#2E2D33] rounded-t-[10px] font-sans text-[11px] sm:text-[12px] font-bold text-white/70 uppercase tracking-wider">
            <span className="col-span-6 sm:col-span-7">Perintah CLI Cisco IOS</span>
            <span className="col-span-6 sm:col-span-5 border-l border-white/20 pl-3">
              Penjelasan Bahasa Indonesia
            </span>
          </div>

          {/* Baris Perintah */}
          <div className="divide-y divide-white/10 bg-black/40 rounded-b-[10px] p-1">
            {cliBaris.map((baris, index) => (
              <div
                key={index}
                className="grid grid-cols-12 py-1.5 px-2.5 hover:bg-white/5 transition-colors"
              >
                <span className={`col-span-6 sm:col-span-7 ${getPerintahColorClass(baris.perintah)}`}>
                  {baris.perintah}
                </span>
                <span className="col-span-6 sm:col-span-5 border-l border-white/10 pl-3 text-[#A0A4B0] font-sans text-[12px] sm:text-[13px] leading-relaxed">
                  {baris.penjelasan}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Catatan Bawah */}
      <div className="pt-1 flex items-start sm:items-center gap-2 text-[12px] text-[#A0A4B0] font-sans leading-relaxed">
        <Info size={16} className="text-[#FCE76C] shrink-0 mt-0.5 sm:mt-0" />
        <span>{catatan}</span>
      </div>
    </section>
  );
};
