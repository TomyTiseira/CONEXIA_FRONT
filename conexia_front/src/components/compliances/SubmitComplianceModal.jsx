/**
 * SubmitComplianceModal Component
 * Modal para subir evidencia de cumplimiento con drag & drop
 */

'use client';

import React, { useState, useCallback, useRef } from 'react';
import { X, Upload, File, Trash2, Loader2, AlertCircle } from 'lucide-react';
import { useComplianceSubmit } from '@/hooks/compliances';
import { ComplianceTypeBadge } from './ComplianceTypeBadge';
import { CountdownTimer } from './CountdownTimer';
import Toast from '@/components/ui/Toast';

export const SubmitComplianceModal = ({ 
  isOpen, 
  onClose, 
  compliance, 
  userId,
  onSuccess 
}) => {
  const [toast, setToast] = useState({ isVisible: false, type: '', message: '' });
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  const {
    files,
    userNotes,
    isSubmitting,
    error,
    fileErrors,
    addFiles,
    removeFile,
    setNotes,
    submit,
    reset,
    getCharacterCount,
  } = useComplianceSubmit();

  if (!isOpen || !compliance) return null;

  const handleDragEnter = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const droppedFiles = Array.from(e.dataTransfer.files);
    addFiles(droppedFiles);
  }, [addFiles]);

  const handleFileSelect = useCallback((e) => {
    const selectedFiles = Array.from(e.target.files);
    addFiles(selectedFiles);
  }, [addFiles]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await submit(compliance.id, userId, compliance.requiresFiles);
      
      setToast({ 
        isVisible: true, 
        type: 'success', 
        message: 'Evidencia enviada exitosamente. Revisa tu correo para actualizaciones.' 
      });

      setTimeout(() => {
        if (onSuccess) onSuccess();
        handleClose();
      }, 2000);
    } catch (err) {
      setToast({ 
        isVisible: true, 
        type: 'error', 
        message: err.message || 'Error al enviar evidencia' 
      });
    }
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const characterCount = getCharacterCount();

  // Formato de tamaño de archivo
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full h-[90vh] overflow-hidden flex flex-col">
          {/* Header */}
          <div className="px-6 py-4 border-b border-purple-200 bg-purple-100 flex items-center justify-between flex-shrink-0 rounded-t-xl">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Cumplir con resolución</h2>
              <p className="text-sm text-gray-600 mt-1">
                Sube la evidencia solicitada para completar este cumplimiento
              </p>
            </div>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600 rounded-full p-2 transition-colors disabled:opacity-50"
              disabled={isSubmitting}
            >
              <X size={24} />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Compliance Info */}
              <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                <div className="flex items-center justify-between">
                  <ComplianceTypeBadge type={compliance.complianceType} />
                  <CountdownTimer 
                    deadline={compliance.deadline} 
                    warningLevel={compliance.warningLevel}
                  />
                </div>
                
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">
                    Instrucciones del Moderador:
                  </h3>
                  <p className="text-sm text-gray-600 bg-white p-3 rounded border border-gray-200">
                    {compliance.moderatorInstructions}
                  </p>
                </div>

                {compliance.rejectionReason && (
                  <div className="bg-red-50 border border-red-200 rounded p-3">
                    <h4 className="text-sm font-semibold text-red-700 mb-1">
                      Motivo de Rechazo Anterior:
                    </h4>
                    <p className="text-sm text-red-600">
                      {compliance.rejectionReason}
                    </p>
                  </div>
                )}
              </div>

              {/* File Upload Area */}
              {compliance.requiresFiles && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Archivos de Evidencia *
                  </label>
                  
                  {/* Drag & Drop Zone */}
                  <div
                    onDragEnter={handleDragEnter}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                      isDragging 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    <Upload size={48} className="mx-auto text-gray-400 mb-4" />
                    <p className="text-sm text-gray-600 mb-2">
                      Arrastra archivos aquí o{' '}
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="text-blue-600 hover:text-blue-700 font-medium"
                      >
                        selecciónalos
                      </button>
                    </p>
                    <p className="text-xs text-gray-500">
                      Máximo 10 archivos, 10MB cada uno
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      PDF, Word, Excel, imágenes
                    </p>
                    <input
                      ref={fileInputRef}
                      type="file"
                      multiple
                      onChange={handleFileSelect}
                      className="hidden"
                      accept=".jpg,.jpeg,.png,.gif,.webp,.pdf,.doc,.docx,.xls,.xlsx"
                    />
                  </div>

                  {/* File Errors */}
                  {fileErrors.length > 0 && (
                    <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded">
                      {fileErrors.map((error, idx) => (
                        <p key={idx} className="text-sm text-red-600 flex items-center">
                          <AlertCircle size={14} className="mr-1" />
                          {error}
                        </p>
                      ))}
                    </div>
                  )}

                  {/* Files List */}
                  {files.length > 0 && (
                    <div className="mt-4 space-y-2">
                      {files.map((file, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200"
                        >
                          <div className="flex items-center flex-1 min-w-0">
                            <File size={20} className="text-blue-600 mr-3 flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900 truncate">
                                {file.name}
                              </p>
                              <p className="text-xs text-gray-500">
                                {formatFileSize(file.size)}
                              </p>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeFile(index)}
                            className="ml-3 text-red-600 hover:text-red-700 p-1 rounded hover:bg-red-50 transition-colors"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Notes */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Notas Explicativas {!compliance.requiresFiles && '*'}
                </label>
                <textarea
                  value={userNotes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Explica qué hiciste para cumplir con lo solicitado..."
                  rows={5}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                />
                <div className="mt-1 flex items-center justify-between text-xs text-gray-500">
                  <span>Mínimo 10 caracteres</span>
                  <span className={characterCount.current >= characterCount.min ? 'text-green-600' : 'text-gray-500'}>
                    {characterCount.current} / {characterCount.max}
                  </span>
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded flex items-center text-red-700">
                  <AlertCircle size={18} className="mr-2 flex-shrink-0" />
                  <span className="text-sm">{error}</span>
                </div>
              )}
            </form>
          </div>

          {/* Footer */}
          <div className="bg-gray-50 px-6 py-4 flex items-center justify-end gap-3 border-t border-gray-200">
            <button
              type="button"
              onClick={handleClose}
              disabled={isSubmitting}
              className="px-5 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-100 transition-colors disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting || (compliance.requiresFiles && files.length === 0)}
              className="px-5 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={18} className="mr-2 animate-spin" />
                  Enviando...
                </>
              ) : (
                'Enviar Evidencia'
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Toast */}
      {toast.isVisible && (
        <Toast
          type={toast.type}
          message={toast.message}
          onClose={() => setToast({ ...toast, isVisible: false })}
        />
      )}
    </>
  );
};

export default SubmitComplianceModal;
