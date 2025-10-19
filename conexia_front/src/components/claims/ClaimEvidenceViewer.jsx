/**
 * ClaimEvidenceViewer Component
 * Componente para ver las evidencias de un reclamo
 */

'use client';

import React, { useState } from 'react';
import { FileText, Image, Film, File, ExternalLink, Download, X, Loader2 } from 'lucide-react';
import { getFileType, getFileNameFromUrl } from '@/utils/claimValidation';
import { config } from '@/config/env';

/**
 * Convierte una ruta relativa en URL absoluta
 */
const getAbsoluteUrl = (url) => {
  if (!url) return '';
  
  // Si ya es una URL completa, devolverla tal cual
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  
  // Si es una ruta relativa, construir URL completa
  // Remover el slash inicial si existe para evitar doble slash
  const path = url.startsWith('/') ? url.substring(1) : url;
  return `${config.DOCUMENT_URL}/${path}`;
};

/**
 * Obtiene el ícono según el tipo de archivo
 */
const getFileIcon = (url) => {
  const type = getFileType(url);
  const iconProps = { size: 20, className: 'mr-2' };

  switch (type) {
    case 'image':
      return <Image {...iconProps} className="text-blue-500" />;
    case 'document':
      return <FileText {...iconProps} className="text-red-500" />;
    case 'video':
      return <Film {...iconProps} className="text-purple-500" />;
    default:
      return <File {...iconProps} className="text-gray-500" />;
  }
};

/**
 * Modal para vista previa de imágenes
 */
const ImagePreviewModal = ({ url, onClose }) => {
  if (!url) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-75">
      <div className="relative max-w-4xl max-h-[90vh]">
        <button
          onClick={onClose}
          className="absolute -top-10 right-0 text-white hover:text-gray-300"
        >
          <X size={32} />
        </button>
        <img src={url} alt="Evidence" className="max-w-full max-h-[90vh] object-contain" />
      </div>
    </div>
  );
};

export const ClaimEvidenceViewer = ({ evidenceUrls = [] }) => {
  const [previewUrl, setPreviewUrl] = useState(null);
  const [downloading, setDownloading] = useState(null); // índice del archivo que se está descargando

  if (!evidenceUrls || evidenceUrls.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <File size={48} className="mx-auto mb-3 text-gray-300" />
        <p>No se adjuntaron evidencias</p>
      </div>
    );
  }

  const handlePreview = (url) => {
    const absoluteUrl = getAbsoluteUrl(url);
    const type = getFileType(url);
    if (type === 'image') {
      setPreviewUrl(absoluteUrl);
    } else {
      // Para otros archivos, abrir en nueva pestaña
      window.open(absoluteUrl, '_blank');
    }
  };

  const handleDownload = async (url, fileName, index) => {
    setDownloading(index);
    try {
      const absoluteUrl = getAbsoluteUrl(url);
      const response = await fetch(absoluteUrl);
      
      if (!response.ok) {
        throw new Error('Error al descargar el archivo');
      }

      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      console.error('Error downloading file:', error);
      alert('Error al descargar el archivo. Por favor, intenta nuevamente.');
    } finally {
      setDownloading(null);
    }
  };

  return (
    <>
      <div className="space-y-3">
        {evidenceUrls.map((url, index) => {
          const absoluteUrl = getAbsoluteUrl(url);
          const fileName = getFileNameFromUrl(url);
          const fileType = getFileType(url);

          return (
            <div
              key={index}
              className="flex items-center justify-between p-3 bg-gray-50 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors group"
            >
              <div className="flex items-center flex-1 min-w-0">
                {getFileIcon(url)}
                <span className="text-sm font-medium text-gray-900 truncate">{fileName}</span>
              </div>

              <div className="flex items-center gap-2 ml-3">
                {/* Botón de vista previa */}
                <button
                  onClick={() => handlePreview(url)}
                  className="p-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded transition-colors"
                  title={fileType === 'image' ? 'Ver imagen' : 'Abrir archivo'}
                >
                  <ExternalLink size={18} />
                </button>

                {/* Botón de descarga */}
                <button
                  onClick={() => handleDownload(url, fileName, index)}
                  disabled={downloading === index}
                  className="p-2 text-gray-600 hover:text-gray-700 hover:bg-gray-100 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Descargar"
                >
                  {downloading === index ? (
                    <Loader2 size={18} className="animate-spin" />
                  ) : (
                    <Download size={18} />
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal de preview */}
      {previewUrl && <ImagePreviewModal url={previewUrl} onClose={() => setPreviewUrl(null)} />}
    </>
  );
};

export default ClaimEvidenceViewer;
