'use client';

import { useState } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, X, ZoomIn } from 'lucide-react';

export default function ImageCarousel({ images, onRemove, showZoom = true, className = '' }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showZoomModal, setShowZoomModal] = useState(false);
  const [zoomedImageIndex, setZoomedImageIndex] = useState(0);

  if (!images || images.length === 0) {
    return (
      <div className={`w-full h-48 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center ${className}`}>
        <span className="text-gray-500 text-sm">No hay imágenes seleccionadas</span>
      </div>
    );
  }

  const nextImage = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const handleZoomImage = (index) => {
    setZoomedImageIndex(index);
    setShowZoomModal(true);
  };

  const nextZoomedImage = () => {
    setZoomedImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevZoomedImage = () => {
    setZoomedImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <>
      <div className={`relative w-full h-48 bg-gray-100 rounded-lg overflow-hidden border border-gray-200 ${className}`}>
        {/* Imagen principal */}
        <div className="relative w-full h-full bg-white">
          <Image
            src={URL.createObjectURL(images[currentIndex])}
            alt={`Imagen ${currentIndex + 1}`}
            fill
            className="object-contain"
          />
          
          {/* Botones de navegación */}
          {images.length > 1 && (
            <>
              <button
                type="button"
                onClick={prevImage}
                className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-1 rounded-full transition-colors"
              >
                <ChevronLeft size={20} />
              </button>
              <button
                type="button"
                onClick={nextImage}
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-1 rounded-full transition-colors"
              >
                <ChevronRight size={20} />
              </button>
            </>
          )}

          {/* Botón de zoom */}
          {showZoom && (
            <button
              type="button"
              onClick={() => handleZoomImage(currentIndex)}
              className="absolute top-2 right-2 bg-black/50 hover:bg-black/70 text-white p-1 rounded-full transition-colors"
            >
              <ZoomIn size={16} />
            </button>
          )}

          {/* Botón de eliminar */}
          {onRemove && (
            <button
              type="button"
              onClick={() => onRemove(currentIndex)}
              className="absolute top-2 left-2 bg-red-500/80 hover:bg-red-600 text-white p-1 rounded-full transition-colors"
            >
              <X size={16} />
            </button>
          )}

          {/* Indicador de posición */}
          {images.length > 1 && (
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-black/50 text-white px-2 py-1 rounded text-xs">
              {currentIndex + 1} / {images.length}
            </div>
          )}
        </div>

        {/* Miniaturas */}
        {images.length > 1 && (
          <div className="absolute bottom-2 right-2 flex gap-1">
            {images.map((_, index) => (
              <button
                key={index}
                type="button"
                onClick={() => setCurrentIndex(index)}
                className={`w-2 h-2 rounded-full transition-colors ${
                  index === currentIndex ? 'bg-white' : 'bg-white/50'
                }`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Modal de zoom */}
      {showZoomModal && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
          <div className="relative max-w-4xl max-h-full w-full h-full flex items-center justify-center">
            {/* Cerrar modal */}
            <button
              onClick={() => setShowZoomModal(false)}
              className="absolute top-4 right-4 text-white hover:text-gray-300 z-10"
            >
              <X size={32} />
            </button>

            {/* Imagen ampliada */}
            <div className="relative w-full h-full max-w-3xl max-h-[80vh]">
              <Image
                src={URL.createObjectURL(images[zoomedImageIndex])}
                alt={`Imagen ampliada ${zoomedImageIndex + 1}`}
                fill
                className="object-contain"
              />
            </div>

            {/* Navegación en modal */}
            {images.length > 1 && (
              <>
                <button
                  onClick={prevZoomedImage}
                  className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white p-2 rounded-full"
                >
                  <ChevronLeft size={24} />
                </button>
                <button
                  onClick={nextZoomedImage}
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white p-2 rounded-full"
                >
                  <ChevronRight size={24} />
                </button>
              </>
            )}

            {/* Contador en modal */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 text-white px-3 py-1 rounded text-sm">
              {zoomedImageIndex + 1} / {images.length}
            </div>
          </div>
        </div>
      )}
    </>
  );
}