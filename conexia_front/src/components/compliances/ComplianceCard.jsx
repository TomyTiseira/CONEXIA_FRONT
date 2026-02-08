/**
 * ComplianceCard Component
 * Tarjeta individual de compliance con información resumida
 */

'use client';

import React from 'react';
import { FileText, User, Calendar } from 'lucide-react';
import { ComplianceStatusBadge } from './ComplianceStatusBadge';
import { ComplianceTypeBadge } from './ComplianceTypeBadge';
import { UrgencyBadge } from './UrgencyBadge';
import { CountdownTimer } from './CountdownTimer';
import { canUserAct, isFinalStatus, getUrgencyLevel, URGENCY_LEVEL } from '@/constants/compliances';

export const ComplianceCard = ({ 
  compliance, 
  onClick, 
  showActions = false, 
  onAction,
  className = '' 
}) => {
  const canAct = canUserAct(compliance.status);
  const isFinal = isFinalStatus(compliance.status);
  const urgencyLevel = getUrgencyLevel(compliance.deadline, compliance.warningLevel);

  // Clase de urgencia para el borde
  const getUrgencyBorderClass = () => {
    switch (urgencyLevel) {
      case URGENCY_LEVEL.CRITICAL:
        return 'border-l-4 border-l-red-500 shadow-lg animate-pulse';
      case URGENCY_LEVEL.URGENT:
        return 'border-l-4 border-l-orange-500';
      case URGENCY_LEVEL.WARNING:
        return 'border-l-4 border-l-yellow-500';
      default:
        return 'border-l-4 border-l-blue-500';
    }
  };

  return (
    <div
      className={`bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-5 ${getUrgencyBorderClass()} ${className} ${onClick ? 'cursor-pointer' : ''}`}
      onClick={onClick}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <ComplianceTypeBadge type={compliance.complianceType} />
        </div>
        <div className="flex flex-col items-end gap-2">
          <ComplianceStatusBadge status={compliance.status} />
          <UrgencyBadge deadline={compliance.deadline} warningLevel={compliance.warningLevel} />
        </div>
      </div>

      {/* ID del Compliance */}
      <div className="flex items-center text-xs text-gray-500 mb-3">
        <FileText size={12} className="mr-1" />
        <span className="font-mono">{compliance.id.substring(0, 8)}</span>
      </div>

      {/* Instrucciones del Moderador */}
      <div className="mb-4">
        <h4 className="text-sm font-semibold text-gray-700 mb-1">Instrucciones:</h4>
        <p className="text-sm text-gray-600 line-clamp-2">
          {compliance.moderatorInstructions}
        </p>
      </div>

      {/* Información del Deadline */}
      <div className="flex items-center justify-between mb-3 p-3 bg-gray-50 rounded-md">
        <div className="flex items-center text-sm text-gray-600">
          <Calendar size={16} className="mr-2" />
          <span className="font-medium">Plazo:</span>
        </div>
        <CountdownTimer 
          deadline={compliance.deadline} 
          warningLevel={compliance.warningLevel}
        />
      </div>

      {/* Warning Level Indicator */}
      {compliance.warningLevel > 0 && (
        <div className="mb-3 p-2 bg-red-50 border border-red-200 rounded text-xs text-red-700">
          {compliance.warningLevel === 1 && '⚠️ Primer vencimiento - Deadline extendido'}
          {compliance.warningLevel === 2 && '🔴 Segundo vencimiento - Advertencia crítica'}
          {compliance.warningLevel === 3 && '❌ Tercer vencimiento - Preparando sanciones'}
        </div>
      )}

      {/* Peer Review Indicator */}
      {compliance.peerApproved !== null && (
        <div className={`mb-3 p-2 rounded text-xs ${compliance.peerApproved ? 'bg-teal-50 border border-teal-200 text-teal-700' : 'bg-orange-50 border border-orange-200 text-orange-700'}`}>
          {compliance.peerApproved ? '✅ Pre-aprobado por la otra parte' : '⚠️ Objetado por la otra parte'}
        </div>
      )}

      {/* Action Button */}
      {showActions && canAct && onAction && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onAction(compliance);
          }}
          className="w-full mt-4 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all"
        >
          {compliance.requiresFiles ? 'Subir Evidencia' : 'Confirmar Cumplimiento'}
        </button>
      )}

      {/* Final Status Message */}
      {isFinal && (
        <div className="mt-3 p-2 bg-gray-100 rounded text-xs text-gray-600 text-center">
          {compliance.status === 'approved' ? '✅ Cumplimiento completado' : '❌ Cumplimiento escalado'}
        </div>
      )}

      {/* Created At */}
      <div className="mt-3 pt-3 border-t border-gray-200 text-xs text-gray-500">
        Creado el {new Date(compliance.createdAt).toLocaleDateString('es-ES', { 
          year: 'numeric', 
          month: 'short', 
          day: 'numeric' 
        })}
      </div>
    </div>
  );
};

export default ComplianceCard;
