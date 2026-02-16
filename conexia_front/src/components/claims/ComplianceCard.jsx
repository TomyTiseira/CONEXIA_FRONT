/**
 * ComplianceCard Component
 * Tarjeta para mostrar información de un compliance (compromiso)
 * Incluye: tipo, estado, deadline, instrucciones, evidencia y acciones
 */

'use client';

import React, { useMemo, useState } from 'react';
import { Clock, Upload, CheckCircle, AlertTriangle, Download, Scale, ChevronDown, ChevronUp, XCircle, FileText, Calendar, Info, AlertCircle } from 'lucide-react';
import { ComplianceStatusBadge } from './ComplianceStatusBadge';
import { ClaimEvidenceViewer } from './ClaimEvidenceViewer';
import { COMPLIANCE_TYPE_LABELS, COMPLIANCE_STATUS } from '@/constants/claims';
import { config } from '@/config';

export const ComplianceCard = ({
  compliance,
  currentUserId,
  onUploadEvidence,
  onReviewCompliance,
  onModeratorReviewCompliance, // Nuevo prop para moderadores
  canUpload = true,
  claimant = null,
  otherUser = null,
  showActionButton = false,
  actionButtonText = '',
  onAction = null,
  hideFooter = false,
  showCompactHeader = false, // Nuevo prop para ocultar el header cuando se usa en acordeón
  isModerator = false, // Nuevo prop para identificar moderadores
  hideWarnings = false, // Nuevo prop para ocultar advertencias/rechazos
}) => {
  // Verificar si el usuario actual es el responsable del compliance
  const isResponsible = useMemo(() => {
    return String(compliance.responsibleUserId) === String(currentUserId);
  }, [compliance.responsibleUserId, currentUserId]);

  // Determinar quién es el responsable del compromiso
  const responsibleUser = useMemo(() => {
    if (!compliance.responsibleUserId) return null;
    const responsibleId = String(compliance.responsibleUserId);
    
    if (claimant?.profile?.id && String(claimant.profile.id) === responsibleId) {
      return claimant;
    }
    if (otherUser?.profile?.id && String(otherUser.profile.id) === responsibleId) {
      return otherUser;
    }
    return null;
  }, [compliance.responsibleUserId, claimant, otherUser]);

  // Obtener nombre completo del responsable
  const getResponsibleName = () => {
    if (!responsibleUser?.profile) return 'Usuario';
    
    // Obtener solo el primer nombre
    const fullName = responsibleUser.profile.name || '';
    const firstName = fullName.trim().split(/\s+/)[0] || '';
    
    // Obtener solo el primer apellido
    const fullLastName = responsibleUser.profile.lastName || '';
    const firstLastName = fullLastName.trim().split(/\s+/)[0] || '';
    
    return `${firstName} ${firstLastName}`.trim() || 'Usuario';
  };

  // Obtener avatar del responsable
  const getResponsibleAvatar = () => {
    if (!responsibleUser?.profile?.profilePicture) return '/images/default-avatar.png';
    const imagePath = responsibleUser.profile.profilePicture;
    if (imagePath.startsWith('http')) return imagePath;
    return `${config.IMAGE_URL}/${imagePath}`;
  };

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
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Determinar si puede subir evidencia usando availableActions del backend
  const canSubmitEvidence = compliance.availableActions?.includes('submit_evidence');
  const showUploadButton = canUpload && canSubmitEvidence;

  // Determinar si puede revisar el compromiso (peer review)
  const canPeerReview = compliance.availableActions?.includes('peer_approve') || 
                        compliance.availableActions?.includes('peer_object');
  const showReviewButton = canPeerReview && onReviewCompliance;

  // Determinar si puede revisar como moderador
  const canModeratorReview = isModerator && compliance.availableActions?.includes('review_compliance');
  const showModeratorReviewButton = canModeratorReview && onModeratorReviewCompliance;

  // Determinar clases del contenedor según urgencia
  const containerClasses = isUrgent
    ? 'border-red-300 bg-red-50'
    : isOverdue
      ? 'border-red-400 bg-red-50'
      : 'border-gray-200 bg-white';

  const textColorClass = isUrgent || isOverdue ? 'text-red-700' : 'text-gray-600';

  return (
    <div className={showCompactHeader ? '' : 'bg-white border-2 border-purple-200 rounded-xl shadow-sm overflow-hidden'}>
      {/* Header - Solo mostrar si no es compacto */}
      {!showCompactHeader && (
        <div className="px-5 py-4 bg-purple-100 border-b border-purple-200">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <h5 className="font-bold text-lg text-gray-900">{complianceTypeLabel}</h5>
                <ComplianceStatusBadge status={compliance.status} />
              </div>
            </div>

            {isResponsible && (
              <span className="text-xs bg-purple-600 text-white px-3 py-1 rounded-full font-semibold whitespace-nowrap ml-2">
                Tu compromiso
              </span>
            )}
          </div>
        </div>
      )}

      {/* Content */}
      <div className="p-5 space-y-4">
        {/* Información del Compromiso */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 space-y-4">
          {/* ID del Compromiso */}
          {compliance.id && (
            <div className="pb-4 border-b border-gray-300">
              <p className="text-xs font-medium text-gray-600 mb-2">ID del Compromiso:</p>
              <code className="text-sm bg-purple-100 text-purple-900 px-3 py-1.5 rounded-lg font-mono font-semibold border border-purple-300 inline-block">
                {String(compliance.id)}
              </code>
            </div>
          )}

          {/* Responsable del Compromiso */}
          {responsibleUser && (
            <div className={`${compliance.id ? 'pb-4 border-b border-gray-300' : 'pb-4 border-b border-gray-300'}`}>
              <p className="text-xs font-medium text-gray-600 mb-2">Responsable:</p>
              <div className="flex items-center gap-2">
                <img
                  src={getResponsibleAvatar()}
                  onError={(e) => {
                    e.currentTarget.src = '/images/default-avatar.png';
                  }}
                  alt={getResponsibleName()}
                  className="w-8 h-8 rounded-full object-cover flex-shrink-0 border-2 border-gray-300"
                />
                <p className="text-sm font-semibold text-gray-900">{getResponsibleName()}</p>
              </div>
            </div>
          )}

          {/* Deadline */}
          {compliance.deadline && (
            <div className={responsibleUser ? '' : ''}>
              <div className="flex items-center gap-2 mb-2">
                <Clock size={16} className="text-purple-600" />
                <span className="text-sm font-medium text-gray-900">
                  Plazo: {formatDate(compliance.deadline)}
                </span>
              </div>
              {daysRemaining !== null && daysRemaining >= 0 && (
                <div className="flex items-center gap-2 flex-wrap ml-6">
                  <span className="text-xs text-gray-600">
                    {daysRemaining} {daysRemaining === 1 ? 'día' : 'días'} restante{daysRemaining !== 1 ? 's' : ''}
                  </span>
                  {isResponsible && compliance.status === COMPLIANCE_STATUS.PENDING && (
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                        daysRemaining > 3
                          ? 'bg-green-100 text-green-700 border border-green-300'
                          : daysRemaining > 0
                          ? 'bg-yellow-100 text-yellow-700 border border-yellow-300'
                          : 'bg-red-100 text-red-700 border border-red-300'
                      }`}
                    >
                      {daysRemaining > 3 ? '✓ A tiempo' : daysRemaining > 0 ? '⚠ Urgente' : '🚨 Vencido'}
                    </span>
                  )}
                </div>
              )}
              {isOverdue && (
                <div className="flex items-center gap-2 flex-wrap ml-6">
                  <span className="text-xs text-red-600 font-semibold">
                    ¡Vencido hace {Math.abs(daysRemaining)} día{Math.abs(daysRemaining) !== 1 ? 's' : ''}!
                  </span>
                  {isResponsible && compliance.status === COMPLIANCE_STATUS.PENDING && (
                    <span className="text-xs px-2 py-0.5 rounded-full font-semibold bg-red-100 text-red-700 border border-red-300">
                      Vencido
                    </span>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Instrucciones del Moderador */}
          {compliance.moderatorInstructions && (
            <div className={compliance.deadline ? 'pt-4 border-t border-gray-300' : ''}>
              <p className="text-xs font-medium text-gray-600 mb-2">
                Instrucciones del Moderador:
              </p>
              <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                {compliance.moderatorInstructions}
              </p>
            </div>
          )}
        </div>

        {/* Información de Vencimiento - Solo si está vencido */}
        {!hideWarnings && compliance.overdueStatus && compliance.overdueStatus !== 'NOT_OVERDUE' && (
          <InformacionVencimiento
            compliance={compliance}
            isResponsible={isResponsible}
          />
        )}

        {/* Historial de Rechazos - Solo si hay rechazos previos y no está oculto */}
        {!hideWarnings && compliance.rejectionCount > 0 && (
          <HistorialRechazos
            compliance={compliance}
            isResponsible={isResponsible}
          />
        )}

        {/* Información del Sistema de Intentos - Solo si no tiene rechazos pero puede subir evidencia */}
        {!hideWarnings && compliance.rejectionCount === 0 && isResponsible && canUpload && compliance.status === COMPLIANCE_STATUS.PENDING && (
          <div className="bg-blue-50 border-2 border-blue-300 rounded-xl overflow-hidden">
            <div className="px-4 py-3 bg-blue-100 border-b border-blue-300">
              <div className="flex items-center gap-2">
                <Info size={20} className="text-blue-700" />
                <p className="text-base font-bold text-gray-900">
                  Sistema de Intentos
                </p>
              </div>
            </div>
            <div className="p-4 space-y-3">
              <p className="text-sm text-gray-700">
                Tienes <span className="font-bold text-blue-700">3 intentos</span> para cumplir este compromiso correctamente.
              </p>
              <div className="bg-white border border-blue-200 rounded-lg p-3">
                <p className="text-xs font-bold text-gray-700 mb-2">Consecuencias por rechazo:</p>
                <ul className="space-y-1.5 text-xs text-gray-700">
                  <li className="flex items-start gap-2">
                    <span className="text-yellow-600 font-bold">1° rechazo:</span>
                    <span>Advertencia y oportunidad de reenviar</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-orange-600 font-bold">2° rechazo:</span>
                    <span>Suspensión de cuenta por 15 días</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-600 font-bold">3° rechazo:</span>
                    <span>Bloqueo permanente de cuenta</span>
                  </li>
                </ul>
              </div>
              <p className="text-xs text-blue-800 font-medium bg-white rounded px-2 py-1.5 border border-blue-300">
                Revisa cuidadosamente las instrucciones del moderador antes de subir tu evidencia.
              </p>
            </div>
          </div>
        )}

        {/* Evidencia Subida (si existe) */}
        {compliance.evidenceUrls && compliance.evidenceUrls.length > 0 && (
          <div className="bg-purple-50 border-2 border-purple-300 rounded-xl overflow-hidden">
            <div className="px-4 py-3 bg-purple-200 border-b border-purple-300">
              <h4 className="font-bold text-base text-gray-900">
                Cumplimiento Enviado
              </h4>
            </div>
            <div className="p-4 space-y-4">
              {/* Descripción/Notas del usuario */}
              {compliance.userNotes && (
                <div>
                  <p className="text-xs font-bold text-gray-700 mb-2">Descripción del Cumplimiento:</p>
                  <div className="bg-white border border-purple-200 rounded-lg p-3">
                    <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                      {compliance.userNotes}
                    </p>
                  </div>
                </div>
              )}

              {/* Evidencias Adjuntas */}
              <div>
                <p className="text-xs font-bold text-gray-700 mb-2">
                  Evidencias Adjuntas ({compliance.evidenceUrls.length}):
                </p>
                <ClaimEvidenceViewer evidenceUrls={compliance.evidenceUrls} />
              </div>

              {/* Fecha de envío */}
              {compliance.submittedAt && (
                <p className="text-xs text-gray-600 font-medium pt-3 border-t border-purple-200">
                  Enviado el: {formatDate(compliance.submittedAt)}
                </p>
              )}
            </div>
          </div>
          )}

        {/* Información de Peer Review (preaprobación/prerechazo) */}
        {compliance.peerReviewReason && compliance.peerReviewedAt && (
          <div className={`border-2 rounded-xl overflow-hidden ${
            compliance.peerApproved 
              ? 'bg-green-50 border-green-300' 
              : 'bg-orange-50 border-orange-300'
          }`}>
            <div className={`px-4 py-3 border-b ${
              compliance.peerApproved 
                ? 'bg-green-100 border-green-300' 
                : 'bg-orange-100 border-orange-300'
            }`}>
              <p className={`text-sm font-bold ${
                compliance.peerApproved ? 'text-green-900' : 'text-orange-900'
              }`}>
                Revisión de la otra parte
              </p>
            </div>
            <div className="p-4 space-y-3">
              <div>
                <p className="text-xs font-bold text-gray-700 mb-2">
                  {compliance.peerApproved ? 'Estado:' : 'Estado:'}
                </p>
                <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${
                  compliance.peerApproved
                    ? 'bg-green-100 text-green-800 border border-green-400'
                    : 'bg-orange-100 text-orange-800 border border-orange-400'
                }`}>
                  {compliance.peerApproved ? 'Preaprobado' : 'Prerechazado'}
                </span>
              </div>
              
              <div>
                <p className="text-xs font-bold text-gray-700 mb-2">
                  {compliance.peerApproved ? 'Comentarios:' : 'Descripción del prerechazo:'}
                </p>
                <div className={`bg-white border-2 rounded-lg p-4 ${
                  compliance.peerApproved ? 'border-green-300' : 'border-orange-300'
                }`}>
                  <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                    {compliance.peerReviewReason}
                  </p>
                </div>
              </div>
              
              {compliance.peerReviewedAt && (
                <p className={`text-xs text-gray-600 font-medium pt-3 border-t border-dashed flex items-center gap-1 ${
                  compliance.peerApproved ? 'border-green-300' : 'border-orange-300'
                }`}>
                  <Clock size={12} />
                  Revisado el {new Date(compliance.peerReviewedAt).toLocaleDateString('es-ES', {
                    day: '2-digit',
                    month: 'long',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Decisión del Moderador - Aprobación */}
        {compliance.status === COMPLIANCE_STATUS.APPROVED && (
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-300 rounded-xl overflow-hidden shadow-md">
            <div className="px-4 py-3 bg-gradient-to-r from-green-100 to-emerald-100 border-b border-green-300">
              <div className="flex items-center gap-2">
                <CheckCircle size={20} className="text-green-700" />
                <p className="text-base font-bold text-green-900">
                  Compromiso Aprobado por Moderador
                </p>
              </div>
            </div>
            <div className="p-4">
              <div className="bg-white border-2 border-green-300 rounded-lg p-4 mb-3">
                <p className="text-sm text-green-800 font-bold flex items-center gap-2">
                  <CheckCircle size={16} />
                  El moderador ha aprobado el cumplimiento de este compromiso
                </p>
              </div>
              {compliance.moderatorNotes && (
                <div>
                  <p className="text-xs font-bold text-gray-700 mb-2">Notas del Moderador:</p>
                  <div className="bg-white border border-green-200 rounded-lg p-3">
                    <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                      {compliance.moderatorNotes}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Decisión del Moderador - Rechazo */}
        {compliance.status === COMPLIANCE_STATUS.REJECTED && (
          <div className="bg-red-50 border-2 border-red-300 rounded-xl overflow-hidden">
            <div className="px-4 py-3 bg-red-100 border-b border-red-300">
              <p className="text-sm font-bold text-red-900">
                Revisión del moderador
              </p>
            </div>
            <div className="p-4 space-y-3">
              {compliance.moderatorNotes && (
                <div>
                  <p className="text-xs font-bold text-gray-700 mb-2">Razón del rechazo:</p>
                  <div className="bg-white border-2 border-red-300 rounded-lg p-4">
                    <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                      {compliance.moderatorNotes}
                    </p>
                  </div>
                </div>
              )}
              
              {/* Estado Final según Rechazos */}
              {(compliance.suspensionTriggered || compliance.banTriggered) && (
                <div className="space-y-2">
                  {compliance.banTriggered && (
                    <div className="bg-black text-white p-3 rounded-lg border-2 border-red-600">
                      <p className="text-sm font-bold flex items-center gap-2">
                        <AlertTriangle size={16} />
                        Cuenta baneada permanentemente
                      </p>
                      <p className="text-xs mt-1">Se ha superado el límite de rechazos permitidos</p>
                    </div>
                  )}
                  
                  {compliance.suspensionTriggered && !compliance.banTriggered && (
                    <div className="bg-orange-100 text-orange-900 p-3 rounded-lg border-2 border-orange-400">
                      <p className="text-sm font-bold flex items-center gap-2">
                        <AlertTriangle size={16} />
                        Cuenta suspendida 15 días
                      </p>
                      <p className="text-xs mt-1">Siguiente rechazo resultará en ban permanente</p>
                    </div>
                  )}
                </div>
              )}

              {compliance.reviewedAt && (
                <p className="text-xs text-gray-600 font-medium pt-3 border-t border-dashed border-red-300 flex items-center gap-1">
                  <Clock size={12} />
                  Revisado el {new Date(compliance.reviewedAt).toLocaleDateString('es-ES', {
                    day: '2-digit',
                    month: 'long',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Footer - Botón de Acción o Estado */}
      {!hideFooter && (
        <div className="px-5 py-4 bg-gray-50 border-t border-purple-200">
          {showActionButton && onAction ? (
            <button
              onClick={onAction}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium"
            >
              <CheckCircle size={16} />
              <span>{actionButtonText || 'Seleccionar'}</span>
            </button>
          ) : showModeratorReviewButton ? (
            <button
              onClick={() => onModeratorReviewCompliance(compliance)}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium"
            >
              <Scale size={16} />
              <span>Revisar Compromiso (Moderador)</span>
            </button>
          ) : showUploadButton ? (
            <button
              onClick={onUploadEvidence}
              className={`w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg transition-colors text-sm font-medium ${
                compliance.rejectionCount > 0
                  ? 'bg-yellow-600 text-white hover:bg-yellow-700'
                  : 'bg-purple-600 text-white hover:bg-purple-700'
              }`}
            >
              <Upload size={16} />
              <span>{compliance.rejectionCount > 0 ? 'Reenviar evidencia (Intento ' + compliance.currentAttempt + '/' + compliance.maxAttempts + ')' : 'Subir evidencia'}</span>
            </button>
          ) : showReviewButton ? (
            <button
              onClick={() => onReviewCompliance(compliance)}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium"
            >
              <CheckCircle size={16} />
              <span>Revisar Compromiso</span>
            </button>
          ) : compliance.status === COMPLIANCE_STATUS.SUBMITTED ? (
            <div className="flex items-center gap-2 text-purple-700 text-sm font-medium bg-purple-50 px-3 py-2 rounded-lg border-2 border-purple-200">
              <CheckCircle size={16} className="flex-shrink-0" />
              <span>Evidencia enviada, esperando revisión</span>
            </div>
          ) : compliance.status === COMPLIANCE_STATUS.APPROVED ? (
            <div className="flex items-center gap-2 text-green-700 text-sm font-bold bg-green-50 px-3 py-2 rounded-lg border-2 border-green-200">
              <CheckCircle size={16} className="flex-shrink-0" />
              <span>Compromiso cumplido y aprobado</span>
            </div>
          ) : (compliance.status === COMPLIANCE_STATUS.OVERDUE ||
              compliance.status === COMPLIANCE_STATUS.WARNING ||
              compliance.status === COMPLIANCE_STATUS.ESCALATED) ? (
            <div className="flex items-center gap-2 text-red-700 text-sm font-bold bg-red-50 px-3 py-2 rounded-lg border-2 border-red-200">
              <AlertTriangle size={16} className="flex-shrink-0" />
              <span>Compromiso vencido - Contacta al moderador urgentemente</span>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
};

// Componente auxiliar para mostrar información de vencimiento
const InformacionVencimiento = ({ compliance, isResponsible }) => {
  const { overdueStatus, daysOverdue, canStillSubmit } = compliance;

  // Determinar configuración según el estado
  const getVencimientoConfig = () => {
    switch (overdueStatus) {
      case 'FIRST_WARNING':
        return {
          bgColor: 'bg-yellow-50',
          borderColor: 'border-yellow-400',
          headerBg: 'bg-yellow-100',
          headerBorder: 'border-yellow-300',
          iconColor: 'text-yellow-700',
          title: 'Primera Advertencia - Plazo Vencido',
          diasAdicionales: 3,
          mensaje: isResponsible 
            ? 'Tu plazo venció. Se te otorgaron 3 días adicionales para cumplir.'
            : 'El plazo venció. Se otorgaron 3 días adicionales para cumplir.',
          consecuencia: 'Si no se cumple en los próximos 3 días, la cuenta será suspendida por 15 días.',
          alertColor: 'bg-yellow-100 text-yellow-900 border-yellow-400',
        };
      
      case 'SUSPENDED':
        return {
          bgColor: 'bg-orange-50',
          borderColor: 'border-orange-500',
          headerBg: 'bg-orange-100',
          headerBorder: 'border-orange-400',
          iconColor: 'text-orange-700',
          title: 'Cuenta Suspendida - Última Oportunidad',
          diasAdicionales: 2,
          mensaje: isResponsible
            ? 'Tu cuenta fue suspendida por 15 días. Tienes 2 días adicionales finales para subir evidencia.'
            : 'La cuenta fue suspendida por 15 días. Hay 2 días adicionales finales para subir evidencia.',
          consecuencia: 'Si no se cumple en los próximos 2 días, la cuenta será baneada permanentemente.',
          alertColor: 'bg-orange-100 text-orange-900 border-orange-500',
        };
      
      case 'BANNED':
        return {
          bgColor: 'bg-red-50',
          borderColor: 'border-red-600',
          headerBg: 'bg-red-100',
          headerBorder: 'border-red-500',
          iconColor: 'text-red-700',
          titleColor: 'text-red-900',
          title: 'Usuario Baneado Permanentemente',
          mensaje: isResponsible
            ? 'Tu cuenta fue baneada permanentemente por incumplimiento grave.'
            : 'La cuenta fue baneada permanentemente por incumplimiento grave.',
          consecuencia: 'Ya no se puede subir evidencia ni acceder a la plataforma. Contactar con soporte si esto es un error.',
          alertColor: 'bg-red-100 text-red-900 border-red-600',
          textColor: 'text-red-800',
        };
      
      default:
        return null;
    }
  };

  const config = getVencimientoConfig();
  if (!config) return null;

  const isBanned = overdueStatus === 'BANNED';

  return (
    <div className={`border-2 rounded-xl overflow-hidden shadow-md ${config.bgColor} ${config.borderColor}`}>
      <div className={`px-4 py-3 border-b ${config.headerBg} ${config.headerBorder}`}>
        <div className="flex items-center gap-2">
          <AlertCircle size={20} className={config.iconColor} />
          <p className={`text-base font-bold ${config.titleColor || 'text-gray-900'}`}>
            {config.title}
          </p>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Información de días vencidos */}
        <div className={`border-2 rounded-lg p-4 ${isBanned ? 'bg-white border-red-500' : 'bg-white'} ${config.borderColor}`}>
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className={`text-xs font-medium mb-1 ${isBanned ? 'text-red-600' : 'text-gray-600'}`}>
                Días vencidos:
              </p>
              <p className={`text-2xl font-bold ${isBanned ? 'text-red-700' : 'text-red-700'}`}>
                {daysOverdue} {daysOverdue === 1 ? 'día' : 'días'}
              </p>
            </div>
            {!isBanned && config.diasAdicionales && (
              <div className="text-right">
                <p className="text-xs font-medium text-gray-600 mb-1">
                  Días adicionales:
                </p>
                <p className={`text-2xl font-bold ${
                  overdueStatus === 'FIRST_WARNING' ? 'text-yellow-700' : 'text-orange-700'
                }`}>
                  {config.diasAdicionales}
                </p>
              </div>
            )}
          </div>

          <p className={`text-sm ${isBanned ? config.textColor : 'text-gray-700'}`}>
            {config.mensaje}
          </p>
        </div>

        {/* Consecuencias */}
        {config.consecuencia && (
          <div className={`border-2 rounded-lg p-4 ${config.alertColor}`}>
            <div className="flex items-start gap-2">
              <AlertTriangle size={18} className="flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-bold mb-1">
                  {isBanned ? 'Consecuencias' : 'Advertencia'}
                </p>
                <p className="text-sm">
                  {config.consecuencia}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Estado de capacidad de envío */}
        {!isBanned && canStillSubmit !== undefined && (
          <div className={`border-2 rounded-lg p-3 ${
            canStillSubmit 
              ? 'bg-blue-50 border-blue-300' 
              : 'bg-gray-100 border-gray-400'
          }`}>
            <div className="flex items-center gap-2">
              <Info size={16} className={canStillSubmit ? 'text-blue-700' : 'text-gray-700'} />
              <p className={`text-sm font-medium ${
                canStillSubmit ? 'text-blue-900' : 'text-gray-700'
              }`}>
                {canStillSubmit 
                  ? 'Aún puedes subir evidencia para cumplir este compromiso'
                  : 'El plazo para subir evidencia ha expirado completamente'}
              </p>
            </div>
          </div>
        )}

        {/* Mensaje de baneo */}
        {isBanned && (
          <div className="bg-red-100 border-2 border-red-500 rounded-lg p-3">
            <div className="flex items-center gap-2">
              <XCircle size={16} className="text-red-700" />
              <p className="text-sm font-medium text-red-900">
                No se puede realizar ninguna acción en este compromiso
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Componente auxiliar para mostrar el historial de rechazos de manera clara
const HistorialRechazos = ({ compliance, isResponsible }) => {
  const [expanded, setExpanded] = useState(false);

  const currentAttempt = compliance.currentAttempt || 1;
  const rejectionCount = compliance.rejectionCount || 0;
  const maxAttempts = compliance.maxAttempts || 3;
  const submissions = compliance.submissions || [];

  const getSiguienteConsequencia = () => {
    if (rejectionCount === 0) return 'Advertencia';
    if (rejectionCount === 1) return 'Suspensión de cuenta por 15 días';
    if (rejectionCount === 2) return 'Bloqueo permanente de cuenta';
    return null;
  };

  // Formatear fecha
  const formatDate = (dateString) => {
    if (!dateString) return 'Sin fecha';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('es-ES', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  return (
    <div className={`border-2 rounded-xl overflow-hidden shadow-md ${
      rejectionCount === 1 ? 'bg-yellow-50 border-yellow-400' :
      rejectionCount === 2 ? 'bg-red-50 border-red-500' :
      'bg-yellow-50 border-yellow-300'
    }`}>
      <div className={`px-4 py-3 border-b ${
        rejectionCount === 1 ? 'bg-yellow-100 border-yellow-300' :
        rejectionCount === 2 ? 'bg-red-100 border-red-400' :
        'bg-yellow-100 border-yellow-300'
      }`}>
        <div className="flex items-center gap-2">
          <AlertTriangle size={20} className={
            rejectionCount === 1 ? 'text-yellow-700' :
            rejectionCount === 2 ? 'text-red-700' :
            'text-yellow-700'
          } />
          <p className="text-base font-bold text-gray-900">
            {isResponsible ? 'Advertencia de Reenvío' : 'Información de Intentos'}
          </p>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Información del intento actual - VISIBLE PARA TODOS */}
        <div className={`border-2 rounded-lg p-4 ${
          rejectionCount === 1 ? 'bg-white border-yellow-300' :
          rejectionCount === 2 ? 'bg-white border-red-400' :
          'bg-white border-yellow-300'
        }`}>
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-xs font-medium text-gray-600 mb-1">Intento actual:</p>
              <p className="text-2xl font-bold text-purple-700">
                {currentAttempt} de {maxAttempts}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs font-medium text-gray-600 mb-1">Rechazos previos:</p>
              <p className="text-2xl font-bold text-red-700">
                {rejectionCount}
              </p>
            </div>
          </div>
          
          {/* Barra de progreso */}
          <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden mb-3">
            <div
              className={`h-full transition-all duration-300 ${
                currentAttempt === 1 ? 'bg-green-500' :
                currentAttempt === 2 ? 'bg-yellow-500' :
                'bg-red-500'
              }`}
              style={{ width: `${(currentAttempt / maxAttempts) * 100}%` }}
            />
          </div>

          <p className="text-sm text-gray-700">
            {isResponsible 
              ? 'Tu compromiso fue rechazado. Corrige la evidencia y reenvíala cuidadosamente.' 
              : 'Este compromiso ha sido rechazado y está en proceso de reenvío.'}
          </p>
        </div>

        {/* SIGUIENTE CONSECUENCIA - VISIBLE PARA TODOS */}
        {getSiguienteConsequencia() && (
          <div className={`border-2 rounded-lg p-4 ${
            rejectionCount === 1 ? 'bg-orange-50 border-orange-400' :
            rejectionCount === 2 ? 'bg-red-50 border-red-500' :
            'bg-yellow-50 border-yellow-400'
          }`}>
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle size={18} className={
                rejectionCount === 1 ? 'text-orange-700' : 'text-red-700'
              } />
              <p className="text-sm font-bold text-gray-900">
                Siguiente paso de advertencia
              </p>
            </div>
            <p className={`text-sm font-bold ${
              rejectionCount === 1 ? 'text-orange-900' :
              rejectionCount === 2 ? 'text-red-900' :
              'text-yellow-900'
            }`}>
              {isResponsible ? 'Si tu próximo envío es rechazado:' : 'Si el próximo envío es rechazado:'}
            </p>
            <p className={`text-base font-bold mt-1 ${
              rejectionCount === 1 ? 'text-orange-900' :
              rejectionCount === 2 ? 'text-red-900' :
              'text-yellow-900'
            }`}>
              {getSiguienteConsequencia()}
            </p>
            {rejectionCount === 2 && (
              <p className="text-xs text-red-800 mt-2 font-medium bg-white rounded px-2 py-1 border border-red-300">
                {isResponsible 
                  ? 'Esta es tu última oportunidad. Revisa cuidadosamente antes de enviar.' 
                  : 'Esta es la última oportunidad antes de un bloqueo permanente.'}
              </p>
            )}
          </div>
        )}

        {/* Razón del último rechazo */}
        {compliance.moderatorNotes && (
          <div>
            <p className="text-xs font-bold text-gray-700 mb-2">Razón del último rechazo:</p>
            <div className={`border-2 rounded-lg p-3 ${
              rejectionCount === 1 ? 'bg-white border-yellow-300' :
              rejectionCount === 2 ? 'bg-white border-red-400' :
              'bg-white border-yellow-300'
            }`}>
              <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                {compliance.moderatorNotes}
              </p>
            </div>
          </div>
        )}

        {/* Historial completo desplegable - VISIBLE PARA TODOS */}
        {submissions && submissions.length > 0 && (
          <div className="bg-white border-2 border-gray-300 rounded-xl overflow-hidden">
            <button
              type="button"
              onClick={() => setExpanded(!expanded)}
              className="w-full px-4 py-3 bg-gray-100 border-b border-gray-300 flex items-center justify-between hover:bg-gray-200 transition-colors"
            >
              <div className="flex items-center gap-2">
                <FileText size={16} className="text-gray-700" />
                <span className="text-sm font-bold text-gray-900">
                  Historial de Intentos ({submissions.length})
                </span>
              </div>
              {expanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
            </button>

            {expanded && (
              <div className="p-4 space-y-4">
                {submissions
                  .sort((a, b) => b.attemptNumber - a.attemptNumber)
                  .map((submission, index) => (
                    <SubmissionHistoryCard
                      key={submission.id || index}
                      submission={submission}
                      formatDate={formatDate}
                    />
                  ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// Componente para mostrar cada submission en el historial
const SubmissionHistoryCard = ({ submission, formatDate }) => {
  const [isExpanded, setIsExpanded] = useState(false);

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
      {/* Header del submission - Clickeable para expandir/colapsar */}
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-5 py-3 bg-gray-100 border-b border-gray-300 hover:bg-gray-200 transition-colors"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h4 className="text-sm font-bold text-gray-900">
              Intento {submission.attemptNumber}
            </h4>
            <span className={`text-xs px-2 py-1 rounded-full font-semibold border ${statusBadge.color}`}>
              {statusBadge.text}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-xs text-gray-600">
              <Clock size={14} />
              <span>{formatDate(submission.submittedAt)}</span>
            </div>
            {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </div>
        </div>
      </button>

      {/* Contenido expandible */}
      {isExpanded && (
        <div className="p-5 space-y-4">
          {/* Evidencia Enviada (Explicación + Evidencias en un solo componente) */}
          {(submission.userNotes || (submission.evidenceUrls && submission.evidenceUrls.length > 0)) && (
            <div className="bg-blue-50 border-2 border-blue-200 rounded-lg">
              <div className="px-4 py-2 bg-blue-100 border-b border-blue-200">
                <p className="text-xs font-bold text-gray-900">Evidencia enviada</p>
              </div>
              <div className="p-4 space-y-4">
                {/* Explicación */}
                {submission.userNotes && (
                  <div>
                    <p className="text-xs font-semibold text-gray-700 mb-2">Explicación del cumplimiento:</p>
                    <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                      {submission.userNotes}
                    </p>
                  </div>
                )}

                {/* Evidencias Adjuntas */}
                {submission.evidenceUrls && submission.evidenceUrls.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-gray-700 mb-2">
                      Archivos adjuntos ({submission.evidenceUrls.length}):
                    </p>
                    <ClaimEvidenceViewer evidenceUrls={submission.evidenceUrls} />
                  </div>
                )}

                {/* Fecha de envío */}
                {submission.submittedAt && (
                  <p className="text-xs text-gray-600 font-medium pt-3 border-t border-blue-200">
                    Enviado el: {formatDate(submission.submittedAt)}
                  </p>
                )}
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
      )}
    </div>
  );
};

export default ComplianceCard;
