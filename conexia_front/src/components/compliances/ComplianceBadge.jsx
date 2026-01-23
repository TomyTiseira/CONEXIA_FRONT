/**
 * ComplianceBadge Component
 * Badge para mostrar contador de compliances pendientes en navbar
 */

'use client';

import React from 'react';
import { useCompliancePolling } from '@/hooks/compliances';
import { useAuth } from '@/context/AuthContext';

export const ComplianceBadge = ({ className = '' }) => {
  const { user } = useAuth();
  const { count, loading } = useCompliancePolling(user?.id, !!user?.id);

  if (loading || !user || count === 0) {
    return null;
  }

  return (
    <span
      className={`absolute -top-1 -right-1 bg-red-600 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center ${className}`}
      title={`${count} cumplimiento${count > 1 ? 's' : ''} pendiente${count > 1 ? 's' : ''}`}
    >
      {count > 9 ? '9+' : count}
    </span>
  );
};

export default ComplianceBadge;
