import React from 'react';
import type { SubnetTableRow } from '../types/api';

interface AddressBarProps {
  tabelSubnet: SubnetTableRow[];
  alamatIp: string;
  prefix: number;
}

// 4 Warna subnet berurutan sesuai DESIGN.md
export const SUBNET_COLORS = [
  '#8BD0FC', // 1: Secondary (biru)
  '#FCE76C', // 2: Primary (kuning)
  '#FF8F5C', // 3: Tertiary (oranye)
  '#C9D0E4', // 4: Subnet-4 (abu-biru)
];

export const getSubnetColor = (index: number): string => {
  return SUBNET_COLORS[index % SUBNET_COLORS.length];
};

export const AddressBar: React.FC<AddressBarProps> = ({
  tabelSubnet,
  alamatIp,
  prefix,
}) => {
  // Cari baris subnet tempat IP berada
  const activeSubnet = tabelSubnet.find((s) => s.aktif) || tabelSubnet[0];
  const activeIndex = activeSubnet ? tabelSubnet.indexOf(activeSubnet) + 1 : 1;

  // Batasi segmen visual maksimal 8 blok agar tetap proporsional dan jelas terbaca
  const displaySubnets = tabelSubnet.slice(0, 8);
  const hasMore = tabelSubnet.length > 8;

  return (
    <div className="w-full flex flex-col gap-3">
      {/* 1. Bar Horizontal Blok Subnet Tanpa Scrollbar Kering */}
      <div
        className="w-full h-14 rounded-[16px] border-2 border-[#1F1E22] bg-[#FFFFFF] p-1.5 flex items-stretch gap-1.5 shadow-xs select-none overflow-x-auto no-scrollbar"
        style={{
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
        }}
      >
        {displaySubnets.map((sub, idx) => {
          const color = getSubnetColor(idx);
          const isTarget = sub.aktif;

          return (
            <div
              key={sub.no}
              title={`Subnet ${sub.no}: ${sub.subnet} (${sub.host_pertama} - ${sub.host_terakhir})`}
              style={{ backgroundColor: color }}
              className={`flex-1 min-w-[58px] sm:min-w-0 rounded-[10px] flex flex-col items-center justify-center px-1.5 py-1 text-center transition-all ${
                isTarget
                  ? 'border-2 border-[#1F1E22] shadow-xs ring-2 ring-[#1F1E22]/20 font-extrabold'
                  : 'border border-[#1F1E22]/30 opacity-90 hover:opacity-100'
              }`}
            >
              <span className="font-sans text-[11px] font-extrabold text-[#1F1E22] leading-tight">
                #{sub.no}
              </span>
              <span className="font-mono text-[11px] font-bold text-[#1F1E22] leading-tight">
                .{sub.na.split('.').pop()}
              </span>
            </div>
          );
        })}

        {hasMore && (
          <div
            title={`+${tabelSubnet.length - 8} subnet lainnya`}
            className="flex-none px-2.5 rounded-[10px] bg-[#D6D9E2] border border-[#1F1E22]/30 flex items-center justify-center font-mono text-[11px] font-bold text-[#1F1E22]"
          >
            +{tabelSubnet.length - 8}
          </div>
        )}
      </div>

      {/* 2. Chip Penanda Posisi Host Target */}
      {activeSubnet && (
        <div className="p-3 bg-[#FFF8D1] border border-[#FCE76C] rounded-[12px] flex flex-wrap items-center justify-between gap-2 text-xs font-sans text-[#1F1E22]">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#1F1E22] shrink-0" />
            <span className="font-medium">
              Posisi Host: IP <strong className="font-mono font-bold">{alamatIp}</strong> berada pada{' '}
              <strong className="underline decoration-[#1F1E22] decoration-2">
                Subnet ke-{activeIndex}
              </strong>{' '}
              (Blok <span className="font-mono font-bold">{activeSubnet.subnet}</span>)
            </span>
          </div>
          <span className="font-mono text-[11px] font-bold bg-[#FFFFFF] text-[#1F1E22] px-2.5 py-1 rounded-[6px] border border-[#1F1E22]/20">
            CIDR /{prefix}
          </span>
        </div>
      )}
    </div>
  );
};
