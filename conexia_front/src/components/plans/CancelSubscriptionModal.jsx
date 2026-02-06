'use client';

import { useState } from 'react';
import { FiX, FiAlertCircle } from 'react-icons/fi';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export default function CancelSubscriptionModal({
  isOpen,
  onClose,
  onConfirm,
  subscription,
  planName,
  isLoading,
}) {
  const [reason, setReason] = useState('');
  const [showReasonField, setShowReasonField] = useState(false);
  const maxLength = 500;

  if (!isOpen) return null;

  const handleConfirm = () => {
    onConfirm(reason.trim() || null);
  };

  const handleReasonChange = (e) => {
    const value = e.target.value;
    if (value.length <= maxLength) {
      setReason(value);
    }
  };

  // Formatear la fecha de fin
  const endDateFormatted = subscription?.endDate
    ? format(new Date(subscription.endDate), "d 'de' MMMM, yyyy", { locale: es })
    : '';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-lg rounded-xl bg-white shadow-2xl overflow-hidden">
        {/* Header con gradiente verde oscuro de CONEXIA */}
        <div className="bg-gradient-to-r from-conexia-green to-[#1a594f] px-6 py-4 text-white">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <FiAlertCircle className="w-6 h-6" />
                <h2 className="text-xl font-bold">Cancelar suscripción</h2>
              </div>
              <p className="text-sm text-white/90">Plan {planName}</p>
            </div>
            <button
              onClick={onClose}
              disabled={isLoading}
              className="text-white hover:bg-white/20 rounded-lg p-1 transition-colors disabled:opacity-50"
            >
              <FiX className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Contenido */}
        <div className="px-6 py-5">
          {/* Alerta de información importante */}
          <div className="bg-conexia-soft border border-conexia-green/20 rounded-lg p-4 mb-5">
            <div className="flex items-start gap-3">
              <FiAlertCircle className="w-5 h-5 text-conexia-green flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-conexia-green mb-2">Información importante</h3>
                <p className="text-sm text-gray-800 font-medium mb-1">
                  Seguirás teniendo acceso hasta {endDateFormatted}.
                </p>
                <p className="text-sm text-gray-700">
                  Luego de esa fecha ya no tendrás los beneficios de tu plan {planName}.
                </p>
              </div>
            </div>
          </div>

          {/* ¿Qué pasará después? */}
          <div className="mb-5">
            <h3 className="font-semibold text-gray-900 mb-3">¿Qué pasará después?</h3>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-start gap-2">
                <span className="text-gray-400 mt-0.5">•</span>
                <span>Tu plan pasará a estado "Pendiente de cancelación"</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-gray-400 mt-0.5">•</span>
                <span>Mantendrás todos los beneficios hasta {endDateFormatted}</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-gray-400 mt-0.5">•</span>
                <span>No se realizará el próximo cobro automático</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-gray-400 mt-0.5">•</span>
                <span>Después de la fecha, volverás al plan Free</span>
              </li>
            </ul>
          </div>

          {/* Campo de razón opcional */}
          {!showReasonField ? (
            <button
              onClick={() => setShowReasonField(true)}
              disabled={isLoading}
              className="text-sm text-conexia-green hover:text-conexia-green/80 font-medium mb-5 disabled:opacity-50"
            >
              + Agregar motivo (opcional)
            </button>
          ) : (
            <div className="mb-5">
              <button
                onClick={() => setShowReasonField(false)}
                disabled={isLoading}
                className="text-sm text-conexia-green hover:text-conexia-green/80 font-medium mb-3 disabled:opacity-50"
              >
                Ocultar
              </button>
              <label htmlFor="cancelReason" className="block text-sm font-medium text-gray-700 mb-2">
                ¿Por qué cancelas tu suscripción?
              </label>
              <textarea
                id="cancelReason"
                value={reason}
                onChange={handleReasonChange}
                disabled={isLoading}
                placeholder="Tus comentarios nos ayudan a mejorar..."
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-conexia-green focus:outline-none focus:ring-2 focus:ring-conexia-green/20 disabled:bg-gray-50 disabled:text-gray-500"
                rows="4"
              />
              <div className="mt-1 text-right text-xs text-gray-500">
                {reason.length}/{maxLength} caracteres
              </div>
            </div>
          )}

          {/* Botones */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              disabled={isLoading}
              className="flex-1 rounded-lg border-2 border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-50"
            >
              Volver
            </button>
            <button
              onClick={handleConfirm}
              disabled={isLoading}
              className="flex-1 rounded-lg bg-conexia-green px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-conexia-green/90 disabled:opacity-50"
            >
              {isLoading ? 'Cancelando...' : 'Cancelar de todos modos'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
