'use client';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

import { use } from 'react';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { NotFound } from '@/components/ui';
import { ROLES } from '@/constants/roles';
import ServiceRequestsPage from '@/components/services/ServiceRequestsPage';
import { useUserStore } from '@/store/userStore';
import { config } from '@/config';
import MessagingWidget from '@/components/messaging/MessagingWidget';

export default function ServiceRequestsPageRoute({ params }) {
  const { serviceId } = use(params);
  // Avatar como en otras páginas
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
      <>
        <ServiceRequestsPage serviceId={serviceId} />
        {/* Widget de mensajería */}
        <MessagingWidget avatar={avatar} />
      </>
    </ProtectedRoute>
  );
}