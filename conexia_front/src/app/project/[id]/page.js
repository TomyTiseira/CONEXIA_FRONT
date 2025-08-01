// Página de detalle de proyecto
'use client';
import ProjectDetail from '@/components/project/detail/ProjectDetail';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { NotFound } from '@/components/ui';
import { ROLES } from '@/constants/roles';

export default function ProjectDetailPage({ params }) {
  return (
    <ProtectedRoute
      allowedRoles={[ROLES.USER, ROLES.ADMIN, ROLES.MODERATOR]}
      fallbackComponent={<NotFound />}
    >
      <ProjectDetail projectId={params.id} />
    </ProtectedRoute>
  );
}
