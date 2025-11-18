// Componente para mostrar las conexiones (amigos) de un usuario en su perfil
 'use client';
import React from 'react';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import { HiUserGroup } from 'react-icons/hi';
import ConnectionFriendCard from '@/components/connections/ConnectionFriendCard';
import { useUserFriends } from '@/hooks/connections/useUserFriends';
import ProfileSidebar from '@/components/profile/ProfileSidebar';
import { useAuth } from '@/context/AuthContext';
import { ROLES } from '@/constants/roles';

export default function UserConnections({ userId, profile, isOwner }) {
  // Get current user to check role
  const { user: currentUser } = useAuth();
  
  // Check if user is admin or moderator using constants
  const isAdmin = currentUser?.role === ROLES.ADMIN;
  const isModerator = currentUser?.role === ROLES.MODERATOR;
  
  // No mostrar conexiones para admins y moderadores
  if (isAdmin || isModerator) {
    return null;
  }
  
  // Traemos los primeros 8 amigos, pero solo mostramos los que entran en una fila (como actividad)
  const { friends, loading, error } = useUserFriends(userId, 1, 8);
  // Determinar cuántos mostrar según el tamaño de pantalla
  // En desktop: 5, en tablet: 3, en mobile: 2
  let maxPerRow = 2;
  if (typeof window !== 'undefined') {
    const w = window.innerWidth;
    if (w >= 1024) maxPerRow = 5;
    else if (w >= 640) maxPerRow = 3;
    else maxPerRow = 2;
  }
  const visibleFriends = friends.slice(0, maxPerRow);

  // No mostrar la sección si está cargando, hay error o no hay amigos
  if (loading || error || friends.length === 0) {
    return null;
  }

  return (
    <section className="w-full mt-8">
      <div className="bg-white rounded-2xl shadow p-6">
        <div className="flex flex-col items-start mb-2">
          <div className="flex items-center gap-2 mb-1">
            <HiUserGroup className="w-6 h-6 text-conexia-green" />
            <h3 className="text-base md:text-lg font-bold text-conexia-green">
              {isOwner ? 'Mis Conexiones' : 'Conexiones'}
            </h3>
          </div>
          <div className="text-gray-500 text-xs md:text-sm mb-2">
            {isOwner ? 'Tus contactos en Conexia.' : 'Contactos de este usuario en Conexia.'}
          </div>
        </div>
        {loading || error || friends.length === 0 ? (
          null
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 items-start">
            {visibleFriends.map(friend => (
              <ConnectionFriendCard key={friend.id} friend={friend} />
            ))}
          </div>
        )}
        {friends.length > 0 && (
          <div className="flex flex-col sm:flex-row justify-center sm:justify-end mt-4">
            <Link
              href={`/profile/${userId}/connections`}
              className="w-full sm:w-auto flex items-center gap-1.5 px-5 py-2 rounded-lg font-semibold shadow bg-[#eef6f6] text-conexia-green hover:bg-[#e0f0f0] text-base border border-[#c6e3e4] justify-center text-center"
              style={{ minHeight: '40px' }}
            >
              <svg className="w-7 h-7 hidden sm:inline" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24" style={{ verticalAlign: 'middle' }}>
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2.2" fill="none"/>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v8m4-4H8" />
              </svg>
              <span className="w-full text-center">Ver más…</span>
            </Link>
          </div>
        )}
      </div>
    </section>
  )
}
