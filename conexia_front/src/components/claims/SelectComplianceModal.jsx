/**
 * SelectComplianceModal Component
 * Modal para seleccionar un compromiso pendiente para subir evidencia
 */

'use client';

import React, { useState, useEffect } from 'react';
import { X, Loader2, AlertCircle, Upload, Clock } from 'lucide-react';
import { ComplianceCard } from './ComplianceCard';
import { ComplianceStatusBadge } from './ComplianceStatusBadge';
import { COMPLIANCE_TYPE_LABELS } from '@/constants/claims';
import { getClaimDetail } from '@/service/claims';

export const SelectComplianceModal = ({ claim, onClose, onSelectCompliance, currentUserId }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [compliances, setCompliances] = useState([]);
  const [claimData, setClaimData] = useState(null);
  const [expandedCompliances, setExpandedCompliances] = useState({});

  useEffect(() => {
    const fetchCompliances = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const claimId = claim.claim?.id || claim.id;
        const result = await getClaimDetail(claimId);
        
        // Guardar datos completos del claim
        if (result.yourProfile && result.otherUserProfile) {
          const userRole = result.claim?.userRole;
          setClaimData({
            ...result,
            claimant: userRole === 'claimant' ? result.yourProfile : result.otherUserProfile,
            otherUser: userRole === 'claimant' ? result.otherUserProfile : result.yourProfile,
          });
        } else {
          setClaimData(result);
        }
        
        // Filtrar solo los compromisos donde el usuario actual es responsable
        // y que tengan la acción submit_evidence disponible
        const userCompliances = (result.compliances || []).filter(compliance => {
          const isResponsible = String(compliance.responsibleUserId) === String(currentUserId);
          const canSubmitEvidence = compliance.availableActions?.includes('submit_evidence');
          return isResponsible && canSubmitEvidence;
        });
        
        setCompliances(userCompliances);
      } catch (err) {
        console.error('Error fetching compliances:', err);
        setError(err.message || 'Error al cargar los compromisos');
      } finally {
        setLoading(false);
      }
    };

    fetchCompliances();
  }, [claim, currentUserId]);



  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-purple-200 bg-purple-100 flex items-center justify-between flex-shrink-0 rounded-t-xl">
          <h2 className="text-lg font-semibold text-gray-900">Subir evidencia de compromiso</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 rounded-full p-2 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading && (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 size={48} className="animate-spin text-purple-600 mb-4" />
              <p className="text-gray-600">Cargando tus compromisos pendientes...</p>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
              <AlertCircle size={20} className="text-red-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-red-900">Error al cargar</p>
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          )}

          {!loading && !error && compliances.length === 0 && (
            <div className="text-center py-12">
              <Upload size={48} className="mx-auto text-gray-300 mb-3" />
              <p className="text-gray-600 font-medium mb-2">No tienes compromisos pendientes</p>
              <p className="text-sm text-gray-500">No hay compromisos que requieran evidencia en este momento.</p>
            </div>
          )}

          {!loading && !error && compliances.length > 0 && (
            <div className="space-y-6">
              <div className="bg-purple-50 border-2 border-purple-200 rounded-xl p-4">
                <p className="text-sm text-purple-900 font-semibold">
                  Selecciona el compromiso al cual deseas subir evidencia de cumplimiento:
                </p>
              </div>
              
              <div className="space-y-3">
                {compliances.map((compliance, index) => {
                  const isExpanded = expandedCompliances[index];
                  return (
                    <div key={compliance.id} className="bg-white border-2 border-purple-200 rounded-xl overflow-hidden">
                      {/* Header del acordeón - Clickeable */}
                      <button
                        onClick={() => setExpandedCompliances(prev => ({ ...prev, [index]: !prev[index] }))}
                        className="w-full px-4 py-3 bg-purple-50 hover:bg-purple-100 transition-colors"
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <div className={`transform transition-transform flex-shrink-0 ${isExpanded ? 'rotate-90' : ''}`}>
                            <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          </div>
                          <span className="font-bold text-sm text-gray-900 flex-1 text-left">
                            {COMPLIANCE_TYPE_LABELS[compliance.complianceType] || compliance.complianceType}
                          </span>
                          {String(compliance.responsibleUserId) === String(currentUserId) && (
                            <span className="text-xs bg-purple-600 text-white px-2 py-0.5 rounded-full font-semibold whitespace-nowrap">
                              Tu compromiso
                            </span>
                          )}
                        </div>
                        
                        <div className="flex items-center justify-between ml-6">
                          <ComplianceStatusBadge status={compliance.status} />
                          {compliance.deadline && (
                            <span className="text-xs text-gray-600 font-medium flex items-center gap-1">
                              <Clock size={12} />
                              {new Date(compliance.deadline).toLocaleDateString('es-AR', {
                                day: '2-digit',
                                month: 'short'
                              })}
                            </span>
                          )}
                        </div>
                      </button>

                      {/* Contenido expandible */}
                      {isExpanded && (
                        <div className="border-t-2 border-purple-200">
                          <ComplianceCard
                            compliance={compliance}
                            currentUserId={currentUserId}
                            canUpload={true}
                            onUploadEvidence={() => {
                              onSelectCompliance(compliance, claimData?.claimant, claimData?.otherUser);
                              onClose();
                            }}
                            claimant={claimData?.claimant}
                            otherUser={claimData?.otherUser}
                            showCompactHeader={true}
                          />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-end flex-shrink-0 rounded-b-xl">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
};
