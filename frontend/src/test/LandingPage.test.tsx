import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { LandingPage } from '../pages/LandingPage';

describe('Halaman Landing Page', () => {
  const renderLandingPage = () => {
    return render(
      <BrowserRouter>
        <LandingPage />
      </BrowserRouter>
    );
  };

  it('merender logo, headline hero, dan tombol aksi utama', () => {
    renderLandingPage();

    // Verifikasi branding
    expect(screen.getAllByText('Asisten Praktikum Jaringan').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText(/Kuasai Hitungan Jaringan Komputer/i)).toBeInTheDocument();

    // Verifikasi tombol CTA
    const ctaButtons = screen.getAllByRole('link', { name: /Buka Aplikasi|Mulai Praktikum/i });
    expect(ctaButtons.length).toBeGreaterThanOrEqual(1);
  });

  it('merender 6 modul praktikum lengkap', () => {
    renderLandingPage();

    expect(screen.getByText('Analisis Subnetting CIDR')).toBeInTheDocument();
    expect(screen.getByText('Alokasi FLSM & VLSM')).toBeInTheDocument();
    expect(screen.getAllByText(/Rencana Ruangan/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('Konversi Antar-Basis')).toBeInTheDocument();
    expect(screen.getByText('Generator DHCP Router')).toBeInTheDocument();
    expect(screen.getByText('Tabel IP Antarmuka Node')).toBeInTheDocument();
  });

  it('merender seksi keunggulan deterministik dan alur praktikum', () => {
    renderLandingPage();

    expect(screen.getByText(/Deterministik Murni/i)).toBeInTheDocument();
    expect(screen.getAllByText(/Format Lembar Ujian/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText(/3 Langkah Menyelesaikan Soal Praktikum/i)).toBeInTheDocument();
  });
});
