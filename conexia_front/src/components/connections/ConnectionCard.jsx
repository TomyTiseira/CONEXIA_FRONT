import React, { useState } from 'react';
import Image from 'next/image';
import { UserPlus, Check } from 'lucide-react';
import { config } from '@/config';

/**
 * ConnectionCard: Tarjeta para mostrar perfil recomendado
 * Props:
 * - user: objeto del usuario con profilePicture, coverPicture, name, lastName, profession, etc.
 * - onConnect: function
 * - onViewProfile: function
 * - mini: boolean para renderizar estilo compacto
 */
export function ConnectionCard({ user, onConnect, onViewProfile, mini = false }) {
  const defaultAvatar = '/images/default-avatar.png';
  const defaultCover = '/bg-smoke.png';

  // Helper para construir URLs de imágenes
  const getImageUrl = (imagePath, defaultImage) => {
    if (!imagePath) return defaultImage;
    if (imagePath.startsWith('http')) return imagePath;
    return `${config.IMAGE_URL}/${imagePath}`;
  };

  // Construir URLs de imágenes
  const profilePhoto = getImageUrl(user.profilePicture, defaultAvatar);
  const coverPhoto = getImageUrl(user.coverPicture, defaultCover);

  const displayName = user.name && user.lastName 
    ? `${user.name} ${user.lastName}` 
    : user.name || 'Usuario';

  const profession = user.profession || 'Sin profesión especificada';

  // Renderizado compacto para sidebar
  if (mini) {
    const [pending, setPending] = useState(false);
    return (
      <div 
        className="flex items-center gap-3 py-2 px-2 hover:bg-gray-50 rounded-lg transition cursor-pointer group"
        onClick={onViewProfile}
      >
        <div className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-gray-200 flex-shrink-0">
          <Image 
            src={profilePhoto} 
            alt="Perfil" 
            fill 
            sizes="48px"
            className="object-cover" 
          />
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-sm truncate group-hover:text-conexia-green transition-colors">
            {displayName}
          </div>
          <div className="text-xs text-gray-500 truncate">{profession}</div>
        </div>
        <button 
          onClick={(e) => {
            e.stopPropagation();
            if (!pending) {
              setPending(true);
              onConnect();
            }
          }}
          className={`flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center transition-all ${
            pending 
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
              : 'bg-conexia-green/10 text-conexia-green hover:bg-conexia-green hover:text-white hover:scale-110'
          }`}
          disabled={pending}
          title={pending ? 'Solicitud enviada' : 'Conectar'}
        >
          {pending ? <Check size={18} /> : <UserPlus size={18} />}
        </button>
      </div>
    );
  }

  // Card normal para página de recomendaciones
  return (
    <div className="rounded-xl shadow bg-white overflow-hidden flex flex-col hover:shadow-lg transition-shadow">
      {/* Imagen de portada */}
      <div className="h-20 w-full relative bg-gray-200">
        <Image 
          src={coverPhoto} 
          alt="Portada" 
          fill 
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
          className="object-cover" 
        />
      </div>
      
      {/* Contenido de la tarjeta */}
      <div className="flex flex-col items-center p-4">
        {/* Avatar sobrepuesto */}
        <div className="relative w-16 h-16 rounded-full overflow-hidden border-2 border-white -mt-8 mb-2">
          <Image 
            src={profilePhoto} 
            alt="Perfil" 
            fill 
            sizes="64px"
            className="object-cover" 
          />
        </div>
        
        {/* Información del usuario */}
        <h3 
          className="font-semibold text-lg text-center cursor-pointer hover:text-conexia-green transition-colors"
          onClick={onViewProfile}
        >
          {displayName}
        </h3>
        <p className="text-sm text-gray-500 mb-3 text-center line-clamp-2">{profession}</p>
        
        {/* Botón de conectar */}
        <button 
          onClick={onConnect}
          className="bg-conexia-green text-white px-4 py-1 rounded-full font-semibold hover:bg-conexia-green/90 transition-colors"
        >
          Conectar
        </button>
      </div>
    </div>
  );
}
