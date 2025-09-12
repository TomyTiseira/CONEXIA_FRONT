import { Suspense } from 'react';
import UserProfile from '@/components/profile/userProfile/userProfile';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { NotFound } from '@/components/ui';
import { ROLES } from '@/constants/roles';

export default function UserProfilePage() {
  return (
    <ProtectedRoute
      allowedRoles={[ROLES.USER, ROLES.ADMIN, ROLES.MODERATOR]}
      fallbackComponent={<NotFound />}
    >
      <Suspense fallback={
        <div className="min-h-screen flex items-center justify-center bg-conexia-soft">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-conexia-green mx-auto mb-4"></div>
            <p className="text-conexia-green">Cargando perfil...</p>
          </div>
        </div>
      }>
        <UserProfile />
      </Suspense>
    </ProtectedRoute>
  );
}
