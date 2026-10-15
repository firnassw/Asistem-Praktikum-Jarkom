import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ResultTable } from '../components/ResultTable';

describe('Komponen ResultTable', () => {
  const mockSubnetRows = [
    {
      no: 1,
      subnet: '192.168.0.0/27',
      na: '192.168.0.0',
      host_pertama: '192.168.0.1',
      host_terakhir: '192.168.0.30',
      broadcast: '192.168.0.31',
      aktif: true,
    },
    {
      no: 2,
      subnet: '192.168.0.32/27',
      na: '192.168.0.32',
      host_pertama: '192.168.0.33',
      host_terakhir: '192.168.0.62',
      broadcast: '192.168.0.63',
      aktif: false,
    },
  ];

  it('merender judul tabel, tombol salin dan cetak, serta baris subnet', () => {
    render(
      <ResultTable
        tabel={mockSubnetRows}
        targetIp="192.168.0.5"
        prefix={27}
      />
    );

    expect(screen.getByText(/Tabel Alokasi Seluruh Subnet/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Salin tabel/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Cetak/i })).toBeInTheDocument();

    // Data baris 1
    expect(screen.getByText('192.168.0.0')).toBeInTheDocument();
    expect(screen.getByText('192.168.0.1')).toBeInTheDocument();
    expect(screen.getByText('192.168.0.30')).toBeInTheDocument();
    expect(screen.getByText('192.168.0.31')).toBeInTheDocument();
    expect(screen.getByText(/Target/i)).toBeInTheDocument();

    // Data baris 2
    expect(screen.getByText('192.168.0.32')).toBeInTheDocument();
  });
});
