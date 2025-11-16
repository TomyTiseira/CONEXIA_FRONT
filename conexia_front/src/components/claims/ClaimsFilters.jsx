/**
 * ClaimsFilters Component
 * Filtros para el panel de admin de reclamos
 */

'use client';

import React, { useState, useEffect, useRef } from 'react';
import { X, ChevronDown } from 'lucide-react';
import { CLAIM_STATUS, CLAIM_STATUS_LABELS } from '@/constants/claims';
import { MdCleaningServices } from 'react-icons/md';

export const ClaimsFilters = ({ filters, onFilterChange, onClearFilters }) => {
  const [searchTerm, setSearchTerm] = useState(filters.searchTerm || '');
  const debounceTimerRef = useRef(null);

  // Debounced search - solo para búsqueda por número
  useEffect(() => {
    // Evitar búsqueda en la carga inicial cuando searchTerm está vacío
    if (searchTerm === '' && filters.searchTerm === '') {
      return;
    }

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      const cleanSearch = searchTerm.replace('#', '').trim();
      onFilterChange('searchTerm', cleanSearch || '');
    }, 1500); // 1.5 segundos después de que el usuario deja de escribir

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [searchTerm]);

  // Reset local state when filters are cleared
  useEffect(() => {
    if (!filters.searchTerm) setSearchTerm('');
  }, [filters.searchTerm]);

  // Manejar búsqueda inmediata al presionar Enter
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      // Cancelar el debounce actual
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      // Aplicar búsqueda inmediatamente
      const cleanSearch = searchTerm.replace('#', '').trim();
      onFilterChange('searchTerm', cleanSearch || '');
    }
  };

  // Manejar cambio de estado - aplicar inmediatamente
  const handleStatusChange = (value) => {
    onFilterChange('status', value || null);
  };

  // Manejar cambio de rol - aplicar inmediatamente
  const handleRoleChange = (value) => {
    onFilterChange('claimantRole', value || null);
  };

  const hasActiveFilters = filters.searchTerm || filters.status || filters.claimantRole;

  return (
    <div className="bg-white p-4 rounded-xl shadow-sm border">
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        {/* Contenedor de filtros centrado */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-center gap-4 flex-wrap flex-1 w-full lg:w-auto">
          {/* Búsqueda por número */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 w-full lg:w-auto">
            <label htmlFor="search-filter" className="text-sm text-conexia-green font-medium whitespace-nowrap">
              Buscar por número:
            </label>
            <input
              id="search-filter"
              type="text"
              placeholder="Ej: 62fc2068"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={handleKeyPress}
              className="h-10 w-full sm:flex-1 lg:min-w-[200px] border border-conexia-green rounded-lg px-3 text-sm placeholder-gray-400 text-gray-700 focus:outline-none focus:ring-2 focus:ring-conexia-green/40 transition"
            />
          </div>

          {/* Filtro por Estado */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 w-full lg:w-auto">
            <label htmlFor="status-filter" className="text-sm text-conexia-green font-medium whitespace-nowrap">
              Estado:
            </label>
            <div className="relative w-full sm:flex-1 lg:w-auto">
              <select
                id="status-filter"
                value={filters.status || ''}
                onChange={(e) => handleStatusChange(e.target.value)}
                className="h-10 w-full lg:min-w-[180px] border border-conexia-green rounded-lg pl-3 pr-10 text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-conexia-green/40 transition cursor-pointer appearance-none"
              >
                <option value="">Todos los estados</option>
                {Object.values(CLAIM_STATUS).map((status) => (
                  <option key={status} value={status}>
                    {CLAIM_STATUS_LABELS[status]}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute top-1/2 -translate-y-1/2 right-3 text-conexia-green">
                <ChevronDown size={18} />
              </div>
            </div>
          </div>

          {/* Filtro por Rol del Reclamante */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 w-full lg:w-auto">
            <label htmlFor="role-filter" className="text-sm text-conexia-green font-medium whitespace-nowrap">
              Reclamante:
            </label>
            <div className="relative w-full sm:flex-1 lg:w-auto">
              <select
                id="role-filter"
                value={filters.claimantRole || ''}
                onChange={(e) => handleRoleChange(e.target.value)}
                className="h-10 w-full lg:min-w-[180px] border border-conexia-green rounded-lg pl-3 pr-10 text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-conexia-green/40 transition cursor-pointer appearance-none"
              >
                <option value="">Todos</option>
                <option value="client">Clientes</option>
                <option value="provider">Proveedores</option>
              </select>
              <div className="pointer-events-none absolute top-1/2 -translate-y-1/2 right-3 text-conexia-green">
                <ChevronDown size={18} />
              </div>
            </div>
          </div>
        </div>

        {/* Botón limpiar filtros - siempre visible */}
        <button
          onClick={onClearFilters}
          disabled={!hasActiveFilters}
          className="px-2 py-2 rounded border border-conexia-green text-conexia-green hover:bg-conexia-green hover:text-white transition-colors text-xs font-semibold flex items-center gap-1 whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-conexia-green h-10 w-full lg:w-auto justify-center"
          title="Limpiar filtros"
        >
          <MdCleaningServices className="w-4 h-4" />
          <span>Limpiar filtros</span>
        </button>
      </div>
    </div>
  );
};

export default ClaimsFilters;
