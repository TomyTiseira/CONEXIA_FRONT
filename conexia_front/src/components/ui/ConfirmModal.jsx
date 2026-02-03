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

  const modalContent = (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
      <div 
        className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 relative"
        onClick={e => e.stopPropagation()}
      >
        {/* Icono y título */}
        <div className="flex items-center gap-3 mb-4">
          <div className={`p-2 rounded-full ${styles.iconBg}`}>
            <FiAlertCircle className={`w-6 h-6 ${styles.iconColor}`} />
          </div>
          <h3 className={`text-xl font-bold ${styles.titleColor}`}>{title}</h3>
        </div>
        
        {/* Mensaje */}
        <p className="text-gray-600 mb-6">{message}</p>
        
        {/* Botones */}
        <div className="flex justify-end gap-2 mt-4">
          <Button
            variant={styles.buttonVariant}
            className="py-2 px-4 text-sm"
            onClick={onConfirm}
            disabled={isLoading}
          >
            {isLoading ? 'Procesando...' : confirmButtonText}
          </Button>
          <Button
            variant="cancel"
            className="py-2 px-4 text-sm"
            onClick={onClose}
            disabled={isLoading}
          >
            {cancelButtonText}
          </Button>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
