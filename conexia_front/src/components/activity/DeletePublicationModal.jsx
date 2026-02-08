import React from 'react';
import PropTypes from 'prop-types';
import { Trash2 } from 'lucide-react';
import Button from '@/components/ui/Button';

export default function DeletePublicationModal({ open, onClose, onDelete, loading }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
      <div className="bg-white rounded-2xl shadow-lg p-0 w-full max-w-lg border border-[#e0e0e0] relative animate-fade-in">
        <button
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-2xl font-bold"
          onClick={onClose}
          aria-label="Cerrar"
        >
          ×
        </button>
        <div className="flex flex-col items-center text-center px-8 pt-10 pb-8">
          <span className="bg-[#eef6f6] rounded-full p-3 mb-4 flex items-center justify-center">
            <Trash2 size={36} className="text-conexia-green" />
          </span>
          <h2 className="text-2xl font-bold text-conexia-green mb-2">Confirmar eliminación de publicación</h2>
          <p className="text-gray-700 mb-8">¿Estás seguro que deseas eliminar esta publicación?</p>
          <div className="flex flex-row gap-3 w-full justify-center mt-2">
            <Button
              className="bg-conexia-green hover:bg-conexia-green/90 text-white font-semibold px-8 py-2 rounded-lg shadow text-base"
              onClick={onDelete}
              disabled={loading}
            >
              {loading ? 'Eliminando...' : 'Confirmar'}
            </Button>
            <Button
              variant="cancel"
              className="px-8 py-2 text-base"
              onClick={onClose}
              disabled={loading}
            >
              Cancelar
            </Button>
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
