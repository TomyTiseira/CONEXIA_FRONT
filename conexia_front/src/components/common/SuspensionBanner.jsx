'use client';

import { AlertCircle, XCircle, Clock } from 'lucide-react';
import { useAccountStatus } from '@/hooks/useAccountStatus';

/**
 * Banner flotante estilo ModerationAlert que muestra el estado de suspensión/baneo
 * Similar al banner de servicios/proyectos moderados
 */
export default function SuspensionBanner() {
  const { isSuspended, isBanned, suspensionExpiresAt } = useAccountStatus();

  // No mostrar nada si la cuenta está activa
  if (!isSuspended && !isBanned) {
    return null;
  }

  const expirationDate = suspensionExpiresAt 
    ? (() => {
        try {
          const date = new Date(suspensionExpiresAt);
          // Verificar si la fecha es válida
          if (!isNaN(date.getTime())) {
            return date.toLocaleDateString('es-AR', {
              day: 'numeric',
              month: 'long',
              year: 'numeric'
            });
          }
          return null;
        } catch (error) {
          console.error('Error parsing suspensionExpiresAt:', error);
          return null;
        }
      })()
    : null;

  if (isBanned) {
    return (
      <div className="w-full px-4 py-3">
        <div className="max-w-7xl mx-auto">
          <div 
            className="bg-red-50 border-l-4 border-red-400 p-4 rounded-lg shadow-sm"
            role="alert"
          >
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 mt-0.5">
                <XCircle className="w-6 h-6 text-red-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-red-900 mb-1">
                  Cuenta suspendida ermanentemente
                </h3>
                <p className="text-red-800 text-sm leading-relaxed">
                  Tu cuenta ha sido suspendida permanentemente por violación de las políticas de Conexia. No puedes realizar acciones en la plataforma.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full px-4 py-3">
      <div className="max-w-7xl mx-auto">
        <div 
          className="bg-amber-50 border-l-4 border-amber-400 p-4 rounded-lg shadow-sm"
          role="alert"
        >
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 mt-0.5">
              <Clock className="w-6 h-6 text-amber-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-amber-900 mb-1">
                Cuenta Suspendida Temporalmente
              </h3>
              <p className="text-amber-800 text-sm leading-relaxed">
                {expirationDate ? (
                  <>Tu cuenta está suspendida hasta el <span className="font-semibold">{expirationDate}</span>. No puedes crear proyectos, servicios, ni postularte durante este período, pero puedes completar tus compromisos actuales.</>
                ) : (
                  <>Tu cuenta está suspendida temporalmente. No puedes crear proyectos, servicios, ni postularte durante este período, pero puedes completar tus compromisos actuales.</>
                )}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
