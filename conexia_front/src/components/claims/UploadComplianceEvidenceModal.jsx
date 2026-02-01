/**
 * UploadComplianceEvidenceModal Component
 * Modal para que usuarios suban evidencia del cumplimiento de un compliance
 * 
 * CARACTERÍSTICAS:
 * - Permite subir hasta 5 archivos (10MB c/u) y agregar notas explicativas
 * - Muestra historial completo de intentos previos (submissions[])
 * - Alertas de advertencia según el número de rechazos (0, 1, 2)
 * - Sistema de consecuencias progresivas:
 *   • 1er rechazo: Primera advertencia
 *   • 2do rechazo: Suspensión 15 días
 *   • 3er rechazo: Ban permanente
 * - Bloquea el envío si el usuario está baneado o suspendido
 * - Muestra información detallada de cada intento: evidencias, peer review, decisión moderador
 * - Indicadores visuales de progreso y urgencia
 * - Diseño consistente con SubsanarClaimModal y ClaimDetailModal
 */

'use client';

import React, { useState } from 'react';
import { X, Upload, Trash2, FileText, AlertCircle, Clock, Loader2, User, Calendar, AlertTriangle, XCircle, ChevronDown, ChevronUp, Info } from 'lucide-react';
import { COMPLIANCE_TYPE_LABELS, COMPLIANCE_VALIDATION } from '@/constants/claims';
import { ComplianceStatusBadge } from './ComplianceStatusBadge';
import { ComplianceCard } from './ComplianceCard';
import { ClaimEvidenceViewer } from './ClaimEvidenceViewer';
import InputField from '@/components/form/InputField';
import Button from '@/components/ui/Button';
import { ClaimEvidenceUpload } from './ClaimEvidenceUpload';
import { useEvidenceUpload } from '@/hooks/claims';

export const UploadComplianceEvidenceModal = ({
  compliance,
  onClose,
  onSubmit,
  isSubmitting = false,
  claimant,
  otherUser,
  currentUserId,
}) => {
  const [userResponse, setUserResponse] = useState('');
  const [error, setError] = useState(null);
  const [showValidationError, setShowValidationError] = useState(false);
  const [showHistorial, setShowHistorial] = useState(false);

  const MAX_FILES = COMPLIANCE_VALIDATION.MAX_EVIDENCE_FILES || 5;
  const MIN_RESPONSE_LENGTH = COMPLIANCE_VALIDATION.USER_NOTES_MIN_LENGTH || 20;
  const MAX_RESPONSE_LENGTH = COMPLIANCE_VALIDATION.USER_NOTES_MAX_LENGTH || 1000;

  // Información de intentos y rechazos del backend
  const currentAttempt = compliance.currentAttempt || 1;
  const rejectionCount = compliance.rejectionCount || 0;
  const warningLevel = compliance.warningLevel || 0;
  const submissions = compliance.submissions || [];
  const maxAttempts = 3; // Según documentación: 3 rechazos = ban
  
  // Validar si puede enviar evidencia
  // Solo bloquear si ya tuvo 3 rechazos (ban permanente)
  const isBlocked = rejectionCount >= 3;

  // Usar el hook de evidencias
  const {
    files,
    errors: uploadErrors,
    addFiles,
    removeFile,
    reset: resetUpload,
  } = useEvidenceUpload();

  // Formatear fecha
  const formatDate = (dateString) => {
    if (!dateString) return 'Sin plazo';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('es-ES', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  // Calcular días restantes
  const getDaysRemaining = () => {
    if (!compliance.deadline) return null;
    const now = new Date();
    const deadlineDate = new Date(compliance.deadline);
    const diffTime = deadlineDate - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const daysRemaining = getDaysRemaining();

  // Obtener información de consecuencias
  const getSiguienteConsequencia = () => {
    if (rejectionCount === 0) return 'Advertencia';
    if (rejectionCount === 1) return 'Suspensión de cuenta por 15 días';
    if (rejectionCount === 2) return 'Bloqueo permanente de cuenta';
    return null;
  };

  const getConsequenciaColor = () => {
    if (rejectionCount === 0) return 'text-yellow-700';
    if (rejectionCount === 1) return 'text-orange-700';
    if (rejectionCount === 2) return 'text-red-700';
    return 'text-gray-700';
  };

  // Obtener título de advertencia
  const getAdvertenciaTitle = () => {
    if (rejectionCount === 1) return 'Primera Advertencia';
    if (rejectionCount === 2) return 'ADVERTENCIA CRÍTICA - Última Oportunidad';
    return 'Reenvío de Evidencia';
  };

  // Manejar selección de archivos
  const handleAddFiles = (selectedFiles) => {
    setError('');
    setShowValidationError(false);
    
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

  // Manejar envío
  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    setShowValidationError(false);

    if (files.length === 0) {
      setError('Debes subir al menos 1 archivo como evidencia');
      setShowValidationError(true);
      return;
    }

    if (!userResponse.trim()) {
      setError('Debes agregar una explicación del cumplimiento');
      setShowValidationError(true);
      return;
    }

    if (userResponse.trim().length < MIN_RESPONSE_LENGTH) {
      setError(`La explicación debe tener al menos ${MIN_RESPONSE_LENGTH} caracteres`);
      setShowValidationError(true);
      return;
    }

    if (userResponse.trim().length > MAX_RESPONSE_LENGTH) {
      setError(`La explicación no puede exceder ${MAX_RESPONSE_LENGTH} caracteres`);
      setShowValidationError(true);
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

  const trimmedResponse = userResponse.trim();
  const hasText = trimmedResponse.length > 0;
  const hasFiles = files.length > 0;
  const isTextValid = !hasText || trimmedResponse.length >= MIN_RESPONSE_LENGTH;
  const canSubmit = !isSubmitting && isTextValid && hasText && hasFiles;

  return (
    <div className="fixed inset-0 z-[100]">
      <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" onClick={onClose} />
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white rounded-lg shadow-xl max-w-4xl w-full h-[90vh] flex flex-col">
          {/* Header (estático) */}
          <div className="px-6 py-4 border-b border-purple-200 bg-purple-100 flex items-center justify-between flex-shrink-0 rounded-t-xl">
            <h2 className="text-lg font-semibold text-gray-900">Subir evidencia de cumplimiento</h2>
            <button
              onClick={onClose}
              disabled={isSubmitting}
              className="text-gray-400 hover:text-gray-600 rounded-full p-2 transition-colors disabled:opacity-50"
            >
              <X size={24} />
            </button>
          </div>

          {/* Body - Con scroll */}
          <form onSubmit={handleSubmit} className="flex-1 flex flex-col overflow-hidden">
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6 bg-gray-50">
              
              {/* Compromiso seleccionado */}
              <div className="space-y-4">
                <div className="bg-purple-50 border-2 border-purple-200 rounded-xl p-4">
                  <h3 className="text-base font-bold text-purple-900 mb-1">
                    Compromiso seleccionado
                  </h3>
                  <p className="text-sm text-purple-800 font-medium">
                    Este es el compromiso al que vas a subir evidencia:
                  </p>
                </div>
                <div>
                  <ComplianceCard
                    compliance={compliance}
                    currentUserId={currentUserId}
                    canUpload={false}
                    onUploadEvidence={() => {}}
                    claimant={claimant}
                    otherUser={otherUser}
                    hideFooter={true}
                    hideWarnings={false}
                  />
                </div>
              </div>

              {/* Separador */}
              <div className="border-t-2 border-dashed border-gray-300"></div>

              {/* Sección de Subida de Evidencia - Solo si puede enviar */}
              {!isBlocked && (
                <div className="bg-white border-2 border-gray-200 rounded-xl p-5">
                  <h3 className="font-bold text-base text-gray-900 mb-4 flex items-center gap-2">
                    <Upload size={18} className="text-gray-700" />
                    Subir evidencia de cumplimiento {rejectionCount > 0 && `(Intento ${currentAttempt})`}
                  </h3>

              {/* Explicación del cumplimiento */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Explicación del cumplimiento <span className="text-red-500">*</span>
                </label>
                <InputField
                  multiline
                  rows={6}
                  name="userResponse"
                  placeholder="Describe detalladamente cómo cumpliste con este compromiso. Ej: Realicé el reembolso completo mediante MercadoPago. Adjunto comprobante de la transacción..."
                  value={userResponse}
                  onChange={(e) => {
                    setUserResponse(e.target.value);
                    setShowValidationError(false);
                    setError('');
                  }}
                  maxLength={MAX_RESPONSE_LENGTH}
                  disabled={isSubmitting}
                  showCharCount={true}
                  error={showValidationError && hasText && trimmedResponse.length < MIN_RESPONSE_LENGTH ? `La explicación debe tener al menos ${MIN_RESPONSE_LENGTH} caracteres` : ''}
                />
                <p className="mt-1 text-xs text-gray-600">
                  Mínimo {MIN_RESPONSE_LENGTH} caracteres, máximo {MAX_RESPONSE_LENGTH}
                </p>
              </div>

              {/* Archivos de evidencia */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Archivos de evidencia <span className="text-red-500">*</span>
                </label>
                <p className="text-sm text-gray-600 mb-3">
                  Adjunta hasta {MAX_FILES} archivos que demuestren el cumplimiento de este compromiso.
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
              )}
            </div>

            {/* Footer - Estático */}
            <div className="flex-shrink-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex gap-3 justify-end rounded-b-xl">
              <Button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                variant="cancel"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={!canSubmit || isBlocked}
                variant="purple"
                className="flex items-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Enviando...
                  </>
                ) : (
                  <>
                    <Upload size={18} />
                    Enviar Evidencia {rejectionCount > 0 && `(Intento ${currentAttempt})`}
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

/**
 * Componente auxiliar para mostrar cada submission en el historial
 */
const SubmissionHistoryCard = ({ submission, formatDate }) => {
  const getStatusBadge = (status) => {
    const badges = {
      pending_review: { color: 'bg-blue-100 text-blue-700 border-blue-300', text: 'En Revisión' },
      approved: { color: 'bg-green-100 text-green-700 border-green-300', text: 'Aprobado' },
      rejected: { color: 'bg-red-100 text-red-700 border-red-300', text: 'Rechazado' },
      requires_adjustment: { color: 'bg-yellow-100 text-yellow-700 border-yellow-300', text: 'Requiere Ajustes' },
    };
    return badges[status] || { color: 'bg-gray-100 text-gray-700 border-gray-300', text: status };
  };

  const statusBadge = getStatusBadge(submission.status);

  return (
    <div className="bg-white border-2 border-gray-300 rounded-xl shadow-sm overflow-hidden">
      {/* Header del submission */}
      <div className="px-5 py-3 bg-gray-100 border-b border-gray-300">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h4 className="text-sm font-bold text-gray-900">
              Intento #{submission.attemptNumber}
            </h4>
            <span className={`text-xs px-2 py-1 rounded-full font-semibold border ${statusBadge.color}`}>
              {statusBadge.text}
            </span>
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-600">
            <Calendar size={14} />
            <span>{formatDate(submission.submittedAt)}</span>
          </div>
        </div>
      </div>

      <div className="p-5 space-y-4">
        {/* Tu Explicación */}
        {submission.userNotes && (
          <div className="bg-blue-50 border-2 border-blue-200 rounded-lg">
            <div className="px-4 py-2 bg-blue-100 border-b border-blue-200">
              <p className="text-xs font-bold text-gray-900">Tu explicación</p>
            </div>
            <div className="p-4">
              <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                {submission.userNotes}
              </p>
            </div>
          </div>
        )}

        {/* Evidencias Adjuntas */}
        {submission.evidenceUrls && submission.evidenceUrls.length > 0 && (
          <div className="bg-blue-50 border-2 border-blue-200 rounded-lg">
            <div className="px-4 py-2 bg-blue-100 border-b border-blue-200">
              <p className="text-xs font-bold text-gray-900">
                Evidencias adjuntas ({submission.evidenceUrls.length})
              </p>
            </div>
            <div className="p-4">
              <ClaimEvidenceViewer evidenceUrls={submission.evidenceUrls} />
            </div>
          </div>
        )}

        {/* Revisión de la Contraparte */}
        {submission.peerReviewedBy && (
          <div className={`border-2 rounded-lg overflow-hidden ${
            submission.peerApproved 
              ? 'bg-green-50 border-green-300' 
              : 'bg-orange-50 border-orange-300'
          }`}>
            <div className={`px-4 py-2 border-b ${
              submission.peerApproved 
                ? 'bg-green-100 border-green-300' 
                : 'bg-orange-100 border-orange-300'
            }`}>
              <p className="text-xs font-bold text-gray-900">Revisión de la contraparte</p>
            </div>
            <div className="p-4 space-y-2">
              <p className={`text-sm font-bold ${
                submission.peerApproved ? 'text-green-700' : 'text-orange-700'
              }`}>
                {submission.peerApproved ? 'Pre-aprobado' : 'Objetado'}
              </p>
              {submission.peerReviewReason && (
                <div>
                  <p className="text-xs font-semibold text-gray-700 mb-1">Comentario:</p>
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">
                    {submission.peerReviewReason}
                  </p>
                </div>
              )}
              {submission.peerReviewedAt && (
                <p className={`text-xs text-gray-600 font-medium pt-3 border-t ${
                  submission.peerApproved ? 'border-green-200' : 'border-orange-200'
                }`}>
                  Revisado el: {formatDate(submission.peerReviewedAt)}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Decisión del Moderador */}
        {submission.reviewedBy && (
          <div className={`border-2 rounded-lg overflow-hidden ${
            submission.moderatorDecision === 'approve' ? 'bg-green-50 border-green-300' :
            submission.moderatorDecision === 'reject' ? 'bg-red-50 border-red-300' :
            'bg-yellow-50 border-yellow-300'
          }`}>
            <div className={`px-4 py-2 border-b ${
              submission.moderatorDecision === 'approve' ? 'bg-green-100 border-green-300' :
              submission.moderatorDecision === 'reject' ? 'bg-red-100 border-red-300' :
              'bg-yellow-100 border-yellow-300'
            }`}>
              <p className="text-xs font-bold text-gray-900">Decisión del moderador</p>
            </div>
            <div className="p-4 space-y-2">
              <p className={`text-sm font-bold ${
                submission.moderatorDecision === 'approve' ? 'text-green-700' :
                submission.moderatorDecision === 'reject' ? 'text-red-700' :
                'text-yellow-700'
              }`}>
                {submission.moderatorDecision === 'approve' && 'Aprobado'}
                {submission.moderatorDecision === 'reject' && 'Rechazado'}
                {submission.moderatorDecision === 'adjust' && 'Requiere ajustes'}
              </p>
              
              {submission.moderatorNotes && (
                <div>
                  <p className="text-xs font-semibold text-gray-700 mb-1">Motivo:</p>
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">
                    {submission.moderatorNotes}
                  </p>
                </div>
              )}
              
              {submission.reviewedAt && (
                <p className={`text-xs text-gray-600 font-medium pt-3 border-t ${
                  submission.moderatorDecision === 'approve' ? 'border-green-200' :
                  submission.moderatorDecision === 'reject' ? 'border-red-200' :
                  'border-yellow-200'
                }`}>
                  Revisado el: {formatDate(submission.reviewedAt)}
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UploadComplianceEvidenceModal;
