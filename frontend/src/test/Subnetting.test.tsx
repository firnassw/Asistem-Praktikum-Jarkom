import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { Subnetting } from '../pages/Subnetting';
import { api } from '../services/api';

vi.mock('../services/api', () => ({
  api: {
    hitungSubnet: vi.fn(),
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

const mockSubnetResponse = {
  fitur: 'subnet',
  diketahui: [
    { label: 'Alamat IP', nilai: '192.168.0.5' },
    { label: 'Subnet Mask', nilai: '255.255.255.224 (/27)' },
    { label: 'Kelas Alamat', nilai: 'Kelas C' },
  ],
  langkah: [
    {
      judul: 'Ubah IP dan subnet mask ke bentuk biner',
      penjelasan: 'Konversikan setiap oktet alamat IP dan subnet mask ke format 8-bit biner.',
      rumus: null,
      tabel: {
        tipe: 'biner_dua_warna',
        ip_biner: '11000000.10101000.00000000.00000101',
        mask_biner: '11111111.11111111.11111111.11100000',
        prefix: 27,
        bit_host: 5,
        ip_desimal: '192.168.0.5',
        mask_desimal: '255.255.255.224',
      },
      hasil: 'IP: 192.168.0.5 | Subnet Mask: 255.255.255.224',
    },
    {
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
    },
    {
      judul: 'Tentukan invers subnet mask (wildcard mask)',
      penjelasan: 'Balikkan seluruh bit pada subnet mask.',
      rumus: 'Invers Mask = NOT subnet mask',
      tabel: {
        tipe: 'operasi_biner',
        operasi: 'NOT',
        op1: '11111111.11111111.11111111.11100000',
        op1_label: 'Mask (255.255.255.224)',
        hasil_biner: '00000000.00000000.00000000.00011111',
        hasil_label: 'Invers (0.0.0.31)',
      },
      hasil: 'Invers Subnet Mask = 0.0.0.31',
    },
    {
      judul: 'Hitung Broadcast Address: BA = NA OR invers mask',
      penjelasan: 'Lakukan operasi logika Boolean OR antara Network Address dan invers subnet mask.',
      rumus: 'BA = NA OR invers mask',
      tabel: {
        tipe: 'operasi_biner',
        operasi: 'OR',
        op1: '11000000.10101000.00000000.00000000',
        op1_label: 'NA (192.168.0.0)',
        op2: '00000000.00000000.00000000.00011111',
        op2_label: 'Invers (0.0.0.31)',
        hasil_biner: '11000000.10101000.00000000.00011111',
        hasil_label: 'BA (192.168.0.31)',
      },
      hasil: 'Broadcast Address (BA) = 192.168.0.31',
    },
    {
      judul: 'Hitung jumlah subnet, host per subnet, dan blok subnet',
      penjelasan: 'Tentukan kapasitas dan segmentasi jaringan.',
      rumus: 'Subnet = 2^3 = 8 | Host = 2^5 - 2 = 30 | Blok = 256 - 224 = 32',
      tabel: {
        tipe: 'karakteristik',
        x: 3,
        y: 5,
        oktet_ke: 4,
        nilai_oktet_mask: 224,
        jumlah_subnet: 8,
        host_per_subnet: 30,
        blok_subnet: 32,
      },
      hasil: 'Subnet: 8 | Host valid: 30 | Blok: 32',
    },
  ],
  hasil_akhir: {
    ringkasan: {
      alamat_ip: '192.168.0.5',
      prefix: 27,
      subnet_mask: '255.255.255.224',
      na: '192.168.0.0',
      ba: '192.168.0.31',
      host_pertama: '192.168.0.1',
      host_terakhir: '192.168.0.30',
      host_per_subnet: 30,
      jumlah_subnet: 8,
      blok_subnet: 32,
      kelas: 'C',
    },
    tabel: [
      {
        no: 1,
        subnet: '192.168.0.0/27',
        na: '192.168.0.0',
        host_pertama: '192.168.0.1',
        host_terakhir: '192.168.0.30',
        broadcast: '192.168.0.31',
        aktif: true,
      },
    ],
    total_subnets: 8,
    ringkasan_tabel: false,
  },
  kesimpulan:
    'Alamat IP 192.168.0.5 dengan prefix /27 memiliki Network Address 192.168.0.0 dan Broadcast Address 192.168.0.31. Rentang alamat host valid adalah 192.168.0.1 hingga 192.168.0.30 dengan kapasitas 30 host per subnet. Terbentuk 8 subnet dengan ukuran blok 32 alamat.',
  peringatan: [],
};

describe('Halaman Subnetting', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('merender header band dan formulir parameter subnetting', () => {
    render(
      <BrowserRouter>
        <Subnetting />
      </BrowserRouter>
    );

    // Header Band
    expect(screen.getByRole('heading', { level: 1, name: /Subnetting/i })).toBeInTheDocument();
    expect(
      screen.getByText(/Hitung NA, BA, dan semua subnet dengan langkah sistematis/i)
    ).toBeInTheDocument();

    // Formulir
    expect(screen.getByLabelText(/Alamat IP/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Panjang Prefix/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^Hitung$/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Isi contoh/i })).toBeInTheDocument();
  });

  it('menjalankan perhitungan saat tombol Isi contoh diklik', async () => {
    (api.hitungSubnet as any).mockResolvedValueOnce(mockSubnetResponse);

    render(
      <BrowserRouter>
        <Subnetting />
      </BrowserRouter>
    );

    const isiContohBtn = screen.getByRole('button', { name: /Isi contoh/i });
    fireEvent.click(isiContohBtn);

    await waitFor(() => {
      expect(api.hitungSubnet).toHaveBeenCalledWith({
        alamat_ip: '192.168.0.5',
        prefix: 27,
        subnet_mask: null,
      });
    });

    // Menampilkan Ringkasan & Tabel
    expect(screen.getAllByText('192.168.0.0').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('192.168.0.31').length).toBeGreaterThanOrEqual(1);

    // Menampilkan 5 Langkah
    expect(
      screen.getByRole('heading', { name: /Ubah IP dan subnet mask ke bentuk biner/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: /Hitung Network Address: NA = IP AND subnet mask/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: /Tentukan invers subnet mask/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: /Hitung Broadcast Address: BA = NA OR invers mask/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: /Hitung jumlah subnet, host per subnet/i })
    ).toBeInTheDocument();

    // Menampilkan Kesimpulan
    expect(screen.getByText(/Kesimpulan/i)).toBeInTheDocument();
    expect(screen.getByText(/Terbentuk 8 subnet dengan ukuran blok 32 alamat/i)).toBeInTheDocument();
  });

  it('menampilkan pesan validasi jika alamat IP kosong', async () => {
    render(
      <BrowserRouter>
        <Subnetting />
      </BrowserRouter>
    );

    const ipInput = screen.getByLabelText(/Alamat IP/i);
    fireEvent.change(ipInput, { target: { value: '' } });

    const hitungBtn = screen.getByRole('button', { name: /^Hitung$/i });
    fireEvent.click(hitungBtn);

    expect(screen.getByText(/Alamat IP harus diisi/i)).toBeInTheDocument();
  });
});
