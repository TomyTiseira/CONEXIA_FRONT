'use client';

import { useState } from 'react';
import { useAccountStatus } from '@/hooks/useAccountStatus';
import SuspensionModal from './SuspensionModal';

/**
 * Badge clickeable para el navbar que indica suspensión/baneo
 * Al hacer click abre un modal con información detallada
 */
export default function SuspensionBadge() {
  const { isSuspended, isBanned } = useAccountStatus();
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Solo mostrar si está suspendido o baneado
  if (!isSuspended && !isBanned) {
    return null;
  }

  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-100 border border-amber-300 shadow-sm hover:bg-amber-200 hover:border-amber-400 transition-all cursor-pointer group"
        title="Click para ver detalles"
      >
        {/* Punto de advertencia */}
        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse group-hover:animate-none"></span>
        
        {/* Texto */}
        <span className="text-xs font-medium text-amber-800">
          Suspendido
        </span>
      </button>

      <SuspensionModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  );
}
