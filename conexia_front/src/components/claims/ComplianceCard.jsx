/**
 * ComplianceCard Component
 * Tarjeta para mostrar información de un compliance (compromiso)
 * Incluye: tipo, estado, deadline, instrucciones, evidencia y acciones
 */

'use client';

import React, { useMemo } from 'react';
import { Clock, Upload, CheckCircle, AlertTriangle, Download } from 'lucide-react';
import { ComplianceStatusBadge } from './ComplianceStatusBadge';
import { COMPLIANCE_TYPE_LABELS, COMPLIANCE_STATUS } from '@/constants/claims';
import { config } from '@/config';

export const ComplianceCard = ({
  compliance,
  currentUserId,
  onUploadEvidence,
  canUpload = true,
}) => {
  // Verificar si el usuario actual es el responsable del compliance
  const isResponsible = useMemo(() => {
    return String(compliance.responsibleUserId) === String(currentUserId);
  }, [compliance.responsibleUserId, currentUserId]);

  // Calcular días restantes hasta el deadline
  const daysRemaining = useMemo(() => {
    if (!compliance.deadline) return null;
    const now = new Date();
    const deadlineDate = new Date(compliance.deadline);
    const diffTime = deadlineDate - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  }, [compliance.deadline]);

  // Verificar si es urgente (quedan 2 días o menos y está pendiente)
  const isUrgent = useMemo(() => {
    return (
      daysRemaining !== null &&
      daysRemaining <= 2 &&
      daysRemaining >= 0 &&
      compliance.status === COMPLIANCE_STATUS.PENDING
    );
  }, [daysRemaining, compliance.status]);

  // Verificar si está vencido
  const isOverdue = useMemo(() => {
    return daysRemaining !== null && daysRemaining < 0;
  }, [daysRemaining]);

  // Obtener label del tipo de compliance
  const complianceTypeLabel =
    COMPLIANCE_TYPE_LABELS[compliance.complianceType] || compliance.complianceType;

  // Formatear fecha del deadline
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

  // Determinar si puede subir evidencia
  const showUploadButton =
    canUpload &&
    isResponsible &&
    compliance.status === COMPLIANCE_STATUS.PENDING;

  // Determinar clases del contenedor según urgencia
  const containerClasses = isUrgent
    ? 'border-red-300 bg-red-50'
    : isOverdue
      ? 'border-red-400 bg-red-50'
      : 'border-gray-200 bg-white';

  const textColorClass = isUrgent || isOverdue ? 'text-red-700' : 'text-gray-600';

  return (
    <div className={`border rounded-lg p-4 ${containerClasses} transition-colors`}>
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <h5 className="font-semibold text-gray-900">{complianceTypeLabel}</h5>
            <ComplianceStatusBadge status={compliance.status} />
          </div>
          {compliance.id && (
            <p className="text-xs text-gray-500">
              ID: {String(compliance.id).substring(0, 8)}...
            </p>
          )}
        </div>

        {isResponsible && (
          <span className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded-full font-medium whitespace-nowrap ml-2">
            Asignado a ti
          </span>
        )}
      </div>

      {/* Deadline */}
      {compliance.deadline && (
        <div className={`flex items-center gap-2 mb-3 ${textColorClass}`}>
          <Clock size={14} />
          <span className="text-sm font-medium">
            Plazo: {formatDate(compliance.deadline)}
          </span>
          {daysRemaining !== null && daysRemaining >= 0 && (
            <span
              className={`text-xs ${isUrgent ? 'text-red-600 font-semibold' : 'text-gray-500'}`}
            >
              ({daysRemaining} {daysRemaining === 1 ? 'día' : 'días'} restante
              {daysRemaining !== 1 ? 's' : ''})
            </span>
          )}
          {isOverdue && (
            <span className="text-xs text-red-600 font-semibold">
              (¡Vencido hace {Math.abs(daysRemaining)} día{Math.abs(daysRemaining) !== 1 ? 's' : ''}!)
            </span>
          )}
        </div>
      )}

      {/* Instrucciones del Moderador */}
      {compliance.moderatorInstructions && (
        <div className="bg-blue-50 border border-blue-200 p-3 rounded-md mb-3">
          <p className="text-xs font-semibold text-blue-900 mb-1">
            Instrucciones del Moderador:
          </p>
          <p className="text-sm text-blue-800 whitespace-pre-wrap">
            {compliance.moderatorInstructions}
          </p>
        </div>
      )}

      {/* Evidencia Subida (si existe) */}
      {compliance.evidenceUrls && compliance.evidenceUrls.length > 0 && (
        <div className="mb-3">
          <p className="text-xs font-semibold text-gray-700 mb-2">
            Evidencia enviada ({compliance.evidenceUrls.length}):
          </p>
          <div className="flex flex-wrap gap-2">
            {compliance.evidenceUrls.map((url, idx) => (
              <a
                key={idx}
                href={`${config.IMAGE_URL}${url}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 underline hover:no-underline transition-colors"
              >
                <Download size={12} />
                Archivo {idx + 1}
              </a>
            ))}
          </div>
          {compliance.userNotes && (
            <div className="mt-2 p-2 bg-gray-50 rounded border border-gray-200">
              <p className="text-xs font-semibold text-gray-600 mb-1">
                Notas del usuario:
              </p>
              <p className="text-sm text-gray-700 italic whitespace-pre-wrap">
                "{compliance.userNotes}"
              </p>
            </div>
          )}
          {compliance.submittedAt && (
            <p className="text-xs text-gray-500 mt-1">
              Enviado el {formatDate(compliance.submittedAt)}
            </p>
          )}
        </div>
      )}

      {/* Botón de Acción o Estado */}
      <div className="mt-3">
        {showUploadButton ? (
          <button
            onClick={onUploadEvidence}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-conexia-green text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <Upload size={16} />
            <span className="font-medium">Subir Evidencia de Cumplimiento</span>
          </button>
        ) : compliance.status === COMPLIANCE_STATUS.SUBMITTED ? (
          <div className="flex items-center gap-2 text-blue-600 text-sm bg-blue-50 p-2 rounded-lg border border-blue-200">
            <CheckCircle size={16} />
            <span>Evidencia enviada, esperando revisión del moderador</span>
          </div>
        ) : compliance.status === COMPLIANCE_STATUS.APPROVED ? (
          <div className="flex items-center gap-2 text-green-600 text-sm font-semibold bg-green-50 p-2 rounded-lg border border-green-200">
            <CheckCircle size={16} />
            <span>✅ Compromiso cumplido y aprobado</span>
          </div>
        ) : compliance.status === COMPLIANCE_STATUS.REJECTED ? (
          <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 p-2 rounded-lg border border-red-200">
            <AlertTriangle size={16} />
            <span>Evidencia rechazada - Por favor revisa y vuelve a enviar</span>
          </div>
        ) : (compliance.status === COMPLIANCE_STATUS.OVERDUE ||
            compliance.status === COMPLIANCE_STATUS.WARNING ||
            compliance.status === COMPLIANCE_STATUS.ESCALATED) ? (
          <div className="flex items-center gap-2 text-red-600 text-sm font-semibold bg-red-50 p-2 rounded-lg border border-red-200">
            <AlertTriangle size={16} />
            <span>⚠️ Compromiso vencido - Contacta al moderador urgentemente</span>
          </div>
        ) : null}
      </div>

      {/* Información de rechazo si existe */}
      {compliance.rejectionReason && (
        <div className="mt-3 p-3 bg-orange-50 border border-orange-200 rounded-lg">
          <p className="text-xs font-semibold text-orange-900 mb-1">
            Motivo del rechazo:
          </p>
          <p className="text-sm text-orange-800 whitespace-pre-wrap">
            {compliance.rejectionReason}
          </p>
        </div>
      )}
    </div>
  );
};

export default ComplianceCard;
