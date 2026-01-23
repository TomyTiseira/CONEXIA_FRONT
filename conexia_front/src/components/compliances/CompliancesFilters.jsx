/**
 * CompliancesFilters Component
 * Filtros para lista de compliances
 */

'use client';

import React from 'react';
import { Search, Filter } from 'lucide-react';
import { COMPLIANCE_STATUS, COMPLIANCE_STATUS_LABELS } from '@/constants/compliances';

export const CompliancesFilters = ({ 
  filters, 
  onFilterChange, 
  showStatusFilter = true,
  showOverdueFilter = true,
  className = '' 
}) => {
  const handleStatusChange = (e) => {
    onFilterChange({ ...filters, status: e.target.value, page: 1 });
  };

  const handleOverdueToggle = () => {
    onFilterChange({ ...filters, onlyOverdue: !filters.onlyOverdue, page: 1 });
  };

  const handleClearFilters = () => {
    onFilterChange({ page: 1, limit: filters.limit });
  };

  const hasActiveFilters = filters.status || filters.onlyOverdue;

  return (
    <div className={`bg-white rounded-lg shadow p-4 ${className}`}>
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex items-center text-gray-700 font-medium">
          <Filter size={18} className="mr-2" />
          <span>Filtros:</span>
        </div>

        {/* Status Filter */}
        {showStatusFilter && (
          <select
            value={filters.status || ''}
            onChange={handleStatusChange}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
          >
            <option value="">Todos los estados</option>
            <option value="pending,requires_adjustment,rejected">⏳ Requieren acción</option>
            <option value="pending">⏳ Pendientes</option>
            <option value="submitted">📤 Enviados</option>
            <option value="peer_approved">✅ Pre-aprobados</option>
            <option value="peer_objected">⚠️ Objetados</option>
            <option value="in_review">👀 En revisión</option>
            <option value="approved">✅ Aprobados</option>
            <option value="overdue,warning">🔴 Vencidos</option>
          </select>
        )}

        {/* Overdue Toggle */}
        {showOverdueFilter && (
          <button
            onClick={handleOverdueToggle}
            className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
              filters.onlyOverdue
                ? 'bg-red-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {filters.onlyOverdue ? '🔴 Solo vencidos' : 'Incluir vencidos'}
          </button>
        )}

        {/* Clear Filters */}
        {hasActiveFilters && (
          <button
            onClick={handleClearFilters}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium text-sm hover:bg-gray-200 transition-colors"
          >
            Limpiar filtros
          </button>
        )}
      </div>
    </div>
  );
};

export default CompliancesFilters;
