import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  Home,
  Network,
  GitFork,
  LayoutGrid,
  Binary,
  Terminal,
  Table,
  Info,
  X
} from 'lucide-react';

interface SidebarProps {
  onClose?: () => void;
  isMobileDrawer?: boolean;
}

export const navItems = [
  { name: 'Beranda', path: '/', icon: Home, shortName: 'Beranda' },
  { name: 'Subnetting', path: '/subnetting', icon: Network, shortName: 'Subnet' },
  { name: 'FLSM dan VLSM', path: '/flsm-vlsm', icon: GitFork, shortName: 'FLSM/VLSM' },
  { name: 'Rencana ruangan', path: '/rencana', icon: LayoutGrid, shortName: 'Rencana' },
  { name: 'Konversi basis', path: '/konversi', icon: Binary, shortName: 'Konversi' },
  { name: 'Generator DHCP', path: '/dhcp', icon: Terminal, shortName: 'DHCP' },
  { name: 'Tabel IP', path: '/tabel-ip', icon: Table, shortName: 'Tabel IP' },
  { name: 'Tentang', path: '/tentang', icon: Info, shortName: 'Tentang' },
];

export const Sidebar: React.FC<SidebarProps> = ({ onClose, isMobileDrawer = false }) => {
  return (
    <aside
      className={`bg-[#1F1E22] text-[#FFFFFF] flex flex-col justify-between p-4 h-full select-none ${
        isMobileDrawer ? 'w-full max-w-[280px]' : 'w-[264px]'
      }`}
    >
      <div className="flex flex-col gap-6">
        {/* Logo & Judul Header */}
        <div className="flex items-center justify-between px-2 pt-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-[12px] bg-[#FCE76C] text-[#1F1E22] font-extrabold flex items-center justify-center text-lg tracking-tight shadow-sm shrink-0">
              APJ
            </div>
            <div className="flex flex-col leading-tight min-w-0">
              <span className="font-bold text-[15px] text-white truncate">
                Asisten Praktikum
              </span>
              <span className="text-[12px] text-[#8A8F9C] truncate">
                Jaringan Komputer
              </span>
            </div>
          </div>
          {isMobileDrawer && onClose && (
            <button
              onClick={onClose}
              aria-label="Tutup menu"
              className="p-1.5 rounded-lg text-white/70 hover:bg-[#2E2D33] hover:text-white transition-colors"
            >
              <X size={20} />
            </button>
          )}
        </div>

        {/* Menu Navigasi */}
        <nav className="flex flex-col gap-1.5" aria-label="Menu Utama">
          {navItems.map((item) => {
            const IconComponent = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onClose}
                end={item.path === '/'}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-[12px] font-bold text-[14px] transition-all ${
                    isActive
                      ? 'bg-[#FCE76C] text-[#1F1E22] border-2 border-[#1F1E22] shadow-sm'
                      : 'text-white/80 hover:bg-[#2E2D33] hover:text-white'
                  }`
                }
              >
                <IconComponent size={20} className="shrink-0" />
                <span className="truncate">{item.name}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Footer Info */}
      <div className="p-3.5 rounded-[12px] bg-white/5 border border-white/10 text-white/70 mt-6">
        <div className="flex items-center gap-2 mb-1">
          <span className="w-2 h-2 rounded-full bg-[#FCE76C]"></span>
          <span className="text-[12px] font-bold text-white tracking-wide uppercase">
            Modul Jarkom v1.0
          </span>
        </div>
        <p className="text-[12px] text-white/60 leading-tight">
          Panduan langkah hitungan jaringan deterministik.
        </p>
      </div>
    </aside>
  );
};
