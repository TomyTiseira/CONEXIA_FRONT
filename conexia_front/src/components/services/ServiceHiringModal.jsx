'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useUserStore } from '@/store/userStore';
import { ROLES } from '@/constants/roles';
import { useServiceHirings } from '@/hooks/service-hirings/useServiceHirings';
import { X } from 'lucide-react';
import Button from '@/components/ui/Button';

export default function ServiceHiringModal({ service, isOpen, onClose, onSuccess }) {
  const { user, isAuthenticated } = useAuth();
  const { roleName } = useUserStore();
  const { createHiring, loading } = useServiceHirings();
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');

  // Validaciones
  const canHire = isAuthenticated && roleName === ROLES.USER && service?.owner?.id !== user?.id;

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
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg p-6 w-full max-w-md">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Iniciar Sesión Requerido
            </h3>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X size={24} />
            </button>
          </div>
          
          <p className="text-gray-600 mb-6">
            Debes iniciar sesión para contratar servicios.
          </p>
          
          <div className="flex gap-3">
            <Button
              onClick={handleClose}
              variant="outline"
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              onClick={() => window.location.href = '/login'}
              className="flex-1"
            >
              Iniciar Sesión
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Validación de rol
  if (roleName !== ROLES.USER) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg p-6 w-full max-w-md">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Acceso Restringido
            </h3>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X size={24} />
            </button>
          </div>
          
          <p className="text-gray-600 mb-6">
            Solo los usuarios pueden contratar servicios.
          </p>
          
          <Button
            onClick={handleClose}
            className="w-full"
          >
            Entendido
          </Button>
        </div>
      </div>
    );
  }

  // Validación de dueño del servicio
  if (service?.owner?.id === user?.id) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg p-6 w-full max-w-md">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              No Disponible
            </h3>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X size={24} />
            </button>
          </div>
          
          <p className="text-gray-600 mb-6">
            No puedes contratar tu propio servicio.
          </p>
          
          <Button
            onClick={handleClose}
            className="w-full"
          >
            Entendido
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            Contratar Servicio
          </h3>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600"
            disabled={loading}
          >
            <X size={24} />
          </button>
        </div>

        {/* Información del servicio */}
        <div className="bg-gray-50 rounded-lg p-4 mb-4">
          <h4 className="font-medium text-gray-900 mb-2">{service?.title}</h4>
          <p className="text-sm text-gray-600 mb-2">
            Por: {service?.owner?.firstName} {service?.owner?.lastName}
          </p>
          <p className="text-lg font-semibold text-conexia-green">
            ${service?.price?.toLocaleString()}
          </p>
        </div>

        <form onSubmit={handleSubmit}>
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
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-conexia-green focus:border-transparent resize-none"
              disabled={loading}
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              Mínimo 10 caracteres ({description.length}/10)
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <div className="flex gap-3">
            <Button
              type="button"
              onClick={handleClose}
              variant="outline"
              className="flex-1"
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="flex-1"
              disabled={loading || !description.trim() || description.trim().length < 10}
            >
              {loading ? 'Enviando...' : 'Solicitar Cotización'}
            </Button>
          </div>
        </form>

        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-xs text-blue-600">
            <strong>Siguiente paso:</strong> El proveedor revisará tu solicitud y te enviará una cotización con el precio final y tiempo estimado.
          </p>
        </div>
      </div>
    </div>
  );
}