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
  previousDelivery = null,
  onSuccess
}) {
  const { createDelivery, loading } = useCreateDelivery();
  const [content, setContent] = useState('');
  const [attachments, setAttachments] = useState([]); // Cambiado a array
  const [toast, setToast] = useState(null);

  if (!isOpen) return null;

  const isDeliverableDelivery = !!deliverableId;
  const price = deliverableInfo?.price || totalPrice || 0;

  const validateForm = () => {
    if (content.trim().length < 10) {
      return 'El contenido debe tener al menos 10 caracteres';
    }

    // Validar límite de archivos
    if (attachments.length > 10) {
      return 'Solo puedes subir un máximo de 10 archivos por entrega';
    }

    // Validar cada archivo
    for (const file of attachments) {
      if (file.size > 20 * 1024 * 1024) {
        return `El archivo "${file.name}" supera el límite de 20MB`;
      }
    }

    return null;
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files || []);
    
    // Validar límite de 10 archivos
    const totalFiles = attachments.length + files.length;
    if (totalFiles > 10) {
      setToast({
        type: 'error',
        message: `Solo puedes subir un máximo de 10 archivos. Ya tienes ${attachments.length} archivo(s) seleccionado(s).`,
        isVisible: true
      });
      e.target.value = '';
      return;
    }
    
    // Validar tamaño de cada archivo
    const invalidFiles = files.filter(file => file.size > 20 * 1024 * 1024);
    if (invalidFiles.length > 0) {
      setToast({
        type: 'error',
        message: `${invalidFiles.length} archivo(s) superan el límite de 20MB`,
        isVisible: true
      });
      e.target.value = '';
      return;
    }

    // Agregar nuevos archivos al array existente
    setAttachments(prev => [...prev, ...files]);
    e.target.value = ''; // Resetear input para permitir seleccionar más archivos
  };

  const handleRemoveFile = (index) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
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
        // Asegurarse de que sea un número antes de agregarlo
        const numericId = parseInt(deliverableId, 10);
        if (!isNaN(numericId)) {
          formData.append('deliverableId', numericId.toString());
        }
      }

      if (attachments && attachments.length > 0) {
        // Enviar múltiples archivos
        attachments.forEach((file) => {
          formData.append('attachments', file);
        });
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
      // Detectar error 403 de validación de orden secuencial
      if (error.status === 403 || error.statusCode === 403) {
        setToast({
          type: 'error',
          message: error.message || 'No puedes entregar este entregable en este momento',
          isVisible: true
        });
      } else {
        setToast({
          type: 'error',
          message: error.message || 'Error al crear la entrega',
          isVisible: true
        });
      }
    }
  };

  const handleClose = () => {
    if (!loading) {
      setContent('');
      setAttachments([]);
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
            {/* Notas de revisión (si aplica) */}
            {previousDelivery && previousDelivery.status === 'revision_requested' && previousDelivery.revisionNotes && (
              <div className="bg-orange-50 border-2 border-orange-300 rounded-lg p-4 mb-6">
                <div className="flex items-start gap-3">
                  <AlertCircle size={24} className="text-orange-600 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <h4 className="font-semibold text-orange-900 mb-2">
                      ⚠️ Revisión solicitada
                    </h4>
                    <p className="text-sm font-medium text-orange-800 mb-1">
                      Notas del cliente:
                    </p>
                    <p className="text-sm text-orange-700 whitespace-pre-wrap bg-white rounded px-3 py-2 border border-orange-200">
                      {previousDelivery.revisionNotes}
                    </p>
                    {previousDelivery.reviewedAt && (
                      <p className="text-xs text-orange-600 mt-2">
                        Solicitado el {new Date(previousDelivery.reviewedAt).toLocaleDateString('es-ES', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

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

            {/* Campo: Archivos adjuntos */}
            <div className="mb-6">
              <label htmlFor="attachment-input" className="block text-sm font-medium text-gray-700 mb-2">
                Archivos adjuntos (opcional)
              </label>
              
              {/* Botón para agregar archivos */}
              <div className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors mb-3 ${
                attachments.length >= 10 
                  ? 'border-gray-200 bg-gray-50 cursor-not-allowed' 
                  : 'border-gray-300 hover:border-conexia-green cursor-pointer'
              }`}>
                <input
                  id="attachment-input"
                  type="file"
                  onChange={handleFileChange}
                  accept="image/*,video/*,.pdf,.doc,.docx,.xls,.xlsx,.zip,.rar,.txt"
                  className="hidden"
                  multiple
                  disabled={attachments.length >= 10}
                />
                <label
                  htmlFor="attachment-input"
                  className={`flex flex-col items-center ${
                    attachments.length >= 10 ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'
                  }`}
                >
                  <Upload size={32} className="text-gray-400 mb-2" />
                  <span className="text-sm text-gray-600 mb-1">
                    {attachments.length >= 10 ? 'Límite alcanzado (10 archivos)' : 'Click para seleccionar archivos'}
                  </span>
                  <span className="text-xs text-gray-500">
                    Máximo 10 archivos • 20MB por archivo • Imágenes, videos, PDF, documentos, comprimidos
                  </span>
                </label>
              </div>

              {/* Lista de archivos seleccionados */}
              {attachments.length > 0 && (
                <div className="space-y-2 mb-3">
                  <p className="text-sm font-medium text-gray-700">
                    {attachments.length} de 10 archivo{attachments.length !== 1 ? 's' : ''} seleccionado{attachments.length !== 1 ? 's' : ''}
                  </p>
                  {attachments.map((file, index) => (
                    <div key={index} className="border border-gray-300 rounded-lg p-3 flex items-center justify-between bg-white">
                      <div className="flex items-center min-w-0 flex-1">
                        <FileText size={20} className="text-blue-500 mr-3 flex-shrink-0" />
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-gray-900 truncate" title={file.name}>
                            {file.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            {formatFileSize(file.size)}
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveFile(index)}
                        className="text-red-500 hover:text-red-700 ml-2 flex-shrink-0"
                        title="Eliminar archivo"
                      >
                        <X size={18} />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className="mt-2 flex items-start">
                <AlertCircle size={16} className="text-blue-500 mr-2 mt-0.5 flex-shrink-0" />
                <p className="text-xs text-gray-600">
                  Los archivos se almacenarán en el servidor y el cliente podrá descargarlos.
                </p>
              </div>
            </div>

            {/* Resumen */}
            <div className="bg-conexia-green/5 border border-conexia-green/20 rounded-lg p-4 mb-6">
              <h4 className="font-semibold text-gray-900 mb-2">Resumen de la entrega:</h4>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>• Tipo: {isDeliverableDelivery ? 'Entregable parcial' : 'Entrega total'}</li>
                <li>• Precio: ${price.toLocaleString()}</li>
                <li>• Archivos adjuntos: {attachments.length > 0 ? `${attachments.length} archivo${attachments.length !== 1 ? 's' : ''}` : 'Ninguno'}</li>
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
