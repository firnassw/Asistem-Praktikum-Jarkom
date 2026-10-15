"""
Sistem registry modul (FR-18) agar fitur/modul baru dapat didaftarkan
tanpa mengubah inti aplikasi.
"""

from typing import Callable, Dict, List, Optional
from app.core.schemas import ModulMetadata

# Registry internal
_FEATURES: Dict[str, ModulMetadata] = {}
_SOLVERS: Dict[str, Callable] = {}


def register_feature(
    feature_meta: ModulMetadata,
    solver: Optional[Callable] = None
) -> None:
    """Mendaftarkan modul/fitur baru ke dalam registry."""
    _FEATURES[feature_meta.id] = feature_meta
    if solver:
        _SOLVERS[feature_meta.id] = solver


def get_all_features() -> List[ModulMetadata]:
    """Mengembalikan daftar semua fitur yang terdaftar, diurutkan berdasarkan urutan."""
    return sorted(_FEATURES.values(), key=lambda f: f.urutan)


def get_feature(feature_id: str) -> Optional[ModulMetadata]:
    """Mengambil metadata fitur berdasarkan ID."""
    return _FEATURES.get(feature_id)


def get_solver(feature_id: str) -> Optional[Callable]:
    """Mengambil fungsi solver fitur jika tersedia."""
    return _SOLVERS.get(feature_id)


def clear_registry() -> None:
    """Mengosongkan registry (berguna untuk testing)."""
    _FEATURES.clear()
    _SOLVERS.clear()


# Default registration untuk 6 fitur v1.0 (sesuai PRD dan DESIGN.md)
_DEFAULT_FEATURES = [
    ModulMetadata(
        id="subnet",
        nama="Analisis subnet",
        deskripsi="Hitung NA, BA, subnet mask, dan tabel rentang host dari satu alamat IP.",
        rute="/subnetting",
        contoh="192.168.0.5 /27",
        warna_aksen="secondary",
        urutan=1,
    ),
    ModulMetadata(
        id="flsm-vlsm",
        nama="FLSM dan VLSM",
        deskripsi="Bagi jaringan induk menjadi beberapa subnet ukuran tetap atau sesuai kebutuhan host.",
        rute="/flsm-vlsm",
        contoh="192.168.64.0/24 • 64, 24, 8 host",
        warna_aksen="primary",
        urutan=2,
    ),
    ModulMetadata(
        id="rencana",
        nama="Rencana ruangan",
        deskripsi="Susun alokasi subnet otomatis dari dua digit NIM serta jumlah ruangan dan device.",
        rute="/rencana",
        contoh="NIM 50 • 5 ruangan",
        warna_aksen="tertiary",
        urutan=3,
    ),
    ModulMetadata(
        id="konversi",
        nama="Konversi basis",
        deskripsi="Ubah bilangan antar basis biner, oktal, desimal, dan heksadesimal dengan tabel bit.",
        rute="/konversi",
        contoh="10101100 -> 172",
        warna_aksen="secondary",
        urutan=4,
    ),
    ModulMetadata(
        id="dhcp",
        nama="Generator DHCP",
        deskripsi="Susun perintah CLI DHCP router dan prediksi alamat IP klien pertama.",
        rute="/dhcp",
        contoh="192.168.10.1/24 • excluded .1-.5",
        warna_aksen="primary",
        urutan=5,
    ),
    ModulMetadata(
        id="tabel-ip",
        nama="Tabel IP perangkat",
        deskripsi="Rekap alamat IP, subnet mask, gateway, dan DNS perangkat siap salin dan cetak.",
        rute="/tabel-ip",
        contoh="Server 192.168.1.1 • 255.255.255.0",
        warna_aksen="tertiary",
        urutan=6,
    ),
    # Juga sediakan pendaftaran alias 'flsm' dan 'vlsm' terpisah untuk kebutuhan API solver di slice berikutnya
    ModulMetadata(
        id="flsm",
        nama="FLSM",
        deskripsi="Pembagian jaringan menjadi subnet dengan panjang mask yang sama.",
        rute="/flsm-vlsm?mode=flsm",
        contoh="192.168.64.0/24",
        warna_aksen="primary",
        urutan=7,
    ),
    ModulMetadata(
        id="vlsm",
        nama="VLSM",
        deskripsi="Pembagian jaringan menjadi subnet dengan panjang mask sesuai kebutuhan host.",
        rute="/flsm-vlsm?mode=vlsm",
        contoh="192.168.64.0/24",
        warna_aksen="primary",
        urutan=8,
    ),
]


def init_default_registry() -> None:
    """Menginisialisasi registry dengan fitur default."""
    try:
        from app.modules.jaringan.solver import hitung_flsm, hitung_subnet, hitung_vlsm
        subnet_solver = hitung_subnet
        flsm_solver = hitung_flsm
        vlsm_solver = hitung_vlsm
    except ImportError:
        subnet_solver = None
        flsm_solver = None
        vlsm_solver = None

    for feat in _DEFAULT_FEATURES:
        if feat.id == "subnet":
            solver_fn = subnet_solver
        elif feat.id == "vlsm":
            solver_fn = vlsm_solver
        elif feat.id == "flsm":
            solver_fn = flsm_solver
        else:
            solver_fn = None
        register_feature(feat, solver=solver_fn)


# Inisialisasi default saat modul di-import
init_default_registry()
