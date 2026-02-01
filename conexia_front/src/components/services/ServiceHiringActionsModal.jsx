'use client';

import { useState } from 'react';
import { useServiceHirings } from '@/hooks/service-hirings/useServiceHirings';
import { X, AlertTriangle, AlertCircle, CheckCircle, XCircle, Trash2, MessageSquare, RefreshCw } from 'lucide-react';
import Button from '@/components/ui/Button';
import ContractServiceButton from './ContractServiceButton';
import { isExpired } from '@/utils/quotationVigency';

export default function ServiceHiringActionsModal({ hiring, isOpen, onClose, onSuccess, onError }) {
  const handleContractSuccess = (result) => {
    onSuccess?.('Servicio contratado exitosamente. Redirigiendo a MercadoPago...');
    onClose();
  };
  const { 
    acceptHiring, 
    rejectHiring, 
    cancelHiring, 
    negotiateHiring,
    requoteHiring
  } = useServiceHirings();
  
  const [loading, setLoading] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);
  const [negotiationDescription, setNegotiationDescription] = useState('');

  if (!isOpen || !hiring) return null;

  const handleAction = async (action) => {
    setLoading(true);
    try {
      let result;
      let message;

      switch (action) {
        case 'accept':
          result = await acceptHiring(hiring.id);
          message = 'Cotización aceptada exitosamente';
          break;
        case 'reject':
          result = await rejectHiring(hiring.id);
          message = 'Cotización rechazada';
          break;
        case 'cancel':
          result = await cancelHiring(hiring.id);
          message = 'Solicitud cancelada exitosamente';
          break;
        case 'negotiate':
          result = await negotiateHiring(hiring.id, { negotiationDescription });
          message = 'Negociación iniciada exitosamente';
          break;
        case 'requote':
          result = await requoteHiring(hiring.id);
          message = 'Solicitud de re-cotización enviada al proveedor';
          break;
        default:
          throw new Error('Acción no válida');
      }

      onSuccess?.(message);
      onClose();
    } catch (error) {
      onError?.(error.message || 'Error al procesar la acción');
    } finally {
      setLoading(false);
      setConfirmAction(null);
      setNegotiationDescription('');
    }
  };

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
        description: 'Al rechazar esta cotización, la solicitud se marcará como rechazada y no podrás volver a aceptarla. Puedes crear una nueva solicitud si lo deseas.',
        buttonText: 'Sí, Rechazar',
        buttonClass: 'bg-red-600 hover:bg-red-700 text-white',
        icon: XCircle,
        iconColor: 'text-red-600'
      },
      cancel: {
        title: 'Cancelar Solicitud',
        description: 'Al cancelar esta solicitud, se eliminará permanentemente y no podrás recuperarla. Esta acción no se puede deshacer.',
        buttonText: 'Sí, Cancelar',
        buttonClass: 'bg-gray-600 hover:bg-gray-700 text-white',
        icon: Trash2,
        iconColor: 'text-gray-600'
      },
      negotiate: {
        title: 'Iniciar Negociación',
        description: 'Al iniciar una negociación, el proveedor será notificado que deseas discutir los términos de la cotización. Podrás comunicarte directamente para llegar a un acuerdo.',
        buttonText: 'Sí, Negociar',
        buttonClass: 'bg-orange-600 hover:bg-orange-700 text-white',
        icon: MessageSquare,
        iconColor: 'text-orange-600'
      },
      requote: {
        title: 'Solicitar Re-cotización',
        description: 'Al solicitar una re-cotización, el proveedor será notificado para que actualice los términos de la cotización vencida. Esto renovará la vigencia de la solicitud.',
        buttonText: 'Sí, Solicitar Re-cotización',
        buttonClass: 'bg-blue-600 hover:bg-blue-700 text-white',
        icon: RefreshCw,
        iconColor: 'text-blue-600'
      }
    };
    return configs[action];
  };

  const availableActions = hiring.availableActions || [];
  // Unificar con reglas por estado para no depender completamente de availableActions
  const statusCode = hiring.status?.code;
  const defaultByStatus = {
    quoted: ['accept', 'reject', 'negotiate', 'cancel'],
    negotiating: ['accept', 'reject', 'cancel'],
    requoting: ['cancel'], // Solo puede cancelar cuando está re-cotizando
    pending: ['cancel']
  };
  const normalizedActions = Array.from(new Set([...(availableActions || []), ...((defaultByStatus[statusCode]) || [])]));
  
  // Estados donde ya no se pueden realizar acciones de cotización
  const isPostDecision = ['accepted', 'rejected', 'approved', 'in_progress', 'delivered', 'completed', 'cancelled'].includes(hiring?.status?.code);
  
  // Solo mostrar bloque de vencida si está vencida Y NO está en estado requoting Y NO está en post-decisión
  const showExpiredBlock = isExpired(hiring) && !isPostDecision && statusCode !== 'requoting';
  
  // Filtrar acciones para no permitir cancelar cuando ya fue aceptada, aprobada o rechazada
  const actions = isPostDecision
    ? normalizedActions.filter(a => a !== 'cancel')
    : normalizedActions;

  // Mostrar confirmación
  if (confirmAction) {
    const actionConfig = getActionConfig(confirmAction);
    
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg w-full max-w-md max-h-[90vh] flex flex-col">
          {/* Header fijo */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 rounded-t-lg flex-shrink-0">
            <h3 className="text-xl font-bold text-orange-600 flex items-center gap-2">
              <AlertTriangle size={20} />
              Confirmar Acción
            </h3>
            <button
              onClick={() => setConfirmAction(null)}
              className="text-gray-400 hover:text-gray-600"
              disabled={loading}
            >
              <X size={24} />
            </button>
          </div>
          
          {/* Contenido con scroll */}
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
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Descripción de la Negociación
                </label>
                <textarea
                  value={negotiationDescription}
                  onChange={(e) => setNegotiationDescription(e.target.value)}
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
          
          {/* Footer fijo */}
          <div className="border-t border-gray-200 px-6 py-4 rounded-b-lg flex-shrink-0 bg-gray-50">
            <div className="flex gap-3">
              <Button
                onClick={() => setConfirmAction(null)}
                variant="cancel"
                className="flex-1"
                disabled={loading}
              >
                Cancelar
              </Button>
              <Button
                onClick={() => handleAction(confirmAction)}
                className={`flex-1 ${actionConfig.buttonClass}`}
                disabled={loading}
              >
                {loading ? 'Procesando...' : actionConfig.buttonText}
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Mostrar lista de acciones
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-md max-h-[90vh] flex flex-col">
        {/* Header fijo */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 rounded-t-lg flex-shrink-0">
          <h3 className="text-xl font-bold text-conexia-green">
            Acciones Disponibles
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X size={24} />
          </button>
        </div>
        
        {/* Contenido con scroll */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="mb-4">
            <h4 className="font-medium text-gray-900 mb-2 break-words overflow-wrap-anywhere line-clamp-2 leading-tight max-w-full">{hiring.service?.title}</h4>
            <p className="text-sm text-gray-600">
              Estado actual: {hiring.status?.name || hiring.status?.code}
            </p>
          </div>
          
          {/* Mensaje informativo cuando está re-cotizando */}
          {statusCode === 'requoting' && (
            <div className="mb-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="text-blue-600 mt-0.5" size={20} />
                <div>
                  <h4 className="font-medium text-blue-800 mb-1">Re-cotización Solicitada</h4>
                  <p className="text-sm text-blue-600">
                    Ya has solicitado una re-cotización. El proveedor está trabajando en actualizar los términos. 
                    Recibirás una notificación cuando esté lista.
                  </p>
                </div>
              </div>
            </div>
          )}
          
          {showExpiredBlock ? (
            <div className="space-y-4">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="text-red-600 mt-0.5" size={20} />
                  <div>
                    <h4 className="font-medium text-red-800 mb-1">Cotización Vencida</h4>
                    <p className="text-sm text-red-600">
                      Esta cotización ha expirado. Puedes solicitar una re-cotización al proveedor o cancelar la solicitud.
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Botón de Re-cotizar */}
              <button
                onClick={() => setConfirmAction('requote')}
                className="w-full flex items-center gap-3 p-4 border border-blue-200 bg-blue-600 rounded-lg hover:bg-blue-700 transition text-left"
              >
                <RefreshCw size={24} className="text-white flex-shrink-0" />
                <div>
                  <p className="font-medium text-white">Solicitar Re-cotización</p>
                  <p className="text-sm text-blue-100">Pedir al proveedor que actualice la cotización</p>
                </div>
              </button>
              
              {/* Botón de Cancelar */}
              <button
                onClick={() => setConfirmAction('cancel')}
                className="w-full flex items-center gap-3 p-4 border border-gray-200 bg-gray-500 rounded-lg hover:bg-gray-600 transition text-left"
              >
                <Trash2 size={24} className="text-white flex-shrink-0" />
                <div>
                  <p className="font-medium text-white">Cancelar Solicitud</p>
                  <p className="text-sm text-gray-100">Eliminar esta solicitud vencida</p>
                </div>
              </button>
            </div>
          ) : (
            <div className="space-y-3">
            {actions.includes('accept') && (
              <button
                onClick={() => setConfirmAction('accept')}
                className="w-full flex items-center gap-3 p-4 border border-green-200 rounded-lg hover:bg-green-50 transition text-left"
              >
                <CheckCircle size={24} className="text-green-600 flex-shrink-0" />
                <div>
                  <p className="font-medium text-green-800">Aceptar Cotización</p>
                  <p className="text-sm text-green-600">Confirmar y proceder con el servicio</p>
                </div>
              </button>
            )}
            
            {actions.includes('negotiate') && (
              <button
                onClick={() => setConfirmAction('negotiate')}
                className="w-full flex items-center gap-3 p-4 border border-orange-200 rounded-lg hover:bg-orange-50 transition text-left"
              >
                <MessageSquare size={24} className="text-orange-600 flex-shrink-0" />
                <div>
                  <p className="font-medium text-orange-800">Negociar</p>
                  <p className="text-sm text-orange-600">Discutir términos con el proveedor</p>
                </div>
              </button>
            )}
            
            {actions.includes('reject') && (
              <button
                onClick={() => setConfirmAction('reject')}
                className="w-full flex items-center gap-3 p-4 border border-red-200 bg-red-500 rounded-lg hover:bg-red-600 transition text-left"
              >
                <XCircle size={24} className="text-white flex-shrink-0" />
                <div>
                  <p className="font-medium text-white">Rechazar</p>
                  <p className="text-sm text-red-100">No aceptar la cotización</p>
                </div>
              </button>
            )}
            
            {actions.includes('cancel') && (
              <button
                onClick={() => setConfirmAction('cancel')}
                className="w-full flex items-center gap-3 p-4 border border-gray-200 bg-gray-500 rounded-lg hover:bg-gray-600 transition text-left"
              >
                <Trash2 size={24} className="text-white flex-shrink-0" />
                <div>
                  <p className="font-medium text-white">Cancelar Solicitud</p>
                  <p className="text-sm text-gray-100">Eliminar esta solicitud</p>
                </div>
              </button>
            )}
            

            
            </div>
          )}
          
          {!showExpiredBlock && actions.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500">No hay acciones disponibles para esta solicitud.</p>
            </div>
          )}
        </div>
        
        {/* Footer fijo */}
        <div className="border-t border-gray-200 px-6 py-4 flex justify-end rounded-b-lg flex-shrink-0 bg-gray-50">
          <Button onClick={onClose} variant="cancel">
            Cerrar
          </Button>
        </div>
      </div>
    </div>
  );
}