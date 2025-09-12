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
            className="grid w-full"
            style={{
              gridTemplateColumns: 'repeat(auto-fill, 170px)',
              gap: '12px',
              justifyContent: 'start',
              padding: '0 12px',
            }}
          >
            {localFriends.map(friend => (
              <ConnectionFriendCard key={friend.id} friend={friend} />
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
