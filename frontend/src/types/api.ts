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
    ringkasan?: SubnetRingkasan;
    tabel?: SubnetTableRow[];
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

export interface ApiError {
  kode: string;
  pesan: string;
  field?: string | null;
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
