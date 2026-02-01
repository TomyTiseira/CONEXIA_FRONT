/**
 * My Claims Page
 * Página de reclamos del usuario
 */

'use client';

import { Suspense } from 'react';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { NotFound } from '@/components/ui';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { ROLES } from '@/constants/roles';
import MyClaimsPage from '@/components/claims/MyClaimsPage';
import { useUserStore } from '@/store/userStore';
import { config } from '@/config';
import MessagingWidget from '@/components/messaging/MessagingWidget';

export default function MyClaimsRoute() {
  const { profile } = useUserStore();
  const avatar = profile?.profilePicture
    ? `${config.IMAGE_URL}/${profile.profilePicture}`
    : '/images/default-avatar.png';

  // Detectar si está en proceso de logout
  let isLoggingOut = false;
  if (typeof window !== 'undefined') {
    isLoggingOut = window.__CONEXIA_LOGGING_OUT__ === true;
  }

  return (
    <ProtectedRoute
      allowedRoles={[ROLES.USER]}
      fallbackComponent={isLoggingOut ? <LoadingSpinner message="Cerrando sesión..." size="large" /> : <NotFound />}
    >
      <Suspense fallback={<LoadingSpinner message="Cargando reclamos..." size="large" />}>
        <MyClaimsPage />
        <MessagingWidget avatar={avatar} />
      </Suspense>
    </ProtectedRoute>
  );
}
