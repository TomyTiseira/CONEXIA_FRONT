'use client';

import React, { use } from 'react';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { NotFound } from '@/components/ui';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { ROLES } from '@/constants/roles';
import ServiceDetail from '@/components/services/ServiceDetail';
import { useUserStore } from '@/store/userStore';
import { config } from '@/config';
import MessagingWidget from '@/components/messaging/MessagingWidget';

export default function ServiceDetailPage({ params, searchParams }) {
  const resolvedParams = use(params);
  const resolvedSearchParams = use(searchParams);

  // Detectar si viene de reportes
  const from = resolvedSearchParams?.from || '';
  const isFromReports =
    from === 'reports' ||
    from === 'reports-service' ||
    resolvedSearchParams?.fromReportsServiceId;
  const allowedRoles = isFromReports
    ? [ROLES.ADMIN, ROLES.MODERATOR]
    : [ROLES.USER, ROLES.ADMIN, ROLES.MODERATOR];

  // Avatar como en ClientCommunity
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
      allowedRoles={allowedRoles}
      fallbackComponent={isLoggingOut ? <LoadingSpinner message="Cerrando sesión..." size="large" /> : <NotFound />}
    >
      <>
        <ServiceDetail serviceId={resolvedParams.id} />
        {/* Widget de mensajería (igual que en ClientCommunity) */}
        <MessagingWidget avatar={avatar} />
      </>
    </ProtectedRoute>
  );
}