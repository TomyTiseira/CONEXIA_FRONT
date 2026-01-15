'use client';

import { useEffect, useState, useCallback } from 'react';
import Toast from '@/components/ui/Toast';
import { registerToastCallback, showPendingToasts } from '@/lib/httpInterceptor';

/**
 * Provider global para manejar toasts de errores HTTP
 * Debe estar en el layout principal
 */
export default function HttpErrorProvider({ children }) {
  const [toast, setToast] = useState({ visible: false, type: 'error', message: '' });

  // Callback para mostrar toast desde el interceptor
  const showToast = useCallback((type, message) => {
    setToast({ visible: true, type, message });
  }, []);

  // Registrar callback al montar
  useEffect(() => {
    registerToastCallback(showToast);
    
    // Mostrar toasts pendientes del sessionStorage
    showPendingToasts();
  }, [showToast]);

  return (
    <>
      {children}
      
      {/* Toast global para errores HTTP */}
      {toast.visible && (
        <Toast
          type={toast.type}
          message={toast.message}
          isVisible={toast.visible}
          onClose={() => setToast({ ...toast, visible: false })}
          position="top-center"
          duration={5000}
        />
      )}
    </>
  );
}
