'use client';

import { AlertTriangle } from 'lucide-react';
import Link from 'next/link';
import { useAccountRestrictions } from '@/hooks';

/**
 * Componente que muestra un mensaje cuando una acción está bloqueada
 * debido a suspensión o baneo de cuenta.
 * 
 * @param {Object} props
 * @param {string} props.action - Tipo de acción bloqueada ('create_project', 'create_service', etc.)
 * @param {string} props.actionLabel - Nombre de la acción para mostrar al usuario (ej: "crear proyecto")
 * @param {boolean} props.showDashboardLink - Si mostrar enlace al dashboard (default: true)
 * @param {string} props.className - Clases adicionales
 */
export default function ActionBlockedMessage({ 
  action, 
  actionLabel,
  showDashboardLink = true,
  className = '' 
}) {
  const { getRestrictionMessage, isSuspended, isBanned } = useAccountRestrictions();

  if (!isSuspended && !isBanned) {
    return null;
  }

  const message = getRestrictionMessage(action);
  
  // Estilos según el tipo de restricción (igual que UserRestrictionAlert)
  const isPermanent = isBanned;
  const bgColor = isPermanent ? 'bg-red-50' : 'bg-amber-50';
  const borderColor = isPermanent ? 'border-red-400' : 'border-amber-400';
  const iconColor = isPermanent ? 'text-red-600' : 'text-amber-600';
  const titleColor = isPermanent ? 'text-red-900' : 'text-amber-900';
  const messageColor = isPermanent ? 'text-red-800' : 'text-amber-800';

  return (
    <div className={`${bgColor} border-l-4 ${borderColor} p-4 rounded-lg shadow-sm ${className}`} role="alert">
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 mt-0.5">
          <AlertTriangle className={`w-6 h-6 ${iconColor}`} />
        </div>
        
        <div className="flex-1">
          <h3 className={`text-lg font-semibold ${titleColor} mb-1`}>
            {isBanned ? 'Acción no disponible' : 'Cuenta suspendida temporalmente'}
          </h3>
          
          <p className={`${messageColor} text-sm leading-relaxed`}>
            {message || `No puedes ${actionLabel} en este momento.`}
          </p>
          
          {isBanned && (
            <p className={`text-xs ${messageColor} mt-2`}>
              Para más información, contacta a soporte.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
