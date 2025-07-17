'use client';

import { useSelectedLayoutSegment } from 'next/navigation';
import SettingsHeader from '@/components/settings/layout/SettingsHeader';
import SettingsSidebarDesktop from '@/components/settings/layout/SettingsSidebarDesktop';
import SettingsSidebarMobile from '@/components/settings/layout/SettingsSidebarMobile';
import { useState } from 'react';

export default function SettingsLayout({ children }) {
  const activeSection = useSelectedLayoutSegment() || 'account';
  const [menuOpen, setMenuOpen] = useState(false);

  const toggleMobileMenu = () => setMenuOpen((prev) => !prev);

  return (
    <div className="min-h-screen bg-conexia-soft flex flex-col">
      <SettingsHeader onToggleMenu={toggleMobileMenu} />

      <div className="flex-1 flex flex-col md:flex-row relative">
        {/* Sidebar móvil */}
        {menuOpen && (
          <div className="absolute top-0 right-0 z-50 bg-white border-l shadow w-64 md:hidden">
            <SettingsSidebarMobile
              active={activeSection}
              onChange={() => setMenuOpen(false)}
            />
          </div>
        )}

        {/* Sidebar desktop */}
        <div className="hidden md:block w-64 border-r bg-white">
          <SettingsSidebarDesktop active={activeSection} />
        </div>

        {/* Zona de contenido que se actualiza dinámicamente */}
        <main className="flex-1 flex justify-center px-4 py-6">
          <div className="bg-white rounded-xl shadow p-6 w-full max-w-2xl">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
