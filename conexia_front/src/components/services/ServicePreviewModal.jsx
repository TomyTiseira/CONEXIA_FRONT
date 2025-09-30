'use client';

import { X, CheckCircle, DollarSign, Clock, Tag, Image as ImageIcon } from 'lucide-react';
import { getUnitLabel } from '@/utils/timeUnit';
import Button from '@/components/ui/Button';

export default function ServicePreviewModal({ 
  open, 
  onClose, 
  onConfirm, 
  serviceData, 
  category,
  loading = false 
}) {
  if (!open) return null;

  const { title, description, price, timeUnit, images } = serviceData;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-conexia-green-dark">
            Vista previa del servicio
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            disabled={loading}
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Título y descripción */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
            <p className="text-gray-600 whitespace-pre-wrap break-words overflow-wrap-anywhere">{description}</p>
          </div>

          {/* Detalles en grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Precio */}
            <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
              <DollarSign className="text-green-600" size={20} />
              <div>
                <p className="text-sm text-gray-600">Precio aproximado</p>
                <p className="font-semibold text-gray-900">${price} ARS</p>
              </div>
            </div>

            {/* Categoría */}
            <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
              <Tag className="text-blue-600" size={20} />
              <div>
                <p className="text-sm text-gray-600">Categoría</p>
                <p className="font-semibold text-gray-900">{category?.name || 'No especificada'}</p>
              </div>
            </div>

            {/* Unidad de tiempo */}
            {timeUnit && (
              <div className="flex items-center gap-3 p-3 bg-orange-50 rounded-lg sm:col-span-2">
                <Clock className="text-orange-600" size={20} />
                <div>
                  <p className="text-sm text-gray-600">Unidad de tiempo</p>
                  <p className="font-semibold text-gray-900">Servicio por {getUnitLabel(timeUnit)}</p>
                </div>
              </div>
            )}

            {/* Imágenes */}
            {images.length > 0 && (
              <div className="sm:col-span-2">
                <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg mb-3">
                  <ImageIcon className="text-purple-600" size={20} />
                  <div>
                    <p className="text-sm text-gray-600">Imágenes adjuntas</p>
                    <p className="font-semibold text-gray-900">{images.length} imagen{images.length !== 1 ? 'es' : ''}</p>
                  </div>
                </div>
                
                {/* Vista previa de imágenes */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {images.slice(0, 6).map((image, index) => (
                    <div key={index} className="aspect-video rounded-lg overflow-hidden bg-gray-100 border border-gray-200">
                      <img
                        src={URL.createObjectURL(image)}
                        alt={`Vista previa ${index + 1}`}
                        className="w-full h-full object-contain bg-white"
                      />
                    </div>
                  ))}
                  {images.length > 6 && (
                    <div className="aspect-video rounded-lg bg-gray-200 flex items-center justify-center border border-gray-300">
                      <span className="text-gray-600 text-sm font-medium">+{images.length - 6} más</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Confirmación */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <CheckCircle className="text-green-600 mt-0.5" size={20} />
              <div>
                <p className="font-medium text-gray-900 mb-1">
                  ¿Confirmas la publicación de este servicio?
                </p>
                <p className="text-sm text-gray-600">
                  Una vez publicado, tu servicio será visible para toda la comunidad y podrás recibir solicitudes de otros usuarios.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer - Fixed at bottom */}
        <div className="flex gap-4 p-6 border-t bg-white">
          <Button
            variant="cancel"
            onClick={onClose}
            disabled={loading}
            className="flex-1"
          >
            Revisar
          </Button>
          <Button
            variant="primary"
            onClick={onConfirm}
            disabled={loading}
            className="flex-1"
          >
            {loading ? 'Publicando...' : 'Confirmar y publicar'}
          </Button>
        </div>
      </div>
    </div>
  );
}