/**
 * Klien API untuk komunikasi dengan backend FastAPI.
 */

import type {
  ApiError,
  DhcpPayload,
  FlsmPayload,
  ModulMetadata,
  RencanaPayload,
  StrukturJawaban,
  VlsmPayload,
} from '../types/api';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

export class ApiException extends Error {
  kode: string;
  field?: string | null;
  prefix_saran?: number;
  extra?: Record<string, any>;

  constructor(error: ApiError) {
    super(error.pesan);
    this.name = 'ApiException';
    this.kode = error.kode;
    this.field = error.field;
    this.prefix_saran = error.prefix_saran;
    this.extra = error;
  }
}

async function request<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  try {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      ...options,
    });

    if (!response.ok) {
      let errorData: ApiError;
      try {
        errorData = await response.json();
      } catch {
        errorData = {
          kode: 'KESALAHAN_SERVER',
          pesan: 'Perhitungan gagal di server. Coba lagi; jika berulang, laporkan beserta contoh datanya',
          field: null,
        };
      }
      throw new ApiException(errorData);
    }

    return (await response.json()) as T;
  } catch (err) {
    if (err instanceof ApiException) {
      throw err;
    }
    throw new ApiException({
      kode: 'KESALAHAN_SERVER',
      pesan: (err as Error).message || 'Gagal menghubungi server.',
      field: null,
    });
  }
}

export const api = {
  /**
   * Health check endpoint
   */
  async getHealth(): Promise<{ status: string }> {
    return request<{ status: string }>('/health');
  },

  /**
   * Mengambil daftar modul yang terdaftar
   */
  async getModul(): Promise<ModulMetadata[]> {
    return request<ModulMetadata[]>('/modul');
  },

  /**
   * Analisis subnetting satu IP
   */
  async hitungSubnet(payload: {
    alamat_ip: string;
    prefix?: number | null;
    subnet_mask?: string | null;
  }): Promise<StrukturJawaban> {
    return request<StrukturJawaban>('/jaringan/subnet', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  /**
   * Alokasi VLSM (Variable Length Subnet Mask)
   */
  async hitungVlsm(payload: VlsmPayload): Promise<StrukturJawaban> {
    return request<StrukturJawaban>('/jaringan/vlsm', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  /**
   * Alokasi FLSM (Fixed Length Subnet Mask)
   */
  async hitungFlsm(payload: FlsmPayload): Promise<StrukturJawaban> {
    return request<StrukturJawaban>('/jaringan/flsm', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  /**
   * Alokasi Rencana Ruangan dan Device
   */
  async hitungRencana(payload: RencanaPayload): Promise<StrukturJawaban> {
    return request<StrukturJawaban>('/jaringan/rencana', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  /**
   * Generator DHCP Server Cisco Packet Tracer
   */
  async hitungDhcp(payload: DhcpPayload): Promise<StrukturJawaban> {
    return request<StrukturJawaban>('/jaringan/dhcp', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  /**
   * Konversi Basis Bilangan (2, 8, 10, 16)
   */
  async hitungKonversi(payload: {
    nilai: string;
    basis_asal: number;
    mode_ipv4?: boolean;
  }): Promise<StrukturJawaban> {
    return request<StrukturJawaban>('/jaringan/konversi', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },
};

