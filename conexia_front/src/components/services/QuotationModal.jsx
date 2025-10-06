'use client';

import { useState } from 'react';
import { useServiceHirings } from '@/hooks/service-hirings/useServiceHirings';
import { X, Clock, DollarSign, FileText, AlertCircle } from 'lucide-react';
import { isExpired, getVigencyStatus } from '@/utils/quotationVigency';
import { getUnitLabel, getUnitLabelPlural } from '@/utils/timeUnit';
import Button from '@/components/ui/Button';

export default function QuotationModal({ hiring, isOpen, onClose, onSuccess, onError }) {
  const { 
    acceptHiring, 
    rejectHiring, 
    cancelHiring, 
    negotiateHiring, 
    loading 
  } = useServiceHirings();
  
  const [actionLoading, setActionLoading] = useState(false);

  if (!isOpen || !hiring) return null;

  const getStatusLabel = (statusCode) => {
    const statusMap = {
      pending: 'Pendiente',
      quoted: 'Cotizado',
      accepted: 'Aceptado',
      rejected: 'Rechazado',
      cancelled: 'Cancelado',
      negotiating: 'Negociando',
      in_progress: 'En progreso',
      completed: 'Completado'
    };
    return statusMap[statusCode] || statusCode;
  };

  const handleAction = async (action) => {
    setActionLoading(true);
    try {
      let result;
      let message;

      switch (action) {
        case 'accept':
          if (!hiring.quotedPrice) {
            throw new Error('No hay cotización para aceptar');
          }
          result = await acceptHiring(hiring.id);
          message = 'Cotización aceptada exitosamente';
          break;
        case 'reject':
          if (!hiring.quotedPrice) {
            throw new Error('No hay cotización para rechazar');
          }
          result = await rejectHiring(hiring.id);
          message = 'Cotización rechazada';
          break;
        case 'cancel':
          result = await cancelHiring(hiring.id);
          message = 'Solicitud cancelada exitosamente';
          break;
        case 'negotiate':
          if (!hiring.quotedPrice) {
            throw new Error('No hay cotización para negociar');
          }
          // Para negociar, necesitamos abrir un modal específico de negociación
          // Por ahora solo marcamos que se puede negociar
          onError?.('La funcionalidad de negociación requiere datos específicos. Use el modal de negociación.');
          return;
        default:
          throw new Error('Acción no válida');
      }

      onSuccess?.(message);
      onClose();
    } catch (error) {
      onError?.(error.message || 'Error al procesar la acción');
    } finally {
      setActionLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const hasQuotation = hiring.quotedPrice && hiring.estimatedHours;
  const availableActions = hiring.availableActions || [];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-2xl min-w-[300px] max-h-[90vh] overflow-y-auto overflow-x-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-xl font-semibold text-gray-900">
            {hasQuotation ? 'Cotización Recibida' : 'Detalle de Solicitud'}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
            disabled={actionLoading}
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Información del servicio */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-3">Servicio Solicitado</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Título</p>
                <p className="font-medium text-gray-900 break-words overflow-wrap-anywhere line-clamp-2 leading-tight">{hiring.service?.title}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Precio Base</p>
                <p className="font-medium text-conexia-green">
                  ${hiring.service?.price?.toLocaleString()}{hiring.service?.timeUnit ? ` por ${getUnitLabel(hiring.service.timeUnit)}` : ''}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Proveedor</p>
                <p className="font-medium text-gray-900">
                  {hiring.service?.owner?.firstName} {hiring.service?.owner?.lastName}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Estado</p>
                <p className="font-medium text-gray-900">
                  {getStatusLabel(hiring.status?.code)}
                </p>
              </div>
            </div>
          </div>

          {/* Mi descripción original */}
          <div>
            <h4 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
              <FileText size={18} />
              Mi Solicitud
            </h4>
            <div className="bg-blue-50 rounded-lg p-4">
              <p className="text-sm text-gray-600 mb-1">
                Fecha de solicitud: {formatDate(hiring.createdAt)}
              </p>
              <p className="text-gray-900">{hiring.description}</p>
            </div>
          </div>

          {/* Cotización (si existe) */}
          {hasQuotation && (
            <div>
              <h4 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                <DollarSign size={18} />
                Cotización del Proveedor
              </h4>
              <div className="bg-conexia-green/5 border border-conexia-green/20 rounded-lg p-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div className="bg-white rounded-lg p-3">
                    <p className="text-sm text-gray-600">Precio Final</p>
                    <p className="text-2xl font-bold text-conexia-green">
                      ${hiring.quotedPrice.toLocaleString()}
                    </p>
                  </div>
                  <div className="bg-white rounded-lg p-3">
                    <p className="text-sm text-gray-600 flex items-center gap-1">
                      <Clock size={14} />
                      Tiempo Estimado
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      {hiring.estimatedHours} {hiring.estimatedTimeUnit ? (hiring.estimatedHours > 1 ? getUnitLabelPlural(hiring.estimatedTimeUnit) : getUnitLabel(hiring.estimatedTimeUnit)) : 'horas'}
                    </p>
                  </div>
                  <div className="bg-white rounded-lg p-3">
                    <p className="text-sm text-gray-600">Vigencia</p>
                    <p className={`text-lg font-bold ${getVigencyStatus(hiring).className}`}>
                      {getVigencyStatus(hiring).text}
                    </p>
                  </div>
                </div>
                
                {hiring.quotationNotes && (
                  <div className="bg-white rounded-lg p-3">
                    <p className="text-sm text-gray-600 mb-2">Notas del Proveedor:</p>
                    <p className="text-gray-900">{hiring.quotationNotes}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Acciones disponibles */}
          {isExpired(hiring) ? (
            <div className="border-t border-gray-200 pt-6">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="text-red-600 mt-0.5" size={20} />
                  <div>
                    <h4 className="font-medium text-red-800 mb-1">Cotización Vencida</h4>
                    <p className="text-sm text-red-600">
                      Esta cotización ha expirado y no se pueden realizar más acciones.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ) : availableActions.length > 0 && (
            <div className="border-t border-gray-200 pt-6">
              <h4 className="font-medium text-gray-900 mb-4">Acciones Disponibles</h4>
              <div className="flex flex-wrap gap-3">
                {availableActions.includes('accept') && (
                  <Button
                    onClick={() => handleAction('accept')}
                    className="bg-green-600 hover:bg-green-700 text-white"
                    disabled={actionLoading}
                  >
                    {actionLoading ? 'Procesando...' : 'Aceptar Cotización'}
                  </Button>
                )}
                
                {availableActions.includes('reject') && (
                  <Button
                    onClick={() => handleAction('reject')}
                    className="bg-red-600 hover:bg-red-700 text-white"
                    disabled={actionLoading}
                  >
                    Rechazar
                  </Button>
                )}
                
                {availableActions.includes('negotiate') && (
                  <Button
                    onClick={() => handleAction('negotiate')}
                    className="bg-orange-600 hover:bg-orange-700 text-white"
                    disabled={actionLoading}
                  >
                    Negociar
                  </Button>
                )}
                
                {availableActions.includes('cancel') && (
                  <Button
                    onClick={() => handleAction('cancel')}
                    className="bg-gray-600 hover:bg-gray-700 text-white"
                    disabled={actionLoading}
                  >
                    Cancelar Solicitud
                  </Button>
                )}
              </div>
            </div>
          )}

          {/* Información adicional */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-600">
              <strong>¿Necesitas ayuda?</strong>
              <br />
              Puedes contactar al proveedor directamente o gestionar esta solicitud desde tus acciones disponibles.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 px-6 py-4 flex justify-end">
          <Button
            onClick={onClose}
            variant="outline"
            disabled={actionLoading}
          >
            Cerrar
          </Button>
        </div>
      </div>
    </div>
  );
}