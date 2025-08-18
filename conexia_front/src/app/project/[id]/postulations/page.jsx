'use client';

import { useParams } from 'next/navigation';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { NotFound } from '@/components/ui';
import { ROLES } from '@/constants/roles';
import ProjectPostulations from '@/components/project/postulations/ProjectPostulations';

export default function ProjectPostulationsPage() {
  const { id } = useParams();

  return (
    <ProtectedRoute
      allowedRoles={[ROLES.USER]}
      fallbackComponent={<NotFound />}
    >
      <ProjectPostulations projectId={id} />
    </ProtectedRoute>
  );
}
