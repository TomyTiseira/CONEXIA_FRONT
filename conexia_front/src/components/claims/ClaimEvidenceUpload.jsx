/**
 * ClaimEvidenceUpload Component
 * Componente para subir evidencias (imágenes, documentos, videos)
 */

'use client';

import React, { useRef } from 'react';
import { Upload, X, FileText, Image, Film, File } from 'lucide-react';
import { formatFileSize, getFileType } from '@/utils/claimValidation';
import { CLAIM_VALIDATION } from '@/constants/claims';

/**
 * Obtiene el ícono según el tipo de archivo
 */
const getFileIcon = (file) => {
  const type = getFileType(file.name);
  const iconProps = { size: 24, className: 'text-gray-500' };

  switch (type) {
    case 'image':
      return <Image {...iconProps} className="text-blue-500" />;
    case 'document':
      return <FileText {...iconProps} className="text-red-500" />;
    case 'video':
      return <Film {...iconProps} className="text-purple-500" />;
    default:
      return <File {...iconProps} />;
  }
};

export const ClaimEvidenceUpload = ({ files, onAddFiles, onRemoveFile, errors = [], maxFiles, existingFilesCount = 0 }) => {
  const fileInputRef = useRef(null);

  // Usar maxFiles si se proporciona, sino usar el máximo por defecto
  const maxFilesAllowed = maxFiles !== undefined ? maxFiles : CLAIM_VALIDATION.MAX_EVIDENCE_FILES;
  const canAddMore = files.length < maxFilesAllowed;
  const filesRemaining = maxFilesAllowed - files.length;

  const handleFileSelect = (e) => {
    const selectedFiles = e.target.files;
    if (selectedFiles && selectedFiles.length > 0) {
      const result = onAddFiles(selectedFiles);
      // Si hay errores, se mostrarán automáticamente en el componente
    }
    // Reset input para permitir seleccionar el mismo archivo de nuevo
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const droppedFiles = e.dataTransfer.files;
    if (droppedFiles && droppedFiles.length > 0) {
      const result = onAddFiles(droppedFiles);
      // Si hay errores, se mostrarán automáticamente en el componente
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  return (
    <div className="space-y-4">
      {/* Zona de Drop */}
      {canAddMore && (
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors cursor-pointer bg-gray-50"
          onClick={() => fileInputRef.current?.click()}
        >
          <Upload className="mx-auto h-12 w-12 text-gray-400 mb-3" />
          <p className="text-sm text-gray-600 mb-1">
            <span className="font-semibold text-blue-600">Click para subir</span> o arrastra archivos aquí
          </p>
          <p className="text-xs text-gray-500">
            JPG, PNG, GIF, PDF, DOCX, MP4 (máx. 10 MB por archivo)
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Puedes subir hasta {filesRemaining} archivo(s) más. ({files.length + existingFilesCount}/{maxFilesAllowed})
          </p>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept=".jpg,.jpeg,.png,.gif,.pdf,.docx,.mp4"
            onChange={handleFileSelect}
            className="hidden"
          />
        </div>
      )}

      {/* Lista de archivos */}
      {files.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-700">Archivos seleccionados:</p>
          {files.map((file, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg hover:border-gray-300 transition-colors"
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                {getFileIcon(file)}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{file.name}</p>
                  <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => onRemoveFile(index)}
                className="ml-2 p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
                title="Eliminar archivo"
              >
                <X size={18} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Errores */}
      {errors.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
          {errors.map((error, index) => (
            <p key={index} className="text-sm text-red-600">
              • {error}
            </p>
          ))}
        </div>
      )}

      {/* Info */}
      {!canAddMore && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
          <p className="text-sm text-yellow-800">
            Has alcanzado el máximo de archivos permitidos ({files.length + existingFilesCount}/{maxFilesAllowed})
          </p>
        </div>
      )}
    </div>
  );
};

export default ClaimEvidenceUpload;
