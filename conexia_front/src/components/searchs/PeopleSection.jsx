import React, { useRef } from 'react';
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
  return (
    <SearchSection
      title="Personas"
      description="Encuentra personas en la comunidad de Conexia."
      showAll={showAll}
      onToggleShowAll={onToggleShowAll}
      showToggle={people.length > 3}
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
        style={{ maxHeight: 600, overflowY: 'auto' }}
        onScroll={onScroll}
      >
        <PeopleList people={showAll ? people : people.slice(0, 3)} />
        {showAll && hasMore && (
          <div className="text-center py-4 text-conexia-green">Cargando más personas...</div>
        )}
      </div>
    </SearchSection>
  );
}
