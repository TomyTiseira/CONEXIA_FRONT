'use client';

import { LogOut, Settings } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { getProfileById } from '@/service/profiles/profilesFetch';
import { config } from '@/config';

const defaultAvatar = '/images/default-avatar.png';

export default function DropdownUserMenu({ onLogout, onClose }) {
  const dropdownRef = useRef(null);
  const router = useRouter();
  const pathname = usePathname();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();
  const userId = user?.id;

  useEffect(() => {
    const fetchProfile = async () => {
      if (!userId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const data = await getProfileById(userId);
        setProfile(data.data.profile);
      } catch (err) {
        setError(err.message || 'Error al cargar el perfil');
        setProfile(null);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [userId]);

  // Detectar clics fuera del menú para cerrarlo
    useEffect(() => {
    const handleClickOutside = (event) => {
        // Si se hizo clic fuera del menú, cerrar
        try {
            if (dropdownRef.current && event.target && dropdownRef.current.contains && !dropdownRef.current.contains(event.target)) {
                onClose?.();
            }
        } catch (error) {
            console.error("Error en handleClickOutside:", error);
            // Si hay algún error en el método contains, cerramos el menú
            onClose?.();
        }
    };

    // Usar "click" en lugar de "mousedown"
    document.addEventListener('click', handleClickOutside);

    return () => {
        document.removeEventListener('click', handleClickOutside);
    };
    }, [onClose]);


  const handleViewProfile = () => {
    onClose?.();

    const isInProfilePage = pathname?.includes('/profile/userProfile/');
    const hasEditForm =
      typeof window !== 'undefined' &&
      document.querySelector('form[novalidate]') !== null;

    const isEditingProfile = isInProfilePage && hasEditForm;

    setTimeout(() => {
      if (isEditingProfile) {
        window.location.href = `/profile/userProfile/${userId}`;
      } else {
        router.push(`/profile/userProfile/${userId}`);
      }
    }, 100);
  };

  if (loading || error || !profile) return null;

  return (
    <div
      ref={dropdownRef}
      className="absolute right-0 top-12 w-64 bg-white border rounded shadow-md z-50 py-3 text-conexia-green"
    >
      {/* Perfil */}
      <div className="flex flex-col gap-3 px-4 pb-3 border-b">
        <div className="flex gap-3 items-center">
          <div className="w-10 h-10 relative rounded-full overflow-hidden shrink-0">
            <Image
              src={
                profile.profilePicture
                  ? `${config.IMAGE_URL}/${profile.profilePicture}`
                  : defaultAvatar
              }
              alt="Foto de perfil"
              fill
              sizes="40px"
              className="object-cover"
            />
          </div>
          <div className="flex flex-col justify-center min-w-0">
            <span className="font-semibold text-sm truncate">
              {profile.name} {profile.lastName}
            </span>
            <span className="text-xs text-conexia-green/80 leading-tight line-clamp-2 break-words">
              {profile.profession || ''}
            </span>
          </div>
        </div>
        <div className="flex justify-center items-center">
          <button
            onClick={handleViewProfile}
            className="bg-conexia-green text-white text-xs px-3 py-1 rounded-md hover:bg-conexia-green/90 transition-colors"
          >
            Ver perfil
          </button>
        </div>
      </div>

      {/* Acciones */}
      <div className="pt-1">
        <button
          onClick={() => router.push('/settings')}
          className="flex items-center gap-2 w-full px-4 py-2 text-sm text-left hover:bg-conexia-green/10"
        >
          <Settings size={16} />
          Configuraciones y privacidad
        </button>
        <button
          onClick={onLogout}
          className="flex items-center gap-2 w-full px-4 py-2 text-sm text-left hover:bg-conexia-green/10"
        >
          <LogOut size={16} />
          Cerrar sesión
        </button>
      </div>
    </div>
  );
}
