import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { TabelIp } from '../pages/TabelIp';
import { api } from '../services/api';

vi.mock('../services/api', () => ({
  api: {
    hitungTabelIp: vi.fn(),
  },
  ApiException: class ApiException extends Error {
    field?: string;
    kode?: string;
    constructor(err: any) {
      super(err.pesan);
      this.field = err.field;
      this.kode = err.kode;
    }
  },
}));

const mockTabelIpResponse = {
  fitur: 'tabel-ip',
  diketahui: [
    { label: 'Total Perangkat Terdaftar', nilai: '3 unit (3 Static, 0 DHCP)' },
    { label: 'Segmen Jaringan Terdeteksi', nilai: '192.168.1.0/24' },
    { label: 'Default Gateway', nilai: '-' },
    { label: 'DNS Server', nilai: '192.168.1.1' },
  ],
  langkah: [
    {
      judul: 'Identifikasi mode pengalamatan dan konversi subnet mask tiap perangkat',
      penjelasan: 'Setiap perangkat diidentifikasi mode pengalamatannya.',
      rumus: 'Prefix /p <-> Subnet Mask 32-bit',
      tabel: [
        { no: 1, nama: 'Server', mode: 'Static', ip: '192.168.1.1', subnet_mask: '255.255.255.0', prefix: '/24' },
        { no: 2, nama: 'PC0', mode: 'Static', ip: '192.168.1.2', subnet_mask: '255.255.255.0', prefix: '/24' },
        { no: 3, nama: 'PC1', mode: 'Static', ip: '192.168.1.3', subnet_mask: '255.255.255.0', prefix: '/24' },
      ],
      hasil: '3 perangkat menggunakan IP statis, 0 perangkat menggunakan konfigurasi dinamis (DHCP).',
    },
    {
      judul: 'Tentukan segmen jaringan (Network Address) dan periksa konsistensi alamat',
      penjelasan: 'Alamat jaringan tiap perangkat statis dihitung dengan operasi bitwise AND.',
      rumus: 'NA = IP AND Subnet Mask; BA = NA OR (NOT Subnet Mask)',
      tabel: [
        { no: 1, nama: 'Server', ip: '192.168.1.1', segmen: '192.168.1.0/24', gateway: '-', status: 'Konsisten' },
        { no: 2, nama: 'PC0', ip: '192.168.1.2', segmen: '192.168.1.0/24', gateway: '-', status: 'Konsisten' },
        { no: 3, nama: 'PC1', ip: '192.168.1.3', segmen: '192.168.1.0/24', gateway: '-', status: 'Konsisten' },
      ],
      hasil: 'Terdeteksi 1 segmen jaringan: 192.168.1.0/24. Seluruh alamat IP konsisten dan tidak ada konflik alamat.',
    },
    {
      judul: 'Susun tabel rekapitulasi IP perangkat',
      penjelasan: 'Seluruh parameter pengalamatan antarmuka perangkat disusun ke dalam tabel.',
      rumus: null,
      tabel: [
        { no: 1, nama: 'Server', mode: 'Static', ip: '192.168.1.1', subnet_mask: '255.255.255.0', prefix: '/24', gateway: '-', dns: '-' },
        { no: 2, nama: 'PC0', mode: 'Static', ip: '192.168.1.2', subnet_mask: '255.255.255.0', prefix: '/24', gateway: '-', dns: '192.168.1.1' },
        { no: 3, nama: 'PC1', mode: 'Static', ip: '192.168.1.3', subnet_mask: '255.255.255.0', prefix: '/24', gateway: '-', dns: '192.168.1.1' },
      ],
      hasil: 'Tabel konfigurasi berhasil direkap untuk 3 perangkat.',
    },
  ],
  hasil_akhir: {
    ringkasan: {
      total_perangkat: 3,
      total_static: 3,
      total_dhcp: 0,
      segmen_jaringan: ['192.168.1.0/24'],
      daftar_gateway: [],
      daftar_dns: ['192.168.1.1'],
    },
    tabel: [
      { no: 1, nama: 'Server', mode: 'Static', ip: '192.168.1.1', subnet_mask: '255.255.255.0', prefix: '/24', gateway: '-', dns: '-' },
      { no: 2, nama: 'PC0', mode: 'Static', ip: '192.168.1.2', subnet_mask: '255.255.255.0', prefix: '/24', gateway: '-', dns: '192.168.1.1' },
      { no: 3, nama: 'PC1', mode: 'Static', ip: '192.168.1.3', subnet_mask: '255.255.255.0', prefix: '/24', gateway: '-', dns: '192.168.1.1' },
    ],
  },
  kesimpulan:
    'Tabel IP perangkat berhasil disusun untuk 3 perangkat (3 Static dan 0 DHCP). Seluruh perangkat statis berada dalam segmen jaringan 192.168.1.0/24. DNS server yang terpasang: 192.168.1.1.',
  peringatan: [],
};

describe('Halaman TabelIp', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('merender header band, formulir pengalamatan, dan tombol aksi utama', () => {
    render(
      <BrowserRouter>
        <TabelIp />
      </BrowserRouter>
    );

    // Header Band
    expect(screen.getByRole('heading', { level: 1, name: /Tabel IP perangkat/i })).toBeInTheDocument();
    expect(
      screen.getByText(/Rekap alamat IP, subnet mask, default gateway, dan DNS perangkat/i)
    ).toBeInTheDocument();

    // Formulir
    expect(screen.getByText(/Kelola Baris Perangkat/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /\+ Tambah perangkat|Tambah perangkat/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Buat tabel IP/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Isi contoh \(Modul 4\)/i })).toBeInTheDocument();

    // State Awal Kosong
    expect(screen.getByText(/Belum ada tabel yang dibuat/i)).toBeInTheDocument();
  });

  it('dapat menambah dan menghapus baris perangkat', () => {
    render(
      <BrowserRouter>
        <TabelIp />
      </BrowserRouter>
    );

    // Awalnya 3 baris
    expect(screen.getByText(/Perangkat #1/i)).toBeInTheDocument();
    expect(screen.getByText(/Perangkat #2/i)).toBeInTheDocument();
    expect(screen.getByText(/Perangkat #3/i)).toBeInTheDocument();

    // Tambah 1 baris
    const addBtn = screen.getByRole('button', { name: /Tambah perangkat/i });
    fireEvent.click(addBtn);
    expect(screen.getByText(/Perangkat #4/i)).toBeInTheDocument();

    // Hapus baris
    const deleteBtns = screen.getAllByTitle(/Hapus Perangkat/i);
    expect(deleteBtns.length).toBeGreaterThan(0);
    fireEvent.click(deleteBtns[deleteBtns.length - 1]);
    expect(screen.queryByText(/Perangkat #4/i)).not.toBeInTheDocument();
  });

  it('dapat mengubah toggle Static ke DHCP sehingga input dinonaktifkan', () => {
    render(
      <BrowserRouter>
        <TabelIp />
      </BrowserRouter>
    );

    const dhcpButtons = screen.getAllByRole('button', { name: 'DHCP' });
    fireEvent.click(dhcpButtons[0]);

    // Input dinonaktifkan dan bernilai Otomatis (DHCP)
    const disabledInputs = screen.getAllByDisplayValue('Otomatis (DHCP)');
    expect(disabledInputs.length).toBeGreaterThanOrEqual(2);
  });

  it('mengisi contoh G-JAR-09, mengeksekusi perhitungan, dan merender hasil tanpa elemen ping karangan', async () => {
    (api.hitungTabelIp as any).mockResolvedValueOnce(mockTabelIpResponse);

    render(
      <BrowserRouter>
        <TabelIp />
      </BrowserRouter>
    );

    // Klik Isi contoh
    const contohBtn = screen.getByRole('button', { name: /Isi contoh \(Modul 4\)/i });
    fireEvent.click(contohBtn);

    // Klik Buat tabel IP
    const submitBtn = screen.getByRole('button', { name: /Buat tabel IP/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(api.hitungTabelIp).toHaveBeenCalledTimes(1);
    });

    // Verifikasi pemanggilan payload
    expect(api.hitungTabelIp).toHaveBeenCalledWith({
      perangkat: [
        {
          nama: 'Server',
          mode: 'static',
          ip: '192.168.1.1',
          prefix: null,
          subnet_mask: '255.255.255.0',
          gateway: '-',
          dns: '-',
        },
        {
          nama: 'PC0',
          mode: 'static',
          ip: '192.168.1.2',
          prefix: null,
          subnet_mask: '255.255.255.0',
          gateway: '-',
          dns: '192.168.1.1',
        },
        {
          nama: 'PC1',
          mode: 'static',
          ip: '192.168.1.3',
          prefix: null,
          subnet_mask: '255.255.255.0',
          gateway: '-',
          dns: '192.168.1.1',
        },
      ],
    });

    // Verifikasi Komponen Hasil Tampil:
    // 1. Ringkasan
    expect(await screen.findByText(/3 Node Terdaftar/i)).toBeInTheDocument();
    expect(screen.getAllByText(/1 Segmen/i).length).toBeGreaterThanOrEqual(1);

    // 2. Diketahui
    expect(screen.getByText('Total Perangkat Terdaftar')).toBeInTheDocument();
    expect(screen.getByText('3 unit (3 Static, 0 DHCP)')).toBeInTheDocument();

    // 3. Langkah
    expect(
      screen.getByText(/Identifikasi mode pengalamatan dan konversi subnet mask tiap perangkat/i)
    ).toBeInTheDocument();

    // 4. ResultTable memuat Server 192.168.1.1, PC0 192.168.1.2, PC1 192.168.1.3 dengan DNS 192.168.1.1
    expect(screen.getByText('Server')).toBeInTheDocument();
    expect(screen.getByText('PC0')).toBeInTheDocument();
    expect(screen.getByText('192.168.1.2')).toBeInTheDocument();
    expect(screen.getByText('PC1')).toBeInTheDocument();
    expect(screen.getByText('192.168.1.3')).toBeInTheDocument();
    expect(screen.getAllByText('192.168.1.1').length).toBeGreaterThanOrEqual(3);

    // 5. Kesimpulan
    expect(screen.getByText(/Tabel IP perangkat berhasil disusun untuk 3 perangkat/i)).toBeInTheDocument();

    // 6. Pastikan TIDAK ADA elemen karangan Stitch (simulasi uji ping / terminal ping)
    expect(screen.queryByText(/Verifikasi Koneksi & Panduan Uji Ping/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Command Prompt/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/ping 192.168.1.1/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/SEGMENTASI AKTIF/i)).not.toBeInTheDocument();
  });
});
