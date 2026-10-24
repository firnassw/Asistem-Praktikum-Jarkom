import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { Konversi } from '../pages/Konversi';
import { api } from '../services/api';

vi.mock('../services/api', () => ({
  api: {
    hitungKonversi: vi.fn(),
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

const mockKonversiResponse = {
  fitur: 'konversi',
  diketahui: [
    { label: 'Nilai Masukan', nilai: '10101100' },
    { label: 'Basis Asal', nilai: 'Basis 2 (Biner)' },
    { label: 'Mode Konversi', nilai: 'Tunggal (1 Oktet / Bilangan)' },
  ],
  langkah: [
    {
      judul: 'Petakan Digit Biner ke Bobot Posisi (128 sampai 1) dan Jumlahkan Bit 1',
      penjelasan: 'Petakan bit biner ke tabel bobot posisi pangkat dua.',
      rumus: '128 + 32 + 8 + 4 = 172',
      tabel: {
        tipe: 'tabel_bit_8',
        tabel_bit: [
          { pangkat: '2^7', bobot: 128, bit: 1, aktif: true, nilai: 128 },
          { pangkat: '2^6', bobot: 64, bit: 0, aktif: false, nilai: 0 },
          { pangkat: '2^5', bobot: 32, bit: 1, aktif: true, nilai: 32 },
          { pangkat: '2^4', bobot: 16, bit: 0, aktif: false, nilai: 0 },
          { pangkat: '2^3', bobot: 8, bit: 1, aktif: true, nilai: 8 },
          { pangkat: '2^2', bobot: 4, bit: 1, aktif: true, nilai: 4 },
          { pangkat: '2^1', bobot: 2, bit: 0, aktif: false, nilai: 0 },
          { pangkat: '2^0', bobot: 1, bit: 0, aktif: false, nilai: 0 },
        ],
        bobot_aktif: [128, 32, 8, 4],
        rumus: '128 + 32 + 8 + 4 = 172',
        desimal: '172',
      },
      hasil: 'Nilai desimal = 172',
    },
    {
      judul: 'Konversi ke Heksadesimal (Pengelompokan 4-Bit / Nibble)',
      penjelasan: 'Kelompokkan digit biner menjadi 2 kelompok 4-bit (nibble).',
      rumus: 'Biner 10101100 → Heksadesimal AC',
      tabel: {
        tipe: 'nibble_split',
        high_nibble: '1010',
        low_nibble: '1100',
        heksa: 'AC',
      },
      hasil: 'Nilai heksadesimal = AC (0xAC)',
    },
  ],
  hasil_akhir: {
    biner: '10101100',
    oktal: '254',
    desimal: '172',
    heksadesimal: 'AC',
    heksadesimal_prefixed: '0xAC',
    tabel_bit: [
      { pangkat: '2^7', bobot: 128, bit: 1, aktif: true, nilai: 128 },
      { pangkat: '2^6', bobot: 64, bit: 0, aktif: false, nilai: 0 },
      { pangkat: '2^5', bobot: 32, bit: 1, aktif: true, nilai: 32 },
      { pangkat: '2^4', bobot: 16, bit: 0, aktif: false, nilai: 0 },
      { pangkat: '2^3', bobot: 8, bit: 1, aktif: true, nilai: 8 },
      { pangkat: '2^2', bobot: 4, bit: 1, aktif: true, nilai: 4 },
      { pangkat: '2^1', bobot: 2, bit: 0, aktif: false, nilai: 0 },
      { pangkat: '2^0', bobot: 1, bit: 0, aktif: false, nilai: 0 },
    ],
    bobot_aktif: [128, 32, 8, 4],
    rumus_penjumlahan: '128 + 32 + 8 + 4 = 172',
    pembagian_biner: [],
    pembagian_oktal: [],
    pembagian_heksa: [],
    mode_ipv4: false,
    tabel: [
      { no: 1, basis: 'Basis 2 (Biner)', notasi: '2', nilai: '10101100', keterangan: '8 bit' },
      { no: 2, basis: 'Basis 8 (Oktal)', notasi: '8', nilai: '254', keterangan: 'Kelompok 3 bit' },
      { no: 3, basis: 'Basis 10 (Desimal)', notasi: '10', nilai: '172', keterangan: 'Rentang 0–255' },
      { no: 4, basis: 'Basis 16 (Heksadesimal)', notasi: '16', nilai: 'AC (0xAC)', keterangan: 'Kelompok 4 bit (nibble)' },
    ],
  },
  kesimpulan:
    'Bilangan 10101100 (Basis 2) setara dengan desimal 172, heksadesimal AC (0xAC), dan oktal 254. Bit aktif pada tabel posisi 8-bit adalah 128, 32, 8, 4 dengan total akumulasi 172.',
  peringatan: [],
};

describe('Halaman Konversi Basis', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('merender header band, parameter formulir, dan tombol hitung', () => {
    render(
      <BrowserRouter>
        <Konversi />
      </BrowserRouter>
    );

    // Header band
    expect(screen.getByRole('heading', { level: 1, name: /Konversi basis/i })).toBeInTheDocument();
    expect(screen.getByText(/Ubah bilangan antar basis biner/i)).toBeInTheDocument();

    // Formulir
    expect(screen.getByLabelText(/Nilai Masukan/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Basis 2 \(Biner\)/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Basis 10 \(Desimal\)/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^Hitung$/i })).toBeInTheDocument();
  });

  it('mengisi contoh Modul 2 (10101100 basis 2), merender hasil desimal 172, heksadesimal AC, dan tabel bit 128..1', async () => {
    (api.hitungKonversi as any).mockResolvedValue(mockKonversiResponse);

    render(
      <BrowserRouter>
        <Konversi />
      </BrowserRouter>
    );

    // Klik tombol Isi contoh Modul 2
    const btnContoh = screen.getByRole('button', { name: /Isi contoh Modul 2/i });
    fireEvent.click(btnContoh);

    await waitFor(() => {
      expect(api.hitungKonversi).toHaveBeenCalledWith({
        nilai: '10101100',
        basis_asal: 2,
        mode_ipv4: false,
      });
    });

    // Periksa Ringkasan Nilai Kartu
    await waitFor(() => {
      expect(screen.getAllByText('172').length).toBeGreaterThan(0);
      expect(screen.getAllByText('0xAC').length).toBeGreaterThan(0);
      expect(screen.getAllByText('254').length).toBeGreaterThan(0);
    });

    // Periksa Tabel Posisi Bit 8-Bit
    expect(screen.getByTestId('bit-table-card')).toBeInTheDocument();
    expect(screen.getAllByText('128 + 32 + 8 + 4 = 172').length).toBeGreaterThanOrEqual(1);

    // Periksa Langkah Pengerjaan
    expect(screen.getByText(/Petakan Digit Biner ke Bobot Posisi/i)).toBeInTheDocument();
    expect(screen.getByText(/Konversi ke Heksadesimal/i)).toBeInTheDocument();

    // Periksa Tabel Hasil Akhir
    expect(screen.getByText(/Tabel Ringkasan Hasil Konversi/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Salin tabel/i })).toBeInTheDocument();

    // Periksa Kesimpulan
    expect(screen.getByText(/Bilangan 10101100 \(Basis 2\) setara dengan desimal 172/i)).toBeInTheDocument();
  });

  it('memastikan urutan tampilan hasil: Ringkasan -> Diketahui -> Langkah -> Tabel Hasil -> Kesimpulan', async () => {
    (api.hitungKonversi as any).mockResolvedValue(mockKonversiResponse);

    render(
      <BrowserRouter>
        <Konversi />
      </BrowserRouter>
    );

    const btnContoh = screen.getByRole('button', { name: /Isi contoh Modul 2/i });
    fireEvent.click(btnContoh);

    await waitFor(() => {
      expect(screen.getByTestId('bit-table-card')).toBeInTheDocument();
    });

    // Cari posisi teks di dalam DOM untuk memverifikasi urutan
    const bitTableCard = screen.getByTestId('bit-table-card');
    const diketahuiSection = screen.getByText('Diketahui');
    const langkahHeading = screen.getByText(/Langkah Pengerjaan Soal/i);
    const resultTableHeading = screen.getByText(/Tabel Ringkasan Hasil Konversi/i);
    const conclusionHeading = screen.getByText(/Kesimpulan/i);

    // Bandingkan posisi dokumen (Node.DOCUMENT_POSITION_FOLLOWING = 4)
    expect(bitTableCard.compareDocumentPosition(diketahuiSection) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(diketahuiSection.compareDocumentPosition(langkahHeading) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(langkahHeading.compareDocumentPosition(resultTableHeading) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(resultTableHeading.compareDocumentPosition(conclusionHeading) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  it('menolak input kosong dengan pesan validasi', async () => {
    render(
      <BrowserRouter>
        <Konversi />
      </BrowserRouter>
    );

    const input = screen.getByLabelText(/Nilai Masukan/i);
    fireEvent.change(input, { target: { value: '' } });

    const btnHitung = screen.getByRole('button', { name: /^Hitung$/i });
    fireEvent.click(btnHitung);

    expect(await screen.findByText(/Nilai masukan tidak boleh kosong/i)).toBeInTheDocument();
    expect(api.hitungKonversi).not.toHaveBeenCalled();
  });
});
