import { useState } from 'react';
import Image from 'next/image';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { config } from '@/config';

export default function ServiceImageCarousel({ 
  images = [], 
  title = '', 
  className = '',
  size = 'normal' // 'normal' para detalle, 'small' para tarjeta
}) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [imageErrors, setImageErrors] = useState({});

  const handleImageError = (index) => {
    setImageErrors(prev => ({ ...prev, [index]: true }));
  };

  const getImageSrc = (imagePath, index) => {
    if (imageErrors[index] || !imagePath) {
      return '/default_project.jpeg';
    }
    
    if (imagePath.startsWith('http')) {
      return imagePath;
    }
    // Usar config.IMAGE_URL como en proyectos y quitar el /uploads del path
    const cleanPath = imagePath.startsWith('/uploads/') ? imagePath.substring(9) : imagePath;
    return `${config.IMAGE_URL}/${cleanPath}`;
  };

  const nextImage = (e) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = (e) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const goToImage = (index, e) => {
    e.stopPropagation();
    setCurrentImageIndex(index);
  };

  // Si no hay imágenes, mostrar imagen por defecto
  if (!images || images.length === 0) {
    const containerClass = size === 'small' 
      ? 'relative w-32 h-32 sm:w-36 sm:h-36 flex-shrink-0' 
      : 'aspect-video bg-gray-100 rounded-lg overflow-hidden relative';
    
    const imageClass = size === 'small'
      ? 'object-cover rounded-xl border-4 border-white bg-[#f3f9f8] shadow-sm'
      : 'object-cover';
      
    return (
      <div className={`${containerClass} ${className}`}>
        <Image
          src="/default_project.jpeg"
          alt={title || "Sin imagen"}
          fill
          className={imageClass}
          sizes={size === 'small' ? '144px' : '100vw'}
        />
      </div>
    );
  }

  // Si solo hay una imagen, mostrar imagen simple
  if (images.length === 1) {
    const containerClass = size === 'small' 
      ? 'relative w-32 h-32 sm:w-36 sm:h-36 flex-shrink-0' 
      : 'aspect-video bg-gray-100 rounded-lg overflow-hidden relative';
    
    const imageClass = size === 'small'
      ? 'object-cover rounded-xl border-4 border-white bg-[#f3f9f8] shadow-sm'
      : 'object-cover';
      
    return (
      <div className={`${containerClass} ${className}`}>
        <Image
          src={getImageSrc(images[0], 0)}
          alt={title || "Imagen del servicio"}
          fill
          className={imageClass}
          sizes={size === 'small' ? '144px' : '100vw'}
          onError={() => handleImageError(0)}
        />
      </div>
    );
  }

  // Carrusel completo para múltiples imágenes
  const containerClass = size === 'small' 
    ? 'relative w-32 h-32 sm:w-36 sm:h-36 flex-shrink-0 group' 
    : 'aspect-video bg-gray-100 rounded-lg overflow-hidden relative group';
  
  const imageClass = size === 'small'
    ? 'object-cover rounded-xl border-4 border-white bg-[#f3f9f8] shadow-sm transition-opacity duration-300'
    : 'object-cover transition-opacity duration-300';
    
  const buttonSize = size === 'small' ? 'w-5 h-5' : 'w-8 h-8';
  const iconSize = size === 'small' ? 8 : 12;
  const indicatorSize = size === 'small' ? 'w-1 h-1' : 'w-2 h-2';
  const counterClass = size === 'small' 
    ? 'absolute top-0.5 right-0.5 bg-black/60 text-white text-[8px] px-1 py-0.5 rounded font-medium'
    : 'absolute top-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded font-medium';

  return (
    <div className={`${containerClass} ${className}`}>
      {/* Imagen principal */}
      <Image
        src={getImageSrc(images[currentImageIndex], currentImageIndex)}
        alt={title || "Imagen del servicio"}
        fill
        className={imageClass}
        sizes={size === 'small' ? '144px' : '100vw'}
        onError={() => handleImageError(currentImageIndex)}
      />

      {/* Controles de navegación - solo visibles en hover */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        {/* Botón anterior */}
        <button
          onClick={prevImage}
          className={`absolute left-1 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full flex items-center justify-center transition-colors duration-200 z-10 ${buttonSize}`}
        >
          <FaChevronLeft size={iconSize} />
        </button>

        {/* Botón siguiente */}
        <button
          onClick={nextImage}
          className={`absolute right-1 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full flex items-center justify-center transition-colors duration-200 z-10 ${buttonSize}`}
        >
          <FaChevronRight size={iconSize} />
        </button>

        {/* Indicadores de imagen - solo en tamaño normal */}
        {size === 'normal' && (
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1 z-10">
            {images.map((_, index) => (
              <button
                key={index}
                onClick={(e) => goToImage(index, e)}
                className={`${indicatorSize} rounded-full transition-colors duration-200 ${
                  index === currentImageIndex 
                    ? 'bg-white' 
                    : 'bg-white/50 hover:bg-white/75'
                }`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Contador de imágenes */}
      <div className={counterClass}>
        {currentImageIndex + 1}/{images.length}
      </div>
    </div>
  );
}