/**
 * UploadComplianceEvidenceModal Component
 * Modal para que usuarios suban evidencia del cumplimiento de un compliance
 * Permite subir hasta 5 archivos (10MB c/u) y agregar notas explicativas
 */

'use client';

import React, { useState } from 'react';
import { X, Upload, Trash2, FileText, AlertCircle } from 'lucide-react';
import { COMPLIANCE_TYPE_LABELS, COMPLIANCE_VALIDATION } from '@/constants/claims';
import { ComplianceStatusBadge } from './ComplianceStatusBadge';
import Button from '@/components/ui/Button';

export const UploadComplianceEvidenceModal = ({
  compliance,
  onClose,
  onSubmit,
  isSubmitting = false,
}) => {
  const [files, setFiles] = useState([]);
  const [userResponse, setUserResponse] = useState('');
  const [error, setError] = useState(null);

  const MAX_FILES = COMPLIANCE_VALIDATION.MAX_EVIDENCE_FILES || 5;
  const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
  const MIN_RESPONSE_LENGTH = COMPLIANCE_VALIDATION.USER_NOTES_MIN_LENGTH || 20;
  const MAX_RESPONSE_LENGTH = COMPLIANCE_VALIDATION.USER_NOTES_MAX_LENGTH || 1000;

  // Formatear fecha
  const formatDate = (dateString) => {
    if (!dateString) return 'Sin plazo';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-AR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Manejar selección de archivos
  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);

    if (files.length + selectedFiles.length > MAX_FILES) {
      setError(`Máximo ${MAX_FILES} archivos permitidos`);
      return;
    }

    const oversized = selectedFiles.filter((f) => f.size > MAX_FILE_SIZE);
    if (oversized.length > 0) {
      setError('Algunos archivos exceden el tamaño máximo de 10MB');
      return;
    }

    setFiles([...files, ...selectedFiles]);
    setError(null);
  };

  // Remover archivo
  const handleRemoveFile = (index) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  // Manejar envío
  const handleSubmit = (e) => {
    e.preventDefault();

    if (files.length === 0) {
      setError('Debes subir al menos 1 archivo como evidencia');
      return;
    }

    if (!userResponse.trim()) {
      setError('Debes agregar una explicación del cumplimiento');
      return;
    }

    if (userResponse.trim().length < MIN_RESPONSE_LENGTH) {
      setError(`La explicación debe tener al menos ${MIN_RESPONSE_LENGTH} caracteres`);
      return;
    }

    if (userResponse.trim().length > MAX_RESPONSE_LENGTH) {
      setError(`La explicación no puede exceder ${MAX_RESPONSE_LENGTH} caracteres`);
      return;
    }

    // Llamar callback con los datos
    onSubmit({
      complianceId: compliance.id,
      files,
      userResponse: userResponse.trim(),
    });
  };

  const complianceTypeLabel =
    COMPLIANCE_TYPE_LABELS[compliance.complianceType] || compliance.complianceType;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[100] p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b bg-gradient-to-r from-conexia-green to-emerald-600">
          <h3 className="text-xl font-bold text-white">
            Subir Evidencia de Cumplimiento
          </h3>
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="p-2 hover:bg-white/20 rounded-full transition-colors disabled:opacity-50"
          >
            <X size={20} className="text-white" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Info del Compliance */}
            <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <h4 className="font-semibold text-blue-900">{complianceTypeLabel}</h4>
                <ComplianceStatusBadge status={compliance.status} />
              </div>
              
              {compliance.moderatorInstructions && (
                <div className="mb-2">
                  <p className="text-xs font-semibold text-blue-700 mb-1">
                    Instrucciones del moderador:
                  </p>
                  <p className="text-sm text-blue-800 whitespace-pre-wrap">
                    {compliance.moderatorInstructions}
                  </p>
                </div>
              )}
              
              {compliance.deadline && (
                <p className="text-xs text-blue-600">
                  <strong>Plazo límite:</strong> {formatDate(compliance.deadline)}
                </p>
              )}
            </div>

            {/* Explicación del cumplimiento */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Explicación del cumplimiento *
              </label>
              <textarea
                value={userResponse}
                onChange={(e) => setUserResponse(e.target.value)}
                placeholder="Ej: Realicé el reembolso completo mediante MercadoPago. Adjunto comprobante de la transacción con el ID de operación..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-conexia-green resize-none"
                rows={4}
                required
                disabled={isSubmitting}
                minLength={MIN_RESPONSE_LENGTH}
                maxLength={MAX_RESPONSE_LENGTH}
              />
              <div className="flex justify-between items-center mt-1">
                <p className="text-xs text-gray-500">
                  Mínimo {MIN_RESPONSE_LENGTH} caracteres, máximo {MAX_RESPONSE_LENGTH}
                </p>
                <p className={`text-xs ${userResponse.length > MAX_RESPONSE_LENGTH ? 'text-red-600 font-semibold' : 'text-gray-500'}`}>
                  {userResponse.length} / {MAX_RESPONSE_LENGTH}
                </p>
              </div>
            </div>

            {/* Archivos de evidencia */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Archivos de evidencia *
              </label>

              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-conexia-green transition-colors">
                <input
                  type="file"
                  id="evidence-files"
                  multiple
                  accept="image/*,.pdf,.docx"
                  onChange={handleFileChange}
                  disabled={isSubmitting || files.length >= MAX_FILES}
                  className="hidden"
                />
                <label
                  htmlFor="evidence-files"
                  className={`cursor-pointer flex flex-col items-center ${isSubmitting || files.length >= MAX_FILES ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <Upload size={32} className="text-gray-400 mb-2" />
                  <p className="text-sm text-gray-600 mb-1">
                    Haz clic para seleccionar archivos
                  </p>
                  <p className="text-xs text-gray-500">
                    Máximo {MAX_FILES} archivos, 10MB cada uno
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Formatos: JPG, PNG, PDF, DOCX
                  </p>
                </label>
              </div>

              {/* Lista de archivos seleccionados */}
              {files.length > 0 && (
                <div className="mt-3 space-y-2">
                  <p className="text-sm font-medium text-gray-700">
                    Archivos seleccionados ({files.length}/{MAX_FILES}):
                  </p>
                  {files.map((file, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between bg-gray-50 p-3 rounded-lg border border-gray-200"
                    >
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <FileText size={16} className="text-gray-500 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-gray-700 truncate" title={file.name}>
                            {file.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            {(file.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveFile(index)}
                        disabled={isSubmitting}
                        className="p-2 text-red-600 hover:bg-red-100 rounded transition-colors disabled:opacity-50"
                        title="Eliminar archivo"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Error */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2">
                <AlertCircle size={16} className="text-red-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="border-t px-6 py-4 bg-gray-50 flex gap-3">
            <Button
              type="button"
              onClick={onClose}
              variant="secondary"
              disabled={isSubmitting}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={isSubmitting || files.length === 0 || !userResponse.trim()}
              className="flex-1"
            >
              {isSubmitting ? (
                <>
                  <Upload size={16} className="animate-pulse" />
                  Enviando...
                </>
              ) : (
                <>
                  <Upload size={16} />
                  Enviar Evidencia
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UploadComplianceEvidenceModal;
