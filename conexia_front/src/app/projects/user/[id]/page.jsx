// Página para ver los proyectos de un usuario específico
'use client';
import { useParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import MyProjectsView from '@/components/project/search/MyProjectsView';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { NotFound } from '@/components/ui';
import { ROLES } from '@/constants/roles';

export default function UserProjectsPage() {
  const { id } = useParams();
  return (
    <ProtectedRoute
      allowedRoles={[ROLES.USER, ROLES.ADMIN, ROLES.MODERATOR]}
      fallbackComponent={<NotFound />}
    >
      <MyProjectsView userId={id}/>
    </ProtectedRoute>
  );
}
