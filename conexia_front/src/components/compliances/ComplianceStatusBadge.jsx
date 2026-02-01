/**
 * ComplianceStatusBadge Component
 * Badge para mostrar el estado de un compliance
 */

'use client';

import React from 'react';
import { AlertCircle, Clock, CheckCircle, XCircle, AlertTriangle, Ban } from 'lucide-react';
import { COMPLIANCE_STATUS, COMPLIANCE_STATUS_CONFIG } from '@/constants/compliances';

/**
 * Obtiene el ícono según el estado
 */
const getStatusIcon = (status) => {
  const iconProps = { size: 14, className: 'mr-1' };

  switch (status) {
    case COMPLIANCE_STATUS.PENDING:
      return <Clock {...iconProps} />;
    case COMPLIANCE_STATUS.SUBMITTED:
      return <AlertCircle {...iconProps} />;
    case COMPLIANCE_STATUS.PEER_APPROVED:
      return <CheckCircle {...iconProps} />;
    case COMPLIANCE_STATUS.PEER_OBJECTED:
      return <XCircle {...iconProps} />;
    case COMPLIANCE_STATUS.IN_REVIEW:
      return <Clock {...iconProps} />;
    case COMPLIANCE_STATUS.REQUIRES_ADJUSTMENT:
      return <AlertTriangle {...iconProps} />;
    case COMPLIANCE_STATUS.APPROVED:
      return <CheckCircle {...iconProps} />;
    case COMPLIANCE_STATUS.REJECTED:
      return <XCircle {...iconProps} />;
    case COMPLIANCE_STATUS.OVERDUE:
      return <AlertTriangle {...iconProps} />;
    case COMPLIANCE_STATUS.WARNING:
      return <AlertTriangle {...iconProps} />;
    case COMPLIANCE_STATUS.ESCALATED:
      return <Ban {...iconProps} />;
    default:
      return <AlertCircle {...iconProps} />;
  }
};

export const ComplianceStatusBadge = ({ status, className = '', showIcon = true }) => {
  const config = COMPLIANCE_STATUS_CONFIG[status] || COMPLIANCE_STATUS_CONFIG[COMPLIANCE_STATUS.PENDING];

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.color} ${className}`}
    >
      {showIcon && getStatusIcon(status)}
      {config.label}
    </span>
  );
};

export default ComplianceStatusBadge;
