'use client';

import React from 'react';
import Link from 'next/link';
import { FiStar, FiZap, FiTrendingUp } from 'react-icons/fi';
import { Briefcase, FolderKanban } from 'lucide-react';

/**
 * Banner para mostrar límites de publicación con llamado a acción
 * Estilo consistente con UpgradePlanButton
 * 
 * @param {string} type - 'service' | 'project'
 * @param {number} current - Cantidad actual publicada
 * @param {number} limit - Límite del plan
 * @param {string} planName - Nombre del plan actual
 * @param {boolean} isLoading - Estado de carga
 */
export default function PublicationLimitBanner({ 
  type = 'service',
  current = 0,
  limit = 0,
  planName = 'Free',
  isLoading = false,
  className = '' 
}) {
  // No mostrar si está cargando
  if (isLoading) {
    return null;
  }

  const isService = type === 'service';
  const Icon = isService ? Briefcase : FolderKanban;
  const label = isService ? 'servicios' : 'proyectos';
  const isPremium = planName === 'Premium';
  
  // Calcular porcentaje usado
  const percentage = limit > 0 ? Math.round((current / limit) * 100) : 0;
  const isNearLimit = percentage >= 80;
  const isAtLimit = current >= limit;

  // Colores según el estado
  const getStatusColor = () => {
    if (isAtLimit) return 'text-red-600';
    if (isNearLimit) return 'text-amber-600';
    return 'text-[#367d7d]';
  };

  return (
    <div className={`w-full ${className}`}>
      {/* Banner con diseño horizontal - Mejor contraste */}
      <div className="relative bg-gradient-to-r from-[#367d7d]/10 via-[#48a6a7]/15 to-[#367d7d]/10 border-2 border-[#48a6a7]/30 rounded-xl overflow-hidden shadow-md">
        {/* Efectos de fondo sutiles */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAwIDEwIEwgNDAgMTAgTSAxMCAwIEwgMTAgNDAgTSAwIDIwIEwgNDAgMjAgTSAyMCAwIEwgMjAgNDAgTSAwIDMwIEwgNDAgMzAgTSAzMCAwIEwgMzAgNDAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSg3MiwxNjYsMTY3LDAuMDMpIiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-30"></div>
        
        <div className="relative px-3 sm:px-6 py-3 sm:py-4">
          <div className="flex flex-col gap-2.5 sm:gap-3">
            {/* Badge del plan (para todos los usuarios) */}
            <div className="flex items-center gap-2">
              <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full ${
                isPremium 
                  ? 'bg-gradient-to-r from-[#48a6a7] to-[#419596]'
                  : planName === 'Basic'
                  ? 'bg-gradient-to-r from-[#419596] to-[#367d7d]'
                  : 'bg-gradient-to-r from-[#367d7d] to-[#2b6a6a]'
              }`}>
                <FiStar className="w-3.5 h-3.5 text-white" />
                <span className="text-xs font-bold text-white">Plan {planName}</span>
              </div>
            </div>

            {/* Información del límite */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Icono */}
              <div className="flex-shrink-0 w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-gradient-to-br from-[#48a6a7]/30 to-[#367d7d]/30 border-2 border-[#48a6a7]/40 flex items-center justify-center">
                <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-[#367d7d]" />
              </div>
              
              {/* Texto y barra de progreso */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1.5">
                  <p className="text-xs sm:text-sm font-bold text-gray-800">
                    {current} de {limit} {label} publicados
                  </p>
                </div>
                
                {/* Barra de progreso */}
                <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                  <div 
                    className={`h-full transition-all duration-500 rounded-full ${
                      isAtLimit 
                        ? 'bg-gradient-to-r from-red-500 to-red-600' 
                        : isNearLimit 
                          ? 'bg-gradient-to-r from-amber-500 to-amber-600'
                          : 'bg-gradient-to-r from-[#48a6a7] to-[#419596]'
                    }`}
                    style={{ width: `${Math.min(percentage, 100)}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Mensaje de estado unificado */}
            <div className="flex items-start gap-2">
              <FiTrendingUp className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#367d7d] mt-0.5 flex-shrink-0" />
              <p className="text-xs sm:text-sm text-gray-700 leading-tight">
                {isAtLimit ? (
                  <span className="font-bold text-red-700">
                    Has alcanzado el límite de {label}. {!isPremium && 'Mejora tu plan para publicar más.'}
                  </span>
                ) : (
                  <span className="font-bold">
                    Te quedan {limit - current} {label} disponibles para publicar.
                  </span>
                )}
              </p>
            </div>

            {/* Mensaje adicional para usuarios cerca del límite (Free/Basic) */}
            {!isPremium && isNearLimit && !isAtLimit && (
              <div className="flex items-start gap-2">
                <FiZap className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                <p className="text-xs sm:text-sm text-amber-700 leading-tight">
                  <span className="font-semibold">Estás cerca del límite. Mejora tu plan para publicar más {label}.</span>
                </p>
              </div>
            )}

            {/* Botón Mejorar plan (solo para Free/Basic) */}
            {!isPremium && (
              <div className="relative mt-1">
                {/* Resplandor dinámico detrás del botón */}
                <div className="absolute -inset-2 bg-gradient-to-r from-[#48a6a7]/30 via-[#419596]/40 to-[#367d7d]/30 rounded-xl blur-xl opacity-60 animate-pulse"></div>
                
                {/* Link como botón para permitir click derecho */}
                <Link
                  href="/settings/my-plan#explorar-planes"
                  className="relative w-full inline-flex items-center justify-center gap-2 bg-gradient-to-r from-[#48a6a7] to-[#419596] text-white px-4 sm:px-5 py-2 sm:py-2.5 rounded-lg font-bold text-xs sm:text-sm hover:from-[#419596] hover:to-[#367d7d] transition-all shadow-[0_4px_15px_rgba(72,166,167,0.4)] hover:shadow-[0_6px_20px_rgba(65,149,150,0.5)] transform hover:scale-105 group"
                >
                  {/* Icono estrella con animación */}
                  <FiStar className="w-3.5 h-3.5 sm:w-4 sm:h-4 group-hover:rotate-12 transition-transform duration-300" />
                  <span>Mejorar plan</span>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
