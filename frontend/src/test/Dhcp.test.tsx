import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { Dhcp } from '../pages/Dhcp';
import { CodeBlock } from '../components/CodeBlock';
import { api } from '../services/api';

vi.mock('../services/api', () => ({
  api: {
    hitungDhcp: vi.fn(),
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

const mockDhcpResponse = {
  fitur: 'dhcp',
  diketahui: [
    { label: 'IP Router (Default Gateway)', nilai: '192.168.10.1' },
    { label: 'Prefix & Subnet Mask', nilai: '/24 (255.255.255.0)' },
    { label: 'Interface Router', nilai: 'fastEthernet0/0' },
    { label: 'Nama DHCP Pool', nilai: 'dhcp_server' },
    { label: 'Rentang Excluded', nilai: '192.168.10.1 s.d. 192.168.10.5' },
  ],
  langkah: [
    {
      judul: 'Tentukan alamat jaringan (NA) dan subnet mask dari IP router',
      penjelasan: 'Tentukan Network Address (NA) dan subnet mask dari alamat IP router 192.168.10.1/24.',
      rumus: 'NA = IP Router AND Subnet Mask',
      tabel: {
        tipe: 'dhcp_step1',
        alamat_router: '192.168.10.1',
        prefix: 24,
        network_address: '192.168.10.0',
        subnet_mask: '255.255.255.0',
        broadcast_address: '192.168.10.255',
      },
      hasil: 'Network Address (NA) = 192.168.10.0 | Subnet Mask = 255.255.255.0',
    },
    {
      judul: 'Periksa rentang excluded address dan prediksi IP klien pertama',
      penjelasan: 'Alamat IP 192.168.10.1 sampai 192.168.10.5 dikecualikan (excluded).',
      rumus: 'IP Klien Pertama = 192.168.10.5 + 1 = 192.168.10.6',
      tabel: {
        tipe: 'dhcp_step2',
        excluded_awal: '192.168.10.1',
        excluded_akhir: '192.168.10.5',
        klien_pertama: '192.168.10.6',
        rentang_dinamis: '192.168.10.6 - 192.168.10.254',
        jumlah_klien_dinamis: 249,
      },
      hasil: 'Klien pertama mendapat IP 192.168.10.6 (Rentang dinamis: 192.168.10.6 - 192.168.10.254)',
    },
    {
      judul: 'Susun urutan perintah CLI konfigurasi interface dan DHCP server',
      penjelasan: 'Susun urutan konfigurasi router Cisco IOS.',
      rumus: null,
      tabel: {
        tipe: 'dhcp_step3',
        total_baris: 10,
        interface: 'fastEthernet0/0',
        nama_pool: 'dhcp_server',
      },
      hasil: '10 baris perintah CLI Cisco IOS siap dieksekusi pada tab CLI router',
    },
  ],
  hasil_akhir: {
    klien_pertama: '192.168.10.6',
    network_address: '192.168.10.0',
    subnet_mask: '255.255.255.0',
    broadcast_address: '192.168.10.255',
    host_pertama: '192.168.10.1',
    host_terakhir: '192.168.10.254',
    interface: 'fastEthernet0/0',
    nama_pool: 'dhcp_server',
    excluded_awal: '192.168.10.1',
    excluded_akhir: '192.168.10.5',
    rentang_dinamis: '192.168.10.6 - 192.168.10.254',
    jumlah_klien_dinamis: 249,
    cli_baris: [
      { perintah: 'enable', penjelasan: 'Masuk ke Privileged EXEC mode' },
      { perintah: 'configure terminal', penjelasan: 'Masuk ke Global Configuration mode' },
      { perintah: 'interface fastEthernet0/0', penjelasan: 'Pilih interface router yang terhubung ke jaringan lokal' },
      { perintah: 'ip address 192.168.10.1 255.255.255.0', penjelasan: 'Pasang alamat IP router dan subnet mask pada interface' },
      { perintah: 'no shutdown', penjelasan: 'Aktifkan interface agar berstatus menyala (up)' },
      { perintah: 'ip dhcp pool dhcp_server', penjelasan: 'Buat dan beri nama DHCP pool pada router' },
      { perintah: 'default-router 192.168.10.1', penjelasan: 'Tentukan alamat default gateway untuk klien DHCP' },
      { perintah: 'network 192.168.10.0 255.255.255.0', penjelasan: 'Tentukan alamat jaringan dan subnet mask yang dibagikan' },
      { perintah: 'exit', penjelasan: 'Keluar dari mode konfigurasi DHCP pool' },
      { perintah: 'ip dhcp excluded-address 192.168.10.1 192.168.10.5', penjelasan: 'Kecualikan rentang alamat IP agar tidak dibagikan ke klien' },
    ],
    cli_script:
      'enable\nconfigure terminal\ninterface fastEthernet0/0\nip address 192.168.10.1 255.255.255.0\nno shutdown\nip dhcp pool dhcp_server\ndefault-router 192.168.10.1\nnetwork 192.168.10.0 255.255.255.0\nexit\nip dhcp excluded-address 192.168.10.1 192.168.10.5',
  },
  kesimpulan:
    "Konfigurasi DHCP pool 'dhcp_server' pada interface fastEthernet0/0 berhasil disusun. Klien pertama yang meminta alamat secara dinamis akan memperoleh IP 192.168.10.6 dengan subnet mask 255.255.255.0 dan default gateway 192.168.10.1.",
  peringatan: [],
};

describe('Generator DHCP Page & CodeBlock Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    Object.assign(navigator, {
      clipboard: {
        writeText: vi.fn().mockImplementation(() => Promise.resolve()),
      },
    });
  });

  it('merender header band dan parameter konfigurasi formulir DHCP', () => {
    render(
      <BrowserRouter>
        <Dhcp />
      </BrowserRouter>
    );

    // Header Band
    expect(screen.getByRole('heading', { level: 1, name: /Generator DHCP/i })).toBeDefined();
    expect(
      screen.getByText(/Susun perintah CLI DHCP server router Cisco Packet Tracer/i)
    ).toBeDefined();

    // Pastikan elemen karangan Stitch TIDAK ADA
    expect(screen.queryByText(/MODUL PRAKTIKUM 03/i)).toBeNull();
    expect(screen.queryByText(/Standar Cisco IOS 15.1\+/i)).toBeNull();
    expect(screen.queryByText(/IPv4 Router/i)).toBeNull();
    expect(screen.queryByText(/Modul Jarkom v3.2/i)).toBeNull();
    expect(screen.queryByText(/Simpan \.pkt script/i)).toBeNull();
    expect(screen.queryByText(/Siap Salin/i)).toBeNull();

    // Parameter formulir
    expect(screen.getByLabelText(/IP Router \(Default Gateway\)/i)).toBeDefined();
    expect(screen.getByLabelText(/Panjang Prefix \(\/CIDR\)/i)).toBeDefined();
    expect(screen.getByLabelText(/Antarmuka \(Interface\) Router/i)).toBeDefined();
    expect(screen.getByLabelText(/Nama DHCP Pool/i)).toBeDefined();
    expect(screen.getByText(/Rentang Excluded Address/i)).toBeDefined();
    expect(screen.getByRole('button', { name: /Buat konfigurasi/i })).toBeDefined();
    expect(screen.getByRole('button', { name: /Isi contoh/i })).toBeDefined();
  });

  it('mengisi contoh G-JAR-08 dan merender hasil lengkap termasuk CodeBlock 10 baris dan prediksi klien pertama', async () => {
    (api.hitungDhcp as any).mockResolvedValue(mockDhcpResponse);

    render(
      <BrowserRouter>
        <Dhcp />
      </BrowserRouter>
    );

    const btnContoh = screen.getByRole('button', { name: /Isi contoh/i });
    fireEvent.click(btnContoh);

    await waitFor(() => {
      expect(api.hitungDhcp).toHaveBeenCalledWith({
        alamat_router: '192.168.10.1',
        prefix: 24,
        interface: 'fastEthernet0/0',
        nama_pool: 'dhcp_server',
        excluded_awal: '192.168.10.1',
        excluded_akhir: '192.168.10.5',
      });
    });

    // 1. Ringkasan Kuning Klien Pertama
    await waitFor(() => {
      expect(screen.getByTestId('client-first-highlight')).toBeDefined();
    });
    expect(screen.getByText(/Klien pertama mendapat 192\.168\.10\.6/i)).toBeDefined();
    expect(screen.getByText(/192\.168\.10\.0\/24/i)).toBeDefined();
    expect(screen.getByText(/192\.168\.10\.6 - 192\.168\.10\.254 \(249 Host\)/i)).toBeDefined();

    // 2. Diketahui
    expect(screen.getByText(/Diketahui/i)).toBeDefined();
    expect(screen.getAllByText(/fastEthernet0\/0/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/dhcp_server/i).length).toBeGreaterThan(0);

    // 3. Langkah 1..3
    expect(screen.getByText(/Tentukan alamat jaringan \(NA\) dan subnet mask dari IP router/i)).toBeDefined();
    expect(screen.getByText(/Periksa rentang excluded address dan prediksi IP klien pertama/i)).toBeDefined();
    expect(screen.getByText(/Susun urutan perintah CLI konfigurasi interface dan DHCP server/i)).toBeDefined();

    // 4. CodeBlock CLI Dua Kolom
    expect(screen.getByTestId('code-block')).toBeDefined();
    expect(screen.getByText('enable')).toBeDefined();
    expect(screen.getByText('configure terminal')).toBeDefined();
    expect(screen.getByText('interface fastEthernet0/0')).toBeDefined();
    expect(screen.getByText('ip address 192.168.10.1 255.255.255.0')).toBeDefined();
    expect(screen.getByText('no shutdown')).toBeDefined();
    expect(screen.getByText('ip dhcp pool dhcp_server')).toBeDefined();
    expect(screen.getByText('default-router 192.168.10.1')).toBeDefined();
    expect(screen.getByText('network 192.168.10.0 255.255.255.0')).toBeDefined();
    expect(screen.getByText('exit')).toBeDefined();
    expect(screen.getByText('ip dhcp excluded-address 192.168.10.1 192.168.10.5')).toBeDefined();

    // Penjelasan bahasa Indonesia
    expect(screen.getByText('Masuk ke Privileged EXEC mode')).toBeDefined();
    expect(screen.getByText('Kecualikan rentang alamat IP agar tidak dibagikan ke klien')).toBeDefined();

    // Catatan wajib
    expect(
      screen.getByText(/Catatan: mengikuti contoh Modul 3; belum diverifikasi di semua versi Packet Tracer atau IOS/i)
    ).toBeDefined();

    // Pastikan TIDAK ADA tombol palsu .pkt
    expect(screen.queryByText(/Simpan \.pkt script/i)).toBeNull();

    // 5. Kesimpulan (ConclusionBlock)
    expect(screen.getByTestId('conclusion-block')).toBeDefined();
    expect(screen.getByText(/Konfigurasi DHCP pool 'dhcp_server' pada interface fastEthernet0\/0 berhasil disusun/i)).toBeDefined();
    expect(screen.queryByText(/Siap Salin/i)).toBeNull();
  });

  it('menguji CodeBlock secara mandiri: fungsi salin menyalin hanya perintah murni dan cetak memanggil handler', () => {
    const handlePrint = vi.fn();
    const cliBaris = [
      { perintah: 'enable', penjelasan: 'Mode Privileged' },
      { perintah: 'configure terminal', penjelasan: 'Mode Config' },
    ];
    const cliScript = 'enable\nconfigure terminal';

    render(
      <CodeBlock
        cliBaris={cliBaris}
        cliScript={cliScript}
        onPrint={handlePrint}
      />
    );

    // Tombol Salin
    const btnSalin = screen.getByRole('button', { name: /Salin/i });
    fireEvent.click(btnSalin);
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(cliScript);

    // Tombol Cetak
    const btnCetak = screen.getByRole('button', { name: /Cetak/i });
    fireEvent.click(btnCetak);
    expect(handlePrint).toHaveBeenCalledTimes(1);

    // Pastikan tidak ada tombol .pkt
    expect(screen.queryByText(/Simpan \.pkt/i)).toBeNull();
  });
});
