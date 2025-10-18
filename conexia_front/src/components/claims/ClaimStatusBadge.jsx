/**
 * ClaimStatusBadge Component
 * Badge para mostrar el estado de un reclamo
 */

'use client';

import React from 'react';
import { AlertCircle, Clock, CheckCircle, XCircle } from 'lucide-react';
import { CLAIM_STATUS, CLAIM_STATUS_CONFIG } from '@/constants/claims';

/**
 * Obtiene el ícono según el estado
 */
const getStatusIcon = (status) => {
  const iconProps = { size: 14, className: 'mr-1' };

  switch (status) {
    case CLAIM_STATUS.OPEN:
      return <AlertCircle {...iconProps} />;
    case CLAIM_STATUS.IN_REVIEW:
      return <Clock {...iconProps} />;
    case CLAIM_STATUS.RESOLVED:
      return <CheckCircle {...iconProps} />;
    case CLAIM_STATUS.REJECTED:
      return <XCircle {...iconProps} />;
    default:
      return <AlertCircle {...iconProps} />;
  }
};

export const ClaimStatusBadge = ({ status, className = '', showIcon = true }) => {
  const config = CLAIM_STATUS_CONFIG[status] || CLAIM_STATUS_CONFIG[CLAIM_STATUS.OPEN];

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.color} ${className}`}
    >
      {showIcon && getStatusIcon(status)}
      {config.label}
    </span>
  );
};

export default ClaimStatusBadge;
