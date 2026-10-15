import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Network, LayoutGrid, MoreHorizontal } from 'lucide-react';

interface MobileBottomNavProps {
  onOpenDrawer: () => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({ onOpenDrawer }) => {
  return (
    <nav
      aria-label="Navigasi Bawah Mobile"
      className="mobile-bottom-tabs md:hidden fixed bottom-0 left-0 right-0 h-16 bg-[#1F1E22] border-t border-[#2E2D33] z-40 flex items-center justify-around px-2 shadow-[0_-2px_10px_rgba(0,0,0,0.15)]"
    >
      <NavLink
        to="/"
        end
        className={({ isActive }) =>
          `flex flex-col items-center justify-center flex-1 py-1 text-[11px] font-bold transition-colors ${
            isActive ? 'text-[#FCE76C]' : 'text-white/70 hover:text-white'
          }`
        }
      >
        <Home size={20} />
        <span className="mt-1">Beranda</span>
      </NavLink>

      <NavLink
        to="/subnetting"
        className={({ isActive }) =>
          `flex flex-col items-center justify-center flex-1 py-1 text-[11px] font-bold transition-colors ${
            isActive ? 'text-[#FCE76C]' : 'text-white/70 hover:text-white'
          }`
        }
      >
        <Network size={20} />
        <span className="mt-1">Subnet</span>
      </NavLink>

      <NavLink
        to="/rencana"
        className={({ isActive }) =>
          `flex flex-col items-center justify-center flex-1 py-1 text-[11px] font-bold transition-colors ${
            isActive ? 'text-[#FCE76C]' : 'text-white/70 hover:text-white'
          }`
        }
      >
        <LayoutGrid size={20} />
        <span className="mt-1">Rencana</span>
      </NavLink>

      <button
        onClick={onOpenDrawer}
        type="button"
        className="flex flex-col items-center justify-center flex-1 py-1 text-[11px] font-bold text-white/70 hover:text-white transition-colors"
      >
        <MoreHorizontal size={20} />
        <span className="mt-1">Lainnya</span>
      </button>
    </nav>
  );
};
