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
      <h1 className="text-2xl font-bold text-conexia-green mb-6">¡Bienvenido Moderador!</h1>
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
