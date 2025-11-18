'use client';

import { useSelectedLayoutSegment } from 'next/navigation';
import { Suspense } from 'react';
import SettingsHeader from '@/components/settings/layout/SettingsHeader';
import SettingsSidebarDesktop from '@/components/settings/layout/SettingsSidebarDesktop';
import SettingsSidebarMobile from '@/components/settings/layout/SettingsSidebarMobile';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { ROLES } from '@/constants/roles';
import { useState } from 'react';
import { NotFound } from '@/components/ui';

export default function SettingsLayout({ children }) {
  const activeSection = useSelectedLayoutSegment() || 'account';
  const [menuOpen, setMenuOpen] = useState(false);

  const toggleMobileMenu = () => setMenuOpen((prev) => !prev);

  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-conexia-soft">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-conexia-green mx-auto mb-4"></div>
          <p className="text-conexia-green">Cargando configuraciones...</p>
        </div>
      </div>
    }>
      <ProtectedRoute 
        allowedRoles={[ROLES.USER, ROLES.ADMIN, ROLES.MODERATOR]}
        fallbackComponent={<NotFound />}
      >
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
            <div className="bg-white rounded-xl shadow p-6 w-full max-w-6xl">
              {children}
            </div>
          </main>
        </div>
      </div>
    </ProtectedRoute>
    </Suspense>
  );
}
