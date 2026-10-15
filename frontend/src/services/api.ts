/**
 * Klien API untuk komunikasi dengan backend FastAPI.
 */

import type { ApiError, ModulMetadata } from '../types/api';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

export class ApiException extends Error {
  kode: string;
  field?: string | null;

  constructor(error: ApiError) {
    super(error.pesan);
    this.name = 'ApiException';
    this.kode = error.kode;
    this.field = error.field;
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
};
