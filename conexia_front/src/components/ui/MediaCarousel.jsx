"use client";
import { useState, useCallback } from 'react';
import { config } from '@/config';

// Utilidad para obtener URL de medios
const getMediaUrl = (mediaUrl) => {
  if (!mediaUrl) return '';
  if (mediaUrl.startsWith('http://') || mediaUrl.startsWith('https://')) return mediaUrl;
  
  // Si la URL del backend viene con /uploads, construir URL completa
  if (mediaUrl.startsWith('/uploads')) {
    // config.IMAGE_URL ya incluye /uploads, así que quitarlo del mediaUrl
    const pathWithoutUploads = mediaUrl.replace('/uploads', '');
    return `${config.IMAGE_URL}${pathWithoutUploads}`;
  }
  
  // Fallback para otros casos
  if (mediaUrl.startsWith('/')) return `${config.IMAGE_URL}${mediaUrl}`;
  return `${config.IMAGE_URL}/${mediaUrl}`;
};

export default function MediaCarousel({ media }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const goToNext = useCallback(() => {
    setCurrentIndex(prev => (prev + 1) % media.length);
  }, [media.length]);

  const goToPrev = useCallback(() => {
    setCurrentIndex(prev => prev === 0 ? media.length - 1 : prev - 1);
  }, [media.length]);

  const goToSlide = useCallback((index) => {
    setCurrentIndex(index);
  }, []);

  // Si no hay medios o es un array vacío, no renderizar nada
  if (!media || media.length === 0) return null;

  // Si solo hay un elemento, renderizar sin controles
  if (media.length === 1) {
    const currentMedia = media[0];
    return (
      <div className="publication-carousel">
        <div className="carousel-container">
          <div className="carousel-content">
            {currentMedia.fileType?.startsWith('image/') || currentMedia.mediaType === 'image' ? (
              <img 
                src={getMediaUrl(currentMedia.fileUrl || currentMedia.mediaUrl)} 
                alt={currentMedia.filename || 'Media'}
                className="carousel-image"
              />
            ) : currentMedia.fileType?.startsWith('video/') || currentMedia.mediaType === 'video' ? (
              <video 
                src={getMediaUrl(currentMedia.fileUrl || currentMedia.mediaUrl)}
                controls
                className="carousel-video"
              >
                Tu navegador no soporta video.
              </video>
            ) : (
              <img 
                src={getMediaUrl(currentMedia.fileUrl || currentMedia.mediaUrl)} 
                alt={currentMedia.filename || 'Media'}
                className="carousel-image"
              />
            )}
          </div>
        </div>
      </div>
    );
  }

  const currentMedia = media[currentIndex];
  const imageUrl = getMediaUrl(currentMedia.fileUrl || currentMedia.mediaUrl);

  return (
    <div className="publication-carousel">
      <div className="carousel-container">
        {/* Contenido principal */}
        <div className="carousel-content">
          {currentMedia.fileType?.startsWith('image/') || currentMedia.mediaType === 'image' ? (
            <img 
              src={imageUrl}
              alt={currentMedia.filename || `Media ${currentIndex + 1}`}
              className="carousel-image"
            />
          ) : currentMedia.fileType?.startsWith('video/') || currentMedia.mediaType === 'video' ? (
            <video 
              src={imageUrl}
              controls
              className="carousel-video"
            >
              Tu navegador no soporta video.
            </video>
          ) : (
            <img 
              src={imageUrl}
              alt={currentMedia.filename || `Media ${currentIndex + 1}`}
              className="carousel-image"
            />
          )}
        </div>

        {/* Controles de navegación */}
        <button 
          onClick={goToPrev}
          className="carousel-btn prev-btn"
          aria-label="Anterior"
        >
          ‹
        </button>
        <button 
          onClick={goToNext}
          className="carousel-btn next-btn"
          aria-label="Siguiente"
        >
          ›
        </button>

        {/* Indicadores */}
        <div className="carousel-indicators">
          {media.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`indicator ${index === currentIndex ? 'active' : ''}`}
              aria-label={`Ir a imagen ${index + 1}`}
            />
          ))}
        </div>

        {/* Contador */}
        <div className="carousel-counter">
          {currentIndex + 1} / {media.length}
        </div>
      </div>

      <style jsx>{`
        .publication-carousel {
          position: relative;
          width: 100%;
          max-width: 100%;
          overflow: hidden;
          margin: 8px 0;
          background: transparent;
          border-radius: 8px;
        }

        .carousel-container {
          position: relative;
          width: 100%;
          height: 400px; /* Altura fija como LinkedIn */
          overflow: hidden;
          background: #f8fcfc;
          border: 1px solid #e0f0f0;
          border-radius: 8px;
        }

        .carousel-content {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .carousel-image,
        .carousel-video {
          max-width: 100%;
          max-height: 100%;
          width: auto;
          height: auto;
          object-fit: contain;
          display: block;
        }

        .carousel-btn {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          background: rgba(0, 0, 0, 0.6);
          color: white;
          border: none;
          width: 40px;
          height: 40px;
          border-radius: 50%;
          font-size: 18px;
          cursor: pointer;
          z-index: 2;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .carousel-btn:hover {
          background: rgba(0, 0, 0, 0.8);
          transform: translateY(-50%) scale(1.1);
        }

        .prev-btn {
          left: 10px;
        }

        .next-btn {
          right: 10px;
        }

        .carousel-indicators {
          position: absolute;
          bottom: 15px;
          left: 50%;
          transform: translateX(-50%);
          display: flex;
          gap: 8px;
          z-index: 2;
        }

        .indicator {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          border: none;
          background: rgba(255, 255, 255, 0.5);
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .indicator.active,
        .indicator:hover {
          background: white;
          transform: scale(1.2);
        }

        .carousel-counter {
          position: absolute;
          top: 15px;
          right: 15px;
          background: rgba(0, 0, 0, 0.6);
          color: white;
          padding: 4px 8px;
          border-radius: 12px;
          font-size: 12px;
          z-index: 2;
        }

        /* Responsive */
        @media (max-width: 768px) {
          .carousel-container {
            height: 300px; /* Más pequeño en móviles */
          }
          
          .carousel-btn {
            width: 32px;
            height: 32px;
            font-size: 14px;
          }

          .prev-btn {
            left: 5px;
          }

          .next-btn {
            right: 5px;
          }

          .indicator {
            width: 6px;
            height: 6px;
          }
        }

        @media (max-width: 480px) {
          .carousel-container {
            height: 250px; /* Aún más pequeño en móviles pequeños */
          }
        }
      `}</style>
    </div>
  );
}