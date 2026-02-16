"use client";

import {
  LogOut,
  Settings,
  Briefcase,
  FileText,
  Users,
  BarChart3,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import { useUserStore } from "@/store/userStore";
import { ROLES } from "@/constants/roles";
import { buildMediaUrl } from "@/utils/mediaUrl";
import { FaRegLightbulb } from "react-icons/fa";
import { FiStar } from "react-icons/fi";

const defaultAvatar = "/images/default-avatar.png";

export default function DropdownUserMenu({ onLogout, onClose, userPlanData }) {
  const { roleName, profile: storeProfile } = useUserStore();
  const dropdownRef = useRef(null);
  const router = useRouter();
  const pathname = usePathname();
  const { user } = useAuth();
  const userId = user?.id;

  // Determinar si es un usuario regular (no admin ni moderador)
  const isRegularUser = roleName === ROLES.USER;

  // Detectar clics fuera del menú para cerrarlo
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Si se hizo clic fuera del menú, cerrar
      try {
        if (
          dropdownRef.current &&
          event.target &&
          dropdownRef.current.contains &&
          !dropdownRef.current.contains(event.target)
        ) {
          onClose?.();
        }
      } catch (error) {
        console.error("Error en handleClickOutside:", error);
        // Si hay algún error en el método contains, cerramos el menú
        onClose?.();
      }
    };

    // Usar "click" en lugar de "mousedown"
    document.addEventListener("click", handleClickOutside);

    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, [onClose]);

  const handleClose = () => onClose?.();

  // Usar el perfil del store directamente (ya está cargado en el navbar)
  const profile = storeProfile || {};
  const hasProfile = storeProfile && Object.keys(storeProfile).length > 0;

  // Renderizar badge de plan simple sin componente pesado
  const renderPlanBadge = () => {
    if (roleName !== ROLES.USER || !userPlanData?.plan) return null;
    
    const planName = userPlanData.plan.name || 'Free';
    const isFree = userPlanData.isFreePlan;
    
    return (
      <div className="px-4 py-2 border-b">
        <button
          onClick={() => {
            handleClose();
            router.push('/subscriptions');
          }}
          className="w-full flex items-center justify-center gap-2 px-3 py-1.5 rounded-md bg-gradient-to-r from-amber-50 to-amber-100 border border-amber-200 hover:from-amber-100 hover:to-amber-200 transition-all"
        >
          <FiStar className="text-amber-500" size={14} />
          <span className="text-xs font-semibold text-amber-700">
            {planName}
          </span>
        </button>
      </div>
    );
  };

  return (
    <div
      ref={dropdownRef}
      className="absolute right-0 top-12 w-64 bg-white border rounded shadow-md z-50 py-2 text-conexia-green"
    >
      {/* Perfil - Solo para usuarios USER con perfil */}
      {roleName === ROLES.USER && hasProfile && (
        <div className="flex flex-col gap-2 px-4 pb-2 border-b">
          <div className="flex gap-3 items-center">
            <div className="w-10 h-10 relative rounded-full overflow-hidden shrink-0">
              <Image
                src={
                  profile.profilePicture
                    ? buildMediaUrl(profile.profilePicture)
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
                {profile.profession || ""}
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
      )}

      {/* Plan del usuario (solo para rol USER y si hay datos del plan) */}
      {renderPlanBadge()}

      {/* Servicios (solo para usuarios con rol USER) */}
      {isRegularUser && (
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
        {isRegularUser && (
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
