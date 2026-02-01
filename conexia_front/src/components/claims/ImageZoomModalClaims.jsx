/**
 * ImageZoomModalClaims Component
 * Modal de carrusel para ver evidencias de reclamos en tamaño completo
 * Incluye navegación, descarga y contador de imágenes
 */

'use client';

import { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, X, Download, Loader2 } from 'lucide-react';
import { config } from '@/config';
import { getFileNameFromUrl } from '@/utils/claimValidation';

/**
 * Convierte una ruta relativa en URL absoluta
 */
const getAbsoluteUrl = (url) => {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  const path = url.startsWith('/') ? url.substring(1) : url;
  return `${config.DOCUMENT_URL}/${path}`;
};

export default function ImageZoomModalClaims({ open, onClose, images, initialIndex = 0 }) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    setCurrentIndex(initialIndex);
  }, [initialIndex]);

  // Cerrar con tecla ESC
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (open) {
      document.addEventListener('keydown', handleEsc);
      // Bloquear scroll del body
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = 'unset';
    };
  }, [open, onClose]);

  if (!open || !images || images.length === 0) return null;

  const nextImage = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const handleDownload = async () => {
    setDownloading(true);
    try {
      const url = images[currentIndex];
      const absoluteUrl = getAbsoluteUrl(url);
      const fileName = getFileNameFromUrl(url);

      const response = await fetch(absoluteUrl);
      if (!response.ok) throw new Error('Error al descargar el archivo');

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
      setDownloading(false);
    }
  };

  const currentUrl = getAbsoluteUrl(images[currentIndex]);

  return (
    <div 
      className="fixed inset-0 z-[9999] flex items-center justify-center"
      style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}
    >
      {/* Overlay oscuro */}
      <div
        className="absolute inset-0 bg-black/90"
        onClick={onClose}
        style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
      />

      <div className="relative max-w-4xl max-h-full w-full h-full flex items-center justify-center z-10 p-4">
        {/* Botones superiores: descargar y cerrar */}
        <div className="absolute top-4 right-4 flex items-center gap-2 z-20">
          <button
            onClick={handleDownload}
            disabled={downloading}
            className="bg-black/50 hover:bg-black/70 text-white p-3 rounded-full transition-colors disabled:opacity-50"
            title="Descargar evidencia"
          >
            {downloading ? (
              <Loader2 size={24} className="animate-spin" />
            ) : (
              <Download size={24} />
            )}
          </button>
          <button
            onClick={onClose}
            className="bg-black/50 hover:bg-black/70 text-white p-3 rounded-full transition-colors"
            title="Cerrar"
          >
            <X size={24} />
          </button>
        </div>

        {/* Imagen ampliada */}
        <div className="relative w-full h-full max-w-3xl max-h-[80vh] flex items-center justify-center">
          <img
            src={currentUrl}
            alt={`Evidencia ${currentIndex + 1}`}
            className="max-w-full max-h-full object-contain"
          />
        </div>

        {/* Navegación en modal (solo si hay más de 1 imagen) */}
        {images.length > 1 && (
          <>
            <button
              onClick={prevImage}
              className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-3 rounded-full z-20 transition-colors"
              title="Imagen anterior"
            >
              <ChevronLeft size={24} />
            </button>
            <button
              onClick={nextImage}
              className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-3 rounded-full z-20 transition-colors"
              title="Siguiente imagen"
            >
              <ChevronRight size={24} />
            </button>
          </>
        )}

        {/* Contador en modal (solo si hay más de 1 imagen) */}
        {images.length > 1 && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/70 text-white px-4 py-2 rounded-full text-sm font-medium z-20">
            {currentIndex + 1} / {images.length}
          </div>
        )}
      </div>
    </div>
  );
}
