import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { Layout } from '../components/Layout';

const renderLayoutApp = () => {
  return render(
    <MemoryRouter initialEntries={['/beranda']}>
      <Routes>
        <Route element={<Layout />}>
          <Route path="beranda" element={<div>Konten Beranda</div>} />
        </Route>
      </Routes>
    </MemoryRouter>
  );
};

describe('Layout Shell UI', () => {
  it('merender layout lengkap dan navigasi bottom bar di mobile', () => {
    renderLayoutApp();

    // Bottom navigation bar ada 4 item utama
    const bottomNav = screen.getByRole('navigation', { name: /Navigasi Bawah Mobile/i });
    expect(bottomNav).toBeInTheDocument();

    expect(within(bottomNav).getByRole('link', { name: /Beranda/i })).toBeInTheDocument();
    expect(within(bottomNav).getByRole('link', { name: /Subnet/i })).toBeInTheDocument();
    expect(within(bottomNav).getByRole('link', { name: /Rencana/i })).toBeInTheDocument();
    expect(within(bottomNav).getByRole('button', { name: /Lainnya/i })).toBeInTheDocument();
  });

  it('dapat membuka drawer navigasi saat tombol Lainnya atau menu bar diklik', () => {
    renderLayoutApp();

    const lainnyaBtn = screen.getByRole('button', { name: /Lainnya/i });
    fireEvent.click(lainnyaBtn);

    // Dialog drawer terbuka
    const dialog = screen.getByRole('dialog', { name: /Navigasi Menu/i });
    expect(dialog).toBeInTheDocument();

    // Tombol tutup drawer ada
    const closeBtn = screen.getByRole('button', { name: /Tutup menu/i });
    expect(closeBtn).toBeInTheDocument();
    fireEvent.click(closeBtn);

    // Dialog tertutup
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
});
