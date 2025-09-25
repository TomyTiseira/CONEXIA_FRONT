import { useState, useEffect } from 'react';
import { useServiceCategories } from '@/hooks/services';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { MdCleaningServices } from 'react-icons/md';

const ServiceFilters = ({ onFiltersChange, loading = false, currentFilters = {} }) => {
  const { categories, loading: categoriesLoading } = useServiceCategories();
  const [filters, setFilters] = useState({
    category: currentFilters.category || [],
    priceMin: currentFilters.priceMin || '',
    priceMax: currentFilters.priceMax || '',
    sortBy: currentFilters.sortBy || ''
  });
  // Estados locales de inputs de precio para permitir tipear varios dígitos
  const [priceMinInput, setPriceMinInput] = useState(currentFilters.priceMin || '');
  const [priceMaxInput, setPriceMaxInput] = useState(currentFilters.priceMax || '');

  // Estados para colapsar secciones - detectar si es mobile
  const [isMobile, setIsMobile] = useState(false);
  const [showSort, setShowSort] = useState(false);
  const [showCategories, setShowCategories] = useState(false);
  const [showPrice, setShowPrice] = useState(false);

  // Detectar tamaño de pantalla y establecer estado inicial
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768; // md breakpoint
      setIsMobile(mobile);
      if (!mobile) {
        // En desktop, mostrar todo desplegado por defecto
        setShowSort(true);
        setShowCategories(true);
        setShowPrice(true);
      } else {
        // En mobile, mantener todo colapsado
        setShowSort(false);
        setShowCategories(false);
        setShowPrice(false);
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Sincronizar con filtros externos
  useEffect(() => {
    setFilters({
      category: currentFilters.category || [],
      priceMin: currentFilters.priceMin || '',
      priceMax: currentFilters.priceMax || '',
      sortBy: currentFilters.sortBy || ''
    });
    setPriceMinInput(currentFilters.priceMin || '');
    setPriceMaxInput(currentFilters.priceMax || '');
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
    const currentCategories = filters.category || [];
    let newCategories;
    
    if (categoryId === 'all') {
      // Si selecciona "Todas", limpia todas las demás
      newCategories = [];
    } else if (currentCategories.includes(categoryId)) {
      newCategories = currentCategories.filter(id => id !== categoryId);
    } else {
      newCategories = [...currentCategories, categoryId];
    }
    
    handleFilterChange('category', newCategories);
  };

  // Commit helpers para precio (blur o Enter)
  const commitPriceMin = () => {
    // Permitir vacío
    const val = priceMinInput === '' ? '' : String(priceMinInput).replace(/[^0-9]/g, '');
    setPriceMinInput(val);
    handleFilterChange('priceMin', val);
  };
  const commitPriceMax = () => {
    const val = priceMaxInput === '' ? '' : String(priceMaxInput).replace(/[^0-9]/g, '');
    setPriceMaxInput(val);
    handleFilterChange('priceMax', val);
  };

  const clearFilters = () => {
    const emptyFilters = {
      category: [],
      priceMin: '',
      priceMax: '',
      sortBy: ''
    };
    setFilters(emptyFilters);
    setPriceMinInput('');
    setPriceMaxInput('');
    onFiltersChange(emptyFilters);
  };

  const hasActiveFilters = 
    filters.category.length > 0 || 
    filters.priceMin || 
    filters.priceMax || 
    filters.sortBy;

  return (
    <div className="bg-white rounded-xl shadow p-5 mb-4">
      {/* Header de Ordenar por */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-conexia-green">Ordenar por</h2>
        <button
          className="ml-1 px-1.5 py-1 rounded border border-conexia-green text-conexia-green hover:bg-conexia-green hover:text-white transition-colors text-xs font-semibold flex items-center gap-1"
          title="Limpiar filtros"
          onClick={clearFilters}
        >
          <MdCleaningServices className="w-4 h-4" />
          <span className="hidden sm:inline">Limpiar filtros</span>
        </button>
      </div>

      {/* Ordenamiento - Sección que se puede colapsar */}
      <div className="mb-6">
        <button
          className="flex items-center justify-between w-full mb-3 cursor-pointer md:hidden"
          onClick={() => setShowSort(!showSort)}
        >
          <h3 className="text-base font-medium text-conexia-green">Ordenamiento</h3>
          <div>
            {showSort ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </div>
        </button>
        
        {/* En desktop siempre visible, en mobile colapsable */}
        <div className={`space-y-2 ${showSort ? 'block' : 'hidden'} md:block`}>
          {sortOptions.map(option => (
            <label key={option.value} className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="sortBy"
                value={option.value}
                checked={filters.sortBy === option.value}
                onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                className="accent-conexia-green"
              />
              <span className="text-sm text-conexia-green">{option.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Header de Filtrar por */}
      <div className="mb-4">
        <h2 className="text-lg font-bold text-conexia-green">Filtrar por</h2>
      </div>

      {/* Categorías */}
      <div className="mb-6">
        <button
          className="flex items-center justify-between w-full mb-3 cursor-pointer"
          onClick={() => setShowCategories(!showCategories)}
        >
          <h3 className="text-base font-medium text-conexia-green">Categorías</h3>
          <div>
            {showCategories ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </div>
        </button>
        
        <div className={`space-y-2 ${showCategories ? 'block' : 'hidden'}`}>
          {/* Opción "Todas" */}
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={filters.category.length === 0}
              onChange={() => handleCategoryChange('all')}
              className="accent-conexia-green"
            />
            <span className="text-sm text-conexia-green font-medium">Todas</span>
          </label>
          
          {categoriesLoading ? (
            <div className="text-sm text-gray-500">Cargando categorías...</div>
          ) : categories?.length > 0 ? (
            categories.map(category => (
              <label key={category.id} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters.category.includes(category.id)}
                  onChange={() => handleCategoryChange(category.id)}
                  className="accent-conexia-green"
                />
                <span className="text-sm text-conexia-green">{category.name}</span>
              </label>
            ))
          ) : (
            <div className="text-sm text-gray-500">No hay categorías disponibles</div>
          )}
        </div>
      </div>

      {/* Rango de Precio */}
      <div className="mb-0">
        <button
          className="flex items-center justify-between w-full mb-3 cursor-pointer"
          onClick={() => setShowPrice(!showPrice)}
        >
          <h3 className="text-base font-medium text-conexia-green">Precio</h3>
          <div>
            {showPrice ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </div>
        </button>
        
        <div className={`space-y-3 ${showPrice ? 'block' : 'hidden'}`}>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Precio mínimo</label>
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              placeholder="Min"
              value={priceMinInput}
              onChange={(e) => {
                const onlyDigits = e.target.value.replace(/[^0-9]/g, '');
                setPriceMinInput(onlyDigits);
              }}
              onBlur={commitPriceMin}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.currentTarget.blur(); } }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-conexia-green/50 focus:border-conexia-green"
              disabled={loading}
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Precio máximo</label>
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              placeholder="Max"
              value={priceMaxInput}
              onChange={(e) => {
                const onlyDigits = e.target.value.replace(/[^0-9]/g, '');
                setPriceMaxInput(onlyDigits);
              }}
              onBlur={commitPriceMax}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.currentTarget.blur(); } }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-conexia-green/50 focus:border-conexia-green"
              disabled={loading}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServiceFilters;