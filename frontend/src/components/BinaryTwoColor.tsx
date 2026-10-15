import React from 'react';

interface BinaryTwoColorProps {
  ipBiner: string;
  maskBiner: string;
  prefix: number;
  ipDesimal?: string;
  maskDesimal?: string;
}

/**
 * Memisahkan string biner bertitik (32 bit + 3 titik) menjadi bagian network dan host
 * berdasarkan prefix (0-32).
 */
export const splitBinaryByPrefix = (
  binStr: string,
  prefix: number
): { netPart: string; hostPart: string } => {
  let bitCount = 0;
  let splitIndex = binStr.length;

  for (let i = 0; i < binStr.length; i++) {
    if (binStr[i] !== '.') {
      bitCount++;
      if (bitCount === prefix) {
        splitIndex = i + 1;
        break;
      }
    }
  }

  if (prefix === 0) {
    return { netPart: '', hostPart: binStr };
  }
  if (prefix >= 32) {
    return { netPart: binStr, hostPart: '' };
  }

  return {
    netPart: binStr.slice(0, splitIndex),
    hostPart: binStr.slice(splitIndex),
  };
};

export const BinaryTwoColor: React.FC<BinaryTwoColorProps> = ({
  ipBiner,
  maskBiner,
  prefix,
  ipDesimal,
  maskDesimal,
}) => {
  const ipParts = splitBinaryByPrefix(ipBiner, prefix);
  const maskParts = splitBinaryByPrefix(maskBiner, prefix);

  const bitHost = 32 - prefix;

  return (
    <div className="w-full flex flex-col gap-3">
      {/* 1. Legenda Bit */}
      <div className="flex flex-wrap items-center gap-2 text-[12px] font-sans">
        <span className="px-2.5 py-1 rounded-[6px] bg-[#E3F4FE] border border-[#8BD0FC] text-[#1F1E22] font-bold flex items-center gap-1.5 shadow-2xs">
          <span className="w-2.5 h-2.5 rounded-[3px] bg-[#8BD0FC] border border-[#1F1E22]/30" />
          Bit Jaringan (Network: {prefix} bit)
        </span>
        <span className="px-2.5 py-1 rounded-[6px] bg-[#FFF8D1] border border-[#FCE76C] text-[#1F1E22] font-bold flex items-center gap-1.5 shadow-2xs">
          <span className="w-2.5 h-2.5 rounded-[3px] bg-[#FCE76C] border border-[#1F1E22]/30" />
          Bit Host (Host: {bitHost} bit)
        </span>
      </div>

      {/* 2. Kartu Biner Dua Warna */}
      <div className="p-4 bg-[#F5F6F8] border border-[#E3E5EA] rounded-[14px] font-mono text-[12px] sm:text-[13px] leading-relaxed overflow-x-auto space-y-2.5">
        {/* Baris IP */}
        <div className="flex items-center min-w-[500px]">
          <span className="w-28 font-bold text-[#5B5F6B] shrink-0">
            IP (Host) :
          </span>
          <div className="flex items-center tracking-wider text-[#1F1E22]">
            {ipParts.netPart && (
              <span className="bg-[#E3F4FE] border-b-2 border-[#8BD0FC] px-1 py-0.5 rounded-l text-[#1F1E22] font-semibold">
                {ipParts.netPart}
              </span>
            )}
            {ipParts.hostPart && (
              <span className="bg-[#FFF8D1] border-b-2 border-[#FCE76C] px-1 py-0.5 rounded-r text-[#1F1E22] font-bold">
                {ipParts.hostPart}
              </span>
            )}
            {ipDesimal && (
              <span className="ml-3 text-[12px] text-[#5B5F6B] font-medium font-sans">
                ({ipDesimal})
              </span>
            )}
          </div>
        </div>

        {/* Baris Mask */}
        <div className="flex items-center min-w-[500px]">
          <span className="w-28 font-bold text-[#5B5F6B] shrink-0">
            Mask (/{prefix}):
          </span>
          <div className="flex items-center tracking-wider text-[#1F1E22]">
            {maskParts.netPart && (
              <span className="bg-[#E3F4FE] border-b-2 border-[#8BD0FC] px-1 py-0.5 rounded-l text-[#1F1E22] font-semibold">
                {maskParts.netPart}
              </span>
            )}
            {maskParts.hostPart && (
              <span className="bg-[#FFF8D1] border-b-2 border-[#FCE76C] px-1 py-0.5 rounded-r text-[#1F1E22] font-bold">
                {maskParts.hostPart}
              </span>
            )}
            {maskDesimal && (
              <span className="ml-3 text-[12px] text-[#5B5F6B] font-medium font-sans">
                ({maskDesimal})
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
