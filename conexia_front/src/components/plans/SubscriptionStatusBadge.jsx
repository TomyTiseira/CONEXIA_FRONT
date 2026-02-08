'use client';

import React from 'react';
import { getSubscriptionStatusInfo } from '@/utils/planFormatters';

/**
 * Badge para mostrar el estado de una suscripción con colores y estilos apropiados
 * 
 * @param {Object} props
 * @param {string} props.status - Estado de la suscripción ('active', 'pending_payment', 'payment_failed', 'cancelled', 'expired', 'replaced')
 * @param {string} props.className - Clases CSS adicionales
 * @param {boolean} props.showIcon - Si se debe mostrar el icono (default: true)
 * @param {string} props.size - Tamaño del badge ('sm', 'md', 'lg') (default: 'md')
 */
export default function SubscriptionStatusBadge({ 
  status, 
  className = '', 
  showIcon = true,
  size = 'md' 
}) {
  if (!status) return null;

  const statusInfo = getSubscriptionStatusInfo(status);
  
  const sizeClasses = {
    'sm': 'text-xs px-2 py-1',
    'md': 'text-sm px-3 py-1.5',
    'lg': 'text-base px-4 py-2'
  };

  return (
    <span 
      className={`
        inline-flex items-center justify-center gap-1.5 font-semibold rounded-full border-2
        ${statusInfo.bgClass} 
        ${statusInfo.colorClass} 
        ${statusInfo.borderClass}
        ${sizeClasses[size]}
        ${className}
      `}
    >
      {showIcon && statusInfo.icon && <span>{statusInfo.icon}</span>}
      <span>{statusInfo.label}</span>
    </span>
  );
}
