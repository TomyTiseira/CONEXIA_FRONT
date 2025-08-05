// Página de detalle de proyecto
'use client';

import ProjectDetail from '@/components/project/detail/ProjectDetail';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { NotFound } from '@/components/ui';
import { ROLES } from '@/constants/roles';
import React from 'react';

export default function ProjectDetailPage({ params }) {
  const { id } = React.use(params);
  return (
    <ProtectedRoute
      allowedRoles={[ROLES.USER, ROLES.ADMIN, ROLES.MODERATOR]}
      fallbackComponent={<NotFound />}
    >
      <ProjectDetail projectId={id} />
    </ProtectedRoute>
  );
}
