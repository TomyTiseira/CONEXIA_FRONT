/**
 * ComplianceStatusBadge Component
 * Badge para mostrar el estado de un compliance con colores e iconos
 */

'use client';

import React from 'react';
import { COMPLIANCE_STATUS_CONFIG } from '@/constants/claims';

export const ComplianceStatusBadge = ({ status }) => {
  const config = COMPLIANCE_STATUS_CONFIG[status] || COMPLIANCE_STATUS_CONFIG.pending;

  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${config.className}`}
    >
      <span>{config.icon}</span>
      <span>{config.label}</span>
    </span>
  );
};

export default ComplianceStatusBadge;
