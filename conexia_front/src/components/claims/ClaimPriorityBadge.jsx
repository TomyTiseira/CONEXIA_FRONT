/**
 * ClaimPriorityBadge Component
 * Badge para mostrar la prioridad del reclamo
 */

'use client';

import React from 'react';
import { getClaimPriorityBadge } from '@/constants/claims';

export const ClaimPriorityBadge = ({ priority }) => {
  if (!priority) return null;

  const { label, className } = getClaimPriorityBadge(priority);

  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap ${className}`}>
      {label}
    </span>
  );
};
