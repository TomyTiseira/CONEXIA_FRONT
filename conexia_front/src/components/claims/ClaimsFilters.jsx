/**
 * ClaimsFilters Component
 * Filtros para el panel de admin de reclamos
 */

'use client';

import React, { useState, useEffect } from 'react';
import { Filter, X, Search } from 'lucide-react';
import { CLAIM_STATUS, CLAIM_STATUS_LABELS } from '@/constants/claims';

export const ClaimsFilters = ({ filters, onFilterChange, onClearFilters }) => {
  const [searchInput, setSearchInput] = useState(filters.search || '');
  const hasActiveFilters = filters.status || filters.claimantRole || filters.search;

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      onFilterChange('search', searchInput || null);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchInput]);

  // Reset search input when filters are cleared
  useEffect(() => {
    if (!filters.search) {
      setSearchInput('');
    }
  }, [filters.search]);

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

      {/* Búsqueda */}
      <div className="mb-4">
        <label htmlFor="search-filter" className="block text-sm font-medium text-gray-700 mb-2">
          Buscar
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search size={18} className="text-gray-400" />
          </div>
          <input
            id="search-filter"
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Buscar por descripción, ID, nombre del reclamante..."
            className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
          />
        </div>
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
