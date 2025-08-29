'use client';

import { useState, useEffect } from 'react';
// import { FaGlobeAmericas, FaUsers } from 'react-icons/fa';
import useSessionTimeout from '@/hooks/useSessionTimeout';
import Button from '@/components/ui/Button';
import Image from 'next/image';
import PublicationModal from './publications/PublicationModal';
import { useAuth } from '@/context/AuthContext';
import { config } from '@/config';
import { getProfileById } from '@/service/profiles/profilesFetch';


// const MAX_DESCRIPTION = 500;
// const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'video/mp4'];


export default function ClientCommunity() {
  useSessionTimeout();
  const [modalOpen, setModalOpen] = useState(false);
  const { user, isLoading } = useAuth();

  // Simulación de publicación
  const handlePublish = (data) => {
    // Aquí iría la lógica para enviar la publicación al backend
    // console.log('Publicación:', data);
  };

  // Mostrar loading o placeholder si no hay usuario
  const avatar = user?.profilePicture
    ? `${config.IMAGE_URL}/${user.profilePicture}`
    : '/images/default-avatar.png';
  const displayName = user?.name && user?.lastName ? `${user.name} ${user.lastName}` : 'Usuario';

  const [profile, setProfile] = useState(null);
  const [profileLoading, setProfileLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user?.id) return;
      setProfileLoading(true);
      try {
        const data = await getProfileById(user.id);
        setProfile(data.data.profile);
      } catch (err) {
        setProfile(null);
      } finally {
        setProfileLoading(false);
      }
    };
    fetchProfile();
  }, [user?.id]);

  return (
    <main className="p-4 md:p-8 bg-[#f8fcfc] min-h-screen">
      <div className="max-w-2xl mx-auto">
        {/* Caja de inicio de publicación */}
        <div className="bg-white rounded-2xl shadow border border-[#c6e3e4] px-6 pt-4 pb-2 mb-8 flex flex-col gap-2">
          <div className="flex items-center gap-3">
            <Image src={profile?.profilePicture ? `${config.IMAGE_URL}/${profile.profilePicture}` : '/images/default-avatar.png'} alt="avatar" width={40} height={40} className="rounded-full aspect-square object-cover" />
            <button
              className="flex-1 text-left bg-[#eef6f6] text-conexia-green/70 px-4 py-2 rounded-lg border border-[#c6e3e4] focus:outline-none hover:bg-[#e0f0f0] transition-colors"
              onClick={() => setModalOpen(true)}
              disabled={isLoading || !user}
            >
              {profileLoading ? 'Cargando...' : `¿Qué tienes en mente?`}
            </button>
          </div>
          {/* Botones de adjunto alineados con el input, menos espacio vertical */}
          <div className="flex gap-2 mt-2">
            <button
              type="button"
              onClick={() => setModalOpen(true)}
              className="flex items-center gap-1 md:gap-2 px-2 md:px-4 py-2 rounded-lg bg-transparent border-none focus:outline-none transition-colors hover:bg-[#e0f0f0]"
              style={{ boxShadow: 'none', border: 'none', minWidth: 'auto' }}
              disabled={isLoading || !user}
            >
              <svg width="18" height="18" fill="none" viewBox="0 0 24 24"><rect x="3" y="5" width="18" height="14" rx="3" fill="#e0f0f0" stroke="#1e6e5c" strokeWidth="2"/><polygon points="10,9 16,12 10,15" fill="#1e6e5c"/></svg>
              <span className="text-xs text-conexia-green/80 select-none">Video</span>
            </button>
            <button
              type="button"
              onClick={() => setModalOpen(true)}
              className="flex items-center gap-1 md:gap-2 px-2 md:px-4 py-2 rounded-lg bg-transparent border-none focus:outline-none transition-colors hover:bg-[#e0f0f0]"
              style={{ boxShadow: 'none', border: 'none', minWidth: 'auto' }}
              disabled={isLoading || !user}
            >
              <svg width="18" height="18" fill="none" viewBox="0 0 24 24"><rect x="3" y="5" width="18" height="14" rx="3" fill="#e0f0f0" stroke="#1e6e5c" strokeWidth="2"/><text x="7" y="17" fontSize="8" fill="#1e6e5c">GIF</text></svg>
              <span className="text-xs text-conexia-green/80 select-none">GIF</span>
            </button>
          </div>
          <div className="flex-1" />
          <Button onClick={() => setModalOpen(true)} className="!px-4 md:!px-5 !py-2 !rounded-lg" disabled={isLoading || !user}>Publicar</Button>
        </div>

        {/* Modal de publicación */}
        <PublicationModal open={modalOpen} onClose={() => setModalOpen(false)} onPublish={handlePublish} user={{
          profilePicture: profile?.profilePicture,
          name: profile?.name && profile?.lastName ? `${profile.name} ${profile.lastName}` : 'Usuario',
        }} />

        {/* Aquí irían las publicaciones de la comunidad */}
        <h1 className="text-2xl font-bold text-conexia-green mb-4">Bienvenido a tu comunidad</h1>
        {/* ... */}
      </div>
    </main>
  );
}