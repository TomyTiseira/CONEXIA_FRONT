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
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold border ${config.className}`}
    >
      {config.label}
    </span>
  );
};

export default ComplianceStatusBadge;
