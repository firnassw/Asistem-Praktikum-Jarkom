import React from 'react';

export const TabelIp: React.FC = () => {
  return (
    <div className="flex flex-col gap-6 w-full">
      <div className="rounded-[28px] border-2 border-[#1F1E22] bg-[#FCE76C] p-6 sm:p-8 shadow-[6px_6px_0px_#1F1E22]">
        <h1 className="font-display-xl text-[28px] sm:text-[34px] font-extrabold text-[#1F1E22]">
          Tabel IP perangkat
        </h1>
        <p className="font-body-md text-[15px] text-[#1F1E22] mt-2">
          Rekap alamat IP, subnet mask, gateway, dan DNS perangkat siap salin dan cetak.
        </p>
      </div>

      <div className="bg-[#FFFFFF] border-2 border-[#1F1E22] rounded-[20px] p-6 shadow-xs">
        <p className="text-[#5B5F6B] font-medium">
          Komponen formulir dan rekap tabel IP akan diimplementasikan pada Slice berikutnya.
        </p>
      </div>
    </div>
  );
};
