'use client';

import { useState } from 'react';
import { useServiceHirings } from '@/hooks/service-hirings/useServiceHirings';
import { X, AlertTriangle } from 'lucide-react';
import Button from '@/components/ui/Button';

export default function ServiceHiringActionsModal({ hiring, isOpen, onClose, onSuccess, onError }) {
  const { 
    acceptHiring, 
    rejectHiring, 
    cancelHiring, 
    negotiateHiring
  } = useServiceHirings();
  
  const [loading, setLoading] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);

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
          result = await negotiateHiring(hiring.id, {});
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
      setLoading(false);
      setConfirmAction(null);
    }
  };

  const getActionConfig = (action) => {
    const configs = {
      accept: {
        title: 'Aceptar Cotización',
        description: 'Al aceptar esta cotización, confirmas que estás de acuerdo con el precio y tiempo estimado. El proveedor podrá comenzar a trabajar en tu solicitud.',
        buttonText: 'Sí, Aceptar',
        buttonClass: 'bg-green-600 hover:bg-green-700 text-white',
        icon: '✅'
      },
      reject: {
        title: 'Rechazar Cotización',
        description: 'Al rechazar esta cotización, la solicitud se marcará como rechazada y no podrás volver a aceptarla. Puedes crear una nueva solicitud si lo deseas.',
        buttonText: 'Sí, Rechazar',
        buttonClass: 'bg-red-600 hover:bg-red-700 text-white',
        icon: '❌'
      },
      cancel: {
        title: 'Cancelar Solicitud',
        description: 'Al cancelar esta solicitud, se eliminará permanentemente y no podrás recuperarla. Esta acción no se puede deshacer.',
        buttonText: 'Sí, Cancelar',
        buttonClass: 'bg-gray-600 hover:bg-gray-700 text-white',
        icon: '🗑️'
      },
      negotiate: {
        title: 'Iniciar Negociación',
        description: 'Al iniciar una negociación, el proveedor será notificado que deseas discutir los términos de la cotización. Podrás comunicarte directamente para llegar a un acuerdo.',
        buttonText: 'Sí, Negociar',
        buttonClass: 'bg-orange-600 hover:bg-orange-700 text-white',
        icon: '🤝'
      }
    };
    return configs[action];
  };

  const availableActions = hiring.availableActions || [];

  // Mostrar confirmación
  if (confirmAction) {
    const actionConfig = getActionConfig(confirmAction);
    
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg w-full max-w-md">
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <AlertTriangle size={20} className="text-orange-500" />
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
          
          <div className="p-6">
            <div className="text-center mb-6">
              <div className="text-4xl mb-3">{actionConfig.icon}</div>
              <h4 className="text-lg font-medium text-gray-900 mb-2">
                {actionConfig.title}
              </h4>
              <p className="text-gray-600 text-sm">
                {actionConfig.description}
              </p>
            </div>
            
            <div className="flex gap-3">
              <Button
                onClick={() => setConfirmAction(null)}
                variant="outline"
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
      <div className="bg-white rounded-lg w-full max-w-md">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            Acciones Disponibles
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X size={24} />
          </button>
        </div>
        
        <div className="p-6">
          <div className="mb-4">
            <h4 className="font-medium text-gray-900 mb-2">{hiring.service?.title}</h4>
            <p className="text-sm text-gray-600">
              Estado actual: {hiring.status?.name || hiring.status?.code}
            </p>
          </div>
          
          <div className="space-y-3">
            {availableActions.includes('accept') && (
              <button
                onClick={() => setConfirmAction('accept')}
                className="w-full flex items-center gap-3 p-4 border border-green-200 rounded-lg hover:bg-green-50 transition text-left"
              >
                <span className="text-2xl">✅</span>
                <div>
                  <p className="font-medium text-green-800">Aceptar Cotización</p>
                  <p className="text-sm text-green-600">Confirmar y proceder con el servicio</p>
                </div>
              </button>
            )}
            
            {availableActions.includes('negotiate') && (
              <button
                onClick={() => setConfirmAction('negotiate')}
                className="w-full flex items-center gap-3 p-4 border border-orange-200 rounded-lg hover:bg-orange-50 transition text-left"
              >
                <span className="text-2xl">🤝</span>
                <div>
                  <p className="font-medium text-orange-800">Negociar</p>
                  <p className="text-sm text-orange-600">Discutir términos con el proveedor</p>
                </div>
              </button>
            )}
            
            {availableActions.includes('reject') && (
              <button
                onClick={() => setConfirmAction('reject')}
                className="w-full flex items-center gap-3 p-4 border border-red-200 rounded-lg hover:bg-red-50 transition text-left"
              >
                <span className="text-2xl">❌</span>
                <div>
                  <p className="font-medium text-red-800">Rechazar</p>
                  <p className="text-sm text-red-600">No aceptar la cotización</p>
                </div>
              </button>
            )}
            
            {availableActions.includes('cancel') && (
              <button
                onClick={() => setConfirmAction('cancel')}
                className="w-full flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition text-left"
              >
                <span className="text-2xl">🗑️</span>
                <div>
                  <p className="font-medium text-gray-800">Cancelar Solicitud</p>
                  <p className="text-sm text-gray-600">Eliminar esta solicitud</p>
                </div>
              </button>
            )}
          </div>
          
          {availableActions.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500">No hay acciones disponibles para esta solicitud.</p>
            </div>
          )}
        </div>
        
        <div className="border-t border-gray-200 px-6 py-4 flex justify-end">
          <Button onClick={onClose} variant="outline">
            Cerrar
          </Button>
        </div>
      </div>
    </div>
  );
}