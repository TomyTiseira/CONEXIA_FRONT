/**
 * ClaimButton Component
 * Botón para crear un reclamo
 */

'use client';

import React, { useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import { useCanCreateClaim } from '@/hooks/claims';

export const ClaimButton = ({
  user,
  hiringStatus,
  hasActiveClaim,
  onOpenModal,
  className = '',
}) => {
  const { canCreate, reason } = useCanCreateClaim(user, hiringStatus, hasActiveClaim);

  if (!canCreate) {
    // Si no puede crear, mostrar botón deshabilitado con tooltip
    return (
      <div className="relative group">
        <button
          disabled
          className={`flex items-center gap-2 px-4 py-2 border border-red-300 text-red-400 rounded-lg cursor-not-allowed opacity-60 ${className}`}
          title={reason}
        >
          <AlertTriangle size={18} />
          Realizar Reclamo
        </button>
        {reason && (
          <div className="absolute bottom-full left-0 mb-2 hidden group-hover:block w-64 p-2 bg-gray-900 text-white text-xs rounded shadow-lg z-10">
            {reason}
          </div>
        )}
      </div>
    );
  }

  return (
    <button
      onClick={onOpenModal}
      className={`flex items-center gap-2 px-4 py-2 border-2 border-red-500 text-red-600 hover:bg-red-50 rounded-lg transition-colors font-medium ${className}`}
    >
      <AlertTriangle size={18} />
      Realizar Reclamo
    </button>
  );
};

export default ClaimButton;
