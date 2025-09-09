// Componente para mostrar las conexiones (amigos) de un usuario en su perfil
'use client';
import React from 'react';
import Button from '@/components/ui/Button';
import { HiUserGroup } from 'react-icons/hi';
import ConnectionFriendCard from '@/components/connections/ConnectionFriendCard';
import { useUserFriends } from '@/hooks/connections/useUserFriends';
import ProfileSidebar from '@/components/profile/ProfileSidebar';

export default function UserConnections({ userId, profile }) {
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

  return (
    <section className="w-full mt-8">
      <div className="bg-white rounded-2xl shadow p-6">
        <div className="flex flex-col items-start mb-2">
          <div className="flex items-center gap-2 mb-1">
            <HiUserGroup className="w-6 h-6 text-conexia-green" />
            <h3 className="text-base md:text-lg font-bold text-conexia-green">Conexiones</h3>
          </div>
          <div className="text-gray-500 text-xs md:text-sm mb-2">Contactos de este usuario en Conexia.</div>
        </div>
        {loading ? (
          <div className="text-conexia-green/70 text-center py-8">Cargando conexiones...</div>
        ) : error ? (
          <div className="text-conexia-green/70 text-center py-8">{error}</div>
        ) : friends.length === 0 ? (
          <div className="text-conexia-green/70 text-center py-8">No tiene contactos aún.</div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 items-start">
            {visibleFriends.map(friend => (
              <ConnectionFriendCard key={friend.id} friend={friend} />
            ))}
          </div>
        )}
        <div className="flex flex-col sm:flex-row justify-end mt-4">
          <a
            href={`/profile/${userId}/connections`}
            className="w-full sm:w-auto flex items-center gap-2 px-5 py-2 rounded-lg font-semibold shadow bg-[#eef6f6] text-conexia-green hover:bg-[#e0f0f0] text-base border border-[#c6e3e4] justify-center text-center"
            style={{ minHeight: '40px' }}
          >
            <span className="w-full text-center">Mostrar todas las conexiones</span>
            <svg
              className="w-5 h-5 text-conexia-green hidden sm:inline"
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle
                cx="10"
                cy="10"
                r="8.5"
                stroke="currentColor"
                strokeWidth="1.5"
                fill="none"
              />
              <line
                x1="13.5"
                y1="10"
                x2="6.5"
                y2="10"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
              <polyline
                points="11,7 14,10 11,13"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </a>
        </div>
      </div>
    </section>
  )
}
