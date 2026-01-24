'use client';

import { 
  ACCOUNT_STATUS, 
  calculateDaysRemaining 
} from '@/constants/accountStatus';

/**
 * Badge para mostrar el estado de una cuenta de usuario
 * @param {Object} props
 * @param {string} props.accountStatus - Estado de la cuenta ('active' | 'suspended' | 'banned')
 * @param {string} props.suspensionExpiresAt - Fecha de expiración de suspensión (solo para suspended)
 * @param {string} props.className - Clases adicionales
 * @param {boolean} props.showDaysRemaining - Mostrar días restantes en suspensiones (default: true)
 */
export default function AccountStatusBadge({ 
  accountStatus, 
  suspensionExpiresAt,
  className = '',
  showDaysRemaining = true
}) {
  if (!accountStatus || accountStatus === ACCOUNT_STATUS.ACTIVE) {
    return null;
  }

  const getBadgeConfig = () => {
    switch (accountStatus) {
      case ACCOUNT_STATUS.BANNED:
        return {
          label: 'Baneado',
          className: 'bg-red-100 text-red-800 border-red-300'
        };
      
      case ACCOUNT_STATUS.SUSPENDED:
        const daysRemaining = showDaysRemaining && suspensionExpiresAt 
          ? calculateDaysRemaining(suspensionExpiresAt) 
          : null;
        
        const suspendedLabel = daysRemaining !== null
          ? `Suspendido (${daysRemaining} ${daysRemaining === 1 ? 'día' : 'días'})`
          : 'Suspendido';
        
        return {
          label: suspendedLabel,
          className: 'bg-amber-100 text-amber-800 border-amber-300'
        };
      
      default:
        return null;
    }
  };

  const config = getBadgeConfig();
  if (!config) return null;

  return (
    <span 
      className={`inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium border ${config.className} ${className}`}
    >
      {config.label}
    </span>
  );
}
