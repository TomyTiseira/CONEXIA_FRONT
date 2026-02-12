/**
 * SubmitComplianceModal Component
 * Modal para que el reclamado suba el cumplimiento del reclamo
 */

'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { X, Upload, FileText, Loader2 } from 'lucide-react';
import { useClaimActions } from '@/hooks/claims';
import { isValidClaimFile } from '@/constants/claims';
import InputField from '@/components/form/InputField';
import { ClaimEvidenceUpload } from './ClaimEvidenceUpload';
import { useEvidenceUpload } from '@/hooks/claims';
import Button from '@/components/ui/Button';
import { ComplianceCard } from './ComplianceCard';
import { useAuth } from '@/context/AuthContext';

export const SubmitComplianceModal = ({ claim, compliance, onClose, onSuccess }) => {
  const { user } = useAuth();
  const { uploadCompliance, loading } = useClaimActions();
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');
  const [showValidationError, setShowValidationError] = useState(false);
  const [selectedComplianceId, setSelectedComplianceId] = useState(null);
  const [step, setStep] = useState('select'); // 'select' o 'upload'

  const MAX_FILES = 5;
  const MIN_DESCRIPTION_LENGTH = 50;
  const MAX_DESCRIPTION_LENGTH = 2000;

  // Usar el hook de evidencias
  const {
    files,
    errors: uploadErrors,
    addFiles,
    removeFile,
    reset: resetUpload,
  } = useEvidenceUpload();

  // Si no se pasa compliance, intentar encontrarlo desde el claim
  // Buscar el compliance que le corresponde al usuario actual (donde es responsable)
  const userCompliance = useMemo(() => {
    // Si hay un compliance seleccionado específicamente, usarlo
    if (selectedComplianceId && claim?.compliances) {
      const selected = claim.compliances.find(c => String(c.id) === String(selectedComplianceId));
      if (selected) return selected;
    }
    
    // Si se pasó compliance directamente, usarlo
    if (compliance) return compliance;
    
    // Si el claim tiene compliances, buscar el que pertenece al usuario
    if (claim?.compliances && Array.isArray(claim.compliances)) {
      return claim.compliances.find(c => 
        String(c.responsibleUserId) === String(user?.id) && 
        c.status === 'pending'
      );
    }
    
    return null;
  }, [selectedComplianceId, compliance, claim, user]);

  // Obtener todos los compromisos pendientes del usuario
  const userPendingCompliances = useMemo(() => {
    if (!claim?.compliances || !Array.isArray(claim.compliances)) return [];
    
    return claim.compliances.filter(c => 
      String(c.responsibleUserId) === String(user?.id) && 
      c.status === 'pending'
    );
  }, [claim, user]);

  // Determinar si necesitamos mostrar selección
  const needsSelection = userPendingCompliances.length > 1 && !selectedComplianceId && !compliance;

  // Auto-seleccionar si solo hay un compromiso o si se pasó compliance
  useEffect(() => {
    if (compliance) {
      setSelectedComplianceId(compliance.id);
      setStep('upload');
    } else if (userPendingCompliances.length === 1) {
      setSelectedComplianceId(userPendingCompliances[0].id);
      setStep('upload');
    } else if (userPendingCompliances.length > 1) {
      setStep('select');
    } else {
      setStep('upload');
    }
  }, [compliance, userPendingCompliances]);

  const handleAddFiles = (selectedFiles) => {
    setError('');
    
    // Validar que no se exceda el límite total
    const totalSelected = files.length + selectedFiles.length;
    if (totalSelected > MAX_FILES) {
      const filesRemaining = MAX_FILES - files.length;
      setError(`Solo puedes agregar ${filesRemaining} archivo(s) más. Máximo ${MAX_FILES} en total.`);
      return false;
    }

    // Usar el hook de evidencias que ya valida tamaño y formato
    const result = addFiles(selectedFiles);
    return result;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setShowValidationError(false);

    if (!userCompliance?.id) {
      setError('No se ha seleccionado un compromiso');
      return;
    }

    if (!description.trim()) {
      setError('La descripción del cumplimiento es requerida');
      setShowValidationError(true);
      return;
    }

    if (description.length < MIN_DESCRIPTION_LENGTH) {
      setError(`La descripción debe tener al menos ${MIN_DESCRIPTION_LENGTH} caracteres`);
      setShowValidationError(true);
      return;
    }

    const formData = new FormData();
    formData.append('description', description);
    files.forEach((file) => {
      formData.append('evidence', file);
    });

    const result = await uploadCompliance(claim.id, userCompliance.id, formData);
    
    if (result.success) {
      onSuccess?.('Cumplimiento enviado exitosamente');
      onClose();
    } else {
      setError(result.error || 'Error al enviar cumplimiento');
    }
  };

  const handleSelectCompliance = (complianceId) => {
    setSelectedComplianceId(complianceId);
    setStep('upload');
  };

  const trimmedDescription = description.trim();
  const hasText = trimmedDescription.length > 0;
  const isTextValid = !hasText || trimmedDescription.length >= MIN_DESCRIPTION_LENGTH;
  const canSubmit = !loading && isTextValid && hasText;

  return (
    <div className="fixed inset-0 z-[100]">
      <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" onClick={onClose} />
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] flex flex-col">
          {/* Header (estático) */}
          <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between flex-shrink-0">
            <h2 className="text-xl font-semibold text-gray-900">
              {step === 'select' ? 'Seleccionar Compromiso' : 'Subir Cumplimiento'}
            </h2>
            <button
              onClick={onClose}
              disabled={loading}
              className="text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
            >
              <X size={24} />
            </button>
          </div>

          {/* Vista de Selección */}
          {step === 'select' && userPendingCompliances.length > 1 && (
            <div className="flex-1 overflow-y-auto px-6 py-4 bg-gray-50">
              <div className="space-y-4">
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <p className="text-sm text-purple-900">
                    Tienes <strong>{userPendingCompliances.length} compromisos pendientes</strong>. Selecciona el compromiso que deseas cumplir.
                  </p>
                </div>

                <div className="space-y-3">
                  {userPendingCompliances.map((comp) => (
                    <button
                      key={comp.id}
                      onClick={() => handleSelectCompliance(comp.id)}
                      className="w-full text-left border border-gray-200 rounded-lg p-4 hover:border-purple-400 hover:bg-purple-50 transition-all"
                    >
                      <ComplianceCard
                        compliance={comp}
                        currentUserId={user?.id}
                        canUpload={false}
                      />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Vista de Upload */}
          {step === 'upload' && (
            <form onSubmit={handleSubmit} className="flex-1 flex flex-col overflow-hidden">
              <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6 bg-gray-50">
                {/* Volver a selección si hay múltiples */}
                {userPendingCompliances.length > 1 && (
                  <button
                    type="button"
                    onClick={() => setStep('select')}
                    className="text-sm text-purple-600 hover:text-purple-800 font-medium flex items-center gap-1"
                  >
                    ← Cambiar compromiso
                  </button>
                )}

                {/* Compromiso al que se subirá evidencia */}
                {userCompliance && (
                  <div className="bg-white border rounded-lg p-4">
                    <h3 className="font-semibold text-lg text-gray-900 mb-3">Compromiso a cumplir</h3>
                    <ComplianceCard
                      compliance={userCompliance}
                      currentUserId={user?.id}
                      canUpload={false}
                    />
                  </div>
                )}

              {/* Instrucciones iniciales */}
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <p className="text-sm text-purple-900">
                  Describe cómo has cumplido con este compromiso y adjunta las evidencias correspondientes.
                </p>
              </div>

              {/* Descripción del Cumplimiento */}
              <div className="bg-white border rounded-lg p-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Descripción del cumplimiento <span className="text-red-500">*</span>
                </label>
                <InputField
                  multiline
                  rows={6}
                  name="description"
                  placeholder="Describe cómo has cumplido con lo solicitado..."
                  value={description}
                  onChange={(e) => {
                    setDescription(e.target.value);
                    setShowValidationError(false);
                    setError('');
                  }}
                  maxLength={MAX_DESCRIPTION_LENGTH}
                  disabled={loading}
                  showCharCount={true}
                  error={showValidationError && hasText && trimmedDescription.length < MIN_DESCRIPTION_LENGTH ? `La descripción debe tener al menos ${MIN_DESCRIPTION_LENGTH} caracteres` : ''}
                />
                <p className="mt-1 text-xs text-gray-600">
                  Mínimo {MIN_DESCRIPTION_LENGTH} caracteres
                </p>
              </div>

              {/* Evidencias del Cumplimiento */}
              <div className="bg-white border rounded-lg p-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Evidencias del cumplimiento (opcional)
                </label>
                <p className="text-sm text-gray-600 mb-3">
                  Puedes adjuntar hasta {MAX_FILES} archivos que respalden tu cumplimiento.
                </p>
                <ClaimEvidenceUpload
                  files={files}
                  onAddFiles={handleAddFiles}
                  onRemoveFile={removeFile}
                  errors={uploadErrors}
                  maxFiles={MAX_FILES}
                  existingFilesCount={0}
                />
                {error && (
                  <div className="mt-2 bg-red-50 border border-red-200 rounded-lg p-3">
                    <p className="text-sm text-red-600">• {error}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Footer - Estático */}
            <div className="flex-shrink-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex gap-3 justify-end rounded-b-lg">
              <Button
                type="button"
                onClick={onClose}
                disabled={loading}
                variant="cancel"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={!canSubmit}
                variant="purple"
                className="flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Enviando...
                  </>
                ) : (
                  <>
                    <Upload size={18} />
                    Enviar cumplimiento
                  </>
                )}
              </Button>
            </div>
          </form>
          )}
        </div>
      </div>
    </div>
  );
};
