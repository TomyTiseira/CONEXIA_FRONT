'use client';

import { useState } from 'react';
import { X, Upload, FileText, AlertCircle } from 'lucide-react';
import Button from '@/components/ui/Button';
import Toast from '@/components/ui/Toast';
import { useCreateDelivery } from '@/hooks/deliveries';

export default function DeliveryModal({
  isOpen,
  onClose,
  hiringId,
  deliverableId = null,
  deliverableInfo = null,
  totalPrice = null,
  onSuccess
}) {
  const { createDelivery, loading } = useCreateDelivery();
  const [content, setContent] = useState('');
  const [attachment, setAttachment] = useState(null);
  const [toast, setToast] = useState(null);

  if (!isOpen) return null;

  const isDeliverableDelivery = !!deliverableId;
  const price = deliverableInfo?.price || totalPrice || 0;

  const validateForm = () => {
    if (content.trim().length < 10) {
      return 'El contenido debe tener al menos 10 caracteres';
    }

    if (attachment && attachment.size > 20 * 1024 * 1024) {
      return 'El archivo no debe superar 20MB';
    }

    return null;
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 20 * 1024 * 1024) {
        setToast({
          type: 'error',
          message: 'El archivo no debe superar 20MB',
          isVisible: true
        });
        e.target.value = '';
        return;
      }
      setAttachment(file);
    }
  };

  const handleRemoveFile = () => {
    setAttachment(null);
    const fileInput = document.getElementById('attachment-input');
    if (fileInput) {
      fileInput.value = '';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const error = validateForm();
    if (error) {
      setToast({
        type: 'error',
        message: error,
        isVisible: true
      });
      return;
    }

    try {
      const formData = new FormData();
      formData.append('content', content.trim());

      if (deliverableId) {
        formData.append('deliverableId', deliverableId.toString());
      }

      if (attachment) {
        formData.append('attachment', attachment);
      }

      const delivery = await createDelivery(hiringId, formData);

      setToast({
        type: 'success',
        message: 'Entrega realizada exitosamente',
        isVisible: true
      });

      // Esperar un momento para mostrar el toast
      setTimeout(() => {
        if (onSuccess) {
          onSuccess(delivery);
        }
        handleClose();
      }, 1500);

    } catch (error) {
      setToast({
        type: 'error',
        message: error.message || 'Error al crear la entrega',
        isVisible: true
      });
    }
  };

  const handleClose = () => {
    if (!loading) {
      setContent('');
      setAttachment(null);
      setToast(null);
      onClose();
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="flex justify-between items-center p-6 border-b sticky top-0 bg-white z-10">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                {isDeliverableDelivery 
                  ? `Entrega N° ${deliverableInfo?.orderIndex || ''} - ${deliverableInfo?.title || ''}`
                  : 'Entrega Total del Servicio'}
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                Precio: ${price.toLocaleString()}
              </p>
            </div>
            <button
              onClick={handleClose}
              disabled={loading}
              className="text-gray-400 hover:text-gray-600 disabled:opacity-50"
            >
              <X size={24} />
            </button>
          </div>

          {/* Body */}
          <form onSubmit={handleSubmit} className="p-6">
            {/* Info del entregable (si aplica) */}
            {deliverableInfo && (
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <h4 className="font-medium text-gray-900 mb-2">Descripción del entregable:</h4>
                <p className="text-sm text-gray-700 whitespace-pre-wrap">
                  {deliverableInfo.description}
                </p>
                {deliverableInfo.estimatedDeliveryDate && (
                  <p className="text-xs text-gray-500 mt-2">
                    Fecha estimada: {new Date(deliverableInfo.estimatedDeliveryDate).toLocaleDateString()}
                  </p>
                )}
              </div>
            )}

            {/* Campo: Contenido */}
            <div className="mb-6">
              <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
                Descripción de la entrega / URL de acceso *
              </label>
              <textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Describe el trabajo realizado, proporciona URLs de acceso, credenciales si es necesario, etc..."
                rows={6}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-conexia-green focus:border-transparent resize-none"
                required
              />
              <div className="flex justify-between items-center mt-1">
                <p className="text-xs text-gray-500">
                  Mínimo 10 caracteres
                </p>
                <p className={`text-xs ${content.length < 10 ? 'text-red-500' : 'text-gray-500'}`}>
                  {content.length} caracteres
                </p>
              </div>
            </div>

            {/* Campo: Archivo adjunto */}
            <div className="mb-6">
              <label htmlFor="attachment-input" className="block text-sm font-medium text-gray-700 mb-2">
                Archivo adjunto (opcional)
              </label>
              
              {!attachment ? (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-conexia-green transition-colors">
                  <input
                    id="attachment-input"
                    type="file"
                    onChange={handleFileChange}
                    accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.zip,.rar,.txt"
                    className="hidden"
                  />
                  <label
                    htmlFor="attachment-input"
                    className="cursor-pointer flex flex-col items-center"
                  >
                    <Upload size={32} className="text-gray-400 mb-2" />
                    <span className="text-sm text-gray-600 mb-1">
                      Click para seleccionar un archivo
                    </span>
                    <span className="text-xs text-gray-500">
                      Máximo 20MB • Imágenes, PDF, documentos, comprimidos
                    </span>
                  </label>
                </div>
              ) : (
                <div className="border border-gray-300 rounded-lg p-4 flex items-center justify-between">
                  <div className="flex items-center">
                    <FileText size={24} className="text-blue-500 mr-3" />
                    <div>
                      <p className="text-sm font-medium text-gray-900 truncate max-w-xs">
                        {attachment.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatFileSize(attachment.size)}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleRemoveFile}
                    className="text-red-500 hover:text-red-700"
                  >
                    <X size={20} />
                  </button>
                </div>
              )}

              <div className="mt-2 flex items-start">
                <AlertCircle size={16} className="text-blue-500 mr-2 mt-0.5 flex-shrink-0" />
                <p className="text-xs text-gray-600">
                  El archivo se almacenará en el servidor y el cliente podrá descargarlo.
                </p>
              </div>
            </div>

            {/* Resumen */}
            <div className="bg-conexia-green/5 border border-conexia-green/20 rounded-lg p-4 mb-6">
              <h4 className="font-semibold text-gray-900 mb-2">Resumen de la entrega:</h4>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>• Tipo: {isDeliverableDelivery ? 'Entregable parcial' : 'Entrega total'}</li>
                <li>• Precio: ${price.toLocaleString()}</li>
                <li>• Archivo adjunto: {attachment ? 'Sí' : 'No'}</li>
              </ul>
            </div>

            {/* Botones */}
            <div className="flex gap-3">
              <Button
                type="button"
                variant="cancel"
                onClick={handleClose}
                className="flex-1"
                disabled={loading}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                variant="primary"
                className="flex-1"
                disabled={loading || content.trim().length < 10}
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Enviando...
                  </div>
                ) : (
                  'Entregar'
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <Toast
          type={toast.type}
          message={toast.message}
          isVisible={toast.isVisible}
          onClose={() => setToast(null)}
          position="top-center"
        />
      )}
    </>
  );
}
