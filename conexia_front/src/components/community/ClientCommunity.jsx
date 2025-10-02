
'use client';

import { useState, useEffect } from 'react';
// import { FaGlobeAmericas, FaUsers } from 'react-icons/fa';
import useSessionTimeout from '@/hooks/useSessionTimeout';
import Button from '@/components/ui/Button';
import PublicationCard from '@/components/activity/PublicationCard';
import ProfileSidebar from '@/components/profile/ProfileSidebar';
import Image from 'next/image';
import PublicationModal from './publications/PublicationModal';
import Toast from '@/components/ui/Toast';
import { useAuth } from '@/context/AuthContext';
import { useUserStore } from '@/store/userStore';
import { ROLES } from '@/constants/roles';
import { config } from '@/config';
import { getCommunityPublications } from '@/service/publications/publicationsFetch';
import MessagingWidget from '@/components/messaging/MessagingWidget';
import { MiniRecommendations } from '@/components/connections/MiniRecommendations';
import { useRecommendations } from '@/hooks/connections/useRecommendations';
import { sendConnectionRequest } from '@/service/connections/sendConnectionRequest';

export default function ClientCommunity() {
  useSessionTimeout();
  const [modalOpen, setModalOpen] = useState(false);
  const { user, isLoading } = useAuth();
  const { profile, roleName } = useUserStore();
  const [publications, setPublications] = useState([]);
  const [loadingPublications, setLoadingPublications] = useState(false);
  const [errorPublications, setErrorPublications] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const limit = 10;
  const { user: userStore } = useUserStore();
  const [toast, setToast] = useState(null);

  // Hook para recomendaciones
  const { 
    recommendations, 
    loading: loadingRecommendations, 
    error: errorRecommendations, 
    refetch: refetchRecommendations 
  } = useRecommendations();

  // Función para conectar con un usuario
  const handleConnect = async (userId) => {
    try {
      await sendConnectionRequest(userId);
      // Actualizar las recomendaciones para remover el usuario conectado
      refetchRecommendations();
    } catch (err) {
      console.error('Error al enviar solicitud de conexión:', err);
    }
  };



  // Obtener publicaciones de la comunidad (solo las que no son propias)
  useEffect(() => {
    const fetchPublications = async () => {
      setLoadingPublications(true);
      setErrorPublications(null);
      try {
        const res = await getCommunityPublications({ page, limit });
        
        // Obtener publicaciones del response
        const data = Array.isArray(res.data?.publications) ? res.data.publications : [];
        
        // Filtrar publicaciones que no sean propias
        const validPublications = data
          .filter(pub => pub && pub.id)
          .filter(pub => pub.isOwner === false);
        
        // Actualizar estado de publicaciones
        setPublications(prev => page === 1 ? validPublications : [...prev, ...validPublications]);
        setHasMore(res.data?.pagination?.hasNextPage ?? false);
      } catch (err) {
        setErrorPublications('Error al cargar publicaciones');
        console.error('Error al cargar publicaciones:', err);
      } finally {
        setLoadingPublications(false);
      }
    };
    fetchPublications();
    // eslint-disable-next-line
  }, [page]);

  // Scroll infinito
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

    // Resultado de publicación (success/error) proveniente del modal
    const handlePublish = (result) => {
      if (!result) return;
      if (result.success) {
        setToast({ type: 'success', message: 'Publicación creada con éxito', isVisible: true });
      } else {
        setToast({ type: 'error', message: result.error || 'No se pudo crear la publicación', isVisible: true });
      }
    };

    const isInternal = roleName === ROLES.ADMIN || roleName === ROLES.MODERATOR;
    const avatar = !isInternal && profile?.profilePicture
      ? `${config.IMAGE_URL}/${profile.profilePicture}`
      : '/images/default-avatar.png';
    const displayName = !isInternal && profile?.name && profile?.lastName ? `${profile.name} ${profile.lastName}` : (isInternal ? (roleName === ROLES.ADMIN ? 'Administrador' : 'Moderador') : 'Usuario');

    // Helper para asegurar URLs absolutas (igual que en ProjectDetail)
    const getMediaUrl = (mediaUrl) => {
      if (!mediaUrl) return null;
      if (mediaUrl.startsWith('http://') || mediaUrl.startsWith('https://')) return mediaUrl;
      if (mediaUrl.startsWith('/uploads')) return `${config.IMAGE_URL}${mediaUrl.replace('/uploads', '')}`;
      if (mediaUrl.startsWith('/')) return `${config.IMAGE_URL}${mediaUrl}`;
      return `${config.IMAGE_URL}/${mediaUrl}`;
    };

    return (
      <main className="p-4 md:p-8 bg-[#f8fcfc] min-h-screen pb-24 md:pb-8 relative">
        <div className="w-full max-w-6xl mx-auto flex flex-col md:flex-row gap-2 md:gap-4">
          {/* Sidebar perfil mobile (arriba de la caja de inicio) */}
          {userStore?.id && !isInternal && (
            <div className="block md:hidden w-full mb-1">
              <ProfileSidebar profile={profile} userId={userStore.id} />
            </div>
          )}
          {/* Sidebar perfil desktop/tablet */}
          {userStore?.id && !isInternal && (
            <div className="hidden md:block w-full md:w-72 lg:w-64 flex-shrink-0">
              <ProfileSidebar profile={profile} userId={userStore.id} />
            </div>
          )}
          {/* Feed principal */}
          <div className="flex-1 flex flex-col items-center max-w-2xl mx-auto">
            {/* Caja de inicio de publicación */}
            <div className="bg-white rounded-2xl shadow border border-[#c6e3e4] px-2 sm:px-4 md:px-6 pt-4 pb-2 mb-3 flex flex-col gap-2 w-full">
              <div className="flex items-center gap-3">
                <Image src={avatar} alt="avatar" width={40} height={40} className="rounded-full aspect-square object-cover" />
                <button
                  className="flex-1 text-left bg-[#eef6f6] text-conexia-green/70 px-6 py-3 rounded-lg border border-[#c6e3e4] focus:outline-none hover:bg-[#e0f0f0] transition-colors"
                  onClick={() => setModalOpen(true)}
                  disabled={isLoading || !user}
                >
                  {profile ? `¿Qué tienes en mente?` : 'Cargando...'}
                </button>
              </div>
              {/* Botones de adjunto alineados con el input, menos espacio vertical */}
              <div className="flex items-center gap-2 md:gap-3 mt-0 pb-2 pl-[56px] md:pl-[56px]">
                <button
                  type="button"
                  onClick={() => setModalOpen(true)}
                  className="flex items-center gap-1 md:gap-2 px-2 md:px-4 py-2 rounded-lg bg-transparent border-none focus:outline-none transition-colors hover:bg-[#e0f0f0]"
                  style={{ boxShadow: 'none', border: 'none', minWidth: 'auto' }}
                  disabled={isLoading || !user}
                >
                  <svg width="18" height="18" fill="none" viewBox="0 0 24 24"><rect x="3" y="5" width="18" height="14" rx="3" fill="#e0f0f0" stroke="#1e6e5c" strokeWidth="2"/><circle cx="8" cy="10" r="2" fill="#1e6e5c"/><path d="M21 19l-5.5-7-4.5 6-3-4-4 5" stroke="#1e6e5c" strokeWidth="2" strokeLinecap="round"/></svg>
                  <span className="hidden md:inline text-xs text-conexia-green/80 select-none">Imagen</span>
                </button>
                <button
                  type="button"
                  onClick={() => setModalOpen(true)}
                  className="flex items-center gap-1 md:gap-2 px-2 md:px-4 py-2 rounded-lg bg-transparent border-none focus:outline-none transition-colors hover:bg-[#e0f0f0]"
                  style={{ boxShadow: 'none', border: 'none', minWidth: 'auto' }}
                  disabled={isLoading || !user}
                >
                  <svg width="18" height="18" fill="none" viewBox="0 0 24 24"><rect x="3" y="5" width="18" height="14" rx="3" fill="#e0f0f0" stroke="#1e6e5c" strokeWidth="2"/><polygon points="10,9 16,12 10,15" fill="#1e6e5c"/></svg>
                  <span className="hidden md:inline text-xs text-conexia-green/80 select-none">Video</span>
                </button>
                <button
                  type="button"
                  onClick={() => setModalOpen(true)}
                  className="flex items-center gap-1 md:gap-2 px-2 md:px-4 py-2 rounded-lg bg-transparent border-none focus:outline-none transition-colors hover:bg-[#e0f0f0]"
                  style={{ boxShadow: 'none', border: 'none', minWidth: 'auto' }}
                  disabled={isLoading || !user}
                >
                  <svg width="18" height="18" fill="none" viewBox="0 0 24 24"><rect x="3" y="5" width="18" height="14" rx="3" fill="#e0f0f0" stroke="#1e6e5c" strokeWidth="2"/><text x="7" y="17" fontSize="8" fill="#1e6e5c">GIF</text></svg>
                  <span className="hidden md:inline text-xs text-conexia-green/80 select-none">GIF</span>
                </button>
                <div className="flex-1" />
                <Button onClick={() => setModalOpen(true)} className="!px-4 md:!px-5 !py-2 !rounded-lg ml-0 md:ml-4 mt-2 md:mt-0" disabled={isLoading || !user}>Publicar</Button>
              </div>
            </div>
            {/* Modal de publicación */}
            <PublicationModal open={modalOpen} onClose={() => setModalOpen(false)} onPublish={handlePublish} user={{
              profilePicture: profile?.profilePicture,
              name: profile?.name && profile?.lastName ? `${profile.name} ${profile.lastName}` : 'Usuario',
              profession: profile?.profession,
              location: profile?.location,
            }} />

            {/* Publicaciones de la comunidad (no propias) */}
            {errorPublications && <div className="text-red-500">{errorPublications}</div>}
            <div className="flex flex-col gap-0 w-full">
              {loadingPublications && publications.length === 0 && (
                <div className="text-conexia-green/70 py-4 text-center">Cargando publicaciones...</div>
              )}
              {!loadingPublications && publications.length === 0 && !errorPublications && (
                <div className="text-conexia-green/70">No hay publicaciones de la comunidad para mostrar.</div>
              )}
              {publications.map(pub => {
                // Asegurarse de que todos los campos necesarios están presentes
                const publicationComplete = {
                  ...pub,
                  reactionsCount: pub.reactionsCount || 0,
                  commentsCount: pub.commentsCount || 0,
                  reactionsSummary: pub.reactionsSummary || [],
                  latestComments: pub.latestComments || [],
                };
                
                return (
                  <PublicationCard 
                    key={publicationComplete.id} 
                    publication={publicationComplete} 
                    onShowToast={(t)=> setToast(t)}
                  />
                );
              })}
              {loadingPublications && publications.length > 0 && (
                <div className="text-conexia-green/70 py-4 text-center">Cargando más publicaciones...</div>
              )}
              {!hasMore && publications.length > 0 && (
                <div className="text-conexia-green/60 py-4 text-center">No hay más publicaciones.</div>
              )}
            </div>
          </div>
          {/* MiniRecommendations sidebar derecho */}
          <div className="hidden md:block w-72 lg:w-64 flex-shrink-0 flex flex-col items-start">
            <MiniRecommendations
              recommendations={recommendations}
              onConnect={handleConnect}
              loading={loadingRecommendations}
              error={errorRecommendations}
            />
          </div>
        </div>
        {/* Widget de mensajería reutilizable */}
        <MessagingWidget avatar={avatar} />
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
      </main>
    );
  }