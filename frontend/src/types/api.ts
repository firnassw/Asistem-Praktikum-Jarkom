/**
 * Tipe data TypeScript untuk struktur jawaban seragam, error, dan metadata modul.
 * Sesuai PRD Bagian 12 dan Lampiran B.
 */

export interface DiketahuiItem {
  label: string;
  nilai: string;
}

export interface LangkahItem {
  judul: string;
  penjelasan: string;
  rumus?: string | null;
  tabel?: Record<string, any> | any[] | null;
  hasil?: string | null;
}

export interface StrukturJawaban {
  fitur: string;
  diketahui: DiketahuiItem[];
  langkah: LangkahItem[];
  hasil_akhir: {
    ringkasan?: SubnetRingkasan | VlsmRingkasan | FlsmRingkasan | any;
    tabel?: SubnetTableRow[] | VlsmTableRow[];
    total_subnets?: number;
    ringkasan_tabel?: boolean;
    [key: string]: any;
  };
  kesimpulan: string;
  peringatan: string[];
}

export interface SubnetRingkasan {
  alamat_ip: string;
  prefix: number;
  subnet_mask: string;
  na: string;
  ba: string;
  host_pertama: string;
  host_terakhir: string;
  host_per_subnet: number;
  jumlah_subnet?: number | null;
  blok_subnet: number;
  kelas: string;
}

export interface SubnetTableRow {
  no: number;
  subnet: string;
  na: string;
  host_pertama: string;
  host_terakhir: string;
  broadcast: string;
  aktif: boolean;
}

export interface SubnetPayload {
  alamat_ip: string;
  prefix?: number | null;
  subnet_mask?: string | null;
}

export interface KebutuhanItem {
  nama: string;
  host: number;
}

export interface VlsmPayload {
  alamat_induk: string;
  prefix_induk: number;
  kebutuhan: KebutuhanItem[];
}

export interface FlsmPayload {
  alamat_induk: string;
  prefix_induk: number;
  kebutuhan: KebutuhanItem[];
  gaya_modul?: boolean;
}

export interface VlsmTableRow {
  no: number;
  nama: string;
  host_diminta: number;
  host_tersedia: number;
  prefix: number;
  subnet_mask: string;
  subnet: string;
  host_pertama: string;
  host_terakhir: string;
  broadcast: string;
  status: 'Terpakai' | 'Tidak muat' | 'Cadangan' | string;
  ukuran_blok: number;
  warna: string;
  bit_host?: number;
}

export interface VlsmRingkasan {
  metode: 'VLSM';
  total_ruangan: number;
  ruangan_terakomodasi: number;
  kapasitas_induk: number;
  total_alamat_dialokasikan: number;
  sisa_alamat: number;
  persen_terpakai: number;
  sisa_rentang?: {
    mulai: string;
    akhir: string;
    jumlah: number;
  } | null;
}

export interface FlsmRingkasan {
  metode: 'FLSM';
  host_terbesar: number;
  prefix_seragam: number;
  subnet_mask_seragam: string;
  ukuran_blok: number;
  host_tersedia: number;
  total_subnet_terbentuk: number;
  subnet_terpakai: number;
  subnet_cadangan: number;
  kapasitas_induk: number;
  total_alamat_dialokasikan: number;
  sisa_alamat: number;
  gaya_modul: boolean;
}

export interface ApiError {
  kode: string;
  pesan: string;
  field?: string | null;
  prefix_saran?: number;
  [key: string]: any;
}

export interface ModulMetadata {
  id: string;
  nama: string;
  deskripsi: string;
  rute: string;
  contoh: string;
  warna_aksen: 'secondary' | 'primary' | 'tertiary';
  urutan: number;
}

export interface RuanganPayloadItem {
  nama: string;
  device: number;
}

export interface RencanaPayload {
  nim_dua_digit?: string | number | null;
  alamat_induk?: string | null;
  prefix_induk?: number | null;
  ruangan: RuanganPayloadItem[];
  gateway?: boolean;
  cadangan_persen?: number;
  mode?: 'vlsm' | 'flsm';
  gaya_modul?: boolean;
}

export interface RencanaTableRow extends VlsmTableRow {
  device?: number;
  cadangan_host?: number;
  host_dibutuhkan?: number;
  usulan_gateway?: string | null;
}

export interface RencanaRingkasan {
  metode: string;
  total_ruangan: number;
  ruangan_terakomodasi: number;
  kapasitas_induk: number;
  total_alamat_dialokasikan: number;
  sisa_alamat: number;
  persen_terpakai: number;
  sisa_rentang?: {
    mulai: string;
    akhir: string;
    jumlah: number;
  } | null;
  gateway_aktif?: boolean;
  cadangan_persen?: number;
}

export interface DhcpPayload {
  alamat_router: string;
  prefix: number;
  interface?: string;
  nama_pool?: string;
  excluded_awal: string;
  excluded_akhir: string;
}

export interface CliBaris {
  perintah: string;
  penjelasan: string;
}

export interface DhcpHasilAkhir {
  klien_pertama: string;
  network_address: string;
  subnet_mask: string;
  broadcast_address: string;
  host_pertama: string;
  host_terakhir: string;
  interface: string;
  nama_pool: string;
  excluded_awal: string;
  excluded_akhir: string;
  rentang_dinamis: string;
  jumlah_klien_dinamis: number;
  cli_baris: CliBaris[];
  cli_script: string;
}

export interface KonversiPayload {
  nilai: string;
  basis_asal: number;
  mode_ipv4?: boolean;
}

export interface BitPositionItem {
  pangkat: string;
  bobot: number;
  bit: number;
  aktif: boolean;
  nilai: number;
}

export interface PembagianRow {
  nilai_awal: number;
  pembagi: number;
  hasil_bagi: number;
  sisa: string;
}

export interface KonversiTableRow {
  no: number;
  basis: string;
  notasi: string;
  nilai: string;
  keterangan: string;
}

export interface KonversiHasilAkhir {
  biner: string;
  oktal: string;
  desimal: string;
  heksadesimal: string;
  heksadesimal_prefixed: string;
  tabel_bit: BitPositionItem[];
  bobot_aktif: number[];
  rumus_penjumlahan: string;
  pembagian_biner: PembagianRow[];
  pembagian_oktal: PembagianRow[];
  pembagian_heksa: PembagianRow[];
  mode_ipv4: boolean;
  oktet_list?: any[];
  tabel: KonversiTableRow[];
}

export interface PerangkatItemPayload {
  nama: string;
  mode?: 'static' | 'dhcp';
  ip?: string | null;
  prefix?: number | null;
  subnet_mask?: string | null;
  gateway?: string | null;
  dns?: string | null;
}

export interface TabelIpPayload {
  perangkat: PerangkatItemPayload[];
}

export interface TabelIpTableRow {
  no: number;
  nama: string;
  mode: 'Static' | 'DHCP';
  ip: string;
  subnet_mask: string;
  prefix: string;
  gateway: string;
  dns: string;
  segmen?: string;
}

export interface TabelIpRingkasan {
  total_perangkat: number;
  total_static: number;
  total_dhcp: number;
  segmen_jaringan: string[];
  daftar_gateway: string[];
  daftar_dns: string[];
}



