'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useUserStore } from '@/store/userStore';
import { ROLES } from '@/constants/roles';
import { useServiceHirings } from '@/hooks/service-hirings/useServiceHirings';
import { getUnitLabel } from '@/utils/timeUnit';
import { X, AlertCircle } from 'lucide-react';
import Button from '@/components/ui/Button';

function ConexiaModalWrapper({ onClose, zIndex = 'z-[100]', children }) {
  return (
    <div className={`fixed inset-0 ${zIndex}`} onClick={onClose}>
      <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity z-0" />
      <div className="fixed inset-0 flex items-center justify-center p-4 z-10">
        <div className="relative z-10" onClick={(e) => e.stopPropagation()}>
          {children}
        </div>
      </div>
    </div>
  );
}

export default function ServiceHiringModal({ service, isOpen, onClose, onSuccess }) {
  const { user, isAuthenticated } = useAuth();
  const { roleName } = useUserStore();
  const { createHiring, loading } = useServiceHirings();
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');

  // Validaciones
  const canHire = isAuthenticated && roleName === ROLES.USER && service?.owner?.id !== user?.id;
  
  // Estados que bloquean solicitar nueva cotización
  const BLOCKED_STATES = ['pending', 'quoted', 'requoting', 'negotiating', 'accepted', 'approved', 'in_progress', 'in_claim', 'delivered', 'revision_requested'];
  const activeHiring = service?.serviceHiring;
  
  // Validar si hay un hiring activo en estado bloqueado
  const hasBlockedHiring = activeHiring && BLOCKED_STATES.includes(activeHiring?.status?.code);
  
  // El servicio está bloqueado si:
  // 1. Tiene hasPendingQuotation o hasActiveQuotation (para backward compatibility)
  // 2. O tiene un serviceHiring con estado bloqueado
  const isBlocked = service?.hasPendingQuotation || service?.hasActiveQuotation || hasBlockedHiring;

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!description.trim()) {
      setError('La descripción es requerida');
      return;
    }

    if (description.trim().length < 10) {
      setError('La descripción debe tener al menos 10 caracteres');
      return;
    }

    try {
      await createHiring(service.id, description.trim());
      onSuccess?.('Solicitud de contratación enviada exitosamente');
      handleClose();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleClose = () => {
    setDescription('');
    setError('');
    onClose();
  };

  if (!isOpen) return null;

  // Validación de usuario no autenticado
  if (!isAuthenticated) {
    return (
      <ConexiaModalWrapper onClose={handleClose}>
        <div className="bg-white rounded-lg w-full max-w-md max-h-[90vh] overflow-hidden flex flex-col">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 flex-shrink-0">
            <h3 className="text-lg font-semibold text-gray-900">Iniciar Sesión Requerido</h3>
            <button onClick={handleClose} className="text-gray-400 hover:text-gray-600">
              <X size={24} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-6 py-4 min-h-0">
            <p className="text-gray-600">Debes iniciar sesión para contratar servicios.</p>
          </div>

          <div className="border-t border-gray-200 px-6 py-4 flex-shrink-0 bg-gray-50">
            <div className="flex gap-3">
              <Button onClick={handleClose} variant="outline" className="flex-1">
                Cancelar
              </Button>
              <Button onClick={() => (window.location.href = '/login')} className="flex-1">
                Iniciar Sesión
              </Button>
            </div>
          </div>
        </div>
      </ConexiaModalWrapper>
    );
  }

  // Validación de rol
  if (roleName !== ROLES.USER) {
    return (
      <ConexiaModalWrapper onClose={handleClose}>
        <div className="bg-white rounded-lg w-full max-w-md max-h-[90vh] overflow-hidden flex flex-col">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 flex-shrink-0">
            <h3 className="text-lg font-semibold text-gray-900">Acceso Restringido</h3>
            <button onClick={handleClose} className="text-gray-400 hover:text-gray-600">
              <X size={24} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-6 py-4 min-h-0">
            <p className="text-gray-600">Solo los usuarios pueden contratar servicios.</p>
          </div>

          <div className="border-t border-gray-200 px-6 py-4 flex-shrink-0 bg-gray-50">
            <Button onClick={handleClose} className="w-full">
              Entendido
            </Button>
          </div>
        </div>
      </ConexiaModalWrapper>
    );
  }

  // Validación de dueño del servicio
  if (service?.owner?.id === user?.id) {
    return (
      <ConexiaModalWrapper onClose={handleClose}>
        <div className="bg-white rounded-lg w-full max-w-md max-h-[90vh] overflow-hidden flex flex-col">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 flex-shrink-0">
            <h3 className="text-lg font-semibold text-gray-900">No Disponible</h3>
            <button onClick={handleClose} className="text-gray-400 hover:text-gray-600">
              <X size={24} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-6 py-4 min-h-0">
            <p className="text-gray-600">No puedes contratar tu propio servicio.</p>
          </div>

          <div className="border-t border-gray-200 px-6 py-4 flex-shrink-0 bg-gray-50">
            <Button onClick={handleClose} className="w-full">
              Entendido
            </Button>
          </div>
        </div>
      </ConexiaModalWrapper>
    );
  }

  // Validación si ya tiene una cotización activa o en curso
  if (isBlocked) {
    const getStatusMessage = () => {
      const status = activeHiring?.status?.code;
      const statusMessages = {
        'pending': 'pendiente de cotización',
        'quoted': 'cotizada',
        'requoting': 'en re-cotización',
        'negotiating': 'en negociación',
        'accepted': 'aceptada',
        'approved': 'aprobada',
        'in_progress': 'en progreso',
        'in_claim': 'con reclamo activo',
        'delivered': 'con entrega pendiente de revisión',
        'revision_requested': 'en revisión'
      };
      return statusMessages[status] || 'en curso';
    };

    return (
      <ConexiaModalWrapper onClose={handleClose}>
        <div className="bg-white rounded-lg w-full max-w-md max-h-[90vh] overflow-hidden flex flex-col">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 flex-shrink-0">
            <div className="flex items-center gap-2">
              <AlertCircle className="text-orange-600" size={24} />
              <h3 className="text-lg font-semibold text-gray-900">Solicitud en Curso</h3>
            </div>
            <button onClick={handleClose} className="text-gray-400 hover:text-gray-600">
              <X size={24} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-6 py-4 min-h-0">
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-4">
              <p className="text-sm text-orange-800 mb-2">
                Ya tienes una solicitud <strong>{getStatusMessage()}</strong> para este servicio.
              </p>
              <p className="text-xs text-orange-700">
                No puedes solicitar una nueva cotización mientras tengas una solicitud activa, en progreso o en reclamo.
              </p>
            </div>

            <div className="space-y-2 text-sm text-gray-600">
              <p className="font-medium text-gray-700">Puedes:</p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>Esperar a que se complete la solicitud actual</li>
                <li>Cancelar la solicitud pendiente si es necesario</li>
                <li>Revisar el estado en "Mis servicios solicitados"</li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-200 px-6 py-4 flex-shrink-0 bg-gray-50">
            <div className="flex gap-3">
              <Button onClick={handleClose} variant="outline" className="flex-1">
                Cerrar
              </Button>
              <Button
                onClick={() => {
                  handleClose();
                  window.location.href = '/my-services';
                }}
                className="flex-1"
              >
                Ver mis solicitudes
              </Button>
            </div>
          </div>
        </div>
      </ConexiaModalWrapper>
    );
  }

  return (
    <ConexiaModalWrapper onClose={handleClose}>
      <div className="bg-white rounded-lg w-full max-w-md min-w-[300px] max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 flex-shrink-0">
          <h3 className="text-lg font-semibold text-gray-900">Contratar servicio</h3>
          <button onClick={handleClose} className="text-gray-400 hover:text-gray-600" disabled={loading}>
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
          <div className="flex-1 overflow-y-auto px-6 py-4 min-h-0 overflow-x-hidden">
            {/* Información del servicio */}
            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <h4 className="font-medium text-gray-900 mb-2 break-words overflow-wrap-anywhere line-clamp-2 leading-tight max-w-full">{service?.title}</h4>
              <p className="text-sm text-gray-600 mb-2 break-words">
                Por: {service?.owner?.firstName} {service?.owner?.lastName}
              </p>
              <p className="text-lg font-semibold text-conexia-green">
                ${service?.price?.toLocaleString()}
                {service?.timeUnit && (
                  <span className="text-sm text-gray-600 ml-1">por {getUnitLabel(service.timeUnit)}</span>
                )}
              </p>
            </div>

            <div className="mb-4">
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                Describe lo que necesitas *
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => {
                  setDescription(e.target.value);
                  if (error) setError('');
                }}
                placeholder="Explica detalladamente qué necesitas para que el proveedor pueda hacer una cotización precisa..."
                rows={4}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-conexia-green focus:border-transparent resize-none break-words"
                disabled={loading}
                required
              />
              <p className="text-xs text-gray-500 mt-1">Mínimo 10 caracteres ({description.length}/10)</p>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-xs text-blue-600">
                <strong>Siguiente paso:</strong> El proveedor revisará tu solicitud y te enviará una cotización con el precio final y tiempo estimado.
              </p>
            </div>
          </div>

          <div className="border-t border-gray-200 px-6 py-4 flex-shrink-0 bg-gray-50">
            <div className="flex gap-3">
              <Button type="button" onClick={handleClose} variant="outline" className="flex-1" disabled={loading}>
                Cancelar
              </Button>
              <Button type="submit" className="flex-1" disabled={loading || !description.trim() || description.trim().length < 10}>
                {loading ? 'Enviando...' : 'Solicitar cotización'}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </ConexiaModalWrapper>
  );
}