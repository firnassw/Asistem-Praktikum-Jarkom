import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { Rencana } from '../pages/Rencana';
import { api } from '../services/api';

vi.mock('../services/api', () => ({
  api: {
    hitungRencana: vi.fn(),
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

// Mock response for G-JAR-06 (with comparison to G-JAR-07)
const mockRencanaResponse = {
  fitur: 'rencana',
  diketahui: [
    { label: 'Jaringan Induk', nilai: '192.168.50.0/24 (Kapasitas: 256 IP) dari NIM 50' },
    { label: 'Jumlah Ruangan', nilai: '5 ruangan' },
    { label: 'Hitung Gateway', nilai: 'Tidak (+0 host)' },
    { label: 'Cadangan Host', nilai: '0%' },
    { label: 'Metode Alokasi', nilai: 'VLSM (Variable Length Subnet Mask)' },
  ],
  langkah: [
    {
      judul: 'Tentukan IP Global induk dan urutkan kebutuhan ruangan',
      penjelasan: 'IP Global induk dibentuk dari dua digit NIM 50 menjadi 192.168.50.0/24.',
      rumus: 'device + cadangan (0%) + gateway (0)',
      tabel: null,
      hasil: 'Urutan: Lab Basis Data (60) → Lab PPSI (34) → Ruang Dosen (30) → Ruang Seminar (8) → Server (1)',
    },
    {
      judul: 'Tentukan prefix tiap ruangan',
      penjelasan: 'Rumus: host_dibutuhkan + 2 <= 2^y, prefix = 32 - y',
      rumus: 'Lab Basis Data: 60+2 <= 64 (/26) | Ruang Dosen: 30+2 <= 32 (/27)',
      tabel: null,
      hasil: 'Prefix ditentukan: /26, /26, /27, /28, /30',
    },
    {
      judul: 'Alokasikan blok subnet secara berurutan',
      penjelasan: 'Tempatkan blok subnet secara kontigu mulai dari alamat induk 192.168.50.0.',
      rumus: 'NA = cursor, BA = cursor + blok - 1',
      tabel: null,
      hasil: 'Alokasi selesai. 180 dari 256 IP terpakai, sisa 76 IP.',
    },
  ],
  hasil_akhir: {
    ringkasan: {
      total_subnet: 5,
      total_host_diminta: 133,
      total_alamat_dialokasikan: 180,
      kapasitas_induk: 256,
      sisa_alamat: 76,
      persen_terpakai: 70,
      ruangan_terakomodasi: 5,
    },
    tabel: [
      {
        no: 1,
        nama: 'Lab Basis Data',
        device: 60,
        host_dibutuhkan: 60,
        host_tersedia: 62,
        prefix: 26,
        subnet_mask: '255.255.255.192',
        subnet: '192.168.50.0',
        host_pertama: '192.168.50.1',
        host_terakhir: '192.168.50.62',
        usulan_gateway: null,
        broadcast: '192.168.50.63',
        status: 'Terpakai',
        ukuran_blok: 64,
        warna: '#8BD0FC',
      },
      {
        no: 2,
        nama: 'Lab PPSI',
        device: 34,
        host_dibutuhkan: 34,
        host_tersedia: 62,
        prefix: 26,
        subnet_mask: '255.255.255.192',
        subnet: '192.168.50.64',
        host_pertama: '192.168.50.65',
        host_terakhir: '192.168.50.126',
        usulan_gateway: null,
        broadcast: '192.168.50.127',
        status: 'Terpakai',
        ukuran_blok: 64,
        warna: '#FCE76C',
      },
      {
        no: 3,
        nama: 'Ruang Dosen',
        device: 30,
        host_dibutuhkan: 30,
        host_tersedia: 30,
        prefix: 27,
        subnet_mask: '255.255.255.224',
        subnet: '192.168.50.128',
        host_pertama: '192.168.50.129',
        host_terakhir: '192.168.50.158',
        usulan_gateway: null,
        broadcast: '192.168.50.159',
        status: 'Terpakai',
        ukuran_blok: 32,
        warna: '#FF8F5C',
      },
      {
        no: 4,
        nama: 'Ruang Seminar',
        device: 8,
        host_dibutuhkan: 8,
        host_tersedia: 14,
        prefix: 28,
        subnet_mask: '255.255.255.240',
        subnet: '192.168.50.160',
        host_pertama: '192.168.50.161',
        host_terakhir: '192.168.50.174',
        usulan_gateway: null,
        broadcast: '192.168.50.175',
        status: 'Terpakai',
        ukuran_blok: 16,
        warna: '#C9D0E4',
      },
      {
        no: 5,
        nama: 'Server',
        device: 1,
        host_dibutuhkan: 1,
        host_tersedia: 2,
        prefix: 30,
        subnet_mask: '255.255.255.252',
        subnet: '192.168.50.176',
        host_pertama: '192.168.50.177',
        host_terakhir: '192.168.50.178',
        usulan_gateway: null,
        broadcast: '192.168.50.179',
        status: 'Terpakai',
        ukuran_blok: 4,
        warna: '#8BD0FC',
      },
    ],
    perbandingan_gateway: {
      ruangan_berubah: [
        {
          nama: 'Ruang Dosen',
          device: 30,
          host_tanpa: 30,
          host_dengan: 31,
          prefix_tanpa: 27,
          prefix_dengan: 26,
          host_tersedia_tanpa: 30,
          host_tersedia_dengan: 62,
        },
      ],
      tanpa_gateway: {
        total_alamat_dialokasikan: 180,
        kapasitas_induk: 256,
        sisa_alamat: 76,
        persen_terpakai: 70,
        ruangan_terakomodasi: 5,
        tabel: [
          {
            no: 1,
            nama: 'Lab Basis Data',
            device: 60,
            host_dibutuhkan: 60,
            host_tersedia: 62,
            prefix: 26,
            subnet_mask: '255.255.255.192',
            subnet: '192.168.50.0',
            host_pertama: '192.168.50.1',
            host_terakhir: '192.168.50.62',
            usulan_gateway: null,
            broadcast: '192.168.50.63',
            status: 'Terpakai',
            ukuran_blok: 64,
            warna: '#8BD0FC',
          },
          {
            no: 2,
            nama: 'Lab PPSI',
            device: 34,
            host_dibutuhkan: 34,
            host_tersedia: 62,
            prefix: 26,
            subnet_mask: '255.255.255.192',
            subnet: '192.168.50.64',
            host_pertama: '192.168.50.65',
            host_terakhir: '192.168.50.126',
            usulan_gateway: null,
            broadcast: '192.168.50.127',
            status: 'Terpakai',
            ukuran_blok: 64,
            warna: '#FCE76C',
          },
          {
            no: 3,
            nama: 'Ruang Dosen',
            device: 30,
            host_dibutuhkan: 30,
            host_tersedia: 30,
            prefix: 27,
            subnet_mask: '255.255.255.224',
            subnet: '192.168.50.128',
            host_pertama: '192.168.50.129',
            host_terakhir: '192.168.50.158',
            usulan_gateway: null,
            broadcast: '192.168.50.159',
            status: 'Terpakai',
            ukuran_blok: 32,
            warna: '#FF8F5C',
          },
          {
            no: 4,
            nama: 'Ruang Seminar',
            device: 8,
            host_dibutuhkan: 8,
            host_tersedia: 14,
            prefix: 28,
            subnet_mask: '255.255.255.240',
            subnet: '192.168.50.160',
            host_pertama: '192.168.50.161',
            host_terakhir: '192.168.50.174',
            usulan_gateway: null,
            broadcast: '192.168.50.175',
            status: 'Terpakai',
            ukuran_blok: 16,
            warna: '#C9D0E4',
          },
          {
            no: 5,
            nama: 'Server',
            device: 1,
            host_dibutuhkan: 1,
            host_tersedia: 2,
            prefix: 30,
            subnet_mask: '255.255.255.252',
            subnet: '192.168.50.176',
            host_pertama: '192.168.50.177',
            host_terakhir: '192.168.50.178',
            usulan_gateway: null,
            broadcast: '192.168.50.179',
            status: 'Terpakai',
            ukuran_blok: 4,
            warna: '#8BD0FC',
          },
        ],
        kesimpulan: 'Alokasi VLSM tanpa gateway menghabiskan 180 dari 256 alamat IP, menyisakan 76 IP bebas.',
      },
      dengan_gateway: {
        total_alamat_dialokasikan: 212,
        kapasitas_induk: 256,
        sisa_alamat: 44,
        persen_terpakai: 83,
        ruangan_terakomodasi: 5,
        tabel: [
          {
            no: 1,
            nama: 'Lab Basis Data',
            device: 60,
            host_dibutuhkan: 61,
            host_tersedia: 62,
            prefix: 26,
            subnet_mask: '255.255.255.192',
            subnet: '192.168.50.0',
            host_pertama: '192.168.50.1',
            host_terakhir: '192.168.50.62',
            usulan_gateway: '192.168.50.1',
            broadcast: '192.168.50.63',
            status: 'Terpakai',
            ukuran_blok: 64,
            warna: '#8BD0FC',
          },
          {
            no: 2,
            nama: 'Lab PPSI',
            device: 34,
            host_dibutuhkan: 35,
            host_tersedia: 62,
            prefix: 26,
            subnet_mask: '255.255.255.192',
            subnet: '192.168.50.64',
            host_pertama: '192.168.50.65',
            host_terakhir: '192.168.50.126',
            usulan_gateway: '192.168.50.65',
            broadcast: '192.168.50.127',
            status: 'Terpakai',
            ukuran_blok: 64,
            warna: '#FCE76C',
          },
          {
            no: 3,
            nama: 'Ruang Dosen',
            device: 30,
            host_dibutuhkan: 31,
            host_tersedia: 62,
            prefix: 26,
            subnet_mask: '255.255.255.192',
            subnet: '192.168.50.128',
            host_pertama: '192.168.50.129',
            host_terakhir: '192.168.50.190',
            usulan_gateway: '192.168.50.129',
            broadcast: '192.168.50.191',
            status: 'Terpakai',
            ukuran_blok: 64,
            warna: '#FF8F5C',
          },
          {
            no: 4,
            nama: 'Ruang Seminar',
            device: 8,
            host_dibutuhkan: 9,
            host_tersedia: 14,
            prefix: 28,
            subnet_mask: '255.255.255.240',
            subnet: '192.168.50.192',
            host_pertama: '192.168.50.193',
            host_terakhir: '192.168.50.206',
            usulan_gateway: '192.168.50.193',
            broadcast: '192.168.50.207',
            status: 'Terpakai',
            ukuran_blok: 16,
            warna: '#C9D0E4',
          },
          {
            no: 5,
            nama: 'Server',
            device: 1,
            host_dibutuhkan: 2,
            host_tersedia: 2,
            prefix: 30,
            subnet_mask: '255.255.255.252',
            subnet: '192.168.50.208',
            host_pertama: '192.168.50.209',
            host_terakhir: '192.168.50.210',
            usulan_gateway: '192.168.50.209',
            broadcast: '192.168.50.211',
            status: 'Terpakai',
            ukuran_blok: 4,
            warna: '#8BD0FC',
          },
        ],
        kesimpulan: 'Alokasi VLSM dengan gateway (+1 router host) menghabiskan 212 dari 256 alamat IP, menyisakan 44 IP bebas.',
      },
    },
    perbandingan_mode: {
      vlsm: {
        total_alamat_dialokasikan: 180,
        sisa_alamat: 76,
        persen_terpakai: 70,
        ruangan_terakomodasi: 5,
        status: 'SUKSES',
      },
      flsm: {
        total_alamat_dialokasikan: 256,
        sisa_alamat: 0,
        persen_terpakai: 100,
        ruangan_terakomodasi: 4,
        status: 'FLSM_TIDAK_MUNGKIN',
        pesan: 'FLSM membutuhkan prefix seragam /26 (64 IP/subnet). 5 ruangan butuh 320 IP, melebihi kapasitas induk 256 IP.',
      },
    },
  },
  kesimpulan:
    'Alokasi VLSM untuk 5 ruangan dengan IP dasar 192.168.50.0/24 berhasil disusun dengan efisiensi tinggi, menghabiskan 180 dari 256 alamat IP (70%) dan menyisakan 76 alamat IP bebas untuk ekspansi jaringan mendatang.',
  peringatan: ['GATEWAY_MEMBEDAKAN_HASIL'],
};

describe('Halaman Rencana Ruangan (/rencana)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('mengubah preview IP Global saat dua digit NIM diganti (mis. 05 -> 192.168.5.0/24, 50 -> 192.168.50.0/24)', () => {
    render(
      <MemoryRouter>
        <Rencana />
      </MemoryRouter>
    );

    // Default NIM adalah 50
    const nimInput = screen.getByPlaceholderText('50') as HTMLInputElement;
    expect(nimInput.value).toBe('50');
    expect(screen.getByText('192.168.50.0/24')).toBeInTheDocument();

    // Ubah ke 05
    fireEvent.change(nimInput, { target: { value: '05' } });
    expect(screen.getByText('192.168.5.0/24')).toBeInTheDocument();

    // Ubah ke 00
    fireEvent.change(nimInput, { target: { value: '00' } });
    expect(screen.getByText('192.168.0.0/24')).toBeInTheDocument();
  });

  it('menguji stepper jumlah ruangan dan tombol "Samakan semua"', () => {
    render(
      <MemoryRouter>
        <Rencana />
      </MemoryRouter>
    );

    // Default awal ada 5 ruangan
    expect(screen.getByText('Jumlah ruangan')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();

    // Klik tombol tambah [+]
    const plusBtn = screen.getByRole('button', { name: 'Tambah ruangan' });
    fireEvent.click(plusBtn);
    expect(screen.getByText('6')).toBeInTheDocument();

    // Klik tombol kurang [-]
    const minusBtn = screen.getByRole('button', { name: 'Kurangi ruangan' });
    fireEvent.click(minusBtn);
    expect(screen.getByText('5')).toBeInTheDocument();

    // Masukkan device ke baris pertama mis. 25
    const row0Device = screen.getByDisplayValue('60');
    fireEvent.change(row0Device, { target: { value: '25' } });
    expect(row0Device).toHaveValue(25);

    // Klik "Samakan semua"
    const samakanBtn = screen.getByRole('button', { name: 'Samakan semua' });
    fireEvent.click(samakanBtn);

    // Semua baris sekarang memiliki nilai 25
    const all25 = screen.getAllByDisplayValue('25');
    expect(all25.length).toBe(5);
  });

  it('mengisi data contoh G-JAR-06 saat tombol "Isi contoh" diklik', () => {
    render(
      <MemoryRouter>
        <Rencana />
      </MemoryRouter>
    );

    // Ubah data asal
    const nimInput = screen.getByPlaceholderText('50');
    fireEvent.change(nimInput, { target: { value: '12' } });

    // Klik "Isi contoh"
    const contohBtn = screen.getByRole('button', { name: 'Isi contoh' });
    fireEvent.click(contohBtn);

    // Periksa NIM terisi 50
    expect(screen.getByPlaceholderText('50')).toHaveValue('50');

    // Periksa daftar ruangan terisi
    expect(screen.getByDisplayValue('Lab Basis Data')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Lab PPSI')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Ruang Dosen')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Ruang Seminar')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Server')).toBeInTheDocument();
  });

  it('menampilkan hasil hitung, banner peringatan gateway, dan tab perbandingan gateway', async () => {
    (api.hitungRencana as any).mockResolvedValue(mockRencanaResponse);

    render(
      <MemoryRouter>
        <Rencana />
      </MemoryRouter>
    );

    // Klik Hitung
    const hitungBtn = screen.getByRole('button', { name: 'Hitung' });
    fireEvent.click(hitungBtn);

    await waitFor(() => {
      expect(api.hitungRencana).toHaveBeenCalledTimes(1);
    });

    // 1. Banner peringatan gateway muncul
    const bannerEl = screen.getByTestId('banner-peringatan-gateway');
    expect(bannerEl).toBeInTheDocument();
    expect(bannerEl).toHaveTextContent(/Perhatian: Penambahan Alamat Gateway/i);
    expect(bannerEl).toHaveTextContent(/Ruang Dosen/i);

    // 2. Ringkasan & AddressBar muncul
    const ringkasanEl = screen.getByTestId('ringkasan-rencana');
    expect(ringkasanEl).toBeInTheDocument();
    expect(ringkasanEl).toHaveTextContent(/5 subnet dialokasikan, 180 dari 256 alamat terpakai/i);
    expect(ringkasanEl).toHaveTextContent('Sisa 76 IP');

    // 3. Tab Perbandingan Gateway muncul
    expect(screen.getByText('Tanpa gateway')).toBeInTheDocument();
    expect(screen.getByText('Dengan gateway')).toBeInTheDocument();

    // Dalam kondisi default (Tanpa gateway): Ruang Dosen adalah /27
    const tableEl = screen.getByRole('table');
    expect(tableEl).toBeInTheDocument();
    expect(screen.getAllByText('/27').length).toBeGreaterThan(0);

    // Klik tab "Dengan gateway"
    const denganGatewayTab = screen.getByText('Dengan gateway');
    fireEvent.click(denganGatewayTab);

    // Di view dengan gateway: Ruang Dosen menjadi /26, total terpakai 212 IP
    expect(ringkasanEl).toHaveTextContent(/212 dari 256 alamat terpakai/i);
    // Kolom Usulan Gateway muncul
    expect(screen.getByText('Usulan Gateway')).toBeInTheDocument();
    expect(screen.getAllByText('192.168.50.129').length).toBe(2);

    // 4. Tab Perbandingan VLSM | FLSM
    expect(screen.getByText('Mode VLSM')).toBeInTheDocument();
    expect(screen.getByText('Mode FLSM')).toBeInTheDocument();

    // Klik tab Mode FLSM
    const flsmTab = screen.getByText('Mode FLSM');
    fireEvent.click(flsmTab);
    expect(screen.getByText(/FLSM Tidak Dapat Diterapkan pada Induk Ini/i)).toBeInTheDocument();

    // 5. Kesimpulan blok ada
    expect(screen.getByText(/Alokasi VLSM untuk 5 ruangan/i)).toBeInTheDocument();
  });

  it('memastikan urutan elemen hasil di area kanan mengikuti DESIGN.md', async () => {
    (api.hitungRencana as any).mockResolvedValue(mockRencanaResponse);

    const { container } = render(
      <MemoryRouter>
        <Rencana />
      </MemoryRouter>
    );

    fireEvent.click(screen.getByRole('button', { name: 'Hitung' }));

    await waitFor(() => {
      expect(api.hitungRencana).toHaveBeenCalled();
    });

    // Cari urutan elemen di kolom kanan:
    // 1. Banner Peringatan (.bg-\[\#FFF4D6\])
    // 2. Ringkasan & AddressBar (.address-bar atau ringkasan card)
    // 3. Tab Perbandingan
    // 4. Diketahui
    // 5. Kartu Langkah (StepCard)
    // 6. ResultTable
    // 7. ConclusionBlock

    const rightCol = container.querySelector('.lg\\:col-span-7');
    expect(rightCol).not.toBeNull();

    const banner = rightCol!.querySelector('[data-testid="banner-peringatan-gateway"]');
    const ringkasan = rightCol!.querySelector('[data-testid="ringkasan-rencana"]');
    const tabsGateway = rightCol!.querySelector('[data-testid="tabs-gateway"]');
    const diketahui = rightCol!.querySelector('[data-testid="diketahui-rencana"]');
    const steps = rightCol!.querySelectorAll('[data-testid="step-card"]');
    const resultTable = rightCol!.querySelector('table');
    const conclusion = rightCol!.querySelector('[data-testid="conclusion-block"]');

    expect(banner).not.toBeNull();
    expect(ringkasan).not.toBeNull();
    expect(tabsGateway).not.toBeNull();
    expect(diketahui).not.toBeNull();
    expect(steps.length).toBeGreaterThan(0);
    expect(resultTable).not.toBeNull();
    expect(conclusion).not.toBeNull();

    // Validasi urutan vertikal dalam DOM
    const elements = [banner, ringkasan, tabsGateway, diketahui, steps[0], resultTable, conclusion];
    for (let i = 0; i < elements.length - 1; i++) {
      const el1 = elements[i]!;
      const el2 = elements[i + 1]!;
      // compareDocumentPosition: Node.DOCUMENT_POSITION_FOLLOWING is 4
      const position = el1.compareDocumentPosition(el2);
      expect(position & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    }
  });
});
