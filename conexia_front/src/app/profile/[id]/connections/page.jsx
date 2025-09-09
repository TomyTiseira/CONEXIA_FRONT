// Página para ver todas las conexiones (amigos) de un usuario
'use client';
import React, { useEffect, useState, Suspense } from 'react';
import { useParams } from 'next/navigation';
import { useUserFriends } from '@/hooks/connections/useUserFriends';
import ConnectionFriendCard from '@/components/connections/ConnectionFriendCard';
import Navbar from '@/components/navbar/Navbar';
import ProfileSidebar from '@/components/profile/ProfileSidebar';
import { getProfileById } from '@/service/profiles/profilesFetch';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { NotFound } from '@/components/ui';
import { ROLES } from '@/constants/roles';

export default function UserConnectionsPage() {
  const { id } = useParams();
  const { friends, loading, error, pagination, loadMore, page } = useUserFriends(id, 1, 12);
  const [profile, setProfile] = useState(null);
  const [profileLoading, setProfileLoading] = useState(true);

  useEffect(() => {
    setProfile(null);
    setProfileLoading(true);
    if (!id) return;
    getProfileById(id)
      .then(res => setProfile(res?.data?.profile || null))
      .catch(() => setProfile(null))
      .finally(() => setProfileLoading(false));
  }, [id]);

  // Scroll infinito
  useEffect(() => {
    const handleScroll = () => {
      if (loading || !pagination?.hasNextPage) return;
      const scrollY = window.scrollY || window.pageYOffset;
      const windowHeight = window.innerHeight;
      const docHeight = document.documentElement.scrollHeight;
      if (scrollY + windowHeight >= docHeight - 200) {
        loadMore();
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [loading, pagination?.hasNextPage, loadMore, page]);

  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-[#f8fcfc]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-conexia-green mx-auto mb-4"></div>
          <p className="text-conexia-green">Cargando conexiones...</p>
        </div>
      </div>
    }>
      <ProtectedRoute
        allowedRoles={[ROLES.USER, ROLES.ADMIN, ROLES.MODERATOR]}
        fallbackComponent={<NotFound />}
      >
        <main className="bg-[#f8fcfc] min-h-screen pb-24 md:pb-8 w-full">
          <Navbar />
          <div className="w-full flex flex-col md:flex-row gap-0 md:gap-6 px-1 md:px-6 pt-4 md:pt-8 max-w-7xl mx-auto">
            {/* Sidebar perfil mobile (arriba) */}
            <div className="block md:hidden w-full mb-2">
              <ProfileSidebar profile={profile} userId={id} />
            </div>
            {/* Sidebar perfil desktop/tablet */}
            <div className="hidden md:block w-full md:w-1/4 lg:w-1/5">
              <ProfileSidebar profile={profile} userId={id} />
            </div>
            {/* Conexiones */}
            <div className="w-full md:w-3/4 lg:w-4/5 flex justify-center">
              <div className="bg-white rounded-2xl shadow p-2 md:p-6 border border-[#c6e3e4] w-full max-w-full md:max-w-4xl flex flex-col items-center">
                <h2 className="text-conexia-green text-2xl font-bold mb-1">Conexiones de este usuario</h2>
                <p className="text-conexia-green/80 mb-6 text-center">Personas con las que ya conectó en Conexia.</p>
                {loading && friends.length === 0 ? (
                  <div className="text-conexia-green/70 text-center py-8">Cargando conexiones...</div>
                ) : error ? (
                  <div className="text-conexia-green/70 text-center py-8">{error}</div>
                ) : friends.length === 0 ? (
                  <div className="text-conexia-green/70 text-center py-8">No tiene contactos aún.</div>
                ) : (
                  <div
                    className="grid w-full"
                    style={{
                      gridTemplateColumns: 'repeat(auto-fill, 170px)',
                      gap: '12px',
                      justifyContent: 'start',
                      padding: '0 12px',
                    }}
                  >
                    {friends.map(friend => (
                      <ConnectionFriendCard key={friend.id} friend={friend} />
                    ))}
                  </div>
                )}
                {loading && friends.length > 0 && (
                  <div className="text-conexia-green/70 text-center py-4">Cargando más conexiones...</div>
                )}
                {!pagination?.hasNextPage && friends.length > 0 && (
                  <div className="text-conexia-green/60 py-4 text-center">No hay más conexiones.</div>
                )}
              </div>
            </div>
          </div>
        </main>
      </ProtectedRoute>
    </Suspense>
  );
}
