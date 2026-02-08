'use client';

import { useState, useRef, useCallback } from 'react';
import { Upload, Image as ImageIcon, X, Check } from 'lucide-react';

export default function ImageUploadProgress({ 
  images, 
  onImagesChange, 
  maxImages = 5, 
  maxSizePerImage = 5 * 1024 * 1024,
  acceptedFormats = ['image/jpeg', 'image/png'],
  className = '' 
}) {
  const fileInputRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [uploadProgress, setUploadProgress] = useState([]);

  const validateFiles = useCallback((files) => {
    const errors = [];
    
    if (images.length + files.length > maxImages) {
      errors.push(`Máximo ${maxImages} imágenes permitidas`);
    }

    files.forEach((file, index) => {
      if (!acceptedFormats.includes(file.type)) {
        errors.push(`Archivo ${index + 1}: Formato no válido. Solo JPG y PNG permitidos`);
      }
      
      if (file.size > maxSizePerImage) {
        const maxSizeMB = maxSizePerImage / (1024 * 1024);
        errors.push(`Archivo ${index + 1}: Tamaño máximo ${maxSizeMB}MB`);
      }
    });

    return errors;
  }, [images.length, maxImages, maxSizePerImage, acceptedFormats]);

  const simulateUpload = useCallback((files, startIndex) => {
    files.forEach((file, index) => {
      const progressIndex = startIndex + index;
      
      // Simular progreso de carga
      let progress = 0;
      const interval = setInterval(() => {
        progress += Math.random() * 30;
        
        setUploadProgress(prev => {
          const newProgress = [...prev];
          newProgress[progressIndex] = Math.min(progress, 100);
          return newProgress;
        });

        if (progress >= 100) {
          clearInterval(interval);
        }
      }, 100);
    });
  }, []);

  const handleFiles = useCallback((files) => {
    setUploadError('');
    const fileArray = Array.from(files);
    
    const errors = validateFiles(fileArray);
    if (errors.length > 0) {
      setUploadError(errors.join(', '));
      return;
    }

    // Filtrar duplicados
    const newImages = fileArray.filter(newFile => {
      return !images.some(existingFile => 
        existingFile.name === newFile.name && existingFile.size === newFile.size
      );
    });

    if (newImages.length === 0) {
      setUploadError('Todas las imágenes seleccionadas ya están agregadas');
      return;
    }

    // Limitar cantidad
    const imagesToAdd = newImages.slice(0, maxImages - images.length);
    
    // Inicializar progreso
    const startIndex = images.length;
    setUploadProgress(prev => {
      const newProgress = [...prev];
      imagesToAdd.forEach((_, index) => {
        newProgress[startIndex + index] = 0;
      });
      return newProgress;
    });

    // Simular carga
    simulateUpload(imagesToAdd, startIndex);
    
    // Agregar imágenes
    onImagesChange([...images, ...imagesToAdd]);

    if (imagesToAdd.length < newImages.length) {
      setUploadError(`Solo se pudieron agregar ${imagesToAdd.length} imágenes (máximo ${maxImages})`);
    }
  }, [images, maxImages, validateFiles, onImagesChange, simulateUpload]);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFiles(files);
    }
  }, [handleFiles]);

  const handleFileInputChange = useCallback((e) => {
    const files = e.target.files;
    if (files.length > 0) {
      handleFiles(files);
    }
    e.target.value = '';
  }, [handleFiles]);

  const handleClick = () => {
    if (images.length < maxImages) {
      fileInputRef.current?.click();
    }
  };

  const removeImage = (index) => {
    const newImages = images.filter((_, i) => i !== index);
    const newProgress = uploadProgress.filter((_, i) => i !== index);
    setUploadProgress(newProgress);
    onImagesChange(newImages);
  };

  const isMaxReached = images.length >= maxImages;

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Zona de subida */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClick}
        className={`
          border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-all duration-200
          ${isDragging 
            ? 'border-conexia-green bg-conexia-green/5 scale-[1.02]' 
            : isMaxReached 
              ? 'border-gray-300 bg-gray-100 cursor-not-allowed' 
              : 'border-gray-300 hover:border-conexia-green hover:bg-conexia-green/5'
          }
        `}
      >
        <div className="flex flex-col items-center gap-3">
          {isMaxReached ? (
            <ImageIcon className="w-8 h-8 text-gray-400" />
          ) : (
            <Upload className={`w-8 h-8 transition-colors ${isDragging ? 'text-conexia-green' : 'text-gray-400'}`} />
          )}
          
          <div>
            {isMaxReached ? (
              <p className="text-sm text-gray-500">
                Máximo de {maxImages} imágenes alcanzado
              </p>
            ) : (
              <>
                <p className="text-sm font-medium text-gray-700">
                  {isDragging ? 'Suelta las imágenes aquí' : 'Arrastra imágenes aquí o haz clic para seleccionar'}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Máximo {maxImages} imágenes, JPG/PNG, {maxSizePerImage / (1024 * 1024)}MB cada una
                </p>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Input oculto */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept={acceptedFormats.join(',')}
        onChange={handleFileInputChange}
        className="hidden"
        disabled={isMaxReached}
      />

      {/* Error de subida */}
      {uploadError && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-600">{uploadError}</p>
        </div>
      )}

      {/* Lista de imágenes con progreso */}
      {images.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-gray-700">
            Imágenes seleccionadas ({images.length}/{maxImages})
          </h4>
          
          <div className="space-y-2">
            {images.map((image, index) => {
              const progress = uploadProgress[index] || 100;
              const isUploaded = progress >= 100;
              
              return (
                <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  {/* Vista previa miniatura */}
                  <div className="w-12 h-12 rounded bg-gray-200 overflow-hidden flex-shrink-0">
                    <img
                      src={URL.createObjectURL(image)}
                      alt={`Vista previa ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  
                  {/* Información del archivo */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {image.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {(image.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                    
                    {/* Barra de progreso */}
                    {!isUploaded && (
                      <div className="mt-2">
                        <div className="w-full bg-gray-200 rounded-full h-1">
                          <div
                            className="bg-conexia-green h-1 rounded-full transition-all duration-300"
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          {Math.round(progress)}%
                        </p>
                      </div>
                    )}
                  </div>
                  
                  {/* Estado y acciones */}
                  <div className="flex items-center gap-2">
                    {isUploaded && (
                      <div className="text-green-600">
                        <Check size={16} />
                      </div>
                    )}
                    
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="text-red-500 hover:text-red-700 p-1 transition-colors"
                    >
                      <X size={16} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Información adicional */}
      <p className="text-xs text-gray-600">
        Sube imágenes de trabajos realizados para que las personas puedan ver ejemplos de tu trabajo
      </p>
    </div>
  );
}