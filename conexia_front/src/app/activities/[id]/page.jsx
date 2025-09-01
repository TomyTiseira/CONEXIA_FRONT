// Página para ver todas las publicaciones de un usuario específico
'use client';
import { useParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { NotFound } from '@/components/ui';
import { ROLES } from '@/constants/roles';
import UserActivitiesFeed from '@/components/activity/UserActivitiesFeed';
import Navbar from '@/components/navbar/Navbar';

export default function UserActivitiesPage() {
  const { id } = useParams();
  return (
    <ProtectedRoute
      allowedRoles={[ROLES.USER, ROLES.ADMIN, ROLES.MODERATOR]}
      fallbackComponent={<NotFound />}
    >
      <>
        <Navbar />
        <UserActivitiesFeed userId={id} />
      </>
    </ProtectedRoute>
  );
}
