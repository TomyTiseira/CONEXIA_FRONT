import { useState, useEffect } from 'react';
import PublicationCard from './PublicationCard';
import { getProfilePublications } from '@/service/publications/profilePublicationsFetch';
import { getProfileById } from '@/service/profiles/profilesFetch';
import ProfileSidebar from '@/components/profile/ProfileSidebar';
import Toast from '@/components/ui/Toast';

export default function UserActivitiesFeed({ userId }) {
  const [profile, setProfile] = useState(null);
  const [publications, setPublications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [profileLoading, setProfileLoading] = useState(true);
  const limit = 10;
  const [toast, setToast] = useState(null);

  // Obtener perfil del usuario a mostrar
  useEffect(() => {
    setProfile(null);
    setProfileLoading(true);
    if (!userId) return;
    getProfileById(userId)
      .then(res => setProfile(res?.data?.profile || null))
      .catch(() => setProfile(null))
      .finally(() => setProfileLoading(false));
  }, [userId]);

  useEffect(() => {
    setPage(1);
    setPublications([]);
    setHasMore(true);
  }, [userId]);

  useEffect(() => {
    const fetchPublications = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await getProfilePublications(userId, page, limit);
        const data = Array.isArray(res.data?.publications) ? res.data.publications : [];
        setPublications(prev => page === 1 ? data : [...prev, ...data]);
        setHasMore(res.data?.pagination?.hasNextPage ?? false);
      } catch (err) {
        setError('Error al cargar publicaciones');
      } finally {
        setLoading(false);
      }
    };
    fetchPublications();
    // eslint-disable-next-line
  }, [page, userId]);

  // Scroll infinito
  useEffect(() => {
    const handleScroll = () => {
      if (loading || !hasMore) return;
      const scrollY = window.scrollY || window.pageYOffset;
      const windowHeight = window.innerHeight;
      const docHeight = document.documentElement.scrollHeight;
      if (scrollY + windowHeight >= docHeight - 200) {
        setPage(prev => prev + 1);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [loading, hasMore]);

  return (
    <main className="p-4 md:p-8 bg-[#f8fcfc] min-h-screen pb-24 md:pb-8">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row gap-2 md:gap-6">
        {/* Sidebar perfil mobile (arriba de la caja de inicio) */}
        <div className="block md:hidden w-full mb-1">
          <ProfileSidebar profile={profile} userId={userId} />
        </div>
        {/* Sidebar perfil desktop/tablet */}
        <div className="hidden md:block w-full md:w-1/4 lg:w-1/5">
          <ProfileSidebar profile={profile} userId={userId} />
        </div>
        {/* Feed principal */}
        <div className="w-full md:w-3/4 lg:w-3/5 flex flex-col items-center">
          <div className="flex flex-col gap-0 w-full max-w-2xl">
            {error && <div className="text-red-500">{error}</div>}
            {loading && publications.length === 0 && (
              <div className="text-conexia-green/70 py-4 text-center">Cargando publicaciones...</div>
            )}
            {!loading && publications.length === 0 && !error && (
              <div className="text-conexia-green/70">No hay publicaciones para mostrar.</div>
            )}
            {publications.map(pub => (
              <PublicationCard key={pub.id} publication={pub} onShowToast={(t)=> setToast(t)} />
            ))}
            {loading && publications.length > 0 && (
              <div className="text-conexia-green/70 py-4 text-center">Cargando más publicaciones...</div>
            )}
            {!hasMore && publications.length > 0 && (
              <div className="text-conexia-green/60 py-4 text-center">No hay más publicaciones.</div>
            )}
          </div>
          {toast && (
            <Toast
              type={toast.type}
              message={toast.message}
              isVisible={toast.isVisible}
              onClose={() => setToast(null)}
              position="top-center"
              duration={4000}
            />
          )}
        </div>
      </div>
    </main>
  );
}
