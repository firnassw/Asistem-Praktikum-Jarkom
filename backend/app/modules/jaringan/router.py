"""
Router API untuk modul jaringan.
"""

from fastapi import APIRouter
from app.core.schemas import StrukturJawaban
from app.modules.jaringan.schemas import SubnetRequest
from app.modules.jaringan.solver import hitung_subnet
from app.modules.jaringan.steps import susun_langkah_subnet

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
