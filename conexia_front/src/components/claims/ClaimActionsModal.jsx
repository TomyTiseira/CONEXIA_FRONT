/**
 * ClaimActionsModal Component
 * Modal dropdown de acciones disponibles para un reclamo
 */

'use client';

import React from 'react';
import { Eye, MessageSquare, Upload, X, CheckCircle, Clock, ThumbsUp, ThumbsDown, FileCheck } from 'lucide-react';
import Button from '@/components/ui/Button';
import { CLAIM_STATUS } from '@/constants/claims';

export const ClaimActionsModal = ({ claim, onClose, onAction }) => {
  if (!claim) return null;

  const actions = [];

  // Obtener availableActions desde el objeto claim correcto
  const availableActions = claim.availableActions || claim.claim?.availableActions || [];
  
  // Obtener compliances para revisar acciones a nivel de compliance
  const compliances = claim.compliances || claim.claim?.compliances || [];
  
  // Verificar si algún compliance tiene peer_approve, peer_object o review_compliance
  const hasPeerApprove = compliances.some(c => c.availableActions?.includes('peer_approve'));
  const hasPeerObject = compliances.some(c => c.availableActions?.includes('peer_object'));
  const hasReviewCompliance = compliances.some(c => c.availableActions?.includes('review_compliance'));

  // Siempre puede ver detalle
  actions.push({
    id: 'view_detail',
    label: 'Ver Detalle',
    description: 'Ver información completa del reclamo',
    icon: Eye,
    color: 'text-blue-600',
    borderColor: 'border-blue-200',
    hoverBg: 'hover:bg-blue-50',
    iconBg: 'text-blue-600',
  });

  // Acciones de moderador/admin
  const claimStatus = claim.status || claim.claim?.status;
  const userRole = claim.userRole || claim.claim?.userRole;
  const assignedModeratorEmail = claim.assignedModerator?.email || claim.claim?.assignedModerator?.email;

  const canMarkInReview =
    availableActions.includes('mark_in_review') ||
    availableActions.includes('mark_as_in_review') ||
    (claimStatus === CLAIM_STATUS.OPEN && !userRole && !assignedModeratorEmail);

  if (canMarkInReview) {
    actions.push({
      id: 'mark_in_review',
      label: 'Marcar en Revisión',
      description: 'Tomar el reclamo y ponerlo en revisión',
      icon: Clock,
      color: 'text-indigo-800',
      borderColor: 'border-indigo-200',
      hoverBg: 'hover:bg-indigo-50',
      iconBg: 'text-indigo-600',
    });
  }

  if (availableActions.includes('resolve_claim')) {
    actions.push({
      id: 'resolve_claim',
      label: 'Resolver Reclamo',
      description: 'Aprobar y emitir resolución a favor de una parte',
      icon: CheckCircle,
      color: 'text-emerald-800',
      borderColor: 'border-emerald-200',
      hoverBg: 'hover:bg-emerald-50',
      iconBg: 'text-emerald-600',
    });

    actions.push({
      id: 'reject_claim',
      label: 'Rechazar Reclamo',
      description: 'Rechazar el reclamo por infundado',
      icon: X,
      color: 'text-red-800',
      borderColor: 'border-red-200',
      hoverBg: 'hover:bg-red-50',
      iconBg: 'text-red-600',
    });
  }

  if (availableActions.includes('add_observations')) {
    actions.push({
      id: 'add_observations',
      label: 'Agregar observaciones',
      description: 'Agregar observaciones como moderador',
      icon: MessageSquare,
      color: 'text-orange-800',
      borderColor: 'border-orange-200',
      hoverBg: 'hover:bg-orange-50',
      iconBg: 'text-orange-600',
    });
  }

  // Si puede enviar observaciones (respondent y status pending)
  if (availableActions.includes('submit_observations')) {
    actions.push({
      id: 'submit_observations',
      label: 'Enviar Observaciones',
      description: 'Responder al reclamo con tus observaciones',
      icon: MessageSquare,
      color: 'text-green-800',
      borderColor: 'border-green-200',
      hoverBg: 'hover:bg-green-50',
      iconBg: 'text-green-600',
    });
  }

  // Si puede subir cumplimiento
  if (availableActions.includes('upload_compliance')) {
    actions.push({
      id: 'upload_compliance',
      label: 'Subir Cumplimiento',
      description: 'Demostrar que se cumplió con lo solicitado',
      icon: Upload,
      color: 'text-purple-800',
      borderColor: 'border-purple-200',
      hoverBg: 'hover:bg-purple-50',
      iconBg: 'text-purple-600',
    });
  }

  // Si puede subir evidencia de compromisos (verificar tanto a nivel de claim como de compliance)
  if (availableActions.includes('submit_compliance_evidence') || availableActions.includes('submit_evidence')) {
    actions.push({
      id: 'submit_compliance_evidence',
      label: 'Subir evidencia de compromiso',
      description: 'Subir evidencia de cumplimiento de compromisos pendientes',
      icon: Upload,
      color: 'text-indigo-800',
      borderColor: 'border-indigo-200',
      hoverBg: 'hover:bg-indigo-50',
      iconBg: 'text-indigo-600',
    });
  }

  // Si puede pre-aprobar evidencia de compromiso (peer review)
  // Unificamos peer_approve y peer_object en una sola acción
  if (availableActions.includes('peer_approve') || hasPeerApprove || 
      availableActions.includes('peer_object') || hasPeerObject) {
    // Solo agregar si no está ya en el array
    if (!actions.find(a => a.id === 'peer_review')) {
      actions.push({
        id: 'peer_review',
        label: 'Revisar Compromiso',
        description: 'Pre-aprobar o pre-rechazar evidencia presentada',
        icon: ThumbsUp,
        color: 'text-purple-800',
        borderColor: 'border-purple-200',
        hoverBg: 'hover:bg-purple-50',
        iconBg: 'text-purple-600',
      });
    }
  }

  // Si puede revisar evidencia de compromiso (moderator review)
  if (availableActions.includes('review_compliance') || hasReviewCompliance) {
    actions.push({
      id: 'review_compliance',
      label: 'Revisar Compromiso (Moderador)',
      description: 'Aprobar o rechazar evidencia de compromiso como moderador',
      icon: FileCheck,
      color: 'text-indigo-800',
      borderColor: 'border-indigo-200',
      hoverBg: 'hover:bg-indigo-50',
      iconBg: 'text-indigo-600',
    });
  }

  // Subsanar reclamo (claimant) cuando el moderador pidió aclaración
  // En algunos endpoints no viene en availableActions, así que lo habilitamos por estado + rol.
  if (claimStatus === CLAIM_STATUS.PENDING_CLARIFICATION && userRole === 'claimant') {
    actions.push({
      id: 'subsanar_claim',
      label: 'Subsanar Reclamo',
      description: 'Responder a lo solicitado y adjuntar evidencias',
      icon: Upload,
      color: 'text-orange-800',
      borderColor: 'border-orange-200',
      hoverBg: 'hover:bg-orange-50',
      iconBg: 'text-orange-600',
    });
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div
        className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header fijo */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 flex-shrink-0 bg-white">
          <h3 className="text-lg font-semibold text-gray-900">Acciones Disponibles</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 rounded-full p-2 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Contenido scrolleable */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="space-y-3">
            {actions.map((action) => {
              const Icon = action.icon;
              return (
                <button
                  key={action.id}
                  onClick={() => {
                    onAction(action.id, claim);
                    onClose();
                  }}
                  className={`w-full flex items-center gap-3 p-4 border ${action.borderColor} rounded-lg ${action.hoverBg} transition-colors text-left`}
                >
                  <Icon size={24} className={`${action.iconBg} flex-shrink-0`} />
                  <div>
                    <p className={`font-medium ${action.color}`}>
                      {action.label}
                    </p>
                    <p className="text-sm text-gray-600">{action.description}</p>
                  </div>
                </button>
              );
            })}
          </div>
          
          {actions.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500">No hay acciones disponibles para este reclamo.</p>
            </div>
          )}
        </div>
        
        {/* Footer fijo */}
        <div className="border-t border-gray-200 px-6 py-4 flex justify-end flex-shrink-0 bg-gray-50">
          <Button onClick={onClose} variant="cancel">
            Cerrar
          </Button>
        </div>
      </div>
    </div>
  );
};
