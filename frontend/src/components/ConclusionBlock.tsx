import React, { useState } from 'react';
import { Check, Copy, CheckSquare } from 'lucide-react';

interface ConclusionBlockProps {
  kesimpulan: string;
}

export const ConclusionBlock: React.FC<ConclusionBlockProps> = ({ kesimpulan }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(kesimpulan);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section
      data-testid="conclusion-block"
      className="conclusion-block w-full bg-[#FCE76C] border-2 border-[#1F1E22] rounded-[20px] p-6 shadow-sm flex flex-col gap-3.5"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-[#1F1E22]">
          <CheckSquare size={20} className="shrink-0 text-[#1F1E22]" />
          <h3 className="font-sans font-extrabold text-[16px] text-[#1F1E22] uppercase tracking-wider">
            Kesimpulan
          </h3>
        </div>

        <button
          onClick={handleCopy}
          type="button"
          className="btn-print-hide px-3.5 py-1.5 bg-[#FFFFFF] hover:bg-[#F5F6F8] text-[#1F1E22] text-[12px] font-bold font-sans rounded-[8px] border-2 border-[#1F1E22] flex items-center gap-1.5 shadow-2xs active:translate-y-0.5 transition-all"
        >
          {copied ? <Check size={14} className="text-[#16794C]" /> : <Copy size={14} />}
          <span>{copied ? 'Tersalin' : 'Salin'}</span>
        </button>
      </div>

      <div className="bg-white/80 border border-[#1F1E22]/15 p-4 rounded-[14px]">
        <p className="font-sans text-[14px] sm:text-[15px] text-[#1F1E22] leading-relaxed font-medium">
          {kesimpulan}
        </p>
      </div>
    </section>
  );
};
