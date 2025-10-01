import { useState } from 'react';

/**
 * Hook para manejar los errores específicos de cotizaciones
 */
export function useQuotationErrorHandler() {
  const [showPaymentAccountModal, setShowPaymentAccountModal] = useState(false);
  const [showUserBannedModal, setShowUserBannedModal] = useState(false);

  /**
   * Analiza un error y determina qué modal mostrar
   * @param {Error} error - Error devuelto por las funciones de cotización
   * @returns {boolean} - True si se manejó el error, false si es un error genérico
   */
  const handleQuotationError = (error) => {
    if (!error) return false;

    // Verificar por tipo de error si está disponible
    if (error.errorType) {
      switch (error.errorType) {
        case 'missing_payment_account':
          setShowPaymentAccountModal(true);
          return true;
        case 'user_banned':
          setShowUserBannedModal(true);
          return true;
        default:
          return false;
      }
    }

    // Fallback: verificar por mensaje si no hay errorType
    const message = error.message || '';
    
    if (message.includes('cuenta bancaria o digital activa') || 
        message.includes('cuenta de pago')) {
      setShowPaymentAccountModal(true);
      return true;
    }
    
    if (message.includes('usuario solicitante fue dado de baja') || 
        message.includes('usuario solicitante fue dado de baja o baneado')) {
      setShowUserBannedModal(true);
      return true;
    }

    return false;
  };

  /**
   * Cierra todos los modales de error
   */
  const closeAllModals = () => {
    setShowPaymentAccountModal(false);
    setShowUserBannedModal(false);
  };

  return {
    // Estados de los modales
    showPaymentAccountModal,
    showUserBannedModal,
    
    // Funciones
    handleQuotationError,
    closeAllModals,
    
    // Funciones específicas para cerrar cada modal
    closePaymentAccountModal: () => setShowPaymentAccountModal(false),
    closeUserBannedModal: () => setShowUserBannedModal(false),
  };
}