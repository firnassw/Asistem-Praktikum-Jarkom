import React from 'react';
import { Menu } from 'lucide-react';
import { useLocation } from 'react-router-dom';

interface HeaderBarProps {
  onOpenMenu: () => void;
}

const pageTitles: Record<string, string> = {
  '/': 'Beranda',
  '/subnetting': 'Subnetting',
  '/flsm-vlsm': 'FLSM dan VLSM',
  '/rencana': 'Rencana ruangan',
  '/konversi': 'Konversi basis',
  '/dhcp': 'Generator DHCP',
  '/tabel-ip': 'Tabel IP',
  '/tentang': 'Tentang',
};

export const HeaderBar: React.FC<HeaderBarProps> = ({ onOpenMenu }) => {
  const location = useLocation();
  const currentTitle = pageTitles[location.pathname] || 'Asisten Jarkom';

  return (
    <header className="lg:hidden sticky top-0 z-30 bg-[#FFFFFF] border-b border-[#E3E5EA] h-14 px-4 flex items-center justify-between shadow-xs">
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMenu}
          aria-label="Buka navigasi"
          className="p-2 -ml-2 rounded-lg text-[#1F1E22] hover:bg-[#F5F6F8] active:bg-[#E3E5EA] transition-colors"
        >
          <Menu size={22} />
        </button>
        <span className="font-bold text-[16px] text-[#1F1E22] truncate max-w-[200px] sm:max-w-xs">
          {currentTitle}
        </span>
      </div>

      <div className="flex items-center gap-2">
        <span className="px-2.5 py-1 rounded-[6px] bg-[#FCE76C] text-[#1F1E22] text-[12px] font-extrabold border border-[#1F1E22]/20">
          APJ
        </span>
      </div>
    </header>
  );
};
