'use client';

import { use } from 'react';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { NotFound } from '@/components/ui';
import { ROLES } from '@/constants/roles';
import UserServicesPage from '@/components/services/UserServicesPage';

export default function UserServicesProfilePage({ params }) {
  const resolvedParams = use(params);
  
  return (
    <ProtectedRoute
      allowedRoles={[ROLES.USER, ROLES.ADMIN, ROLES.MODERATOR]}
      fallbackComponent={<NotFound />}
    >
      <UserServicesPage userId={resolvedParams.userId} />
    </ProtectedRoute>
  );
}