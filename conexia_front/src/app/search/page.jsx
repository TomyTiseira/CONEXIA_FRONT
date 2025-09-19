
'use client';
import { useSearchParams } from 'next/navigation';


import ProjectList from '@/components/project/search/ProjectList';
import { useEffect, useState, useRef } from 'react';
import Navbar from '@/components/navbar/Navbar';
import { fetchProjects } from '@/service/projects/projectsFetch';
import { fetchUsers } from '@/service/user/userFetch';
import PeopleList from '@/components/common/PeopleList';
import { MdWorkOutline, MdPersonOutline, MdBuild, MdKeyboardArrowDown, MdKeyboardArrowUp, MdCheck } from 'react-icons/md';

export default function SearchResultsPage() {
  // Estado para mostrar todos o solo 3 por sección
  const [showAllProjects, setShowAllProjects] = useState(false);
  const [showAllPeople, setShowAllPeople] = useState(false);
  const [showAllServices, setShowAllServices] = useState(false); // Placeholder para futuro
  // Estado para mostrar/ocultar secciones
  const [showProjects, setShowProjects] = useState(true);
  const [showPeople, setShowPeople] = useState(true);
  const [showServices, setShowServices] = useState(true);
  const params = useSearchParams();
  const query = params.get('q') || '';
  // --- Proyectos ---
  const [projects, setProjects] = useState([]);
  const [projectsPage, setProjectsPage] = useState(1);
  const [projectsHasMore, setProjectsHasMore] = useState(true);
  const projectsSectionRef = useRef(null);
  const projectsScrollRef = useRef(null);
  // --- Personas ---
  const [people, setPeople] = useState([]);
  const [peoplePage, setPeoplePage] = useState(1);
  const [peopleHasMore, setPeopleHasMore] = useState(true);
  const peopleSectionRef = useRef(null);
  const peopleScrollRef = useRef(null);
  // --- Servicios (placeholder) ---
  const servicesSectionRef = useRef(null);
  // --- Menú ---
  const [selectedSection, setSelectedSection] = useState('projects');

  // Sidebar sections config (similar a ConnectionsSidebar)
  const sections = [
    {
      key: 'projects',
      label: 'Proyectos',
      icon: MdWorkOutline,
      description: 'Explora proyectos publicados',
    },
    {
      key: 'people',
      label: 'Personas',
      icon: MdPersonOutline,
      description: 'Encuentra personas en la comunidad',
    },
    {
      key: 'services',
      label: 'Servicios',
      icon: MdBuild,
      description: 'Servicios ofrecidos por usuarios',
    },
  ];

  // --- Fetch inicial y paginado para proyectos ---
  useEffect(() => {
    let ignore = false;
    async function fetchMoreProjects() {
      try {
        const { projects: newProjects, pagination } = await fetchProjects({ title: query, page: projectsPage, limit: 6 });
        if (!ignore) {
          setProjects(prev => projectsPage === 1 ? newProjects : [...prev, ...newProjects]);
          setProjectsHasMore(pagination?.currentPage < pagination?.totalPages);
        }
      } catch (e) {
        if (!ignore) setProjectsHasMore(false);
      }
    }
    fetchMoreProjects();
    return () => { ignore = true; };
  }, [query, projectsPage]);

  // --- Fetch inicial y paginado para personas ---
  useEffect(() => {
    let ignore = false;
    async function fetchMorePeople() {
      try {
        const users = await fetchUsers({ search: query, page: peoplePage, limit: 6 });
        if (!ignore) {
          setPeople(prev => peoplePage === 1 ? users : [...prev, ...users]);
          setPeopleHasMore((users?.length || 0) === 6);
        }
      } catch (e) {
        if (!ignore) setPeopleHasMore(false);
      }
    }
    fetchMorePeople();
    return () => { ignore = true; };
  }, [query, peoplePage]);

  // --- Scroll a sección al seleccionar en menú ---
  useEffect(() => {
    const refs = {
      projects: projectsSectionRef,
      people: peopleSectionRef,
      services: servicesSectionRef,
    };
    if (refs[selectedSection]?.current) {
      refs[selectedSection].current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [selectedSection]);

  return (
    <div className="relative min-h-screen w-full bg-gray-50 flex flex-col">
      {/* Navbar fijo arriba */}
      <div className="fixed top-0 left-0 w-full z-30">
        <Navbar />
      </div>
      <main className="flex-1 flex flex-col md:flex-row pt-24 pb-8 px-2 md:px-6 max-w-7xl mx-auto w-full gap-2 md:gap-6">
        {/* Sidebar estilo conexiones */}
  <div className="w-full max-w-[400px] mx-auto md:w-[270px] md:max-w-none md:mx-0 lg:w-[300px] flex-shrink-0 flex flex-col items-stretch md:items-start">
          {/* Mobile: arriba, Desktop: sidebar a la izquierda */}
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
          <div ref={projectsSectionRef} id="projects-section">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between bg-white rounded-2xl shadow-xl border-2 border-conexia-green/20 px-6 py-3 mb-6 gap-2 md:gap-0" style={{minHeight: 56}}>
              <div>
                <span className="text-conexia-green text-2xl font-bold block">Proyectos</span>
                <span className="text-conexia-green/90 font-medium block text-base mt-1">Explora proyectos publicados por la comunidad.</span>
              </div>
              <div className="flex items-center gap-2 md:ml-4">
                {projects.length > 3 && (
                  <button
                    className="flex items-center gap-1 px-3 py-1 rounded-lg text-sm font-semibold transition border border-conexia-green/20 bg-conexia-green/10 text-conexia-green/80 hover:bg-conexia-green/20"
                    onClick={() => setShowAllProjects(v => !v)}
                  >
                    <span className="text-lg">{showAllProjects ? <MdCheck size={18} /> : null}</span> Ver todos
                  </button>
                )}
                <button
                  className="flex items-center justify-center w-9 h-9 rounded-full border border-conexia-green/20 bg-conexia-green/10 hover:bg-conexia-green/20 text-conexia-green/80 transition"
                  onClick={() => setShowProjects((v) => !v)}
                  aria-label={showProjects ? 'Ocultar proyectos' : 'Mostrar proyectos'}
                >
                  {showProjects ? <MdKeyboardArrowUp size={24} /> : <MdKeyboardArrowDown size={24} />}
                </button>
              </div>
            </div>
            {showProjects && (
              <div
                ref={projectsScrollRef}
                style={{ maxHeight: 600, overflowY: 'auto' }}
                onScroll={e => {
                  const el = e.target;
                  if (el.scrollTop + el.clientHeight >= el.scrollHeight - 10 && projectsHasMore) {
                    setProjectsPage(p => p + 1);
                  }
                }}
                className="bg-[#f3f7f6] rounded-2xl shadow-xl border-2 border-conexia-green/20 p-4 flex flex-col"
              >
                <ProjectList projects={showAllProjects ? projects : projects.slice(0, 3)} />
                {showAllProjects && projectsHasMore && (
                  <div className="text-center py-4 text-conexia-green">Cargando más proyectos...</div>
                )}
              </div>
            )}
          </div>
          {/* Personas */}
          <div ref={peopleSectionRef} id="people-section">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between bg-white rounded-2xl shadow-xl border-2 border-conexia-green/20 px-6 py-3 mb-6 gap-2 md:gap-0" style={{minHeight: 56}}>
              <div>
                <span className="text-conexia-green text-2xl font-bold block">Personas</span>
                <span className="text-conexia-green/90 font-medium block text-base mt-1">Encuentra personas en la comunidad de Conexia.</span>
              </div>
              <div className="flex items-center gap-2 md:ml-4">
                {people.length > 3 && (
                  <button
                    className="flex items-center gap-1 px-3 py-1 rounded-lg text-sm font-semibold transition border border-conexia-green/20 bg-conexia-green/10 text-conexia-green/80 hover:bg-conexia-green/20"
                    onClick={() => setShowAllPeople(v => !v)}
                  >
                    <span className="text-lg">{showAllPeople ? <MdCheck size={18} /> : null}</span> Ver todos
                  </button>
                )}
                <button
                  className="flex items-center justify-center w-9 h-9 rounded-full border border-conexia-green/20 bg-conexia-green/10 hover:bg-conexia-green/20 text-conexia-green/80 transition"
                  onClick={() => setShowPeople((v) => !v)}
                  aria-label={showPeople ? 'Ocultar personas' : 'Mostrar personas'}
                >
                  {showPeople ? <MdKeyboardArrowUp size={24} /> : <MdKeyboardArrowDown size={24} />}
                </button>
              </div>
            </div>
            {showPeople && (
              <div
                ref={peopleScrollRef}
                style={{ maxHeight: 600, overflowY: 'auto' }}
                onScroll={e => {
                  const el = e.target;
                  if (el.scrollTop + el.clientHeight >= el.scrollHeight - 10 && peopleHasMore) {
                    setPeoplePage(p => p + 1);
                  }
                }}
                className="bg-[#f3f7f6] rounded-2xl shadow-xl border-2 border-conexia-green/20 p-4 flex flex-col"
              >
                <PeopleList people={showAllPeople ? people : people.slice(0, 3)} />
                {showAllPeople && peopleHasMore && (
                  <div className="text-center py-4 text-conexia-green">Cargando más personas...</div>
                )}
              </div>
            )}
          </div>
          {/* Servicios (placeholder) */}
          <div ref={servicesSectionRef} id="services-section">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between bg-white rounded-2xl shadow-xl border-2 border-conexia-green/20 px-6 py-3 mb-6 gap-2 md:gap-0" style={{minHeight: 56}}>
              <div>
                <span className="text-conexia-green text-2xl font-bold block">Servicios</span>
                <span className="text-conexia-green/90 font-medium block text-base mt-1">Servicios ofrecidos por usuarios de la comunidad.</span>
              </div>
              <button
                className="flex items-center justify-center w-9 h-9 rounded-full border border-conexia-green/20 bg-conexia-green/10 hover:bg-conexia-green/20 text-conexia-green/80 transition"
                onClick={() => setShowServices((v) => !v)}
                aria-label={showServices ? 'Ocultar servicios' : 'Mostrar servicios'}
              >
                {showServices ? <MdKeyboardArrowUp size={24} /> : <MdKeyboardArrowDown size={24} />}
              </button>
            </div>
            {showServices && (
              <div className="bg-[#f3f7f6] rounded-2xl shadow-xl border-2 border-conexia-green/20 p-4 min-h-[120px] flex items-center justify-center text-gray-400 flex-col">
                {/* Aquí podrías mostrar hasta 3 servicios y un botón para ver todos en el futuro */}
                Próximamente...
              </div>
            )}
          </div>
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
