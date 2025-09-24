import { useState, useEffect } from 'react';
import { useServiceCategories } from '@/hooks/services';
import { FaFilter } from 'react-icons/fa';
import { MdCleaningServices } from 'react-icons/md';
import Button from '@/components/ui/Button';

const ServiceFilters = ({ onFiltersChange, loading = false, currentFilters = {} }) => {
  const { categories, loading: categoriesLoading } = useServiceCategories();
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    category: currentFilters.category || [],
    priceMin: currentFilters.priceMin || '',
    priceMax: currentFilters.priceMax || '',
    sortBy: currentFilters.sortBy || ''
  });

  // Sincronizar con filtros externos
  useEffect(() => {
    setFilters({
      category: currentFilters.category || [],
      priceMin: currentFilters.priceMin || '',
      priceMax: currentFilters.priceMax || '',
      sortBy: currentFilters.sortBy || ''
    });
  }, [currentFilters]);

  const sortOptions = [
    { value: '', label: 'Predeterminado' },
    { value: 'price_asc', label: 'Precio: Menor a Mayor' },
    { value: 'price_desc', label: 'Precio: Mayor a Menor' },
    { value: 'newest', label: 'Más Recientes' },
    { value: 'oldest', label: 'Más Antiguos' }
  ];

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const handleCategoryChange = (categoryId) => {
    const currentCategories = filters.category;
    let newCategories;
    
    if (currentCategories.includes(categoryId)) {
      newCategories = currentCategories.filter(id => id !== categoryId);
    } else {
      newCategories = [...currentCategories, categoryId];
    }
    
    handleFilterChange('category', newCategories);
  };

  const clearFilters = () => {
    const clearedFilters = {
      category: [],
      priceMin: '',
      priceMax: '',
      sortBy: ''
    };
    setFilters(clearedFilters);
    onFiltersChange(clearedFilters);
  };

  const hasActiveFilters = 
    filters.category.length > 0 || 
    filters.priceMin || 
    filters.priceMax || 
    filters.sortBy;

  return (
    <div className="bg-white rounded-lg shadow-sm border p-4 mb-6">
      {/* Header con ordenamiento y limpiar filtros */}
      <div className="flex items-center justify-between mb-6">
        {/* Botón de filtros para móvil */}
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="lg:hidden flex items-center gap-2 text-conexia-green hover:text-conexia-green-dark"
        >
          <FaFilter size={16} />
          <span>Filtros</span>
          {hasActiveFilters && (
            <span className="bg-conexia-green text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
              {filters.category.length + (filters.priceMin ? 1 : 0) + (filters.priceMax ? 1 : 0) + (filters.sortBy ? 1 : 0)}
            </span>
          )}
        </button>

        {/* Ordenamiento y limpiar filtros - Lado derecho */}
        <div className="flex items-center gap-4">
          {/* Ordenamiento */}
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700">Ordenar:</label>
            <select
              value={filters.sortBy}
              onChange={(e) => handleFilterChange('sortBy', e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-conexia-green/50"
              disabled={loading}
            >
              {sortOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Limpiar filtros */}
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="px-3 py-1 rounded border border-conexia-green text-conexia-green hover:bg-conexia-green hover:text-white transition-colors text-sm font-semibold flex items-center gap-2"
              disabled={loading}
              title="Limpiar filtros"
            >
              <MdCleaningServices className="w-4 h-4" />
              <span className="hidden sm:inline">Limpiar filtros</span>
            </button>
          )}
        </div>
      </div>

      {/* Filtros expandibles */}
      <div className={`${showFilters ? 'block' : 'hidden'} lg:block`}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Categorías */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Categorías
            </label>
            <div className="max-h-40 overflow-y-auto border rounded-md p-2 space-y-1">
              {categoriesLoading ? (
                <div className="text-sm text-gray-500">Cargando categorías...</div>
              ) : categories && categories.length > 0 ? (
                categories.map(category => (
                  <label key={category.id} className="flex items-center gap-2 text-sm cursor-pointer hover:bg-gray-50 p-1 rounded">
                    <input
                      type="checkbox"
                      checked={filters.category.includes(category.id)}
                      onChange={() => handleCategoryChange(category.id)}
                      className="rounded border-gray-300 text-conexia-green focus:ring-conexia-green"
                      disabled={loading}
                    />
                    <span className="truncate">{category.name}</span>
                  </label>
                ))
              ) : (
                <div className="text-sm text-gray-500">No hay categorías disponibles</div>
              )}
            </div>
          </div>

          {/* Rango de precios mínimo */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Precio mínimo
            </label>
            <input
              type="number"
              placeholder="Precio mínimo"
              value={filters.priceMin}
              onChange={(e) => handleFilterChange('priceMin', e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-conexia-green/50"
              min="0"
              disabled={loading}
            />
          </div>

          {/* Rango de precios máximo */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Precio máximo
            </label>
            <input
              type="number"
              placeholder="Precio máximo"
              value={filters.priceMax}
              onChange={(e) => handleFilterChange('priceMax', e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-conexia-green/50"
              min="0"
              disabled={loading}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServiceFilters;