import { Suspense } from 'react';
import UserProfile from '@/components/profile/userProfile/userProfile';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

export default function UserProfilePage() {
  return (
    <Suspense fallback={<LoadingSpinner message="Cargando perfil" />}>
      <UserProfile />
    </Suspense>
  );
}
