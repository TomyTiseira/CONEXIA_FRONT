'use client';

import { LogOut, Settings, Briefcase, FileText, Users, BarChart3 } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { getProfileById } from '@/service/profiles/profilesFetch';
import { useUserStore } from '@/store/userStore';
import { ROLES } from '@/constants/roles';
import { config } from '@/config';
import { FaRegLightbulb } from 'react-icons/fa';
import { PlanBadge } from '@/components/plans';
import { useUserPlan } from '@/hooks/memberships';

const defaultAvatar = '/images/default-avatar.png';

export default function DropdownUserMenu({ onLogout, onClose }) {
  const { roleName } = useUserStore();
  const dropdownRef = useRef(null);
  const router = useRouter();
  const pathname = usePathname();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();
  const userId = user?.id;
  
  // Obtener información del plan solo si es USER
  const { data: userPlan, error: planError } = roleName === ROLES.USER ? useUserPlan() : { data: null, error: null };

  useEffect(() => {
    // Si es admin o moderador, no buscar perfil
    if (roleName === ROLES.ADMIN || roleName === ROLES.MODERATOR) {
      setLoading(false);
      setProfile(null);
      return;
    }
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
  }, [userId, roleName]);

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


  const handleClose = () => onClose?.();

  if (loading || error || !profile) return null;

  return (
    <div
      ref={dropdownRef}
      className="absolute right-0 top-12 w-64 bg-white border rounded shadow-md z-50 py-2 text-conexia-green"
    >
      {/* Perfil */}
      <div className="flex flex-col gap-2 px-4 pb-2 border-b">
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
          <Link
            href={`/profile/userProfile/${userId}`}
            onClick={handleClose}
            className="bg-conexia-green text-white text-xs px-3 py-1 rounded-md hover:bg-conexia-green/90 transition-colors"
          >
            Ver perfil
          </Link>
        </div>
      </div>

      {/* Plan del usuario (solo para rol USER y si hay datos del plan) */}
      {roleName === ROLES.USER && userPlan && !planError && (
        <div className="px-4 py-2 border-b">
          <PlanBadge 
            useCurrentPlan={true}
            variant="compact"
            className="w-full justify-center"
          />
        </div>
      )}

      {/* Servicios (solo para usuarios con rol USER) */}
      {roleName === ROLES.USER && (
        <>
          <div className="pt-0.5 mt-0.5">
            <div className="px-4 py-0.5 text-xs font-medium text-gray-500 uppercase tracking-wide">
              Servicios
            </div>
            <Link
              href="/services/my-hirings"
              onClick={handleClose}
              className="flex items-center gap-2 w-full px-4 py-1.5 text-sm text-left hover:bg-conexia-green/10"
            >
              <FileText size={16} />
              Mis solicitudes
            </Link>
            <Link
              href="/services/my-services"
              onClick={handleClose}
              className="flex items-center gap-2 w-full px-4 py-1.5 text-sm text-left hover:bg-conexia-green/10"
            >
              <Briefcase size={16} />
              Mis servicios
            </Link>
            <Link
              href="/claims/my-claims"
              onClick={handleClose}
              className="flex items-center gap-2 w-full px-4 py-1.5 text-sm text-left hover:bg-conexia-green/10"
            >
              <FileText size={16} />
              Mis reclamos
            </Link>
          </div>
          <div className="border-t pt-0.5 mt-0.5">
            <div className="px-4 py-0.5 text-xs font-medium text-gray-500 uppercase tracking-wide">
              Proyectos
            </div>
            <Link
              href="/project/my-postulations"
              onClick={handleClose}
              className="flex items-center gap-2 w-full px-4 py-1.5 text-sm text-left hover:bg-conexia-green/10"
            >
              <FileText size={16} />
              Mis postulaciones
            </Link>
            <Link
              href="/my-projects"
              onClick={handleClose}
              className="flex items-center gap-2 w-full px-4 py-1.5 text-sm text-left hover:bg-conexia-green/10"
            >
              <FaRegLightbulb size={16} />
              Mis proyectos
            </Link>
          </div>
        </>
      )}

      {/* Acciones */}
      <div className="border-t pt-0.5 mt-0.5">
        {/* Dashboard solo para usuarios USER */}
        {roleName === ROLES.USER && (
          <Link
            href="/dashboard"
            onClick={handleClose}
            className="flex items-center gap-2 w-full px-4 py-1.5 text-sm text-left hover:bg-conexia-green/10"
          >
            <BarChart3 size={16} />
            Métricas
          </Link>
        )}
        <Link
          href="/settings"
          onClick={handleClose}
          className="flex items-center gap-2 w-full px-4 py-1.5 text-sm text-left hover:bg-conexia-green/10"
        >
          <Settings size={16} />
          Configuraciones y privacidad
        </Link>
        <button
          onClick={onLogout}
          className="flex items-center gap-2 w-full px-4 py-1.5 text-sm text-left hover:bg-conexia-green/10"
        >
          <LogOut size={16} />
          Cerrar sesión
        </button>
      </div>
    </div>
  );
}
