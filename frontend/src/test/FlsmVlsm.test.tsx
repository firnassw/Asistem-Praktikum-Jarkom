import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { FlsmVlsm } from '../pages/FlsmVlsm';
import { api } from '../services/api';

vi.mock('../services/api', () => ({
  api: {
    hitungVlsm: vi.fn(),
    hitungFlsm: vi.fn(),
  },
  ApiException: class ApiException extends Error {
    field?: string;
    kode?: string;
    prefix_saran?: number;
    constructor(err: any) {
      super(err.pesan);
      this.field = err.field;
      this.kode = err.kode;
      this.prefix_saran = err.prefix_saran;
    }
  },
}));

// Mock Data Jawaban VLSM G-JAR-04
const mockVlsmResponse = {
  fitur: 'vlsm',
  diketahui: [
    { label: 'Induk Jaringan', nilai: '192.168.64.0/24 (Kapasitas: 256 IP)' },
    { label: 'Metode Alokasi', nilai: 'VLSM (Variable Length Subnet Mask)' },
    { label: 'Daftar Kebutuhan', nilai: 'Lab Jaringan: 64 host, Lab Komputasi: 24 host, Lab Mulmed: 8 host' },
  ],
  langkah: [
    {
      judul: 'Urutkan kebutuhan host dari terbesar ke terkecil',
      penjelasan: 'Metode VLSM memprioritaskan alokasi dari host terbanyak agar tidak terjadi fragmentasi.',
      rumus: null,
      tabel: null,
      hasil: 'Urutan: Lab Jaringan (64) → Lab Komputasi (24) → Lab Mulmed (8)',
    },
    {
      judul: 'Tentukan prefix dan ukuran blok tiap kebutuhan',
      penjelasan: 'Rumus: host + 2 <= 2^y, prefix = 32 - y',
      rumus: 'Lab Jaringan: 64+2 <= 128 (/25) | Lab Komputasi: 24+2 <= 32 (/27) | Lab Mulmed: 8+2 <= 16 (/28)',
      tabel: null,
      hasil: 'Prefix ditentukan: /25, /27, /28',
    },
    {
      judul: 'Alokasikan blok alamat secara berurutan',
      penjelasan: 'Tempatkan blok subnet secara kontigu mulai dari alamat induk 192.168.64.0.',
      rumus: 'NA = cursor, BA = cursor + blok - 1',
      tabel: {
        tipe: 'alokasi_blok_vlsm',
        baris: [
          {
            no: 1,
            nama: 'Lab Jaringan',
            host_diminta: 64,
            host_tersedia: 126,
            prefix: 25,
            subnet_mask: '255.255.255.128',
            subnet: '192.168.64.0',
            host_pertama: '192.168.64.1',
            host_terakhir: '192.168.64.126',
            broadcast: '192.168.64.127',
            status: 'Terpakai',
            ukuran_blok: 128,
            warna: '#8BD0FC',
          },
          {
            no: 2,
            nama: 'Lab Komputasi',
            host_diminta: 24,
            host_tersedia: 30,
            prefix: 27,
            subnet_mask: '255.255.255.224',
            subnet: '192.168.64.128',
            host_pertama: '192.168.64.129',
            host_terakhir: '192.168.64.158',
            broadcast: '192.168.64.159',
            status: 'Terpakai',
            ukuran_blok: 32,
            warna: '#FCE76C',
          },
          {
            no: 3,
            nama: 'Lab Mulmed',
            host_diminta: 8,
            host_tersedia: 14,
            prefix: 28,
            subnet_mask: '255.255.255.240',
            subnet: '192.168.64.160',
            host_pertama: '192.168.64.161',
            host_terakhir: '192.168.64.174',
            broadcast: '192.168.64.175',
            status: 'Terpakai',
            ukuran_blok: 16,
            warna: '#FF8F5C',
          },
        ],
      },
      hasil: 'Total dialokasikan: 176/256 IP | Sisa bebas: 80 IP',
    },
  ],
  hasil_akhir: {
    ringkasan: {
      metode: 'VLSM',
      total_ruangan: 3,
      ruangan_terakomodasi: 3,
      kapasitas_induk: 256,
      total_alamat_dialokasikan: 176,
      sisa_alamat: 80,
      persen_terpakai: 68,
      sisa_rentang: {
        mulai: '192.168.64.176',
        akhir: '192.168.64.255',
        jumlah: 80,
      },
    },
    tabel: [
      {
        no: 1,
        nama: 'Lab Jaringan',
        host_diminta: 64,
        host_tersedia: 126,
        prefix: 25,
        subnet_mask: '255.255.255.128',
        subnet: '192.168.64.0',
        host_pertama: '192.168.64.1',
        host_terakhir: '192.168.64.126',
        broadcast: '192.168.64.127',
        status: 'Terpakai',
        ukuran_blok: 128,
        warna: '#8BD0FC',
      },
      {
        no: 2,
        nama: 'Lab Komputasi',
        host_diminta: 24,
        host_tersedia: 30,
        prefix: 27,
        subnet_mask: '255.255.255.224',
        subnet: '192.168.64.128',
        host_pertama: '192.168.64.129',
        host_terakhir: '192.168.64.158',
        broadcast: '192.168.64.159',
        status: 'Terpakai',
        ukuran_blok: 32,
        warna: '#FCE76C',
      },
      {
        no: 3,
        nama: 'Lab Mulmed',
        host_diminta: 8,
        host_tersedia: 14,
        prefix: 28,
        subnet_mask: '255.255.255.240',
        subnet: '192.168.64.160',
        host_pertama: '192.168.64.161',
        host_terakhir: '192.168.64.174',
        broadcast: '192.168.64.175',
        status: 'Terpakai',
        ukuran_blok: 16,
        warna: '#FF8F5C',
      },
    ],
  },
  kesimpulan:
    'Alokasi VLSM untuk jaringan induk 192.168.64.0/24 berhasil mengakomodasi seluruh 3 ruangan dengan menggunakan 176 dari 256 alamat IP (68%). Tersisa 80 alamat IP bebas (192.168.64.176 s.d. 192.168.64.255) yang siap digunakan untuk ekspansi jaringan mendatang.',
  peringatan: [],
};

describe('Halaman FlsmVlsm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('merender header band, parameter formulir, dan tombol hitung', () => {
    render(
      <MemoryRouter>
        <FlsmVlsm />
      </MemoryRouter>
    );

    // Header band title and single-sentence description
    expect(screen.getByRole('heading', { level: 1, name: /FLSM dan VLSM/i })).toBeInTheDocument();
    expect(
      screen.getByText(
        /Bagi jaringan induk menjadi beberapa subnet ukuran tetap \(FLSM\) atau sesuai kebutuhan host \(VLSM\) langkah demi langkah\./i
      )
    ).toBeInTheDocument();

    // Form parameter header
    expect(screen.getByText(/Parameter Pembagian Subnet/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Alamat Induk & Prefix Induk/i)).toBeInTheDocument();

    // Toggle Metode Alokasi
    expect(screen.getByRole('button', { name: /VLSM \(Variabel\)/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /FLSM \(Tetap\)/i })).toBeInTheDocument();

    // Tombol Hitung dan Isi Contoh
    expect(screen.getByRole('button', { name: /Hitung VLSM/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Isi contoh Modul 2/i })).toBeInTheDocument();
  });

  it('mengisi contoh Modul 2 dan mengeksekusi perhitungan VLSM (G-JAR-04)', async () => {
    (api.hitungVlsm as any).mockResolvedValueOnce(mockVlsmResponse);

    render(
      <MemoryRouter>
        <FlsmVlsm />
      </MemoryRouter>
    );

    const btnContoh = screen.getByRole('button', { name: /Isi contoh Modul 2/i });
    fireEvent.click(btnContoh);

    await waitFor(() => {
      expect(api.hitungVlsm).toHaveBeenCalledWith({
        alamat_induk: '192.168.64.0',
        prefix_induk: 24,
        kebutuhan: [
          { nama: 'Lab Jaringan', host: 64 },
          { nama: 'Lab Komputasi', host: 24 },
          { nama: 'Lab Mulmed', host: 8 },
        ],
      });
    });

    // Cek hasil VLSM G-JAR-04 ditampilkan
    await waitFor(() => {
      expect(screen.getByText(/Ringkasan Alokasi VLSM/i)).toBeInTheDocument();
      expect(screen.getByText('176 / 256 IP')).toBeInTheDocument();
      expect(screen.getByText('80 IP Bebas')).toBeInTheDocument();
      expect(screen.getByText('192.168.64.0')).toBeInTheDocument();
      expect(screen.getByText('192.168.64.128')).toBeInTheDocument();
      expect(screen.getByText('192.168.64.160')).toBeInTheDocument();
    });

    // Cek teks kesimpulan
    expect(screen.getByText(/Alokasi VLSM untuk jaringan induk 192.168.64.0\/24 berhasil/i)).toBeInTheDocument();
  });

  it('memastikan urutan seksi hasil: Ringkasan -> Diketahui -> Langkah -> Tabel -> Kesimpulan', async () => {
    (api.hitungVlsm as any).mockResolvedValueOnce(mockVlsmResponse);

    const { container } = render(
      <MemoryRouter>
        <FlsmVlsm />
      </MemoryRouter>
    );

    fireEvent.click(screen.getByRole('button', { name: /Isi contoh Modul 2/i }));

    await waitFor(() => {
      expect(screen.getByText(/Ringkasan Alokasi VLSM/i)).toBeInTheDocument();
    });

    // Periksa indeks kemunculan teks di DOM
    const html = container.innerHTML;
    const idxRingkasan = html.indexOf('Ringkasan Alokasi VLSM');
    const idxDiketahui = html.indexOf('Diketahui');
    const idxLangkah = html.indexOf('Langkah Pengerjaan');
    const idxTabel = html.indexOf('Tabel Alokasi Subnet VLSM');
    const idxKesimpulan = html.indexOf('Kesimpulan');

    expect(idxRingkasan).toBeGreaterThan(-1);
    expect(idxDiketahui).toBeGreaterThan(idxRingkasan);
    expect(idxLangkah).toBeGreaterThan(idxDiketahui);
    expect(idxTabel).toBeGreaterThan(idxLangkah);
    expect(idxKesimpulan).toBeGreaterThan(idxTabel);
  });

  it('menangani penolakan FLSM_TIDAK_MUNGKIN (G-JAR-05) beserta tombol aksi sekundernya', async () => {
    // Buat exception FLSM_TIDAK_MUNGKIN
    const { ApiException } = await import('../services/api');
    const err = new ApiException({
      kode: 'FLSM_TIDAK_MUNGKIN',
      pesan:
        'Induk /24 hanya memuat 2 subnet /25, padahal dibutuhkan 3. Pakai induk /23, pilih VLSM, atau aktifkan gaya modul',
      field: 'prefix_induk',
      prefix_saran: 23,
    });

    (api.hitungFlsm as any).mockRejectedValueOnce(err);

    render(
      <MemoryRouter>
        <FlsmVlsm />
      </MemoryRouter>
    );

    // Ganti metode ke FLSM
    fireEvent.click(screen.getByRole('button', { name: /FLSM \(Tetap\)/i }));

    // Klik Hitung FLSM
    fireEvent.click(screen.getByRole('button', { name: /Hitung FLSM/i }));

    // Cek error card muncul
    await waitFor(() => {
      expect(
        screen.getByText(/Peringatan Batasan FLSM \(Alokasi Tetap Tidak Muat\)/i)
      ).toBeInTheDocument();
      expect(
        screen.getByText(/Induk \/24 hanya memuat 2 subnet \/25, padahal dibutuhkan 3/i)
      ).toBeInTheDocument();
    });

    // 3 tombol aksi secondary harus tersedia
    const btnPakaiInduk = screen.getByRole('button', { name: /Pakai induk \/23/i });
    const btnPindahVlsm = screen.getByRole('button', { name: /Pindah ke VLSM/i });
    const btnGayaModul = screen.getByRole('button', { name: /Aktifkan gaya modul/i });

    expect(btnPakaiInduk).toBeInTheDocument();
    expect(btnPindahVlsm).toBeInTheDocument();
    expect(btnGayaModul).toBeInTheDocument();

    // Uji klik tombol "Pakai induk /23"
    (api.hitungFlsm as any).mockResolvedValueOnce({
      ...mockVlsmResponse,
      fitur: 'flsm',
      hasil_akhir: {
        ringkasan: {
          metode: 'FLSM',
          total_subnet_terbentuk: 4,
          subnet_terpakai: 3,
          subnet_cadangan: 1,
          kapasitas_induk: 512,
          total_alamat_dialokasikan: 512,
          sisa_alamat: 0,
        },
        tabel: [],
      },
    });

    fireEvent.click(btnPakaiInduk);

    await waitFor(() => {
      expect(api.hitungFlsm).toHaveBeenCalledWith(
        expect.objectContaining({
          prefix_induk: 23,
        })
      );
    });
  });

  it('dapat menambah dan menghapus baris ruangan', () => {
    render(
      <MemoryRouter>
        <FlsmVlsm />
      </MemoryRouter>
    );

    // Awalnya ada 3 ruangan
    expect(screen.getByDisplayValue('Lab Jaringan')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Lab Komputasi')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Lab Mulmed')).toBeInTheDocument();

    // Klik Tambah baris
    const btnTambah = screen.getByRole('button', { name: /Tambah baris/i });
    fireEvent.click(btnTambah);

    expect(screen.getByDisplayValue('Ruangan 4')).toBeInTheDocument();

    // Hapus satu baris
    const deleteButtons = screen.getAllByTitle('Hapus baris');
    expect(deleteButtons.length).toBe(4);
    fireEvent.click(deleteButtons[3]);

    expect(screen.queryByDisplayValue('Ruangan 4')).not.toBeInTheDocument();
  });
});
