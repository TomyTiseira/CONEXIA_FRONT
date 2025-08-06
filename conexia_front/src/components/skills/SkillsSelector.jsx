// components/skills/SkillsSelector.jsx
import { useState, useRef, useEffect } from 'react';
import { useSkills } from '@/hooks/useSkills';

const SkillsSelector = ({ selectedSkills = [], onSkillsChange, maxSkills = 20, className = '' }) => {
  const { skills, loading, error } = useSkills();
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const inputRef = useRef(null);
  const dropdownRef = useRef(null);

  // Filtrar habilidades basado en la búsqueda y excluir las ya seleccionadas
  const filteredSkills = skills.filter(skill => 
    skill.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
    !selectedSkills.some(selected => selected.id === skill.id)
  );

  // Cerrar dropdown al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
        setSearchTerm('');
        setHighlightedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Manejar navegación con teclado
  const handleKeyDown = (e) => {
    if (!isOpen) {
      if ((e.key === 'ArrowDown' || e.key === 'Enter') && selectedSkills.length < maxSkills) {
        setIsOpen(true);
        setHighlightedIndex(0);
        e.preventDefault();
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex(prev => 
          prev < filteredSkills.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex(prev => 
          prev > 0 ? prev - 1 : filteredSkills.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (highlightedIndex >= 0 && filteredSkills[highlightedIndex]) {
          handleSelectSkill(filteredSkills[highlightedIndex]);
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

  // Seleccionar habilidad
  const handleSelectSkill = (skill) => {
    if (selectedSkills.length >= maxSkills) {
      alert(`No puedes seleccionar más de ${maxSkills} habilidades`);
      return;
    }

    const newSelectedSkills = [...selectedSkills, skill];
    onSkillsChange(newSelectedSkills);
    setSearchTerm('');
    setIsOpen(false);
    setHighlightedIndex(-1);
    inputRef.current?.focus();
  };

  // Remover habilidad seleccionada
  const handleRemoveSkill = (skillId) => {
    const newSelectedSkills = selectedSkills.filter(skill => skill.id !== skillId);
    onSkillsChange(newSelectedSkills);
  };

  // Manejar cambio en el input de búsqueda
  const handleInputChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    if (!isOpen && value && selectedSkills.length < maxSkills) {
      setIsOpen(true);
    }
    setHighlightedIndex(-1);
  };

  // Manejar focus en el input
  const handleInputFocus = () => {
    if (selectedSkills.length < maxSkills) {
      setIsOpen(true);
    }
  };

  if (error) {
    return (
      <div className="text-red-600 text-sm">
        Error al cargar habilidades: {error}
      </div>
    );
  }

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Input de búsqueda */}
      <div className="relative" ref={dropdownRef}>
        <div className="relative">
          <input
            ref={inputRef}
            type="text"
            value={searchTerm}
            onChange={handleInputChange}
            onFocus={handleInputFocus}
            onKeyDown={handleKeyDown}
            placeholder={loading ? "Cargando habilidades..." : selectedSkills.length >= maxSkills ? `Máximo de ${maxSkills} habilidades alcanzado` : "Buscar habilidades..."}
            disabled={loading || selectedSkills.length >= maxSkills}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-conexia-green focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
          />
          <div className="absolute inset-y-0 right-0 flex items-center pr-3">
            <svg 
              className="w-4 h-4 text-gray-400" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>

        {/* Dropdown con opciones */}
        {isOpen && !loading && selectedSkills.length < maxSkills && (
          <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
            {filteredSkills.length > 0 ? (
              filteredSkills.map((skill, index) => (
                <div
                  key={skill.id}
                  onClick={() => handleSelectSkill(skill)}
                  className={`px-3 py-2 cursor-pointer text-sm ${
                    index === highlightedIndex 
                      ? 'bg-conexia-green text-white' 
                      : 'hover:bg-gray-100'
                  }`}
                  onMouseEnter={() => setHighlightedIndex(index)}
                >
                  {skill.name}
                </div>
              ))
            ) : (
              <div className="px-3 py-2 text-sm text-gray-500">
                {searchTerm ? 'No se encontraron habilidades' : 'No hay más habilidades disponibles'}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Habilidades seleccionadas */}
      {selectedSkills.length > 0 && (
        <div className="space-y-2">
          <div className="text-sm text-gray-600">
            Habilidades seleccionadas ({selectedSkills.length}/{maxSkills}):
          </div>
          <div className="flex flex-wrap gap-2">
            {selectedSkills.map(skill => (
              <div
                key={skill.id}
                className="inline-flex items-center px-3 py-1 bg-conexia-green text-white text-sm rounded-full"
              >
                <span>{skill.name}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveSkill(skill.id)}
                  className="ml-2 text-white hover:text-gray-200 focus:outline-none"
                  aria-label={`Remover ${skill.name}`}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Indicador de límite */}
      {selectedSkills.length >= maxSkills && (
        <div className="text-amber-600 text-xs">
          Has alcanzado el límite máximo de {maxSkills} habilidades.
        </div>
      )}
    </div>
  );
};

export default SkillsSelector;
