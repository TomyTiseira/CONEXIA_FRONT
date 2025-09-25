'use client';

import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { NotFound } from '@/components/ui';
import { ROLES } from '@/constants/roles';
import ServiceSearch from '@/components/services/ServiceSearch';
import { useUserStore } from '@/store/userStore';
import { config } from '@/config';
import MessagingWidget from '@/components/messaging/MessagingWidget';

export default function ServicesPage() {
  // Avatar como en ClientCommunity
  const { profile } = useUserStore();
  const avatar = profile?.profilePicture
    ? `${config.IMAGE_URL}/${profile.profilePicture}`
    : '/images/default-avatar.png';

  return (
    <ProtectedRoute
      allowedRoles={[ROLES.USER, ROLES.ADMIN, ROLES.MODERATOR]}
      fallbackComponent={<NotFound />}
    >
      <>
        <ServiceSearch />
        {/* Widget de mensajería (igual que en ClientCommunity) */}
        <MessagingWidget avatar={avatar} />
      </>
    </ProtectedRoute>
  );
}