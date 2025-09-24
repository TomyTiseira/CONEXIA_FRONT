'use client';

import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { NotFound } from '@/components/ui';
import { ROLES } from '@/constants/roles';
import ServiceSearch from '@/components/services/ServiceSearch';

export default function ServicesPage() {
  return (
    <ProtectedRoute
      allowedRoles={[ROLES.USER, ROLES.ADMIN, ROLES.MODERATOR]}
      fallbackComponent={<NotFound />}
    >
      <ServiceSearch />
    </ProtectedRoute>
  );
}