import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { Sidebar } from '../components/Sidebar';

describe('Sidebar Navigasi', () => {
  it('merender logo APJ dan seluruh 8 item navigasi', () => {
    render(
      <BrowserRouter>
        <Sidebar />
      </BrowserRouter>
    );

    // Verifikasi Logo & Judul
    expect(screen.getByText('APJ')).toBeInTheDocument();
    expect(screen.getByText('Asisten Praktikum')).toBeInTheDocument();
    expect(screen.getByText('Jaringan Komputer')).toBeInTheDocument();

    // 8 Item Menu sesuai PRD & DESIGN.md
    const menuItems = [
      { name: 'Beranda', href: '/app' },
      { name: 'Subnetting', href: '/subnetting' },
      { name: 'FLSM dan VLSM', href: '/flsm-vlsm' },
      { name: 'Rencana ruangan', href: '/rencana' },
      { name: 'Konversi basis', href: '/konversi' },
      { name: 'Generator DHCP', href: '/dhcp' },
      { name: 'Tabel IP', href: '/tabel-ip' },
      { name: 'Tentang', href: '/tentang' },
    ];

    menuItems.forEach((item) => {
      const link = screen.getByRole('link', { name: new RegExp(item.name, 'i') });
      expect(link).toBeInTheDocument();
      expect(link).toHaveAttribute('href', item.href);
    });
  });
});
