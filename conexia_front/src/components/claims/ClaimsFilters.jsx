/**
 * ClaimsFilters Component
 * Filtros para el panel de admin de reclamos
 */

'use client';

import React from 'react';
import { Filter, X } from 'lucide-react';
import { CLAIM_STATUS, CLAIM_STATUS_LABELS } from '@/constants/claims';

export const ClaimsFilters = ({ filters, onFilterChange, onClearFilters }) => {
  const hasActiveFilters = filters.status || filters.claimantRole;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Filter size={18} className="text-gray-600" />
          <h3 className="font-semibold text-gray-900">Filtros</h3>
        </div>
        {hasActiveFilters && (
          <button
            onClick={onClearFilters}
            className="text-sm text-red-600 hover:text-red-700 flex items-center gap-1"
          >
            <X size={14} />
            Limpiar filtros
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Filtro por Estado */}
        <div>
          <label htmlFor="status-filter" className="block text-sm font-medium text-gray-700 mb-2">
            Estado
          </label>
          <select
            id="status-filter"
            value={filters.status || ''}
            onChange={(e) => onFilterChange('status', e.target.value || null)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
          >
            <option value="">Todos los estados</option>
            {Object.values(CLAIM_STATUS).map((status) => (
              <option key={status} value={status}>
                {CLAIM_STATUS_LABELS[status]}
              </option>
            ))}
          </select>
        </div>

        {/* Filtro por Rol del Reclamante */}
        <div>
          <label htmlFor="role-filter" className="block text-sm font-medium text-gray-700 mb-2">
            Reclamante
          </label>
          <select
            id="role-filter"
            value={filters.claimantRole || ''}
            onChange={(e) => onFilterChange('claimantRole', e.target.value || null)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
          >
            <option value="">Todos</option>
            <option value="client">Clientes</option>
            <option value="provider">Proveedores</option>
          </select>
        </div>
      </div>
    </div>
  );
};

export default ClaimsFilters;
