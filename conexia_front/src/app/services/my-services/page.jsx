'use client';

import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { NotFound } from '@/components/ui';
import { ROLES } from '@/constants/roles';
import MyServicesPage from '@/components/services/MyServicesPage';
import { useUserStore } from '@/store/userStore';
import { config } from '@/config';
import MessagingWidget from '@/components/messaging/MessagingWidget';

export default function MyServicesPageRoute() {
  // Avatar como en otras páginas
  const { profile } = useUserStore();
  const avatar = profile?.profilePicture
    ? `${config.IMAGE_URL}/${profile.profilePicture}`
    : '/images/default-avatar.png';

  return (
    <ProtectedRoute
      allowedRoles={[ROLES.USER]}
      fallbackComponent={<NotFound />}
    >
      <>
        <MyServicesPage />
        {/* Widget de mensajería */}
        <MessagingWidget avatar={avatar} />
      </>
    </ProtectedRoute>
  );
}