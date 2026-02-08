import React, { useRef } from 'react';
import SearchSection from './SearchSection';
import ProjectList from '@/components/project/search/ProjectList';
import { MdWorkOutline, MdKeyboardArrowDown, MdKeyboardArrowUp, MdCheck } from 'react-icons/md';

export default function ProjectsSection({
  projects,
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
      title="Proyectos"
      description="Explora proyectos publicados por la comunidad."
      showAll={showAll}
      onToggleShowAll={onToggleShowAll}
      showToggle={projects.length > 3}
      showContent={showContent}
      onToggleContent={onToggleContent}
      icon={MdWorkOutline}
      headerActions={
        <button
          className="flex items-center justify-center w-9 h-9 rounded-full border border-conexia-green/20 bg-conexia-green/10 hover:bg-conexia-green/20 text-conexia-green/80 transition"
          onClick={onToggleContent}
          aria-label={showContent ? 'Ocultar proyectos' : 'Mostrar proyectos'}
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
        <ProjectList projects={showAll ? projects : projects.slice(0, 3)} />
        {showAll && hasMore && (
          <div className="text-center py-4 text-conexia-green">Cargando más proyectos...</div>
        )}
      </div>
    </SearchSection>
  );
}
