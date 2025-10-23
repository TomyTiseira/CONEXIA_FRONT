'use client';

/**
 * Filtros para la tabla de moderación
 */
export default function AnalysisFilters({ filters, onFilterChange }) {
  return (
    <div className="bg-white rounded-lg shadow p-4 mb-6">
      <div className="flex flex-col md:flex-row gap-4">
        {/* Filtro de estado */}
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Estado
          </label>
          <select
            value={filters.resolved === undefined ? 'all' : filters.resolved ? 'resolved' : 'pending'}
            onChange={(e) => {
              const value = e.target.value;
              onFilterChange({
                resolved: value === 'all' ? undefined : value === 'resolved',
              });
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-conexia-green focus:border-transparent"
          >
            <option value="all">Todos</option>
            <option value="pending">Pendientes</option>
            <option value="resolved">Resueltos</option>
          </select>
        </div>

        {/* Filtro de clasificación */}
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Clasificación
          </label>
          <select
            value={filters.classification || 'all'}
            onChange={(e) => {
              const value = e.target.value;
              onFilterChange({
                classification: value === 'all' ? undefined : value,
              });
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-conexia-green focus:border-transparent"
          >
            <option value="all">Todas</option>
            <option value="Revisar">Revisar</option>
            <option value="Banear">Banear</option>
          </select>
        </div>

        {/* Filtro de límite por página */}
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Resultados por página
          </label>
          <select
            value={filters.limit || 10}
            onChange={(e) => {
              onFilterChange({
                limit: parseInt(e.target.value),
                page: 1, // Resetear a página 1
              });
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-conexia-green focus:border-transparent"
          >
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
          </select>
        </div>
      </div>
    </div>
  );
}
