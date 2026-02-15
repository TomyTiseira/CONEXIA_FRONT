import React from 'react';
import PropTypes from 'prop-types';
import { Trash2 } from 'lucide-react';
import Button from '@/components/ui/Button';

export default function DeletePublicationModal({ open, onClose, onDelete, loading }) {
  if (!open) return null;

  const handleClose = () => {
    if (loading) return;
    onClose?.();
  };

  return (
    <div className="fixed inset-0 z-[200]" onClick={handleClose}>
      <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" />

      <div className="fixed inset-0 flex items-center justify-center p-4">
        <div
          className="relative z-10 bg-white rounded-lg w-full max-w-md max-h-[90vh] overflow-hidden flex flex-col shadow-xl"
          onClick={(e) => e.stopPropagation()}
          role="dialog"
          aria-modal="true"
          aria-label="Confirmar eliminación de publicación"
        >
          {/* Header fijo */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 rounded-t-lg flex-shrink-0">
            <h2 className="text-xl font-bold text-conexia-green">Confirmar eliminación</h2>
            <button
              className="text-gray-400 hover:text-gray-600"
              onClick={handleClose}
              aria-label="Cerrar"
              disabled={loading}
              type="button"
            >
              ×
            </button>
          </div>

          {/* Contenido con scroll */}
          <div className="flex-1 overflow-y-auto px-6 py-6">
            <div className="flex flex-col items-center text-center">
              <span className="bg-[#eef6f6] rounded-full p-3 mb-4 flex items-center justify-center">
                <Trash2 size={36} className="text-conexia-green" />
              </span>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Eliminar publicación</h3>
              <p className="text-gray-700">¿Estás seguro que deseas eliminar esta publicación?</p>
            </div>
          </div>

          {/* Footer fijo */}
          <div className="border-t border-gray-200 px-6 py-4 rounded-b-lg flex-shrink-0 bg-gray-50">
            <div className="flex gap-3 justify-end">
              <Button
                variant="cancel"
                className="px-6 py-2 text-base"
                onClick={handleClose}
                disabled={loading}
              >
                Cancelar
              </Button>
              <Button
                className="bg-conexia-green hover:bg-conexia-green/90 text-white font-semibold px-6 py-2 rounded-lg shadow text-base"
                onClick={onDelete}
                disabled={loading}
              >
                {loading ? 'Eliminando...' : 'Confirmar'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

DeletePublicationModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  loading: PropTypes.bool
};
