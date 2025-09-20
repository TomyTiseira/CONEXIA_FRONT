
"use client";
import React from 'react';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';


import { useRef } from 'react';
import Navbar from '@/components/navbar/Navbar';
import SearchSidebar from '@/components/searchs/SearchSidebar';
import ProjectsSection from '@/components/searchs/ProjectsSection';
import PeopleSection from '@/components/searchs/PeopleSection';
import { useSearchSections } from '@/components/searchs/useSearchSections';

export default function SearchResultsPage() {
  return (
    <Suspense fallback={<div>Cargando resultados...</div>}>
      <SearchResultsPageContent />
    </Suspense>
  );
}

function SearchResultsPageContent() {
  const params = useSearchParams();
  const query = params.get('q') || '';
  const [selectedSection, setSelectedSection] = React.useState('projects');
  const projectsSectionRef = useRef(null);
  const peopleSectionRef = useRef(null);
  // Custom hook para lógica de búsqueda y paginación
  const {
    projects, projectsPage, setProjectsPage, projectsHasMore, showAllProjects, setShowAllProjects, showProjects, setShowProjects,
    people, peoplePage, setPeoplePage, peopleHasMore, showAllPeople, setShowAllPeople, showPeople, setShowPeople
  } = useSearchSections(query);

  // Sidebar sections dinámico
  const sections = [];
  if (projects.length > 0) {
    sections.push({
      key: 'projects',
      label: 'Proyectos',
      icon: require('react-icons/md').MdWorkOutline,
      description: 'Explora proyectos publicados',
    });
  }
  if (people.length > 0) {
    sections.push({
      key: 'people',
      label: 'Personas',
      icon: require('react-icons/md').MdPersonOutline,
      description: 'Encuentra personas en la comunidad',
    });
  }

  return (
    <div className="relative min-h-screen w-full bg-gray-50 flex flex-col">
      {/* Navbar fijo arriba */}
      <div className="fixed top-0 left-0 w-full z-30">
        <Navbar />
      </div>
      <main className="flex-1 flex flex-col md:flex-row pt-24 pb-8 px-2 md:px-6 max-w-7xl mx-auto w-full gap-2 md:gap-6">
        {/* Sidebar */}
        <div className="w-full max-w-[400px] mx-auto md:w-[270px] md:max-w-none md:mx-0 lg:w-[300px] flex-shrink-0 flex flex-col items-stretch md:items-start">
          <div className="block md:hidden mt-2 mb-2">
            <SearchSidebar sections={sections} selected={selectedSection} onSelect={setSelectedSection} />
          </div>
          <div className="hidden md:block">
            <SearchSidebar sections={sections} selected={selectedSection} onSelect={setSelectedSection} />
          </div>
        </div>
        {/* Contenido principal */}
        <section className="flex-1 flex flex-col gap-12">
          {/* Proyectos */}
          {projects.length > 0 && (
            <ProjectsSection
              projects={projects}
              showAll={showAllProjects}
              onToggleShowAll={() => setShowAllProjects(v => !v)}
              showContent={showProjects}
              onToggleContent={() => setShowProjects(v => !v)}
              hasMore={projectsHasMore}
              onScroll={e => {
                const el = e.target;
                if (el.scrollTop + el.clientHeight >= el.scrollHeight - 10 && projectsHasMore) {
                  setProjectsPage(p => p + 1);
                }
              }}
            />
          )}
          {/* Personas */}
          {people.length > 0 && (
            <PeopleSection
              people={people}
              showAll={showAllPeople}
              onToggleShowAll={() => setShowAllPeople(v => !v)}
              showContent={showPeople}
              onToggleContent={() => setShowPeople(v => !v)}
              hasMore={peopleHasMore}
              onScroll={e => {
                const el = e.target;
                if (el.scrollTop + el.clientHeight >= el.scrollHeight - 10 && peopleHasMore) {
                  setPeoplePage(p => p + 1);
                }
              }}
            />
          )}
        </section>
      </main>
    </div>
  );
// Sidebar reutilizando el estilo de ConnectionsSidebar pero adaptado a búsqueda general
function SearchSidebar({ sections, selected, onSelect }) {
  return (
    <aside
      className="sticky top-24 bg-white rounded-2xl shadow-xl border-2 border-conexia-green/20 px-8 py-8 flex-col gap-4 mt-0 transition-all mx-0"
      style={{ minWidth: '320px', maxWidth: 440, width: '100%', height: 'fit-content', minHeight: 320 }}
    >
      <h2 className="text-conexia-green font-semibold text-xl tracking-tight mb-4">Panel de búsqueda</h2>
      <nav className="flex flex-col gap-2">
        {sections.map(({ key, label, icon: Icon, description }) => (
          <div key={key} className="relative w-full">
            <button
              onClick={() => onSelect(key)}
              className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-all text-left hover:bg-conexia-green/10 focus:outline-none border border-transparent w-full ${
                selected === key ? 'bg-conexia-green/10 border-conexia-green text-conexia-green font-semibold shadow-md' : 'text-conexia-green/80'
              }`}
              aria-current={selected === key}
              style={{ minHeight: 56 }}
            >
              <Icon size={22} className="shrink-0 text-conexia-green/80" />
              <span className="flex flex-col items-start w-full relative">
                <span className="text-base leading-tight flex items-center">
                  {label}
                </span>
                <span className="text-xs text-conexia-green/60 leading-tight">{description}</span>
              </span>
            </button>
          </div>
        ))}
      </nav>
    </aside>
  );
}
}
