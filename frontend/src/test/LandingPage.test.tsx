import { describe, it, expect } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import { BrowserRouter, MemoryRouter } from 'react-router-dom';
import { LandingPage } from '../pages/LandingPage';
import { AppRoutes } from '../App';

describe('Halaman Landing Page (/) & Routing Beranda (/beranda)', () => {
  const renderLandingPage = () => {
    return render(
      <BrowserRouter>
        <LandingPage />
      </BrowserRouter>
    );
  };

  it('merender LandingPage tanpa sidebar kiri, memiliki Top Navbar dan tombol Buka Dashboard', () => {
    renderLandingPage();

    // Verifikasi branding Top Navbar
    expect(screen.getByText('APJ')).toBeInTheDocument();
    expect(screen.getAllByText('Asisten Praktikum Jaringan').length).toBeGreaterThanOrEqual(1);

    // Pastikan tidak ada elemen navigasi sidebar atau drawer menu internal
    expect(screen.queryByLabelText(/Navigasi Bawah Mobile/i)).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/Buka navigasi/i)).not.toBeInTheDocument();

    // Tombol Buka Dashboard di Navbar mengarah ke /beranda
    const bukaDashboardBtn = screen.getByRole('link', { name: /Buka Dashboard/i });
    expect(bukaDashboardBtn).toBeInTheDocument();
    expect(bukaDashboardBtn).toHaveAttribute('href', '/beranda');
  });

  it('merender judul Hero, tombol Mulai Praktikum, tombol Coba Contoh Soal, dan pratinjau lembar jawaban', () => {
    renderLandingPage();

    // Judul Hero utama
    expect(
      screen.getByRole('heading', {
        level: 1,
        name: /Selesaikan hitungan jaringan, langkah demi langkah/i,
      })
    ).toBeInTheDocument();

    // Tombol Primary: Mulai Praktikum -> /beranda
    const mulaiPraktikumBtn = screen.getByRole('link', { name: /Mulai Praktikum/i });
    expect(mulaiPraktikumBtn).toBeInTheDocument();
    expect(mulaiPraktikumBtn).toHaveAttribute('href', '/beranda');
    expect(mulaiPraktikumBtn.className).toContain('bg-[#FCE76C]'); // Mematuhi aturan satu tombol primary

    // Tombol Secondary: Coba Contoh Soal -> /subnetting?contoh=1
    const cobaContohBtn = screen.getByRole('link', { name: /Coba Contoh Soal/i });
    expect(cobaContohBtn).toBeInTheDocument();
    expect(cobaContohBtn).toHaveAttribute('href', '/subnetting?contoh=1');
    expect(cobaContohBtn.className).toContain('bg-[#FFFFFF]'); // Tombol secondary

    // Pratinjau lembar jawaban 192.168.0.5 /27
    expect(screen.getByText(/Contoh Analisis: 192.168.0.5 \/27/i)).toBeInTheDocument();
    expect(screen.getByText(/192.168.0.0/i)).toBeInTheDocument();
    expect(screen.getByText(/192.168.0.31/i)).toBeInTheDocument();
    expect(screen.getByText(/27 Bit Jaringan/i)).toBeInTheDocument();
    expect(screen.getByText(/5 Bit Host/i)).toBeInTheDocument();

    // Memastikan label/teks dekoratif karangan Stitch telah DIBUANG
    expect(screen.queryByText(/Format Baku Ujian & Modul Praktikum Cisco/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Subnet #1 Terverifikasi/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/RFC 4632/i)).not.toBeInTheDocument();
  });

  it('merender 6 kartu alat hitung modul praktikum yang dapat diklik langsung', () => {
    renderLandingPage();

    expect(screen.getByText('Enam Alat Hitung Sesuai Modul Praktikum')).toBeInTheDocument();

    // Ke-6 Kartu Fitur
    const kartuFitur = [
      { nama: 'Analisis subnet', rute: '/subnetting', contoh: '192.168.0.5 /27' },
      { nama: 'FLSM dan VLSM', rute: '/flsm-vlsm', contoh: '192.168.64.0/24 • 64, 24, 8 host' },
      { nama: 'Rencana ruangan', rute: '/rencana', contoh: 'NIM 50 -> 192.168.50.0/24' },
      { nama: 'Konversi basis', rute: '/konversi', contoh: '10101100 -> 172 (0xAC)' },
      { nama: 'Generator DHCP', rute: '/dhcp', contoh: '192.168.10.1/24 • klien .6' },
      { nama: 'Tabel IP perangkat', rute: '/tabel-ip', contoh: 'Server 192.168.1.1 /24' },
    ];

    kartuFitur.forEach((f) => {
      const linkEl = screen.getByRole('link', { name: new RegExp(f.nama, 'i') });
      expect(linkEl).toBeInTheDocument();
      expect(linkEl).toHaveAttribute('href', f.rute);
      expect(within(linkEl).getByText(f.contoh)).toBeInTheDocument();
    });

    // Memastikan label dekoratif modul karangan Stitch telah DIBUANG
    expect(screen.queryByText(/PERANGKAT MODUL PRAKTIKUM/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/MODUL 01/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/MODUL 02/i)).not.toBeInTheDocument();
  });

  it('merender 3 kartu langkah kerja, banner CTA bawah, dan footer', () => {
    renderLandingPage();

    // 3 Langkah Pengerjaan
    expect(screen.getByText('Format Seragam Seperti Lembar Jawaban Ujian')).toBeInTheDocument();
    expect(screen.getByText('Isi Data Soal atau NIM')).toBeInTheDocument();
    expect(screen.getByText('Pelajari Langkah Biner & Rumus')).toBeInTheDocument();
    expect(screen.getByText('Salin ke Packet Tracer atau Cetak')).toBeInTheDocument();

    // Memastikan TAHAP 01/02/03 telah DIBUANG
    expect(screen.queryByText(/TAHAP 01/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/TAHAP 02/i)).not.toBeInTheDocument();

    // Banner CTA Bawah
    expect(screen.getByText(/Siap mengerjakan soal praktikum sekarang\?/i)).toBeInTheDocument();
    const ctaBawah = screen.getByRole('link', { name: /Buka Aplikasi Sekarang/i });
    expect(ctaBawah).toBeInTheDocument();
    expect(ctaBawah).toHaveAttribute('href', '/beranda');
    expect(ctaBawah.className).toContain('bg-[#FFFFFF]'); // Tombol secondary
  });

  it('memverifikasi integrasi App: rute / merender LandingPage dan rute /beranda merender Dashboard di dalam Shell', () => {
    // 1. Rute /
    const { unmount } = render(
      <MemoryRouter initialEntries={['/']}>
        <AppRoutes />
      </MemoryRouter>
    );
    expect(screen.getByRole('heading', { level: 1, name: /Selesaikan hitungan jaringan/i })).toBeInTheDocument();
    unmount();

    // 2. Rute /beranda (di dalam Shell UI dengan Sidebar & Header)
    render(
      <MemoryRouter initialEntries={['/beranda']}>
        <AppRoutes />
      </MemoryRouter>
    );
    // Di /beranda terdapat teks dashboard & menu sidebar
    expect(screen.getByRole('navigation', { name: /Menu Utama/i })).toBeInTheDocument();
  });
});
