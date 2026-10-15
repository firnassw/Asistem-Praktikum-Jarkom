import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { HeaderBar } from './HeaderBar';
import { MobileBottomNav } from './MobileBottomNav';

export const Layout: React.FC = () => {
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#F5F6F8] text-[#1F1E22] flex flex-col lg:flex-row overflow-x-hidden">
      {/* 1. Desktop Fixed Sidebar */}
      <div className="hidden lg:block fixed left-0 top-0 bottom-0 w-[264px] z-50">
        <Sidebar />
      </div>

      {/* 2. Mobile & Tablet Drawer Modal */}
      {drawerOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Navigasi Menu"
          className="fixed inset-0 z-50 flex lg:hidden"
        >
          {/* Backdrop overlay */}
          <div
            className="fixed inset-0 bg-[#1F1E22]/60 backdrop-blur-xs transition-opacity"
            onClick={() => setDrawerOpen(false)}
            aria-hidden="true"
          />
          {/* Drawer content */}
          <div className="relative z-10 w-full max-w-[280px] h-full shadow-2xl flex">
            <Sidebar onClose={() => setDrawerOpen(false)} isMobileDrawer={true} />
          </div>
        </div>
      )}

      {/* 3. Main Content Area */}
      <div className="flex-1 flex flex-col lg:pl-[264px] min-h-screen w-full overflow-x-hidden">
        {/* Mobile & Tablet Header Bar */}
        <HeaderBar onOpenMenu={() => setDrawerOpen(true)} />

        {/* Content Wrapper */}
        <main className="flex-1 w-full max-w-[1280px] mx-auto p-4 sm:p-6 lg:p-8 pb-24 md:pb-8">
          <Outlet />
        </main>

        {/* Mobile Bottom Navigation */}
        <MobileBottomNav onOpenDrawer={() => setDrawerOpen(true)} />
      </div>
    </div>
  );
};
