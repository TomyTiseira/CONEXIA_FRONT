'use client';

import { useState, useRef } from 'react';
import { X, Upload, FileText, CheckCircle, AlertCircle } from 'lucide-react';

export default function PostulationModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  loading, 
  error,
  projectTitle 
}) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [fileError, setFileError] = useState(null);
  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  const handleFileSelect = (file) => {
    if (!file) return;

    // Limpiar errores previos
    setFileError(null);

    // Validar tipo de archivo
    if (file.type !== 'application/pdf') {
      setFileError('Solo se permiten archivos PDF para el CV');
      setSelectedFile(null);
      return;
    }

    // Validar tamaño (10MB)
    if (file.size > 10 * 1024 * 1024) {
      setFileError('El archivo no puede superar los 10MB');
      setSelectedFile(null);
      return;
    }

    setSelectedFile(file);
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleFileInputChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0]);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleSubmit = () => {
    if (!selectedFile) {
      setFileError('Debes seleccionar un archivo CV');
      return;
    }
    onConfirm(selectedFile);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 pt-20">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-800">Postularse al proyecto</h2>
          <button
            onClick={() => {
              setFileError(null);
              setSelectedFile(null);
              onClose();
            }}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            disabled={loading}
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="mb-4">
            <p className="text-gray-600 text-sm mb-4">
              Te estás postulando al proyecto: <span className="font-semibold text-conexia-green">"{projectTitle}"</span>
            </p>
          </div>

          {/* File Upload Area */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Currículum Vitae (PDF) *
            </label>
            
            <div
              className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                dragActive 
                  ? 'border-conexia-green bg-green-50' 
                  : selectedFile 
                    ? 'border-green-500 bg-green-50' 
                    : 'border-gray-300 hover:border-gray-400'
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              {selectedFile ? (
                <div className="flex items-center justify-center space-x-3">
                  <CheckCircle className="text-green-500" size={24} />
                  <div className="text-left">
                    <p className="text-sm font-semibold text-gray-800">{selectedFile.name}</p>
                    <p className="text-xs text-gray-500">{formatFileSize(selectedFile.size)}</p>
                  </div>
                </div>
              ) : (
                <div>
                  <Upload className="mx-auto mb-3 text-gray-400" size={32} />
                  <p className="text-sm text-gray-600 mb-2">
                    Arrastra tu CV aquí o{' '}
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="text-conexia-green font-semibold hover:underline"
                    >
                      selecciona un archivo
                    </button>
                  </p>
                  <p className="text-xs text-gray-500">Solo archivos PDF, máximo 10MB</p>
                </div>
              )}
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf"
              onChange={handleFileInputChange}
              className="hidden"
            />

            {/* Error de archivo */}
            {fileError && (
              <div className="mt-3 flex items-center space-x-2 text-red-600 bg-red-50 p-3 rounded-lg">
                <AlertCircle size={16} />
                <p className="text-sm">{fileError}</p>
              </div>
            )}

            {selectedFile && (
              <button
                type="button"
                onClick={() => {
                  setSelectedFile(null);
                  setFileError(null);
                }}
                className="mt-2 text-sm text-red-600 hover:text-red-800 transition-colors"
              >
                Quitar archivo
              </button>
            )}
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 flex items-center space-x-2 text-red-600 bg-red-50 p-3 rounded-lg">
              <AlertCircle size={16} />
              <p className="text-sm">{error}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex space-x-3 p-6 border-t border-gray-200">
          <button
            onClick={() => {
              setFileError(null);
              setSelectedFile(null);
              onClose();
            }}
            disabled={loading}
            className="flex-1 bg-[#f5f6f6] text-[#777d7d] py-3 px-4 rounded-lg font-semibold hover:bg-[#f1f2f2] transition-colors disabled:opacity-50 disabled:cursor-not-allowed border border-[#e1e4e4]"
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading || !selectedFile}
            className="flex-1 bg-conexia-green text-white py-3 px-4 rounded-lg font-semibold hover:bg-conexia-green/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {loading ? (
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                <span>Enviando...</span>
              </div>
            ) : (
              'Confirmar postulación'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
