'use client';
import React from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Button from '@/components/ui/Button';
import { config } from '@/config';
import { useAcceptConnectionRequest } from '@/hooks/connections/useAcceptConnectionRequest';

export default function ConnectionRequestCard({ name, profession, image, requestId, senderId, onIgnore, onAccepted }) {
  const defaultAvatar = '/images/default-avatar.png';
  // Helper para asegurar URLs absolutas igual que en publicaciones/perfil
  const getProfileImageUrl = (img) => {
    if (!img) return defaultAvatar;
    if (img.startsWith('http://') || img.startsWith('https://')) return img;
    if (img.startsWith('/uploads')) return `${config.IMAGE_URL}${img}`;
    if (img.startsWith('/')) return `${config.IMAGE_URL}${img}`;
    return `${config.IMAGE_URL}/${img}`;
  };
  const profileImage = getProfileImageUrl(image);

  const { acceptRequest, loading: acceptLoading, success: acceptSuccess, error: acceptError } = useAcceptConnectionRequest();

  const handleAccept = async () => {
    try {
      await acceptRequest(requestId);
      if (onAccepted) onAccepted(requestId);
    } catch (err) {
      // Opcional: mostrar error
    }
  };

  const router = useRouter();
  const handleCardClick = (e) => {
    // Evitar que el click en los botones dispare la navegación
    if (e.target.closest('button')) return;
    if (senderId) router.push(`/profile/userProfile/${senderId}`);
  };

  return (
    <div
      className="bg-white rounded-xl shadow border border-[#c6e3e4] px-3 py-2 mb-2 w-full max-w-5xl transition-shadow hover:shadow-lg mx-auto min-h-[54px] flex flex-col sm:flex-row sm:items-center"
      style={{ minWidth: '320px' }}
    >
      {/* Info principal: foto, nombre y profesión en una línea en mobile y desktop */}
      <div className="flex flex-row items-center flex-1 min-w-0">
        <div className="flex-shrink-0">
          <Image
            src={profileImage}
            alt={name}
            width={48}
            height={48}
            className="rounded-full border-2 border-[#c6e3e4] bg-white object-cover sm:w-[56px] sm:h-[56px] cursor-pointer"
            onClick={() => senderId && router.push(`/profile/userProfile/${senderId}`)}
          />
        </div>
        <div className="flex flex-col justify-center min-w-0 ml-3">
          <div
            className="font-semibold text-conexia-green text-base sm:text-lg truncate leading-tight sm:leading-[1.5] cursor-pointer"
            onClick={() => senderId && router.push(`/profile/userProfile/${senderId}`)}
          >
            {name}
          </div>
          <div className="text-conexia-green/80 text-sm sm:text-[14px] truncate leading-tight sm:leading-[1.3]">{profession}</div>
        </div>
      </div>
      {/* Botones: en desktop a la derecha, en mobile abajo ocupando todo el ancho */}
      <div className="hidden sm:flex flex-row gap-2 ml-4 items-center justify-end min-w-[180px]">
  <Button variant="neutral" className="px-4 py-1.5 text-sm" onClick={handleAccept} disabled={acceptLoading}>
          {acceptLoading ? 'Aceptando...' : 'Aceptar'}
        </Button>
  <Button variant="cancel" className="px-4 py-1.5 text-sm" onClick={onIgnore}>Eliminar</Button>
      </div>
      <div className="flex sm:hidden flex-row gap-2 mt-3 w-full">
  <Button variant="neutral" className="flex-1 px-4 py-1.5 text-sm" onClick={handleAccept} disabled={acceptLoading}>
          {acceptLoading ? 'Aceptando...' : 'Aceptar'}
        </Button>
  <Button variant="cancel" className="flex-1 px-4 py-1.5 text-sm" onClick={onIgnore}>Eliminar</Button>
      </div>
    </div>
  );
}
