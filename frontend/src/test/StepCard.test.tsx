import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StepCard } from '../components/StepCard';

describe('Komponen StepCard', () => {
  it('merender nomor langkah, judul, penjelasan, faded label, dan hasil', () => {
    const mockLangkah = {
      judul: 'Hitung Network Address: NA = IP AND subnet mask',
      penjelasan: 'Lakukan operasi logika Boolean AND antara alamat IP dan subnet mask.',
      rumus: 'NA = IP AND subnet mask',
      tabel: {
        tipe: 'operasi_biner',
        operasi: 'AND',
        op1: '11000000.10101000.00000000.00000101',
        op1_label: 'IP (192.168.0.5)',
        op2: '11111111.11111111.11111111.11100000',
        op2_label: 'Mask (255.255.255.224)',
        hasil_biner: '11000000.10101000.00000000.00000000',
        hasil_label: 'NA (192.168.0.0)',
      },
      hasil: 'Network Address (NA) = 192.168.0.0',
    };

    render(
      <StepCard
        nomor={2}
        langkah={mockLangkah}
        fadedLabel="AND"
      />
    );

    // Nomor langkah
    expect(screen.getByText('2')).toBeInTheDocument();

    // Judul
    expect(
      screen.getByRole('heading', { name: /Hitung Network Address: NA = IP AND subnet mask/i })
    ).toBeInTheDocument();

    // Penjelasan
    expect(
      screen.getByText(/Lakukan operasi logika Boolean AND antara alamat IP dan subnet mask/i)
    ).toBeInTheDocument();

    // Faded label
    expect(screen.getByText('AND')).toBeInTheDocument();

    // Baris hasil
    expect(screen.getByText(/Network Address \(NA\) = 192.168.0.0/i)).toBeInTheDocument();
  });
});
