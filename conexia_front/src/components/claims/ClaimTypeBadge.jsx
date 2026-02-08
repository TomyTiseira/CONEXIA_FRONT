/**
 * ClaimTypeBadge Component
 * Badge para mostrar el tipo de reclamo con ícono
 */

'use client';

import React from 'react';
import {
  AlertTriangle,
  FileX,
  ShieldAlert,
  Ban,
  HelpCircle,
  DollarSign,
} from 'lucide-react';
import { 
  CLIENT_CLAIM_TYPES,
  PROVIDER_CLAIM_TYPES,
  getClaimTypeLabel,
} from '@/constants/claims';

// Configuración de iconos por tipo
const CLAIM_TYPE_ICONS = {
  [CLIENT_CLAIM_TYPES.NOT_DELIVERED]: FileX,
  [CLIENT_CLAIM_TYPES.OFF_AGREEMENT]: ShieldAlert,
  [CLIENT_CLAIM_TYPES.DEFECTIVE_DELIVERY]: AlertTriangle,
  [CLIENT_CLAIM_TYPES.CLIENT_OTHER]: HelpCircle,
  [PROVIDER_CLAIM_TYPES.PAYMENT_NOT_RECEIVED]: DollarSign,
  [PROVIDER_CLAIM_TYPES.PROVIDER_OTHER]: HelpCircle,
};

// Configuración de colores por tipo
const CLAIM_TYPE_CONFIG = {
  [CLIENT_CLAIM_TYPES.NOT_DELIVERED]: {
    className: 'bg-red-100 text-red-800',
  },
  [CLIENT_CLAIM_TYPES.OFF_AGREEMENT]: {
    className: 'bg-orange-100 text-orange-800',
  },
  [CLIENT_CLAIM_TYPES.DEFECTIVE_DELIVERY]: {
    className: 'bg-yellow-100 text-yellow-800',
  },
  [CLIENT_CLAIM_TYPES.CLIENT_OTHER]: {
    className: 'bg-gray-100 text-gray-800',
  },
  [PROVIDER_CLAIM_TYPES.PAYMENT_NOT_RECEIVED]: {
    className: 'bg-purple-100 text-purple-800',
  },
  [PROVIDER_CLAIM_TYPES.PROVIDER_OTHER]: {
    className: 'bg-gray-100 text-gray-800',
  },
};

export const ClaimTypeBadge = ({ claimType, showIcon = true, labelOverride = null }) => {
  if (!claimType) return null;

  // Obtener el label usando el helper
  const label = labelOverride || getClaimTypeLabel(claimType);

  // Obtener configuración
  const config = CLAIM_TYPE_CONFIG[claimType] || {
    className: 'bg-gray-100 text-gray-800',
  };

  // Obtener ícono
  const Icon = CLAIM_TYPE_ICONS[claimType] || HelpCircle;

  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap ${config.className}`}
    >
      {showIcon && <Icon size={12} />}
      {label}
    </span>
  );
};
