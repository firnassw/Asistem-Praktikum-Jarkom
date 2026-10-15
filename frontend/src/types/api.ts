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
