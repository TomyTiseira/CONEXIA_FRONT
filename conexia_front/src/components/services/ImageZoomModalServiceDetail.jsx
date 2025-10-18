import { useEffect, useState } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { config } from '@/config';

export default function ImageZoomModal({ open, onClose, images, initialIndex = 0 }) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  useEffect(() => {
    setCurrentIndex(initialIndex);
  }, [initialIndex]);

  if (!open || !images || images.length === 0) return null;

  // Función para obtener la URL correcta de la imagen
  const getImageSrc = (imagePath) => {
    if (!imagePath) {
      return '/default_service.jpg';
    }
    
    if (imagePath.startsWith('http')) {
      return imagePath;
    }
    
    // Usar config.IMAGE_URL como en otros componentes
    const cleanPath = imagePath.startsWith('/uploads/') ? imagePath.substring(9) : imagePath;
    const finalUrl = `${config.IMAGE_URL}/${cleanPath}`;
    return finalUrl;
  };

  const nextImage = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}>
      {/* Overlay oscuro que cubre todo, incluido el navbar */}
      <div 
        className="absolute inset-0 bg-black/90" 
        onClick={onClose}
        style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
      />
      
      <div className="relative max-w-4xl max-h-full w-full h-full flex items-center justify-center z-10 p-4">
        {/* Cerrar modal */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-white hover:text-gray-300 z-20 bg-black/50 rounded-full p-2"
        >
          <X size={24} />
        </button>

        {/* Imagen ampliada */}
        <div className="relative w-full h-full max-w-3xl max-h-[80vh]">
          <Image
            src={getImageSrc(images[currentIndex])}
            alt={`Imagen ampliada ${currentIndex + 1}`}
            fill
            className="object-contain"
            sizes="(max-width: 768px) 100vw, 75vw"
          />
        </div>

        {/* Navegación en modal */}
        {images.length > 1 && (
          <>
            <button
              onClick={prevImage}
              className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-3 rounded-full z-20"
            >
              <ChevronLeft size={24} />
            </button>
            <button
              onClick={nextImage}
              className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-3 rounded-full z-20"
            >
              <ChevronRight size={24} />
            </button>
          </>
        )}

        {/* Contador en modal */}
        {images.length > 1 && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/70 text-white px-4 py-2 rounded-full text-sm font-medium z-20">
            {currentIndex + 1} / {images.length}
          </div>
        )}
      </div>
    </div>
  );
}
