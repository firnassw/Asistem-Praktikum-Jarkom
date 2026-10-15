"""
Router API untuk modul jaringan.
"""

from fastapi import APIRouter
from app.core.schemas import StrukturJawaban
from app.modules.jaringan.schemas import FlsmRequest, RencanaRequest, SubnetRequest, VlsmRequest
from app.modules.jaringan.solver import (
    hitung_flsm,
    hitung_rencana,
    hitung_subnet,
    hitung_vlsm,
)
from app.modules.jaringan.steps import (
    susun_langkah_flsm,
    susun_langkah_rencana,
    susun_langkah_subnet,
    susun_langkah_vlsm,
)

router = APIRouter(prefix="/api/jaringan", tags=["Jaringan"])


@router.post("/subnet", response_model=StrukturJawaban, summary="Analisis Subnetting Satu IP")
async def endpoint_subnet(payload: SubnetRequest) -> StrukturJawaban:
    """
    Menghitung parameter subnetting CIDR satu IP secara deterministik:
    NA, BA, rentang host valid, jumlah subnet, host per subnet, dan blok subnet.
    """
    calc_data = hitung_subnet(
        alamat_ip=payload.alamat_ip,
        prefix=payload.prefix,
        subnet_mask=payload.subnet_mask,
    )
    return susun_langkah_subnet(calc_data)


@router.post("/vlsm", response_model=StrukturJawaban, summary="Alokasi Subnet VLSM")
async def endpoint_vlsm(payload: VlsmRequest) -> StrukturJawaban:
    """
    Menghitung alokasi subnet VLSM (Variable Length Subnet Mask) berdasarkan kebutuhan host tiap ruangan.
    """
    calc_data = hitung_vlsm(
        alamat_induk=payload.alamat_induk,
        prefix_induk=payload.prefix_induk,
        kebutuhan=payload.kebutuhan,
    )
    return susun_langkah_vlsm(calc_data)


@router.post("/flsm", response_model=StrukturJawaban, summary="Alokasi Subnet FLSM")
async def endpoint_flsm(payload: FlsmRequest) -> StrukturJawaban:
    """
    Menghitung alokasi subnet FLSM (Fixed Length Subnet Mask) dengan ukuran seragam.
    """
    calc_data = hitung_flsm(
        alamat_induk=payload.alamat_induk,
        prefix_induk=payload.prefix_induk,
        kebutuhan=payload.kebutuhan,
        gaya_modul=payload.gaya_modul,
    )
    return susun_langkah_flsm(calc_data)


@router.post("/rencana", response_model=StrukturJawaban, summary="Rencana Ruangan dan Device")
async def endpoint_rencana(payload: RencanaRequest) -> StrukturJawaban:
    """
    Menghitung rencana alokasi subnet dari ruangan dan device:
    - Sumber dari NIM dua digit atau alamat induk manual
    - Opsi penambahan cadangan pertumbuhan (%)
    - Opsi penambahan gateway (+1 host per ruangan, usulan host pertama)
    - Tab perbandingan tanpa vs dengan gateway dan VLSM vs FLSM
    """
    calc_data = hitung_rencana(
        nim_dua_digit=payload.nim_dua_digit,
        alamat_induk=payload.alamat_induk,
        prefix_induk=payload.prefix_induk,
        ruangan=payload.ruangan,
        gateway=payload.gateway,
        cadangan_persen=payload.cadangan_persen,
        mode=payload.mode,
        gaya_modul=payload.gaya_modul,
    )
    return susun_langkah_rencana(calc_data)

