/**
 * ComplianceTypeBadge Component
 * Badge para mostrar el tipo de compliance con icono
 */

'use client';

import React from 'react';
import { 
  DollarSign, 
  RotateCcw, 
  Edit, 
  PlusCircle, 
  CreditCard, 
  FileText, 
  CheckCircle,
  Bot,
  CircleDot
} from 'lucide-react';
import { COMPLIANCE_TYPE, COMPLIANCE_TYPE_LABELS } from '@/constants/compliances';

/**
 * Obtiene el ícono según el tipo de compliance
 */
const getTypeIcon = (type) => {
  const iconProps = { size: 16, className: 'mr-1' };

  switch (type) {
    case COMPLIANCE_TYPE.FULL_REFUND:
    case COMPLIANCE_TYPE.PARTIAL_REFUND:
      return <DollarSign {...iconProps} />;
    case COMPLIANCE_TYPE.FULL_REDELIVERY:
      return <RotateCcw {...iconProps} />;
    case COMPLIANCE_TYPE.CORRECTED_DELIVERY:
      return <Edit {...iconProps} />;
    case COMPLIANCE_TYPE.ADDITIONAL_DELIVERY:
      return <PlusCircle {...iconProps} />;
    case COMPLIANCE_TYPE.PAYMENT_REQUIRED:
    case COMPLIANCE_TYPE.PARTIAL_PAYMENT:
      return <CreditCard {...iconProps} />;
    case COMPLIANCE_TYPE.EVIDENCE_UPLOAD:
      return <FileText {...iconProps} />;
    case COMPLIANCE_TYPE.CONFIRMATION_ONLY:
      return <CheckCircle {...iconProps} />;
    case COMPLIANCE_TYPE.AUTO_REFUND:
      return <Bot {...iconProps} />;
    default:
      return <CircleDot {...iconProps} />;
  }
};

export const ComplianceTypeBadge = ({ type, className = '', showIcon = true }) => {
  const label = COMPLIANCE_TYPE_LABELS[type] || type;

  return (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-md text-sm font-medium bg-blue-50 text-blue-700 border border-blue-200 ${className}`}
    >
      {showIcon && getTypeIcon(type)}
      {label}
    </span>
  );
};

export default ComplianceTypeBadge;
