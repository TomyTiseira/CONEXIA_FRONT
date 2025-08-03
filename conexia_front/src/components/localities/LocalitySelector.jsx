'use client';

import { useState, useRef, useEffect } from 'react';
import { useLocalities } from '@/hooks/common/useLocalities';

const LocalitySelector = ({ selectedLocality = null, onLocalityChange, className = '' }) => {
  const { localities, loading, error } = useLocalities();
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const inputRef = useRef(null);
  const dropdownRef = useRef(null);

  // Filtrar provincias según el texto
  const filteredLocalities = localities.filter(loc =>
    loc.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Mostrar texto escrito o localidad seleccionada
  const inputValue = searchTerm !== '' || !selectedLocality ? searchTerm : selectedLocality.name;

  // Detectar si borró el texto manualmente
  const lastSearchTerm = useRef('');
  useEffect(() => {
    if (
      lastSearchTerm.current !== '' &&
      searchTerm === '' &&
      selectedLocality
    ) {
      onLocalityChange(null);
    }
    lastSearchTerm.current = searchTerm;
  }, [searchTerm, selectedLocality, onLocalityChange]);

  // Cerrar al hacer clic fuera del dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
        if (!selectedLocality) setSearchTerm('');
        setHighlightedIndex(-1);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [selectedLocality]);

  // Navegación por teclado
  const handleKeyDown = (e) => {
    if (!isOpen && (e.key === 'ArrowDown' || e.key === 'Enter')) {
      setIsOpen(true);
      setHighlightedIndex(0);
      e.preventDefault();
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex(prev =>
          prev < filteredLocalities.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex(prev =>
          prev > 0 ? prev - 1 : filteredLocalities.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (highlightedIndex >= 0 && filteredLocalities[highlightedIndex]) {
          handleSelectLocality(filteredLocalities[highlightedIndex]);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        setSearchTerm('');
        setHighlightedIndex(-1);
        inputRef.current?.blur();
        break;
    }
  };

  const handleSelectLocality = (loc) => {
    onLocalityChange(loc);
    setSearchTerm(loc.name);
    setIsOpen(false);
    setHighlightedIndex(-1);
    inputRef.current?.blur();
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    if (!isOpen && value) setIsOpen(true);
    setHighlightedIndex(-1);
  };

  if (error) {
    return (
      <div className="text-red-600 text-sm">
        Error al cargar provincias: {error}
      </div>
    );
  }

  return (
    <div className={`space-y-3 ${className}`}>
      <div className="relative" ref={dropdownRef}>
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={loading ? "Cargando provincias..." : "Buscar provincia..."}
          disabled={loading}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-conexia-green focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
        />
        {isOpen && !loading && (
          <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
            {filteredLocalities.length > 0 ? (
              filteredLocalities.map((loc, index) => (
                <div
                  key={loc.id}
                  onClick={() => handleSelectLocality(loc)}
                  className={`px-3 py-2 cursor-pointer text-sm ${
                    index === highlightedIndex
                      ? 'bg-conexia-green text-white'
                      : 'hover:bg-gray-100'
                  }`}
                  onMouseEnter={() => setHighlightedIndex(index)}
                >
                  {loc.name}
                </div>
              ))
            ) : (
              <div className="px-3 py-2 text-sm text-gray-500">
                {searchTerm ? 'No se encontraron provincias' : 'No hay provincias disponibles'}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default LocalitySelector;
