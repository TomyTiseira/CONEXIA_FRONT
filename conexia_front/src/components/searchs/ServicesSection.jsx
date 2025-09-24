import React, { useRef } from 'react';
import SearchSection from './SearchSection';
import ServiceList from '@/components/services/ServiceList';
import { FaTools } from 'react-icons/fa';
import { MdKeyboardArrowDown, MdKeyboardArrowUp } from 'react-icons/md';

export default function ServicesSection({
  services,
  showAll,
  onToggleShowAll,
  showContent,
  onToggleContent,
  hasMore,
  onScroll,
}) {
  const scrollRef = useRef(null);
  
  return (
    <SearchSection
      title="Servicios"
      description="Descubre servicios ofrecidos por la comunidad."
      showAll={showAll}
      onToggleShowAll={onToggleShowAll}
      showToggle={services.length > 3}
      showContent={showContent}
      onToggleContent={onToggleContent}
      icon={FaTools}
      headerActions={
        <button
          className="flex items-center justify-center w-9 h-9 rounded-full border border-conexia-green/20 bg-conexia-green/10 hover:bg-conexia-green/20 text-conexia-green/80 transition"
          onClick={onToggleContent}
          aria-label={showContent ? 'Ocultar servicios' : 'Mostrar servicios'}
        >
          {showContent ? <MdKeyboardArrowUp size={24} /> : <MdKeyboardArrowDown size={24} />}
        </button>
      }
    >
      <div
        ref={scrollRef}
        style={{ maxHeight: 600, overflowY: 'auto' }}
        onScroll={onScroll}
      >
        <ServiceList 
          services={showAll ? services : services.slice(0, 3)} 
          loading={false}
          error={null}
          emptyMessage="No se encontraron servicios"
          emptyDescription="No hay servicios que coincidan con tu búsqueda."
        />
        {showAll && hasMore && (
          <div className="text-center py-4 text-conexia-green">Cargando más servicios...</div>
        )}
      </div>
    </SearchSection>
  );
}