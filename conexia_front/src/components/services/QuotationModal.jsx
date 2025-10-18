'use client';

import { useState } from 'react';
import { useServiceHirings } from '@/hooks/service-hirings/useServiceHirings';
import { X, Clock, DollarSign, FileText, AlertCircle, Briefcase, User } from 'lucide-react';
import { isExpired, getVigencyStatus } from '@/utils/quotationVigency';
import { getUnitLabel, getUnitLabelPlural } from '@/utils/timeUnit';
import Button from '@/components/ui/Button';
import QuotationDisplay from './QuotationDisplay';
import { config } from '@/config';
import { getUserDisplayName } from '@/utils/formatUserName';

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

  // Derivar información del dueño del servicio para mostrar en el encabezado de servicio
  const ownerRaw = hiring.owner || hiring.service?.owner || hiring.service?.user || null;
  const ownerNameFromFull = (fullName) => {
    const parts = (fullName || '').trim().split(/\s+/);
    return {
      name: parts[0] || '',
      lastName: parts[1] || ''
    };
  };
  const ownerNameFields = ownerRaw?.fullName
    ? ownerNameFromFull(ownerRaw.fullName)
    : { name: ownerRaw?.firstName ?? ownerRaw?.name ?? '', lastName: ownerRaw?.lastName ?? '' };
  const ownerDisplayName = ownerRaw
    ? getUserDisplayName({ name: ownerNameFields.name, lastName: ownerNameFields.lastName })
    : 'Usuario';
  const ownerImage = ownerRaw?.profileImage || ownerRaw?.profilePicture || null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-2xl min-w-[300px] max-h-[90vh] flex flex-col">
        {/* Header fijo */}
        <div className="px-6 py-4 border-b border-gray-200 rounded-t-lg flex-shrink-0">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-bold text-conexia-green flex items-center gap-2">
              {hasQuotation ? (
                <>
                  Cotización Recibida
                </>
              ) : (
                <>
                  Detalle de Solicitud
                </>
              )}
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
              disabled={actionLoading}
            >
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Contenido con scroll */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Título Servicio Solicitado */}
          <h4 className="font-medium text-conexia-green text-lg mb-2 flex items-center gap-2">
            <Briefcase size={20} className="text-conexia-green" />
            Servicio Solicitado
          </h4>
          {/* Información del servicio */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
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
                <div className="flex items-center gap-2 mt-1">
                  {ownerImage ? (
                    <img
                      src={`${config.IMAGE_URL}/${ownerImage}`}
                      alt={ownerDisplayName}
                      className="w-7 h-7 rounded-full object-cover border"
                    />
                  ) : (
                    <div className="w-7 h-7 rounded-full bg-gray-200 flex items-center justify-center">
                      <User size={14} className="text-gray-500" />
                    </div>
                  )}
                  <p className="font-medium text-gray-900">{ownerDisplayName}</p>
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-600">Estado</p>
                <p className="font-medium text-gray-900">
                  {getStatusLabel(hiring.status?.code)}
                </p>
              </div>
            </div>
          </div>

          {/* Título Mi Solicitud */}
          <h4 className="font-medium text-blue-600 text-lg mb-2 flex items-center gap-2">
            <FileText size={18} className="text-blue-600" />
            Mi Solicitud
          </h4>
          <div className="bg-blue-50 rounded-lg p-4 mb-6">
            <p className="text-sm text-gray-600 mb-1">
              Fecha de solicitud: {formatDate(hiring.createdAt)}
            </p>
            <p className="text-gray-900">{hiring.description}</p>
          </div>

          {/* Título Cotización del Proveedor */}
          {hasQuotation && (
            <>
              <h4 className="font-medium text-green-700 text-lg mb-3 flex items-center gap-2">
                <DollarSign size={18} className="text-green-700" />
                Cotización del Proveedor
              </h4>
              {isExpired(hiring) ? (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="text-red-600 mt-0.5" size={20} />
                    <div>
                      <h4 className="font-medium text-red-800 mb-1">Cotización Vencida</h4>
                      <p className="text-sm text-red-600">
                        Esta cotización ha expirado y sus detalles ya no están disponibles.
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  <QuotationDisplay quotation={hiring} compact={false} />
                  {hiring.quotationValidityDays && (
                    <div className="mt-4 bg-gray-50 rounded-lg p-4 border border-gray-200">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-600">Vigencia de la cotización</p>
                          <p className={`text-lg font-bold ${getVigencyStatus(hiring).className}`}>
                            {getVigencyStatus(hiring).text}
                          </p>
                        </div>
                        <div className="text-sm text-gray-500">
                          Válida por {hiring.quotationValidityDays} {hiring.quotationValidityDays === 1 ? 'día' : 'días'}
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}
            </>
          )}

          {/* Acciones disponibles */}
          {isExpired(hiring) ? null : availableActions.length > 0 && (
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

        {/* Footer fijo */}
        <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 rounded-b-lg flex-shrink-0">
          <div className="flex justify-end">
            <Button variant="cancel" onClick={onClose} disabled={actionLoading}>
              Cerrar
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}