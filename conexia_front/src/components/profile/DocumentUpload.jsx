'use client';

import { useState, useRef } from 'react';
import { Upload, X, FileText, AlertCircle, CheckCircle } from 'lucide-react';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png'];

export default function DocumentUpload({ onFileSelect, selectedFile }) {
  const [preview, setPreview] = useState(null);
  const [error, setError] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  const validateFile = (file) => {
    // Validar tipo de archivo
    if (!ALLOWED_TYPES.includes(file.type)) {
      return 'Solo se permiten imágenes en formato JPEG o PNG.';
    }

    // Validar tamaño
    if (file.size > MAX_FILE_SIZE) {
      return 'La imagen excede los 10MB. Por favor, selecciona una imagen más pequeña.';
    }

    return null;
  };

  const handleFileChange = (file) => {
    if (!file) return;

    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      setPreview(null);
      onFileSelect(null);
      return;
    }

    // Crear preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result);
      setError(null);
      onFileSelect(file);
    };
    reader.readAsDataURL(file);
  };

  const handleInputChange = (e) => {
    const file = e.target.files?.[0];
    handleFileChange(file);
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
    const file = e.dataTransfer.files?.[0];
    handleFileChange(file);
  };

  const handleRemove = () => {
    setPreview(null);
    setError(null);
    onFileSelect(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-4">
      {!preview ? (
        <div
          onClick={handleClick}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`
            border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all
            ${isDragging
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'
            }
          `}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/jpg,image/png"
            onChange={handleInputChange}
            className="hidden"
          />
          
          <Upload className="mx-auto text-gray-400 mb-4" size={48} />
          
          <div className="space-y-2">
            <p className="text-lg font-medium text-gray-700">
              Arrastra tu documento aquí
            </p>
            <p className="text-sm text-gray-500">
              o haz clic para seleccionar un archivo
            </p>
            <p className="text-xs text-gray-400 mt-2">
              JPEG o PNG, máximo 10MB
            </p>
          </div>
        </div>
      ) : (
        <div className="relative">
          <div className="border-2 border-green-500 rounded-lg overflow-hidden">
            <img
              src={preview}
              alt="Preview del documento"
              className="w-full h-64 object-contain bg-gray-50"
            />
          </div>
          
          <button
            onClick={handleRemove}
            className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-2 shadow-lg transition-colors"
            aria-label="Eliminar imagen"
          >
            <X size={20} />
          </button>

          <div className="flex items-center space-x-2 mt-3 text-sm text-green-600">
            <CheckCircle size={16} />
            <span className="font-medium">Imagen cargada correctamente</span>
          </div>

          {selectedFile && (
            <div className="flex items-center space-x-2 mt-2 text-xs text-gray-500">
              <FileText size={14} />
              <span>{selectedFile.name}</span>
              <span>({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)</span>
            </div>
          )}
        </div>
      )}

      {error && (
        <div className="flex items-start space-x-2 p-3 bg-red-50 border border-red-200 rounded-lg">
          <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={20} />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-2">
        <p className="text-sm font-medium text-blue-800">Requisitos del documento:</p>
        <ul className="text-xs text-blue-700 space-y-1 ml-4 list-disc">
          <li>La imagen debe ser clara y legible</li>
          <li>Asegúrate de que el número de identificación sea visible</li>
          <li>Evita reflejos y sombras en la foto</li>
          <li>El documento debe estar completamente visible</li>
        </ul>
      </div>
    </div>
  );
}
