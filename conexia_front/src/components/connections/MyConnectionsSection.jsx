'use client';
import React from 'react';
import ConnectionFriendCard from '@/components/connections/ConnectionFriendCard';
import { useUserStore } from '@/store/userStore';
import { useUserFriends } from '@/hooks/connections/useUserFriends';

export default function MyConnectionsSection() {
  const { user } = useUserStore();
  const userId = user?.id;
  const { friends, loading, error, pagination, loadMore, page } = useUserFriends(userId);
  const [localFriends, setLocalFriends] = React.useState([]);

  React.useEffect(() => {
    setLocalFriends(friends);
  }, [friends]);

  // Scroll infinito para amigos
  React.useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (loading || !pagination?.hasNextPage) return;
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const scrollY = window.scrollY || window.pageYOffset;
          const windowHeight = window.innerHeight;
          const docHeight = document.documentElement.scrollHeight;
          if (scrollY + windowHeight >= docHeight - 200) {
            loadMore();
          }
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [loading, pagination?.hasNextPage, loadMore, page]);

  return (
    <div className="w-full">
      <div className="text-conexia-green text-2xl font-bold mb-1">Mis conexiones</div>
      <div className="text-conexia-green/80 mb-6">Personas con las que ya conectaste en Conexia.</div>
      {loading && localFriends.length === 0 ? (
        <div className="text-conexia-green/70 text-center py-8">Cargando...</div>
      ) : error ? (
        <div className="text-conexia-green/70 text-center py-8">{error}</div>
      ) : localFriends.length === 0 ? (
        <div className="text-conexia-green/70 text-center py-8">No tiene contactos aún.</div>
      ) : (
        <>
          <div
            className="grid connections-grid w-full"
            style={{
              paddingLeft: '4px',
              paddingRight: '4px',
              gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
              gap: '16px 8px',
              justifyContent: 'center',
            }}
          >
            <style jsx>{`
              .connection-card {
                width: 100%;
                max-width: 170px;
                min-width: 140px;
              }
              @media (min-width: 640px) {
                .connections-grid {
                  padding-left: 48px !important;
                  padding-right: 48px !important;
                  gap: 20px 12px !important;
                  grid-template-columns: repeat(auto-fit, minmax(170px, 1fr)) !important;
                }
              }
            `}</style>
            {localFriends.map(friend => (
              <div className="connection-card" key={friend.id}>
                <ConnectionFriendCard friend={friend} />
              </div>
            ))}
          </div>
          {loading && localFriends.length > 0 && (
            <div className="text-conexia-green/70 text-center py-4">Cargando más amigos...</div>
          )}
          {!pagination?.hasNextPage && localFriends.length > 0 && (
            <div className="text-conexia-green/60 py-4 text-center">No hay más amigos.</div>
          )}
        </>
      )}
    </div>
  );
}
