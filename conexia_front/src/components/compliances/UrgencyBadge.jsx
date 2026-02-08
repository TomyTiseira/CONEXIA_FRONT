/**
 * UrgencyBadge Component
 * Badge para mostrar el nivel de urgencia de un compliance
 */

'use client';

import React from 'react';
import { AlertCircle, AlertTriangle, Flame } from 'lucide-react';
import { URGENCY_LEVEL, URGENCY_CONFIG, getUrgencyLevel } from '@/constants/compliances';

/**
 * Obtiene el ícono según el nivel de urgencia
 */
const getUrgencyIcon = (level) => {
  const iconProps = { size: 14, className: 'mr-1' };

  switch (level) {
    case URGENCY_LEVEL.CRITICAL:
      return <Flame {...iconProps} />;
    case URGENCY_LEVEL.URGENT:
      return <AlertTriangle {...iconProps} />;
    case URGENCY_LEVEL.WARNING:
      return <AlertCircle {...iconProps} />;
    default:
      return null;
  }
};

export const UrgencyBadge = ({ deadline, warningLevel, className = '', showIcon = true }) => {
  const level = getUrgencyLevel(deadline, warningLevel);
  
  // No mostrar badge para nivel normal
  if (level === URGENCY_LEVEL.NORMAL) {
    return null;
  }

  const config = URGENCY_CONFIG[level];

  return (
    <span
      className={`inline-flex items-center px-2 py-1 rounded text-xs font-semibold ${config.bg} ${config.color} border ${config.border} ${className}`}
    >
      {showIcon && getUrgencyIcon(level)}
      {config.label}
    </span>
  );
};

export default UrgencyBadge;
