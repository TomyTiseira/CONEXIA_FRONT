/**
 * ClaimRoleBadge Component
 * Badge para mostrar el rol del usuario en el reclamo
 */

'use client';

import React from 'react';
import { getClaimRoleBadge } from '@/constants/claims';

export const ClaimRoleBadge = ({ role }) => {
  if (!role) return null;

  const { label, className } = getClaimRoleBadge(role);

  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap ${className}`}>
      {label}
    </span>
  );
};
