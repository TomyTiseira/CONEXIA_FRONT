'use client';

import { useState } from 'react';
import { useServiceHirings } from '@/hooks/service-hirings/useServiceHirings';
import { X, Clock, DollarSign, FileText, AlertCircle, Briefcase, User, CheckCircle, XCircle, Trash2, MessageSquare } from 'lucide-react';
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
  const [negotiationDescription, setNegotiationDescription] = useState('');
  const [confirmAction, setConfirmAction] = useState(null);

  if (!isOpen || !hiring) return null;

  // Datos listos para renderizar (logs de depuración eliminados)

  const getActionConfig = (action) => {
    const configs = {
      accept: {
        title: 'Aceptar cotización',
        description: 'Al aceptar esta cotización, confirmas que estás de acuerdo con el precio y tiempo estimado. El proveedor podrá comenzar a trabajar en tu solicitud.',
        buttonText: 'Sí, Aceptar',
        buttonClass: 'bg-green-600 hover:bg-green-700 text-white',
        icon: CheckCircle,
        iconColor: 'text-green-600'
      },
      reject: {
        title: 'Rechazar cotización',
        description: 'Al rechazar esta cotización, la solicitud se marcará como rechazada y no podrás volver a aceptarla. El proveedor será notificado de tu decisión.',
        buttonText: 'Sí, Rechazar',
        buttonClass: 'bg-red-600 hover:bg-red-700 text-white',
        icon: XCircle,
        iconColor: 'text-red-600'
      },
      cancel: {
        title: 'Cancelar solicitud',
        description: 'Al cancelar esta solicitud, se eliminará permanentemente y no podrás recuperarla. Esta acción no se puede deshacer.',
        buttonText: 'Sí, cancelar',
        buttonClass: 'bg-gray-600 hover:bg-gray-700 text-white',
        icon: Trash2,
        iconColor: 'text-gray-600'
      },
      negotiate: {
        title: 'Iniciar negociación',
        description: 'Al iniciar una negociación, el proveedor será notificado que deseas discutir los términos de la cotización. Podrás comunicarte directamente para llegar a un acuerdo.',
        buttonText: 'Sí, negociar',
        buttonClass: 'bg-orange-600 hover:bg-orange-700 text-white',
        icon: MessageSquare,
        iconColor: 'text-orange-600'
      }
    };
    return configs[action];
  };

  const getStatusLabel = (statusCode) => {
    const statusMap = {
      pending: 'Pendiente',
      quoted: 'Cotizado',
      accepted: 'Aceptado',
      payment_pending: 'Pago en proceso',
      payment_rejected: 'Pago rechazado',
      approved: 'Aprobada',
      rejected: 'Rechazado',
      cancelled: 'Cancelado',
      negotiating: 'Negociando',
      in_progress: 'En progreso',
      delivered: 'Entregado',
      revision_requested: 'Revisión solicitada',
      completed: 'Completado',
      expired: 'Vencida',
      in_claim: 'En reclamo',
      cancelled_by_claim: 'Cancelado por reclamo',
      completed_by_claim: 'Finalizado por reclamo',
      completed_with_agreement: 'Finalizado con acuerdo'
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
          // Permitir rechazar incluso si no hay precio (seguridad extra)
          result = await rejectHiring(hiring.id);
          message = 'Cotización rechazada';
          break;
        case 'cancel':
          result = await cancelHiring(hiring.id);
          message = 'Solicitud cancelada exitosamente';
          break;
        case 'negotiate':
          // Iniciar negociación con la descripción
          result = await negotiateHiring(hiring.id, { 
            negotiationDescription: negotiationDescription.trim() || undefined 
          });
          message = 'Negociación iniciada exitosamente';
          break;
        default:
          throw new Error('Acción no válida');
      }

      onSuccess?.(message);
      onClose();
    } catch (error) {
      onError?.(error.message || 'Error al procesar la acción');
    } finally {
      setActionLoading(false);
      setConfirmAction(null);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'No disponible';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Fecha inválida';
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Determinar si hay cotización: debe tener precio O entregables, y estimatedHours
  const hasQuotation = Boolean(
    (hiring.quotedPrice || (hiring.deliverables && hiring.deliverables.length > 0)) && 
    hiring.estimatedHours
  );
  const availableActions = hiring.availableActions || [];
  const statusCode = hiring.status?.code;
  const defaultByStatus = {
    quoted: ['accept', 'reject', 'negotiate', 'cancel'],
    negotiating: ['accept', 'reject', 'cancel'],
    pending: ['cancel']
  };
  const actions = Array.from(new Set([...(availableActions || []), ...((defaultByStatus[statusCode]) || [])]));
  // Regla: solo mostrar "Cotización Vencida" cuando está en estado 'quoted' Y está vencida
  // En negotiating, accepted, rejected, etc. siempre mostrar los detalles
  const showExpiredBlock = isExpired(hiring) && hiring.status?.code === 'quoted';

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

  // Modal de confirmación de acción
  if (confirmAction) {
    const actionConfig = getActionConfig(confirmAction);
    
    return (
      <div className="fixed inset-0 z-[110]" onClick={() => setConfirmAction(null)}>
        <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity z-0" />
        <div className="fixed inset-0 flex items-center justify-center p-4 z-10">
          <div
            className="relative z-10 bg-white rounded-lg w-full max-w-md max-h-[90vh] overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
          {/* Header fijo */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 rounded-t-lg flex-shrink-0">
            <h3 className="text-xl font-bold text-orange-600 flex items-center gap-2">
              <AlertCircle size={20} />
              Confirmar acción
            </h3>
            <button
              onClick={() => setConfirmAction(null)}
              className="text-gray-400 hover:text-gray-600"
              disabled={actionLoading}
            >
              <X size={24} />
            </button>
          </div>
          
          {/* Contenido */}
          <div className="flex-1 overflow-y-auto p-6">
            <div className="text-center mb-6">
              <div className="flex justify-center mb-4">
                <actionConfig.icon size={48} className={actionConfig.iconColor} />
              </div>
              <h4 className="text-lg font-medium text-gray-900 mb-2">
                {actionConfig.title}
              </h4>
              <p className="text-gray-600 text-sm">
                {actionConfig.description}
              </p>
            </div>

            {/* Campo de descripción de negociación */}
            {confirmAction === 'negotiate' && (
              <div className="mt-4">
                <label htmlFor="negotiationDescription" className="block text-sm font-medium text-gray-700 mb-2">
                  Descripción de la negociación
                </label>
                <textarea
                  id="negotiationDescription"
                  value={negotiationDescription}
                  onChange={(e) => setNegotiationDescription(e.target.value.slice(0, 1000))}
                  placeholder="Describe los términos que deseas negociar (precio, tiempo, alcance, etc.)"
                  maxLength={1000}
                  rows={5}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
                />
                <div className="flex justify-between mt-1">
                  <p className="text-xs text-gray-500">
                    Describe qué aspectos deseas negociar con el proveedor
                  </p>
                  <p className="text-xs text-gray-500">
                    {negotiationDescription.length}/1000
                  </p>
                </div>
              </div>
            )}
          </div>
          
          {/* Footer */}
          <div className="border-t border-gray-200 px-6 py-4 rounded-b-lg flex-shrink-0 bg-gray-50">
            <div className="flex gap-3">
              <Button
                onClick={() => setConfirmAction(null)}
                variant="cancel"
                className="flex-1"
                disabled={actionLoading}
              >
                Cancelar
              </Button>
              <Button
                onClick={() => handleAction(confirmAction)}
                className={`flex-1 ${actionConfig.buttonClass}`}
                disabled={actionLoading}
              >
                {actionLoading ? 'Procesando...' : actionConfig.buttonText}
              </Button>
            </div>
          </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[100]" onClick={onClose}>
      <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity z-0" />
      <div className="fixed inset-0 flex items-center justify-center p-4 z-10">
        <div
          className="relative z-10 bg-white rounded-lg w-full max-w-2xl min-w-[300px] max-h-[90vh] overflow-hidden flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
        {/* Header fijo */}
        <div className="px-6 py-4 border-b border-gray-200 rounded-t-lg flex-shrink-0">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-bold text-conexia-green flex items-center gap-2">
              {hasQuotation ? (
                <>
                  Cotización recibida
                </>
              ) : (
                <>
                  Detalle de solicitud
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
            Servicio solicitado
          </h4>
          {/* Información del servicio */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Título</p>
                <p className="font-medium text-gray-900 break-words overflow-wrap-anywhere line-clamp-2 leading-tight">{hiring.service?.title}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Precio base</p>
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
            Mi solicitud
          </h4>
          <div className="bg-blue-50 rounded-lg p-4 mb-6">
            {hiring.createdAt && (
              <p className="text-sm text-gray-600 mb-1">
                Fecha de solicitud: {formatDate(hiring.createdAt)}
              </p>
            )}
            <p className="text-gray-900 whitespace-pre-wrap">
              {hiring.description?.trim() || 'Sin descripción específica'}
            </p>
          </div>

          {/* Título Cotización del Proveedor */}
          {hasQuotation && (
            <>
              <h4 className="font-medium text-green-700 text-lg mb-3 flex items-center gap-2">
                <DollarSign size={18} className="text-green-700" />
                Cotización del proveedor
              </h4>
              {showExpiredBlock ? (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="text-red-600 mt-0.5" size={20} />
                    <div className="flex-1">
                      <h4 className="font-medium text-red-800 mb-1">Cotización Vencida</h4>
                      <p className="text-sm text-red-600">
                        Esta cotización ha expirado. Debes cancelar la solicitud para poder volver a pedir una nueva cotización.
                      </p>
                      <div className="mt-4">
                        <Button
                          onClick={() => handleAction('cancel')}
                          className="bg-gray-600 hover:bg-gray-700 text-white"
                          disabled={actionLoading}
                        >
                          {actionLoading ? 'Procesando...' : 'Cancelar solicitud'}
                        </Button>
                      </div>
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
          {showExpiredBlock ? null : actions.length > 0 && (
            <div className="border-t border-gray-200 pt-6">
              <h4 className="font-medium text-gray-900 mb-4">Acciones Disponibles</h4>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {actions.includes('accept') && (
                  <Button
                    onClick={() => setConfirmAction('accept')}
                    className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white shadow-md hover:shadow-lg transition-all duration-200 font-semibold flex items-center justify-center gap-2"
                    disabled={actionLoading}
                  >
                    {actionLoading ? 'Procesando...' : (
                      <>
                        <CheckCircle size={16} />
                        Aceptar cotización
                      </>
                    )}
                  </Button>
                )}
                
                {actions.includes('reject') && (
                  <Button
                    onClick={() => setConfirmAction('reject')}
                    className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white shadow-md hover:shadow-lg transition-all duration-200 font-semibold flex items-center justify-center gap-2"
                    disabled={actionLoading}
                  >
                    <XCircle size={16} />
                    Rechazar
                  </Button>
                )}
                
                {actions.includes('negotiate') && (
                  <Button
                    onClick={() => setConfirmAction('negotiate')}
                    className="bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800 text-white shadow-md hover:shadow-lg transition-all duration-200 font-semibold flex items-center justify-center gap-2"
                    disabled={actionLoading}
                  >
                    <MessageSquare size={16} />
                    Negociar
                  </Button>
                )}
                
                {actions.includes('cancel') && (
                  <Button
                    onClick={() => setConfirmAction('cancel')}
                    className="bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white shadow-md hover:shadow-lg transition-all duration-200 font-semibold flex items-center justify-center gap-2"
                    disabled={actionLoading}
                  >
                    <Trash2 size={16} />
                    Cancelar solicitud
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
    </div>
  );
}