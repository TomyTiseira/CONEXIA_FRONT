import { useState, useRef } from 'react';
import { Search } from 'lucide-react';

const ServiceSearchBar = ({ onSearch, loading = false, placeholder = "Buscar servicios..." }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const timeoutRef = useRef(null);

  const handleInputChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);

    // Limpiar timeout anterior
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Debounce: esperar 500ms antes de buscar
    timeoutRef.current = setTimeout(() => {
      onSearch(value);
    }, 500);
  };

  const handleClear = () => {
    setSearchTerm('');
    // Limpiar timeout pendiente
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    onSearch('');
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border p-4 mb-6">
      <div className="relative">
        <Search 
          className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" 
          size={20} 
        />
        <input
          type="text"
          placeholder={placeholder}
          value={searchTerm}
          onChange={handleInputChange}
          className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-conexia-green/50 focus:border-conexia-green"
          disabled={loading}
        />
        {searchTerm && (
          <button
            onClick={handleClear}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            type="button"
          >
            ✕
          </button>
        )}
        {loading && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-conexia-green"></div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ServiceSearchBar;