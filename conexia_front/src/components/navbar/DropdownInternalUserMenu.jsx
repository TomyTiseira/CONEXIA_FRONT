'use client';

import { useEffect, useRef } from 'react';
import { LogOut, Settings } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { ROLES_NAME } from '@/constants/roles';
import { useRole } from '@/hooks/useRole';

const defaultAvatar = '/images/default-avatar.png';

export default function DropdownInternalUserMenu({ onLogout, onClose }) {
  const dropdownRef = useRef(null);
  const router = useRouter();
  const { user } = useAuth();
  const { role } = useRole(user?.roleId);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        onClose?.();
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [onClose]);

  return (
    <div
      ref={dropdownRef}
      className="absolute right-0 top-12 w-64 bg-white border rounded shadow-md z-50 py-3 text-conexia-green"
    >
      {/* Perfil */}
      <div className="flex flex-col gap-3 px-4 pb-3">
        <div className="flex gap-3 items-center">
          <div className="w-10 h-10 rounded-full overflow-hidden relative">
            <Image
              src={defaultAvatar}
              alt="Foto de perfil"
              fill
              sizes="40px"
              className="object-cover"
            />
          </div>
          <div className="flex flex-col justify-center min-w-0">
            <span className="font-semibold text-sm text-conexia-green truncate max-w-[10rem]">
              {user?.email}
            </span>
            <span className="text-xs text-conexia-green/80 leading-tight truncate">
              {ROLES_NAME[role] || 'Cargando rol...'}
            </span>
          </div>
        </div>
      </div>

      {/* Acciones */}
      <div className="pt-1">
        <button
          onClick={() => {
            router.push('/settings');
            onClose?.();
          }}
          className="flex items-center gap-2 w-full px-4 py-2 text-sm text-left hover:bg-conexia-green/10"
        >
          <Settings size={16} />
          Configuraciones y privacidad
        </button>

        <button
          onClick={() => {
            onLogout?.();
            onClose?.();
          }}
          className="flex items-center gap-2 w-full px-4 py-2 text-sm text-left hover:bg-conexia-green/10"
        >
          <LogOut size={16} />
          Cerrar sesión
        </button>
      </div>
    </div>
  );
}
