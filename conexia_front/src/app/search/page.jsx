
"use client";
import React from 'react';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';


import { useRef } from 'react';
import Navbar from '@/components/navbar/Navbar';
import SearchSidebar from '@/components/searchs/SearchSidebar';
import ProjectsSection from '@/components/searchs/ProjectsSection';
import PeopleSection from '@/components/searchs/PeopleSection';
import ServicesSection from '@/components/searchs/ServicesSection';
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
  const projectsSectionRef = React.useRef(null);
  const peopleSectionRef = React.useRef(null);
  const servicesSectionRef = React.useRef(null);
  // Custom hook para lógica de búsqueda y paginación
  const {
    projects, projectsPage, setProjectsPage, projectsHasMore, showAllProjects, setShowAllProjects, showProjects, setShowProjects,
    people, peoplePage, setPeoplePage, peopleHasMore, showAllPeople, setShowAllPeople, showPeople, setShowPeople,
    services, servicesPage, setServicesPage, servicesHasMore, showAllServices, setShowAllServices, showServices, setShowServices
  } = useSearchSections(query);

  // Cargar más resultados automáticamente cuando se activa "Ver todos" y hay más páginas disponibles
  React.useEffect(() => {
    if (showAllPeople && peopleHasMore && people.length === peoplePage * 6) {
      setPeoplePage(p => p + 1);
    }
  }, [showAllPeople, peopleHasMore, people.length, peoplePage, setPeoplePage]);

  React.useEffect(() => {
    if (showAllProjects && projectsHasMore && projects.length === projectsPage * 6) {
      setProjectsPage(p => p + 1);
    }
  }, [showAllProjects, projectsHasMore, projects.length, projectsPage, setProjectsPage]);

  React.useEffect(() => {
    if (showAllServices && servicesHasMore && services.length === servicesPage * 6) {
      setServicesPage(p => p + 1);
    }
  }, [showAllServices, servicesHasMore, services.length, servicesPage, setServicesPage]);

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
  if (services.length > 0) {
    sections.push({
      key: 'services',
      label: 'Servicios',
      icon: require('react-icons/fa').FaTools,
      description: 'Descubre servicios de la comunidad',
    });
  }

  // Función para hacer scroll a la sección correspondiente
  const handleSidebarSelect = (key) => {
    setSelectedSection(key);
    setTimeout(() => {
      if (key === 'projects' && projectsSectionRef.current) {
        projectsSectionRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      } else if (key === 'people' && peopleSectionRef.current) {
        peopleSectionRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      } else if (key === 'services' && servicesSectionRef.current) {
        servicesSectionRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 50);
  };
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
            <SearchSidebar sections={sections} selected={selectedSection} onSelect={handleSidebarSelect} />
          </div>
          <div className="hidden md:block">
            <SearchSidebar sections={sections} selected={selectedSection} onSelect={handleSidebarSelect} />
          </div>
        </div>
        {/* Contenido principal */}
        <section className="flex-1 flex flex-col gap-12">
          {/* Mensaje cuando no hay resultados */}
          {projects.length === 0 && people.length === 0 && services.length === 0 && query.trim() && (
            <div className="flex items-center justify-center min-h-[400px]">
              <div className="text-center max-w-md mx-auto px-6">
                <div className="w-20 h-20 bg-conexia-green/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg className="w-10 h-10 text-conexia-green/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-conexia-green mb-3">
                  No encontramos resultados
                </h3>
                <p className="text-gray-600 mb-4 leading-relaxed">
                  No hay coincidencias para "<span className="font-medium text-conexia-green">{query}</span>" en proyectos, personas o servicios.
                </p>
                <p className="text-sm text-gray-500">
                  Intenta con términos diferentes o revisa la ortografía de tu búsqueda.
                </p>
              </div>
            </div>
          )}
          
          {/* Proyectos */}
          {projects.length > 0 && (
            <div ref={projectsSectionRef}>
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
            </div>
          )}
          {/* Personas */}
          {people.length > 0 && (
            <div ref={peopleSectionRef}>
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
            </div>
          )}
          {/* Servicios */}
          {services.length > 0 && (
            <div ref={servicesSectionRef}>
              <ServicesSection
                services={services}
                showAll={showAllServices}
                onToggleShowAll={() => setShowAllServices(v => !v)}
                showContent={showServices}
                onToggleContent={() => setShowServices(v => !v)}
                hasMore={servicesHasMore}
                onScroll={e => {
                  const el = e.target;
                  if (el.scrollTop + el.clientHeight >= el.scrollHeight - 10 && servicesHasMore) {
                    setServicesPage(p => p + 1);
                  }
                }}
              />
            </div>
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
      {sections.length > 0 ? (
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
      ) : (
        <div className="flex items-center justify-center min-h-[200px]">
          <div className="text-center">
            <div className="w-16 h-16 bg-conexia-green/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-conexia-green/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <p className="text-conexia-green/80 text-sm font-medium mb-2">Sin resultados</p>
            <p className="text-conexia-green/60 text-xs leading-relaxed">
              No se encontraron coincidencias en ninguna categoría
            </p>
          </div>
        </div>
      )}
    </aside>
  );
}
}
