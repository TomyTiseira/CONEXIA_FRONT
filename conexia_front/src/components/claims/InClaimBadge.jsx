/**
 * InClaimBadge Component
 * Badge especial para mostrar que un servicio está en reclamo
 */

'use client';

import React from 'react';
import { AlertTriangle } from 'lucide-react';

export const InClaimBadge = ({ className = '', animated = true }) => {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-700 border border-red-300 ${
        animated ? 'animate-pulse' : ''
      } ${className}`}
    >
      <AlertTriangle size={12} className="mr-1" />
      En Reclamo
    </span>
  );
};

export default InClaimBadge;
