// Página de búsqueda de proyectos
'use client';
import ProjectSearch from '@/components/project/search/ProjectSearch';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { NotFound } from '@/components/ui';
import { ROLES } from '@/constants/roles';

export default function ProjectSearchPage() {
  return (
    <ProtectedRoute
      allowedRoles={[ROLES.USER, ROLES.ADMIN, ROLES.MODERATOR]}
      fallbackComponent={<NotFound />}
    >
      <ProjectSearch />
    </ProtectedRoute>
  );
}
