'use client';

import { useState, useEffect } from 'react';
// import { FaGlobeAmericas, FaUsers } from 'react-icons/fa';
import useSessionTimeout from '@/hooks/useSessionTimeout';
import Button from '@/components/ui/Button';
import PublicationCard from '@/components/activity/PublicationCard';
import Image from 'next/image';
import PublicationModal from './publications/PublicationModal';
import { useAuth } from '@/context/AuthContext';
import { useUserStore } from '@/store/userStore';
import { config } from '@/config';
import { getCommunityPublications } from '@/service/publications/publicationsFetch';

export default function ClientCommunity() {
  useSessionTimeout();
  const [modalOpen, setModalOpen] = useState(false);
  const { user, isLoading } = useAuth();
  const { profile } = useUserStore();
  const [publications, setPublications] = useState([]);
  const [loadingPublications, setLoadingPublications] = useState(true);
  const [errorPublications, setErrorPublications] = useState(null);



  // Obtener publicaciones de la comunidad (solo las que no son propias)
  useEffect(() => {
    const fetchPublications = async () => {
      setLoadingPublications(true);
      setErrorPublications(null);
      try {
        const res = await getCommunityPublications();
        const data = res.data || [];
        const filtered = data.filter(pub => pub.isOwner === false);
        setPublications(filtered);
      } catch (err) {
        setErrorPublications('Error al cargar publicaciones');
        console.error('Error al cargar publicaciones:', err);
      } finally {
        setLoadingPublications(false);
      }
    };
    try {
      fetchPublications();
    } catch (e) {
      console.error('Error global useEffect:', e);
    }
  }, []);

    // Simulación de publicación
    const handlePublish = (data) => {
      // Aquí iría la lógica para enviar la publicación al backend
      // console.log('Publicación:', data);
    };

    const avatar = profile?.profilePicture
      ? `${config.IMAGE_URL}/${profile.profilePicture}`
      : '/images/default-avatar.png';
    const displayName = profile?.name && profile?.lastName ? `${profile.name} ${profile.lastName}` : 'Usuario';

    // Helper para asegurar URLs absolutas (igual que en ProjectDetail)
    const getMediaUrl = (mediaUrl) => {
      if (!mediaUrl) return null;
      if (mediaUrl.startsWith('http://') || mediaUrl.startsWith('https://')) return mediaUrl;
      if (mediaUrl.startsWith('/uploads')) return `${config.IMAGE_URL}${mediaUrl.replace('/uploads', '')}`;
      if (mediaUrl.startsWith('/')) return `${config.IMAGE_URL}${mediaUrl}`;
      return `${config.IMAGE_URL}/${mediaUrl}`;
    };

    return (
      <main className="p-4 md:p-8 bg-[#f8fcfc] min-h-screen">
        <div className="max-w-2xl mx-auto">
          {/* Caja de inicio de publicación */}
          <div className="bg-white rounded-2xl shadow border border-[#c6e3e4] px-6 pt-4 pb-2 mb-8 flex flex-col gap-2">
            <div className="flex items-center gap-3">
              <Image src={avatar} alt="avatar" width={40} height={40} className="rounded-full aspect-square object-cover" />
              <button
                className="flex-1 text-left bg-[#eef6f6] text-conexia-green/70 px-4 py-2 rounded-lg border border-[#c6e3e4] focus:outline-none hover:bg-[#e0f0f0] transition-colors"
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
          <h1 className="text-2xl font-bold text-conexia-green mb-4">Bienvenido a tu comunidad</h1>
          {errorPublications && <div className="text-red-500">{errorPublications}</div>}
          {publications.length === 0 && !errorPublications && (
            <div className="text-conexia-green/70">No hay publicaciones de la comunidad para mostrar.</div>
          )}
          <div className="flex flex-col gap-4">
            {publications.map(pub => (
              <PublicationCard key={pub.id} publication={pub} />
            ))}
          </div>
        </div>
      </main>
    );
  }