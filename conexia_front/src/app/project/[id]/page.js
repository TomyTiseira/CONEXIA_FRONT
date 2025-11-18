// Página de detalle de proyecto
'use client';

import ProjectDetail from '@/components/project/detail/ProjectDetail';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { NotFound } from '@/components/ui';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { ROLES } from '@/constants/roles';
import React from 'react';

export default function ProjectDetailPage({ params, searchParams }) {
  const { id } = React.use(params);
  const resolvedSearchParams = React.use(searchParams);
  // Detectar si viene de reportes
  const from = resolvedSearchParams?.from || '';
  const isFromReports =
    from === 'reports' ||
    from === 'reports-project' ||
    resolvedSearchParams?.fromReportsProjectId;
  const allowedRoles = isFromReports
    ? [ROLES.ADMIN, ROLES.MODERATOR]
    : [ROLES.USER, ROLES.ADMIN, ROLES.MODERATOR];
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
      <ProjectDetail projectId={id} />
    </ProtectedRoute>
  );
}
