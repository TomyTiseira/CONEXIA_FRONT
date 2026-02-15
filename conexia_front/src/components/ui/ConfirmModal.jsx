'use client';
import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { FiAlertCircle } from 'react-icons/fi';
import Button from '@/components/ui/Button';

/**
 * Modal de confirmación reutilizable
 * @param {boolean} isOpen - Si el modal está abierto
 * @param {function} onClose - Función para cerrar el modal
 * @param {function} onConfirm - Función para confirmar la acción
 * @param {string} title - Título del modal
 * @param {string} message - Mensaje de confirmación
 * @param {string} confirmButtonText - Texto del botón de confirmar (default: "Confirmar")
 * @param {string} cancelButtonText - Texto del botón de cancelar (default: "Cancelar")
 * @param {boolean} isLoading - Estado de carga
 * @param {string} variant - Variante del estilo: 'danger' (rojo) | 'success' (verde) | 'warning' (amarillo) - default: 'success'
 */
export default function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmButtonText = 'Confirmar',
  cancelButtonText = 'Cancelar',
  isLoading = false,
  variant = 'success'
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!isOpen || !mounted) return null;

  // Determinar el color del icono y título según la variante
  const getVariantStyles = () => {
    switch (variant) {
      case 'danger':
        return {
          iconBg: 'bg-red-50',
          iconColor: 'text-red-600',
          titleColor: 'text-red-600',
          buttonVariant: 'danger'
        };
      case 'warning':
        return {
          iconBg: 'bg-yellow-50',
          iconColor: 'text-yellow-600',
          titleColor: 'text-yellow-600',
          buttonVariant: 'success' // Usar success para warnings
        };
      default: // 'success'
        return {
          iconBg: 'bg-blue-50',
          iconColor: 'text-conexia-green',
          titleColor: 'text-conexia-green',
          buttonVariant: 'success'
        };
    }
  };

  const styles = getVariantStyles();

  const handleClose = () => {
    if (isLoading) return;
    onClose?.();
  };

  const modalContent = (
    <div className="fixed inset-0 z-[9999]">
      <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <div
          className="relative z-10 bg-white rounded-lg w-full max-w-md max-h-[90vh] overflow-hidden flex flex-col shadow-xl"
          onClick={(e) => e.stopPropagation()}
          role="dialog"
          aria-modal="true"
          aria-label={title}
        >
          {/* Header fijo */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 rounded-t-lg flex-shrink-0">
            <div className="flex items-center gap-3 min-w-0">
              <div className={`p-2 rounded-full ${styles.iconBg} flex-shrink-0`}>
                <FiAlertCircle className={`w-6 h-6 ${styles.iconColor}`} />
              </div>
              <h3 className={`text-xl font-bold ${styles.titleColor} truncate`}>{title}</h3>
            </div>
          </div>

          {/* Contenido con scroll */}
          <div className="flex-1 overflow-y-auto px-6 py-6">
            <p className="text-gray-600">{message}</p>
          </div>

          {/* Footer fijo */}
          <div className="border-t border-gray-200 px-6 py-4 rounded-b-lg flex-shrink-0 bg-gray-50">
            <div className="flex justify-end gap-2">
              <Button
                variant="cancel"
                className="py-2 px-4 text-sm"
                onClick={handleClose}
                disabled={isLoading}
              >
                {cancelButtonText}
              </Button>
              <Button
                variant={styles.buttonVariant}
                className="py-2 px-4 text-sm"
                onClick={onConfirm}
                disabled={isLoading}
              >
                {isLoading ? 'Procesando...' : confirmButtonText}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
