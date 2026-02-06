'use client';

import useSessionTimeout from '@/hooks/useSessionTimeout';
import { useState, useEffect } from 'react';
import PublicationCard from '@/components/activity/PublicationCard';
import { getCommunityPublications } from '@/service/publications/publicationsFetch';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

export default function ClientModerator() {
  useSessionTimeout();
  const [publications, setPublications] = useState([]);
  const [loadingPublications, setLoadingPublications] = useState(true);
  const [errorPublications, setErrorPublications] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const limit = 10;
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);

  useEffect(() => {
    const fetchPublications = async () => {
      setLoadingPublications(true);
      setErrorPublications(null);
      try {
        const res = await getCommunityPublications({ page, limit });
        const data = Array.isArray(res.data?.publications) ? res.data.publications : [];
        setPublications(prev => page === 1 ? data : [...prev, ...data]);
        setHasMore(res.data?.pagination?.hasNextPage ?? false);
      } catch (err) {
        setErrorPublications('Error al cargar publicaciones');
        console.error('Error al cargar publicaciones:', err);
      } finally {
        setLoadingPublications(false);
        if (page === 1) {
          setInitialLoadComplete(true);
        }
      }
    };
    fetchPublications();
    // eslint-disable-next-line
  }, [page]);

  useEffect(() => {
    const handleScroll = () => {
      if (loadingPublications || !hasMore) return;
      const scrollY = window.scrollY || window.pageYOffset;
      const windowHeight = window.innerHeight;
      const docHeight = document.documentElement.scrollHeight;
      if (scrollY + windowHeight >= docHeight - 200) {
        setPage(prev => prev + 1);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [loadingPublications, hasMore]);

  // Mostrar spinner de carga inicial hasta que las publicaciones estén listas
  if (!initialLoadComplete) {
    return <LoadingSpinner message="Cargando publicaciones..." />;
  }

  return (
    <main className="p-4 md:p-8 bg-[#f8fcfc] min-h-screen pb-24 md:pb-8">
      {/* Tarjeta de Bienvenida para Moderador */}
      <div className="w-full max-w-2xl mx-auto mb-6">
        <div className="bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-700 rounded-xl shadow-lg overflow-hidden">
          <div className="p-4 md:p-5 relative">
            {/* Patrón decorativo de fondo */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 right-0 w-48 h-48 bg-white rounded-full -mr-24 -mt-24"></div>
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-white rounded-full -ml-16 -mb-16"></div>
            </div>
            
            <div className="relative z-10 flex flex-col md:flex-row items-center gap-3">
              {/* Icono de Moderador */}
              <div className="flex-shrink-0">
                <div className="w-12 h-12 md:w-14 md:h-14 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center shadow-lg">
                  <svg className="w-6 h-6 md:w-7 md:h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </div>
              </div>
              
              {/* Texto de bienvenida */}
              <div className="flex-1 text-center md:text-left">
                <h1 className="text-2xl md:text-3xl font-bold text-white mb-1">
                  ¡Bienvenido, Moderador!
                </h1>
                <p className="text-white/90 text-xs md:text-sm">
                  Supervisa el contenido y mantén la comunidad de Conexia segura
                </p>
              </div>
              
              {/* Badge de rol */}
              <div className="flex-shrink-0">
                <div className="bg-white/20 backdrop-blur-sm border-2 border-white/40 rounded-full px-3 py-1.5">
                  <span className="text-white font-semibold text-xs">Moderador</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Feed de publicaciones */}
      <div className="flex flex-col gap-0 w-full max-w-2xl mx-auto">
        {errorPublications && <div className="text-red-500">{errorPublications}</div>}
        {!loadingPublications && publications.length === 0 && !errorPublications && (
          <div className="text-conexia-green/70">No hay publicaciones para mostrar.</div>
        )}
        {publications.map(pub => (
          <PublicationCard key={pub.id} publication={pub} />
        ))}
        {loadingPublications && publications.length > 0 && (
          <div className="text-conexia-green/70 py-4 text-center">Cargando más publicaciones...</div>
        )}
        {!hasMore && publications.length > 0 && (
          <div className="text-conexia-green/60 py-4 text-center">No hay más publicaciones.</div>
        )}
      </div>
    </main>
  );
}
