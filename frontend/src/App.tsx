import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import { LandingPage } from './pages/LandingPage';
import { Beranda } from './pages/Beranda';
import { Subnetting } from './pages/Subnetting';
import { FlsmVlsm } from './pages/FlsmVlsm';
import { Rencana } from './pages/Rencana';
import { Konversi } from './pages/Konversi';
import { Dhcp } from './pages/Dhcp';
import { TabelIp } from './pages/TabelIp';
import { Tentang } from './pages/Tentang';

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Halaman Depan / Landing Page Mandiri */}
        <Route path="/" element={<LandingPage />} />

        {/* Workspace Aplikasi Lab */}
        <Route element={<Layout />}>
          <Route path="app" element={<Beranda />} />
          <Route path="beranda" element={<Beranda />} />
          <Route path="subnetting" element={<Subnetting />} />
          <Route path="flsm-vlsm" element={<FlsmVlsm />} />
          <Route path="rencana" element={<Rencana />} />
          <Route path="konversi" element={<Konversi />} />
          <Route path="dhcp" element={<Dhcp />} />
          <Route path="tabel-ip" element={<TabelIp />} />
          <Route path="tentang" element={<Tentang />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default App;
