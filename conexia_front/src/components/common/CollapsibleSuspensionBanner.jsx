'use client';

import { Clock, XCircle } from 'lucide-react';
import { useAccountStatus } from '@/hooks/useAccountStatus';
import { usePathname } from 'next/navigation';

/**
 * Banner compacto (40px) que se muestra SOLO en páginas principales
 * - Inicio (/)
 * - Servicios (/services)
 * - Proyectos (/project/search)
 * - Conexiones (/connections)
 */
export default function CollapsibleSuspensionBanner() {
  const { isSuspended, isBanned, suspensionExpiresAt } = useAccountStatus();
  const pathname = usePathname();

  // Solo mostrar si está suspendido o baneado
  if (!isSuspended && !isBanned) {
    return null;
  }

  // Solo mostrar en páginas principales
  const mainPages = ['/', '/services', '/project/search', '/connections'];
  const isMainPage = mainPages.some(page => pathname === page);
  
  if (!isMainPage) {
    return null;
  }

  // Formatear fecha de expiración (formato corto)
  let expirationDate = null;
  if (suspensionExpiresAt) {
    try {
      const date = new Date(suspensionExpiresAt);
      // Verificar si la fecha es válida
      if (!isNaN(date.getTime())) {
        expirationDate = date.toLocaleDateString('es-AR', {
          day: 'numeric',
          month: 'short',
          year: 'numeric'
        });
      }
    } catch (error) {
      console.error('Error parsing suspensionExpiresAt:', error);
    }
  }

  // Configuración según tipo de restricción
  const config = isBanned ? {
    icon: XCircle,
    bgColor: 'bg-transparent',
    borderColor: 'border-red-400',
    iconColor: 'text-red-600',
    textColor: 'text-red-900',
    message: 'Cuenta suspendida permanentemente'
  } : {
    icon: Clock,
    bgColor: 'bg-transparent',
    borderColor: 'border-amber-400',
    iconColor: 'text-amber-600',
    textColor: 'text-amber-900',
    message: expirationDate 
      ? `Cuenta suspendida temporalmente • Hasta el ${expirationDate}`
      : 'Cuenta suspendida temporalmente'
  };

  const Icon = config.icon;

  return (
    <div className="w-full">
      <div className="max-w-7xl mx-auto px-4">
        <div 
          className={`${config.bgColor} border-l-4 ${config.borderColor} pl-4 pr-3 py-2 rounded-lg shadow-sm flex items-center gap-2.5`}
          role="alert"
        >
          <Icon className={`w-4 h-4 ${config.iconColor} flex-shrink-0`} />
          <p className={`${config.textColor} text-sm font-medium leading-tight flex-1`}>
            {config.message}
          </p>
        </div>
      </div>
    </div>
  );
}
