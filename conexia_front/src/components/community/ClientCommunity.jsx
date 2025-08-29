'use client';

import { useState, useRef } from 'react';
// import { FaGlobeAmericas, FaUsers } from 'react-icons/fa';
import useSessionTimeout from '@/hooks/useSessionTimeout';
import Button from '@/components/ui/Button';
import Image from 'next/image';
import PublicationModal from './publications/PublicationModal';

const user = {
  name: 'Luis Rodríguez',
  avatar: '/images/default-avatar.png',
  subtitle: 'Estudiante en UTN Facultad Regional Córdoba',
};

// const MAX_DESCRIPTION = 500;
// const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'video/mp4'];


export default function ClientCommunity() {
  useSessionTimeout();
  const [modalOpen, setModalOpen] = useState(false);

  // Simulación de publicación
  const handlePublish = (data) => {
    // Aquí iría la lógica para enviar la publicación al backend
    // console.log('Publicación:', data);
  };

  return (
    <main className="p-4 md:p-8 bg-[#f8fcfc] min-h-screen">
      <div className="max-w-2xl mx-auto">
        {/* Caja de inicio de publicación */}
        <div className="bg-white rounded-2xl shadow border border-[#c6e3e4] px-6 pt-4 pb-2 mb-8 flex flex-col gap-2">
          <div className="flex items-center gap-3">
            <Image src={user.avatar} alt="avatar" width={40} height={40} className="rounded-full object-cover" />
            <button
              className="flex-1 text-left bg-[#eef6f6] text-conexia-green/70 px-4 py-2 rounded-lg border border-[#c6e3e4] focus:outline-none hover:bg-[#e0f0f0] transition-colors"
              onClick={() => setModalOpen(true)}
            >
              ¿Qué tienes en mente?
            </button>
          </div>
          {/* Botones de adjunto alineados con el input, menos espacio vertical */}
          <div className="flex gap-2 md:gap-3 mt-0 pb-2" style={{ marginLeft: '56px', marginTop: '4px' }}>
            <button
              type="button"
              onClick={() => setModalOpen(true)}
              className="flex items-center gap-1 md:gap-2 px-2 md:px-4 py-2 rounded-lg bg-transparent border-none focus:outline-none transition-colors hover:bg-[#e0f0f0]"
              style={{ boxShadow: 'none', border: 'none', minWidth: 'auto' }}
            >
              <svg width="18" height="18" fill="none" viewBox="0 0 24 24"><rect x="3" y="5" width="18" height="14" rx="3" fill="#e0f0f0" stroke="#1e6e5c" strokeWidth="2"/><circle cx="8" cy="10" r="2" fill="#1e6e5c"/><path d="M21 19l-5.5-7-4.5 6-3-4-4 5" stroke="#1e6e5c" strokeWidth="2" strokeLinecap="round"/></svg>
              <span className="text-xs text-conexia-green/80 select-none">Foto</span>
            </button>
            <button
              type="button"
              onClick={() => setModalOpen(true)}
              className="flex items-center gap-1 md:gap-2 px-2 md:px-4 py-2 rounded-lg bg-transparent border-none focus:outline-none transition-colors hover:bg-[#e0f0f0]"
              style={{ boxShadow: 'none', border: 'none', minWidth: 'auto' }}
            >
              <svg width="18" height="18" fill="none" viewBox="0 0 24 24"><rect x="3" y="5" width="18" height="14" rx="3" fill="#e0f0f0" stroke="#1e6e5c" strokeWidth="2"/><polygon points="10,9 16,12 10,15" fill="#1e6e5c"/></svg>
              <span className="text-xs text-conexia-green/80 select-none">Video</span>
            </button>
            <button
              type="button"
              onClick={() => setModalOpen(true)}
              className="flex items-center gap-1 md:gap-2 px-2 md:px-4 py-2 rounded-lg bg-transparent border-none focus:outline-none transition-colors hover:bg-[#e0f0f0]"
              style={{ boxShadow: 'none', border: 'none', minWidth: 'auto' }}
            >
              <svg width="18" height="18" fill="none" viewBox="0 0 24 24"><rect x="3" y="5" width="18" height="14" rx="3" fill="#e0f0f0" stroke="#1e6e5c" strokeWidth="2"/><text x="7" y="17" fontSize="8" fill="#1e6e5c">GIF</text></svg>
              <span className="text-xs text-conexia-green/80 select-none">GIF</span>
            </button>
            <div className="flex-1" />
            <Button onClick={() => setModalOpen(true)} className="!px-4 md:!px-5 !py-2 !rounded-lg">Publicar</Button>
          </div>
        </div>

  {/* Modal de publicación */}
  <PublicationModal open={modalOpen} onClose={() => setModalOpen(false)} onPublish={handlePublish} user={user} />

        {/* Aquí irían las publicaciones de la comunidad */}
        <h1 className="text-2xl font-bold text-conexia-green mb-4">Bienvenido a tu comunidad</h1>
        {/* ... */}
      </div>
    </main>
  );
}
