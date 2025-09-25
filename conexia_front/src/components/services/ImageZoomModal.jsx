'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';

export default function ImageZoomModal({ open, onClose, images, initialIndex = 0 }) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  useEffect(() => {
    setCurrentIndex(initialIndex);
  }, [initialIndex]);

  if (!open || !images || images.length === 0) return null;

  const nextImage = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <div className="fixed inset-0 bg-black/90 z-[60] flex items-center justify-center p-4">
      <div className="relative max-w-4xl max-h-full w-full h-full flex items-center justify-center">
        {/* Cerrar modal */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-white hover:text-gray-300 z-10"
        >
          <X size={32} />
        </button>

        {/* Imagen ampliada */}
        <div className="relative w-full h-full max-w-3xl max-h-[80vh]">
          <Image
            src={URL.createObjectURL(images[currentIndex])}
            alt={`Imagen ampliada ${currentIndex + 1}`}
            fill
            className="object-contain"
          />
        </div>

        {/* Navegación en modal */}
        {images.length > 1 && (
          <>
            <button
              onClick={prevImage}
              className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white p-2 rounded-full"
            >
              <ChevronLeft size={24} />
            </button>
            <button
              onClick={nextImage}
              className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white p-2 rounded-full"
            >
              <ChevronRight size={24} />
            </button>
          </>
        )}

        {/* Contador en modal */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 text-white px-3 py-1 rounded text-sm">
          {currentIndex + 1} / {images.length}
        </div>
      </div>
    </div>
  );
}