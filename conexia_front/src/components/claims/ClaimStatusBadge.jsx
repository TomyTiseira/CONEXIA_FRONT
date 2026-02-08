/**
 * ClaimStatusBadge Component
 * Badge para mostrar el estado de un reclamo
 */

'use client';

import React from 'react';
import { getClaimStatusBadge } from '@/constants/claims';

export const ClaimStatusBadge = ({ status }) => {
  if (!status) return null;

  const { label, className } = getClaimStatusBadge(status);

  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap ${className}`}>
      {label}
    </span>
  );
};

export default ClaimStatusBadge;
