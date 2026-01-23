/**
 * SubmitComplianceModal Component
 * Modal para que el reclamado suba el cumplimiento del reclamo
 */

'use client';

import React, { useState } from 'react';
import { X, Upload, FileText, Loader2 } from 'lucide-react';
import { useClaimActions } from '@/hooks/claims';
import { isValidClaimFile } from '@/constants/claims';

export const SubmitComplianceModal = ({ claim, onClose, onSuccess }) => {
  const { uploadCompliance, loading } = useClaimActions();
  const [description, setDescription] = useState('');
  const [files, setFiles] = useState([]);
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState('');

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files || []);
    addFiles(selectedFiles);
  };

  const addFiles = (newFiles) => {
    setError('');
    
    if (files.length + newFiles.length > 5) {
      setError('Máximo 5 archivos permitidos');
      return;
    }

    const validFiles = newFiles.filter((file) => {
      if (!isValidClaimFile(file)) {
        setError(`${file.name}: formato no válido o tamaño mayor a 10MB`);
        return false;
      }
      return true;
    });

    setFiles((prev) => [...prev, ...validFiles]);
  };

  const removeFile = (index) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
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

    const droppedFiles = Array.from(e.dataTransfer.files || []);
    addFiles(droppedFiles);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!description.trim()) {
      setError('La descripción del cumplimiento es requerida');
      return;
    }

    if (description.length < 50) {
      setError('La descripción debe tener al menos 50 caracteres');
      return;
    }

    const formData = new FormData();
    formData.append('description', description);
    files.forEach((file) => {
      formData.append('evidence', file);
    });

    const result = await uploadCompliance(claim.id, formData);
    
    if (result.success) {
      onSuccess?.('Cumplimiento enviado exitosamente');
      onClose();
    } else {
      setError(result.error || 'Error al enviar cumplimiento');
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b bg-gradient-to-r from-purple-600 to-purple-700">
          <h2 className="text-xl font-bold text-white">Subir Cumplimiento</h2>
          <button onClick={onClose} className="text-white hover:bg-white/20 rounded-full p-2 transition-colors">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <p className="text-sm text-purple-900">
              Describe cómo has cumplido con la resolución del moderador y adjunta las evidencias correspondientes.
            </p>
          </div>

          {claim?.resolution?.complianceInstructions && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="text-sm font-semibold text-gray-900 mb-2">Instrucciones del Moderador:</h4>
              <p className="text-sm text-gray-700">{claim.resolution.complianceInstructions}</p>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Descripción del Cumplimiento <span className="text-red-500">*</span>
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent resize-none"
              rows={6}
              placeholder="Describe cómo has cumplido con lo solicitado..."
              maxLength={2000}
            />
            <p className="text-xs text-gray-500 mt-1">
              {description.length}/2000 caracteres (mínimo 50)
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Evidencias del Cumplimiento <span className="text-red-500">*</span>
            </label>
            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                dragActive ? 'border-purple-600 bg-purple-50' : 'border-gray-300'
              }`}
            >
              <Upload size={32} className="mx-auto text-gray-400 mb-2" />
              <p className="text-sm text-gray-600 mb-2">
                Arrastra archivos aquí o haz clic para seleccionar
              </p>
              <input
                type="file"
                onChange={handleFileChange}
                multiple
                accept=".jpg,.jpeg,.png,.gif,.pdf,.docx,.mp4"
                className="hidden"
                id="file-upload-comp"
              />
              <label
                htmlFor="file-upload-comp"
                className="inline-block px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg cursor-pointer text-sm transition-colors"
              >
                Seleccionar Archivos
              </label>
              <p className="text-xs text-gray-500 mt-2">
                Máximo 5 archivos. Formatos: JPG, PNG, GIF, PDF, DOCX, MP4 (10MB máx)
              </p>
            </div>

            {files.length > 0 && (
              <div className="mt-4 space-y-2">
                {files.map((file, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <FileText size={16} className="text-gray-600" />
                      <span className="text-sm text-gray-700 truncate">{file.name}</span>
                      <span className="text-xs text-gray-500">
                        ({(file.size / 1024 / 1024).toFixed(2)} MB)
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeFile(index)}
                      className="text-red-500 hover:text-red-700 text-sm"
                    >
                      Eliminar
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}
        </form>

        <div className="px-6 py-4 border-t bg-gray-50 flex gap-3 justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            disabled={loading}
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading || !description.trim() || description.length < 50}
            className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {loading && <Loader2 size={16} className="animate-spin" />}
            {loading ? 'Enviando...' : 'Enviar Cumplimiento'}
          </button>
        </div>
      </div>
    </div>
  );
};
