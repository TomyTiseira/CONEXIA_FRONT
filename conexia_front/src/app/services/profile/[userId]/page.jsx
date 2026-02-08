'use client';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

import { use } from 'react';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { NotFound } from '@/components/ui';
import { ROLES } from '@/constants/roles';
import UserServicesPage from '@/components/services/UserServicesPage';
import { useUserStore } from '@/store/userStore';
import { config } from '@/config';
import MessagingWidget from '@/components/messaging/MessagingWidget';

export default function UserServicesProfilePage({ params }) {
  const resolvedParams = use(params);
  
  // Avatar como en ClientCommunity
  const { profile } = useUserStore();
  const avatar = profile?.profilePicture
    ? `${config.IMAGE_URL}/${profile.profilePicture}`
    : '/images/default-avatar.png';
  
  // Detectar si está en proceso de logout
  let isLoggingOut = false;
  if (typeof window !== 'undefined') {
    isLoggingOut = window.__CONEXIA_LOGGING_OUT__ === true;
  }
  return (
    <ProtectedRoute
      allowedRoles={[ROLES.USER, ROLES.ADMIN, ROLES.MODERATOR]}
      fallbackComponent={isLoggingOut ? <LoadingSpinner message="Cerrando sesión..." size="large" /> : <NotFound />}
    >
      <>
        <UserServicesPage userId={resolvedParams.userId} />
        {/* Widget de mensajería (igual que en ClientCommunity) */}
        <MessagingWidget avatar={avatar} />
      </>
    </ProtectedRoute>
  );
}