'use client';

import { useRef, useState } from 'react';
import { Upload, Image as ImageIcon } from 'lucide-react';

export default function ImageUploadZone({ 
  images, 
  onImagesChange, 
  maxImages = 5, 
  maxSizePerImage = 5 * 1024 * 1024, // 5MB
  acceptedFormats = ['image/jpeg', 'image/png'],
  className = '' 
}) {
  const fileInputRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadError, setUploadError] = useState('');

  const validateFiles = (files) => {
    const errors = [];
    
    // Verificar cantidad total
    if (images.length + files.length > maxImages) {
      errors.push(`Máximo ${maxImages} imágenes permitidas`);
    }

    // Verificar cada archivo
    files.forEach((file, index) => {
      // Verificar formato
      if (!acceptedFormats.includes(file.type)) {
        errors.push(`Archivo ${index + 1}: Formato no válido. Solo JPG y PNG permitidos`);
      }
      
      // Verificar tamaño
      if (file.size > maxSizePerImage) {
        const maxSizeMB = maxSizePerImage / (1024 * 1024);
        errors.push(`Archivo ${index + 1}: Tamaño máximo ${maxSizeMB}MB`);
      }
    });

    return errors;
  };

  const handleFiles = (files) => {
    setUploadError('');
    const fileArray = Array.from(files);
    
    const errors = validateFiles(fileArray);
    if (errors.length > 0) {
      setUploadError(errors.join(', '));
      return;
    }

    // Filtrar archivos duplicados por nombre y tamaño
    const newImages = fileArray.filter(newFile => {
      return !images.some(existingFile => 
        existingFile.name === newFile.name && existingFile.size === newFile.size
      );
    });

    if (newImages.length === 0) {
      setUploadError('Todas las imágenes seleccionadas ya están agregadas');
      return;
    }

    // Limitar al máximo permitido
    const imagesToAdd = newImages.slice(0, maxImages - images.length);
    onImagesChange([...images, ...imagesToAdd]);

    if (imagesToAdd.length < newImages.length) {
      setUploadError(`Solo se pudieron agregar ${imagesToAdd.length} imágenes (máximo ${maxImages})`);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFiles(files);
    }
  };

  const handleFileInputChange = (e) => {
    const files = e.target.files;
    if (files.length > 0) {
      handleFiles(files);
    }
    // Limpiar input para permitir seleccionar el mismo archivo de nuevo
    e.target.value = '';
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const isMaxReached = images.length >= maxImages;

  return (
    <div className={`space-y-2 ${className}`}>
      {/* Zona de subida */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={!isMaxReached ? handleClick : undefined}
        className={`
          border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors
          ${isDragging 
            ? 'border-conexia-green bg-conexia-green/5' 
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
            <Upload className={`w-8 h-8 ${isDragging ? 'text-conexia-green' : 'text-gray-400'}`} />
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
        <p className="text-xs text-red-600">{uploadError}</p>
      )}

      {/* Información adicional */}
      <p className="text-xs text-gray-600">
        Sube imágenes de trabajos realizados para que las personas puedan ver ejemplos de tu trabajo
        ({images.length}/{maxImages} imágenes)
      </p>
    </div>
  );
}