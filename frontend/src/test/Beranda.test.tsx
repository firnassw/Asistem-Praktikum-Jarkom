import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { Beranda } from '../pages/Beranda';

const renderBeranda = () => {
  return render(
    <BrowserRouter>
      <Beranda />
    </BrowserRouter>
  );
};

describe('Halaman Beranda', () => {
  it('merender header band dengan judul, deskripsi, dan tombol Coba contoh', () => {
    renderBeranda();

    // 1. Judul Header Band
    const heading = screen.getByRole('heading', {
      name: /Selesaikan hitungan jaringan, langkah demi langkah/i,
    });
    expect(heading).toBeInTheDocument();

    // 2. Kalimat penjelasan
    expect(
      screen.getByText(
        /Alat bantu praktikum Jaringan Komputer untuk menyelesaikan subnetting, rencana IP, konversi basis, dan konfigurasi DHCP langkah demi langkah\./i
      )
    ).toBeInTheDocument();

    // 3. Tombol aksi Coba contoh
    const cobaButton = screen.getByRole('link', { name: /Coba contoh/i });
    expect(cobaButton).toBeInTheDocument();
    expect(cobaButton).toHaveAttribute('href', '/subnetting?contoh=1');
  });

  it('merender tepat 6 kartu fitur dengan nama, deskripsi, dan contoh monospace yang sesuai', () => {
    renderBeranda();

    const expectedFeatures = [
      {
        nama: 'Analisis subnet',
        deskripsi: 'Hitung NA, BA, subnet mask, dan tabel rentang host dari satu alamat IP.',
        contoh: '192.168.0.5 /27',
        rute: '/subnetting',
      },
      {
        nama: 'FLSM dan VLSM',
        deskripsi: 'Bagi jaringan induk menjadi beberapa subnet ukuran tetap atau sesuai kebutuhan host.',
        contoh: '192.168.64.0/24 • 64, 24, 8 host',
        rute: '/flsm-vlsm',
      },
      {
        nama: 'Rencana ruangan',
        deskripsi: 'Susun alokasi subnet otomatis dari dua digit NIM serta jumlah ruangan dan device.',
        contoh: 'NIM 50 • 5 ruangan',
        rute: '/rencana',
      },
      {
        nama: 'Konversi basis',
        deskripsi: 'Ubah bilangan antar basis biner, oktal, desimal, dan heksadesimal dengan tabel bit.',
        contoh: '10101100 -> 172',
        rute: '/konversi',
      },
      {
        nama: 'Generator DHCP',
        deskripsi: 'Susun perintah CLI DHCP router dan prediksi alamat IP klien pertama.',
        contoh: '192.168.10.1/24 • excluded .1-.5',
        rute: '/dhcp',
      },
      {
        nama: 'Tabel IP perangkat',
        deskripsi: 'Rekap alamat IP, subnet mask, gateway, dan DNS perangkat siap salin dan cetak.',
        contoh: 'Server 192.168.1.1 • 255.255.255.0',
        rute: '/tabel-ip',
      },
    ];

    expectedFeatures.forEach((fitur) => {
      // Nama fitur
      expect(
        screen.getByRole('heading', { name: fitur.nama })
      ).toBeInTheDocument();

      // Deskripsi
      expect(screen.getByText(fitur.deskripsi)).toBeInTheDocument();

      // Contoh monospace
      expect(screen.getByText(fitur.contoh)).toBeInTheDocument();

      // Link rute
      const link = screen.getByRole('link', { name: new RegExp(fitur.nama, 'i') });
      expect(link).toHaveAttribute('href', fitur.rute);
    });
  });

  it('tidak memuat teks karangan yang dilarang (maskot, koin, testimoni, statistik palsu)', () => {
    renderBeranda();

    const prohibitedTerms = [
      'koin',
      'kupon',
      'hadiah',
      'testimoni',
      'pengguna aktif',
      'bintang 5',
      'diskon',
    ];

    prohibitedTerms.forEach((term) => {
      expect(screen.queryByText(new RegExp(term, 'i'))).not.toBeInTheDocument();
    });
  });
});
