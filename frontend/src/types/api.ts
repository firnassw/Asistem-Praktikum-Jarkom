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
  tabel?: Record<string, unknown> | unknown[] | null;
  hasil?: string | null;
}

export interface StrukturJawaban {
  fitur: string;
  diketahui: DiketahuiItem[];
  langkah: LangkahItem[];
  hasil_akhir: Record<string, unknown>;
  kesimpulan: string;
  peringatan: string[];
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
