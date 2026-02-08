/**
 * CompliancesList Component
 * Lista de compliances con paginación
 */

'use client';

import React, { useState } from 'react';
import { Loader2, AlertCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import { ComplianceCard } from './ComplianceCard';
import { SubmitComplianceModal } from './SubmitComplianceModal';

export const CompliancesList = ({ 
  compliances = [],
  loading = false,
  error = null,
  pagination = {},
  onPageChange,
  userId,
  showActions = true,
  onComplianceUpdate,
  emptyMessage = 'No hay cumplimientos disponibles',
  className = '' 
}) => {
  const [selectedCompliance, setSelectedCompliance] = useState(null);
  const [showSubmitModal, setShowSubmitModal] = useState(false);

  const handleComplianceClick = (compliance) => {
    // Solo abrir modal si requiere acción
    if (showActions && (compliance.status === 'pending' || compliance.status === 'requires_adjustment' || compliance.status === 'rejected')) {
      setSelectedCompliance(compliance);
      setShowSubmitModal(true);
    }
  };

  const handleSubmitSuccess = () => {
    setShowSubmitModal(false);
    setSelectedCompliance(null);
    if (onComplianceUpdate) {
      onComplianceUpdate();
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 size={48} className="animate-spin text-blue-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 flex items-center text-red-700">
        <AlertCircle size={24} className="mr-3 flex-shrink-0" />
        <div>
          <p className="font-semibold">Error al cargar cumplimientos</p>
          <p className="text-sm mt-1">{error}</p>
        </div>
      </div>
    );
  }

  if (!compliances || compliances.length === 0) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-12 text-center">
        <p className="text-gray-600">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <>
      <div className={className}>
        {/* Lista de Compliances */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {compliances.map((compliance) => (
            <ComplianceCard
              key={compliance.id}
              compliance={compliance}
              onClick={() => handleComplianceClick(compliance)}
              showActions={showActions}
              onAction={(c) => {
                setSelectedCompliance(c);
                setShowSubmitModal(true);
              }}
            />
          ))}
        </div>

        {/* Paginación */}
        {pagination && pagination.totalPages > 1 && (
          <div className="mt-8 flex items-center justify-center gap-2">
            <button
              onClick={() => onPageChange(pagination.page - 1)}
              disabled={pagination.page <= 1}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <ChevronLeft size={18} />
              Anterior
            </button>

            <span className="px-4 py-2 text-gray-700 font-medium">
              Página {pagination.page} de {pagination.totalPages}
            </span>

            <button
              onClick={() => onPageChange(pagination.page + 1)}
              disabled={pagination.page >= pagination.totalPages}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              Siguiente
              <ChevronRight size={18} />
            </button>
          </div>
        )}

        {/* Total Count */}
        {pagination && pagination.total > 0 && (
          <div className="mt-4 text-center text-sm text-gray-600">
            Mostrando {compliances.length} de {pagination.total} cumplimientos
          </div>
        )}
      </div>

      {/* Submit Modal */}
      {showSubmitModal && selectedCompliance && (
        <SubmitComplianceModal
          isOpen={showSubmitModal}
          onClose={() => {
            setShowSubmitModal(false);
            setSelectedCompliance(null);
          }}
          compliance={selectedCompliance}
          userId={userId}
          onSuccess={handleSubmitSuccess}
        />
      )}
    </>
  );
};

export default CompliancesList;
