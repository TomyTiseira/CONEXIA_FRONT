import React, { useRef, useState, useEffect } from 'react';
import SearchSection from './SearchSection';
import PeopleList from '@/components/common/PeopleList';
import { MdPersonOutline, MdKeyboardArrowDown, MdKeyboardArrowUp, MdCheck } from 'react-icons/md';

export default function PeopleSection({
  people,
  showAll,
  onToggleShowAll,
  showContent,
  onToggleContent,
  hasMore,
  onScroll,
}) {
  const scrollRef = useRef(null);
  const [isMobile, setIsMobile] = useState(false);
  const [isClient, setIsClient] = useState(false);
  
  // Detectar si estamos en móvil
  useEffect(() => {
    setIsClient(true);
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 768); // md breakpoint
    };
    
    checkIsMobile();
    window.addEventListener('resize', checkIsMobile);
    
    return () => window.removeEventListener('resize', checkIsMobile);
  }, []);
  
  // Lógica responsiva para mostrar el botón "Ver todos"
  // Solo aplicar la lógica después de que el componente se haya hidratado en el cliente
  const shouldShowToggle = !isClient ? false : (isMobile ? people.length > 2 : people.length >= 5);
  const defaultShowCount = !isClient ? people.length : (isMobile ? 2 : 5);
  
  return (
    <SearchSection
      title="Personas"
      description="Encuentra personas en la comunidad de Conexia."
      showAll={showAll}
      onToggleShowAll={onToggleShowAll}
      showToggle={shouldShowToggle}
      showContent={showContent}
      onToggleContent={onToggleContent}
      icon={MdPersonOutline}
      headerActions={
        <button
          className="flex items-center justify-center w-9 h-9 rounded-full border border-conexia-green/20 bg-conexia-green/10 hover:bg-conexia-green/20 text-conexia-green/80 transition"
          onClick={onToggleContent}
          aria-label={showContent ? 'Ocultar personas' : 'Mostrar personas'}
        >
          {showContent ? <MdKeyboardArrowUp size={24} /> : <MdKeyboardArrowDown size={24} />}
        </button>
      }
    >
      <div
        ref={scrollRef}
        className="mb-4 md:mb-0"
        style={{ maxHeight: 600, overflowY: 'auto' }}
        onScroll={onScroll}
      >
        <PeopleList people={showAll ? people : people.slice(0, defaultShowCount)} />
        {showAll && hasMore && (
          <div className="text-center py-4 text-conexia-green">Cargando más personas...</div>
        )}
      </div>
    </SearchSection>
  );
}
