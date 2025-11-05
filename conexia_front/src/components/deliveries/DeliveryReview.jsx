'use client';

import { useState, useEffect } from 'react';
import { Calendar, DollarSign, FileText, Download, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';
import StatusBadge from '@/components/common/StatusBadge';
import Button from '@/components/ui/Button';
import { useReviewDelivery } from '@/hooks/deliveries';
import Toast from '@/components/ui/Toast';
import { buildMediaUrl } from '@/utils/mediaUrl';

export default function DeliveryReview({ delivery, isClient = false, onReviewSuccess, hasActiveClaim = false }) {
  const { reviewDelivery, loading } = useReviewDelivery();
  const [showRevisionForm, setShowRevisionForm] = useState(false);
  const [revisionNotes, setRevisionNotes] = useState('');
  const [toast, setToast] = useState(null);
  const [showConfirmApprove, setShowConfirmApprove] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [previewSrc, setPreviewSrc] = useState(null);

  // Función para obtener attachments (con retrocompatibilidad)
  const getAttachments = () => {
    // Nuevo formato: array de attachments
    if (delivery.attachments && Array.isArray(delivery.attachments) && delivery.attachments.length > 0) {
      return delivery.attachments;
    }
    
    // Formato antiguo: attachmentUrl single
    if (delivery.attachmentUrl || delivery.attachmentPath) {
      return [{
        id: 'legacy',
        fileUrl: delivery.attachmentUrl,
        filePath: delivery.attachmentPath,
        fileName: delivery.attachmentPath?.split('/').pop() || 'archivo',
        fileSize: delivery.attachmentSize,
        orderIndex: 0
      }];
    }
    
    return [];
  };

  const attachments = getAttachments();

  if (!delivery) {
    return (
      <div className="bg-gray-50 rounded-lg p-8 text-center">
        <AlertCircle size={48} className="mx-auto text-gray-400 mb-3" />
        <p className="text-gray-600">No hay información de entrega disponible</p>
      </div>
    );
  }

  const handleApprove = async () => {
    try {
      const response = await reviewDelivery(delivery.id, { action: 'approve' });
      
      setToast({
        type: 'success',
        message: 'Entrega aprobada! Redirigiendo a Mercado Pago...',
        isVisible: true
      });

      // Si hay URL de pago, redirigir a MercadoPago
      if (response.paymentUrl) {
        setTimeout(() => {
          window.location.href = response.paymentUrl;
        }, 1500);
      } else {
        // Si no hay URL, solo cerrar y refrescar
        setTimeout(() => {
          if (onReviewSuccess) {
            onReviewSuccess();
          }
          setShowConfirmApprove(false);
        }, 1500);
      }
    } catch (error) {
      setToast({
        type: 'error',
        message: error.message || 'Error al aprobar la entrega',
        isVisible: true
      });
    }
  };

  const handleRequestRevision = async () => {
    if (!revisionNotes.trim()) {
      setToast({
        type: 'error',
        message: 'Debes proporcionar notas para solicitar la revisión',
        isVisible: true
      });
      return;
    }

    try {
      await reviewDelivery(delivery.id, {
        action: 'request_revision',
        notes: revisionNotes.trim()
      });

      setToast({
        type: 'success',
        message: 'Solicitud de revisión enviada',
        isVisible: true
      });

      setTimeout(() => {
        if (onReviewSuccess) {
          onReviewSuccess();
        }
        setShowRevisionForm(false);
        setRevisionNotes('');
      }, 1500);
    } catch (error) {
      setToast({
        type: 'error',
        message: error.message || 'Error al solicitar revisión',
        isVisible: true
      });
    }
  };

  const getAttachmentUrl = (attachment) => {
    // Priorizar filePath para reconstruir la URL correcta con el puerto del frontend
    if (attachment?.filePath) {
      return buildMediaUrl(attachment.filePath);
    }
    // Fallback a fileUrl solo si no hay filePath
    if (attachment?.fileUrl) {
      return buildMediaUrl(attachment.fileUrl);
    }
    return null;
  };

  const getAttachmentFileName = (attachment) => {
    if (attachment?.fileName) {
      return attachment.fileName;
    }
    if (attachment?.filePath) {
      return attachment.filePath.split('/').pop() || 'archivo';
    }
    return 'archivo';
  };

  const formatFileSize = (bytes) => {
    if (!bytes || bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  const handleDownload = async (attachment) => {
    setDownloading(true);
    try {
      const url = getAttachmentUrl(attachment);
      if (!url) {
        throw new Error('URL de archivo no disponible');
      }

      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error('Error al descargar el archivo');
      }

      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = getAttachmentFileName(attachment);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);

      setToast({
        type: 'success',
        message: 'Archivo descargado correctamente',
        isVisible: true
      });
    } catch (error) {
      console.error('Error downloading file:', error);
      setToast({
        type: 'error',
        message: 'Error al descargar el archivo. Intenta nuevamente.',
        isVisible: true
      });
    } finally {
      setDownloading(false);
    }
  };

  // Generar una vista previa watermark en canvas para ocultar la URL real en el DOM cuando corresponde
  useEffect(() => {
    const isImage = (path) => /(\.jpg|\.jpeg|\.png|\.gif|\.webp)$/i.test(path || '');
    const needWatermark = Boolean(isClient && delivery?.needsWatermark && isImage(delivery?.attachmentPath));

    // Si no hace falta o no hay URL, resetear
    if (!needWatermark) {
      if (previewSrc) {
        URL.revokeObjectURL(previewSrc);
        setPreviewSrc(null);
      }
      return;
    }

    let revoked = false;
    let objectUrl;
    const controller = new AbortController();

    const generate = async () => {
      try {
        const url = getAttachmentUrl();
        if (!url) return;

        // Descargar como blob (el request puede seguir viéndose en Network, pero el src en el DOM será blob:)
        const res = await fetch(url, { signal: controller.signal, credentials: 'include' });
        const blob = await res.blob();
        const imgUrl = URL.createObjectURL(blob);

        // Cargar imagen en memoria
        const img = new Image();
        img.src = imgUrl;
        await new Promise((resolve, reject) => {
          img.onload = resolve;
          img.onerror = reject;
        });

        // Escalar para evitar canvases gigantes
        const maxDim = 1600;
        let w = img.naturalWidth || img.width;
        let h = img.naturalHeight || img.height;
        const ratio = Math.min(1, maxDim / Math.max(w, h));
        w = Math.max(1, Math.round(w * ratio));
        h = Math.max(1, Math.round(h * ratio));

        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');

        // Dibujo base
        ctx.drawImage(img, 0, 0, w, h);

  // Velo sutil (ligeramente más claro para no tapar tanto la imagen)
  ctx.fillStyle = 'rgba(0,0,0,0.10)';
        ctx.fillRect(0, 0, w, h);

        // Patrón diagonal de "CONEXIA" repetido
        ctx.save();
        ctx.translate(w / 2, h / 2);
        ctx.rotate(-Math.PI / 6); // -30°
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        const patternFontSize = Math.max(14, Math.round(w * 0.03));
        ctx.font = `700 ${patternFontSize}px system-ui, -apple-system, Segoe UI, Roboto, Arial`;
        ctx.fillStyle = 'rgba(255,255,255,0.18)';
        ctx.strokeStyle = 'rgba(0,0,0,0.25)';
        ctx.lineWidth = Math.max(1, Math.round(patternFontSize * 0.06));
        const stepX = Math.round(patternFontSize * 8);
        const stepY = Math.round(patternFontSize * 6);
        for (let y = -h; y <= h; y += stepY) {
          for (let x = -w; x <= w; x += stepX) {
            ctx.strokeText('CONEXIA', x, y);
            ctx.fillText('CONEXIA', x, y);
          }
        }
        ctx.restore();

  // Texto central: NO PAGADO (centrado, un poco más chico y gris translúcido)
        ctx.save();
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
  ctx.fillStyle = 'rgba(0,0,0,0.35)'; // gris translúcido, un poco más oscuro que el patrón
  ctx.strokeStyle = 'rgba(255,255,255,0.2)'; // sutil borde claro para legibilidad
  const centerFontSize = Math.max(22, Math.round(w * 0.06));
  ctx.font = `900 ${centerFontSize}px system-ui, -apple-system, Segoe UI, Roboto, Arial`;
  ctx.lineWidth = Math.max(1, Math.round(centerFontSize * 0.06));
  const cx = Math.round(w / 2);
  const cy = Math.round(h / 2);
  ctx.strokeText('NO PAGADO', cx, cy);
  ctx.fillText('NO PAGADO', cx, cy);
        ctx.restore();

        const outBlob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/png', 0.9));
        objectUrl = URL.createObjectURL(outBlob);
        if (!revoked) setPreviewSrc(objectUrl);

        // Limpiar
        URL.revokeObjectURL(imgUrl);
      } catch (e) {
        // Si falla (CORS, etc.), dejamos que el overlay CSS haga el trabajo visual
        if (previewSrc) {
          URL.revokeObjectURL(previewSrc);
          setPreviewSrc(null);
        }
      }
    };

    generate();
    return () => {
      revoked = true;
      controller.abort();
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isClient, delivery?.needsWatermark, delivery?.attachmentPath, delivery?.attachmentUrl]);

  return (
    <>
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        {/* Header */}
        <div className="bg-gray-50 px-6 py-4 border-b flex justify-between items-center">
          <div>
            <div className="flex items-center gap-3">
              <StatusBadge status={delivery.status} type="delivery" />
              {delivery.deliveryType === 'deliverable' && delivery.deliverable && (
                <span className="text-sm text-gray-600">
                  Entregable N° {delivery.deliverable.orderIndex}
                </span>
              )}
            </div>
            <p className="text-sm text-gray-500 mt-1">
              Entregado el {new Date(delivery.deliveredAt).toLocaleString('es-ES', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500">Precio</p>
            <p className="text-2xl font-bold text-gray-900 flex items-center justify-end">
              <DollarSign size={20} />
              {delivery.price?.toLocaleString()}
            </p>
          </div>
        </div>

        {/* Body */}
        <div className="p-6">
          {/* Descripción / URL */}
          <div className="mb-6">
            <label className="flex items-center font-semibold text-gray-900 mb-2">
              <FileText size={18} className="mr-2" />
              Descripción / URL de acceso
            </label>
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <p className="text-gray-800 whitespace-pre-wrap break-words">
                {delivery.content}
              </p>
            </div>
          </div>

          {/* Archivos adjuntos */}
          {attachments.length > 0 && (
            <div className="mb-6">
              <label className="flex items-center font-semibold text-gray-900 mb-3">
                <Download size={18} className="mr-2" />
                {attachments.length === 1 ? 'Archivo Adjunto' : `Archivos Adjuntos (${attachments.length})`}
                {isClient && delivery.needsWatermark && (
                  <span className="ml-2 px-2 py-0.5 bg-yellow-100 text-yellow-800 text-xs rounded-full">
                    Pendiente de pago
                  </span>
                )}
              </label>

              <div className="space-y-3">
                {attachments.map((attachment, index) => {
                  const isImage = /\.(jpg|jpeg|png|gif|webp)$/i.test(attachment.filePath || attachment.fileName || '');
                  const attachmentUrl = getAttachmentUrl(attachment);
                  
                  return (
                    <div key={attachment.id || index} className="border border-gray-200 rounded-lg overflow-hidden">
                      {/* Preview de imagen si aplica */}
                      {isImage && attachmentUrl && (
                        <div className="relative bg-gray-100 flex items-center justify-center" style={{ minHeight: '200px' }}>
                          <img
                            src={attachmentUrl}
                            alt={`Vista previa ${index + 1}`}
                            className="w-full max-h-96 object-contain"
                            loading="lazy"
                          />
                          {isClient && delivery.needsWatermark && (
                            <div 
                              className="absolute inset-0 pointer-events-none overflow-hidden"
                              style={{
                                background: `repeating-linear-gradient(
                                  45deg,
                                  transparent,
                                  transparent 100px,
                                  rgba(255, 255, 255, 0.05) 100px,
                                  rgba(255, 255, 255, 0.05) 200px
                                )`
                              }}
                            >
                              <div className="absolute inset-0 flex flex-wrap items-center justify-center opacity-30">
                                {Array.from({ length: 20 }).map((_, i) => (
                                  <div
                                    key={i}
                                    className="text-white font-bold text-4xl md:text-5xl transform rotate-[-45deg] m-8"
                                    style={{
                                      textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
                                      userSelect: 'none'
                                    }}
                                  >
                                    CONEXIA
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Información y descarga del archivo */}
                      {isClient && delivery.needsWatermark ? (
                        <div className="bg-yellow-50 p-4">
                          <div className="flex items-start gap-3">
                            <FileText size={24} className="text-yellow-600 flex-shrink-0 mt-0.5" />
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-gray-900 truncate" title={getAttachmentFileName(attachment)}>
                                {getAttachmentFileName(attachment)}
                              </p>
                              {attachment.fileSize && (
                                <p className="text-sm text-gray-600">
                                  Tamaño: {formatFileSize(attachment.fileSize)}
                                </p>
                              )}
                              <p className="text-xs text-yellow-700 mt-1">
                                Bloqueado hasta realizar el pago
                              </p>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleDownload(attachment)}
                          disabled={downloading}
                          className="w-full flex items-center gap-3 p-4 bg-blue-50 hover:bg-blue-100 transition-colors group disabled:opacity-50"
                        >
                          <FileText size={24} className="text-blue-500 flex-shrink-0" />
                          <div className="flex-1 text-left min-w-0">
                            <p className="font-medium text-blue-900 group-hover:text-blue-700 truncate" title={getAttachmentFileName(attachment)}>
                              {getAttachmentFileName(attachment)}
                            </p>
                            <p className="text-sm text-blue-600">
                              {downloading ? 'Descargando...' : (
                                attachment.fileSize 
                                  ? `${formatFileSize(attachment.fileSize)} • Click para descargar`
                                  : 'Click para descargar'
                              )}
                            </p>
                          </div>
                          {downloading ? (
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500 flex-shrink-0"></div>
                          ) : (
                            <Download size={20} className="text-blue-500 flex-shrink-0" />
                          )}
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Información del entregable (si aplica) */}
          {delivery.deliverable && (
            <div className="mb-6">
              <label className="font-semibold text-gray-900 mb-2 block">
                Información del Entregable
              </label>
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <h4 className="font-medium text-gray-900 mb-1">
                  {delivery.deliverable.title}
                </h4>
                <p className="text-sm text-gray-600 mb-2">
                  {delivery.deliverable.description}
                </p>
                {delivery.deliverable.estimatedDeliveryDate && (
                  <p className="text-xs text-gray-500 flex items-center">
                    <Calendar size={14} className="mr-1" />
                    Fecha estimada: {new Date(delivery.deliverable.estimatedDeliveryDate).toLocaleDateString()}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Acciones según estado - Solo para el cliente */}
          {isClient && delivery.status === 'delivered' && !showConfirmApprove && !showRevisionForm && (
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                variant="primary"
                onClick={() => setShowConfirmApprove(true)}
                className="flex-1 bg-green-600 hover:bg-green-700 flex items-center justify-center"
                disabled={loading || hasActiveClaim}
                title={hasActiveClaim ? 'No se puede aprobar mientras hay un reclamo activo' : ''}
              >
                <CheckCircle size={18} className="mr-2" />
                Aceptar Entrega
              </Button>
              <Button
                variant="secondary"
                onClick={() => setShowRevisionForm(true)}
                className="flex-1 flex items-center justify-center"
                disabled={loading || hasActiveClaim}
                title={hasActiveClaim ? 'No se puede solicitar revisión mientras hay un reclamo activo' : ''}
              >
                <RefreshCw size={18} className="mr-2" />
                Solicitar Revisión
              </Button>
            </div>
          )}

          {/* Botón de pago para entregas pendientes de pago */}
          {isClient && delivery.status === 'pending_payment' && (
            <div className="space-y-4">
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <div className="flex items-start">
                  <AlertCircle size={20} className="text-amber-600 mr-3 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-amber-900 mb-1">
                      Pago pendiente
                    </h4>
                    <p className="text-sm text-amber-800">
                      Esta entrega ha sido aprobada pero el pago aún no se ha completado. 
                      Haz clic en el botón de abajo para procesar el pago en MercadoPago.
                    </p>
                  </div>
                </div>
              </div>
              <Button
                variant="primary"
                onClick={handleApprove}
                className="w-full bg-blue-600 hover:bg-blue-700 flex items-center justify-center"
                disabled={loading || hasActiveClaim}
                title={hasActiveClaim ? 'No se puede realizar el pago mientras hay un reclamo activo' : ''}
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Procesando...
                  </div>
                ) : (
                  <>
                    <DollarSign size={18} className="mr-2" />
                    Realizar pago
                  </>
                )}
              </Button>
            </div>
          )}

          {/* Mensaje informativo para prestador */}
          {!isClient && delivery.status === 'delivered' && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start">
                <AlertCircle size={20} className="text-blue-600 mr-3 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-blue-900 mb-1">
                    Entrega realizada
                  </h4>
                  <p className="text-sm text-blue-800">
                    Esta entrega está esperando la revisión y aprobación del cliente.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Confirmación de aprobación */}
          {showConfirmApprove && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-start mb-4">
                <AlertCircle size={20} className="text-green-600 mr-3 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-green-900 mb-1">
                    ¿Confirmar aprobación de entrega?
                  </h4>
                  <p className="text-sm text-green-800">
                    Esta acción no se puede deshacer. Se procesará el pago correspondiente al prestador.
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <Button
                  variant="cancel"
                  onClick={() => setShowConfirmApprove(false)}
                  disabled={loading}
                  className="flex-1"
                >
                  Cancelar
                </Button>
                <Button
                  variant="primary"
                  onClick={handleApprove}
                  disabled={loading}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                >
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Procesando...
                    </div>
                  ) : (
                    'Sí, aprobar'
                  )}
                </Button>
              </div>
            </div>
          )}

          {/* Formulario de revisión */}
          {showRevisionForm && (
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
              <h4 className="font-semibold text-orange-900 mb-3">
                Solicitar Revisión
              </h4>
              <textarea
                value={revisionNotes}
                onChange={(e) => setRevisionNotes(e.target.value)}
                placeholder="Explica qué necesita ser modificado o corregido..."
                className="w-full border border-orange-300 rounded-lg p-3 mb-3 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
                rows={4}
              />
              <p className="text-xs text-orange-700 mb-3">
                {revisionNotes.length} / 500 caracteres
              </p>
              <div className="flex gap-3">
                <Button
                  variant="cancel"
                  onClick={() => {
                    setShowRevisionForm(false);
                    setRevisionNotes('');
                  }}
                  disabled={loading}
                  className="flex-1"
                >
                  Volver
                </Button>
                <Button
                  variant="primary"
                  onClick={handleRequestRevision}
                  disabled={loading || !revisionNotes.trim()}
                  className="flex-1"
                >
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Enviando...
                    </div>
                  ) : (
                    'Enviar Solicitud'
                  )}
                </Button>
              </div>
            </div>
          )}

          {/* Estado: Aprobado */}
          {delivery.status === 'approved' && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center">
                <CheckCircle size={24} className="text-green-600 mr-3" />
                <div>
                  <p className="font-semibold text-green-900">
                    Entrega aprobada
                  </p>
                  {delivery.approvedAt && (
                    <p className="text-sm text-green-700">
                      Aprobado el {new Date(delivery.approvedAt).toLocaleDateString('es-ES', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric'
                      })}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Estado: Revisión solicitada */}
          {delivery.status === 'revision_requested' && (
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
              <div className="flex items-start">
                <RefreshCw size={24} className="text-orange-600 mr-3 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-orange-900 mb-2">
                    Revisión solicitada
                  </p>
                  {delivery.revisionNotes && (
                    <div>
                      <p className="text-sm font-medium text-orange-800 mb-1">
                        Notas de revisión:
                      </p>
                      <p className="text-sm text-orange-700 whitespace-pre-wrap">
                        {delivery.revisionNotes}
                      </p>
                    </div>
                  )}
                  {delivery.reviewedAt && (
                    <p className="text-xs text-orange-600 mt-2">
                      Solicitado el {new Date(delivery.reviewedAt).toLocaleDateString()}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
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
