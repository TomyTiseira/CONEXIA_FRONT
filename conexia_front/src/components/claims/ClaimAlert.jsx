/**
 * ClaimAlert Component
 * Alerta que se muestra cuando un servicio tiene un reclamo activo
 */

'use client';

import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { useRouter } from 'next/navigation';

export const ClaimAlert = ({ claim, showViewButton = true }) => {
  const router = useRouter();

  if (!claim) {
    return null;
  }

  const handleViewClaim = () => {
    router.push(`/claims/${claim.id}`);
  };

  return (
    <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded-r-lg">
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <AlertTriangle className="h-6 w-6 text-red-500" />
        </div>
        <div className="ml-3 flex-1">
          <h3 className="text-sm font-semibold text-red-800 mb-1">
            Este servicio tiene un reclamo activo
          </h3>
          <p className="text-sm text-red-700 mb-2">
            Todas las acciones están suspendidas hasta que un moderador resuelva el reclamo.
            Recibirás un email cuando haya una resolución.
          </p>
          {showViewButton && (
            <button
              onClick={handleViewClaim}
              className="text-sm font-medium text-red-600 hover:text-red-500 underline"
            >
              Ver detalles del reclamo →
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ClaimAlert;
