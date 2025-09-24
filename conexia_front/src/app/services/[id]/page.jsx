'use client';

import { use } from 'react';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { NotFound } from '@/components/ui';
import { ROLES } from '@/constants/roles';
import ServiceDetail from '@/components/services/ServiceDetail';

export default function ServiceDetailPage({ params }) {
  const resolvedParams = use(params);
  return (
    <ProtectedRoute
      allowedRoles={[ROLES.USER, ROLES.ADMIN, ROLES.MODERATOR]}
      fallbackComponent={<NotFound />}
    >
      <ServiceDetail serviceId={resolvedParams.id} />
    </ProtectedRoute>
  );
}