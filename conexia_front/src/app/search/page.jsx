
'use client';
import { useSearchParams } from 'next/navigation';

import ProjectList from '@/components/project/search/ProjectList';
// import PeopleList from '@/components/people/PeopleList'; // Suponiendo que existe
import { useEffect, useState, useRef } from 'react';
import Navbar from '@/components/navbar/Navbar';
import Pagination from '@/components/common/Pagination';
import { fetchProjects } from '@/service/projects/projectsFetch';
import { fetchUsers } from '@/service/user/userFetch';
import PeopleList from '@/components/common/PeopleList';

export default function SearchResultsPage() {
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
  // const [services, setServices] = useState([]); // No implementado

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
    <div className="relative min-h-screen w-full bg-conexia-soft flex flex-col">
      {/* Navbar fijo arriba */}
      <div className="fixed top-0 left-0 w-full z-30">
        <Navbar />
      </div>
      <main className="flex-1 flex flex-row pt-24 pb-8 px-4 max-w-7xl mx-auto w-full bg-conexia-soft gap-8">
        {/* Menú lateral sticky */}
        <aside className="hidden md:flex flex-col gap-2 w-56 sticky top-28 h-fit bg-white rounded-2xl shadow p-4 mt-4">
          <button onClick={() => setSelectedSection('projects')} className={`text-left px-4 py-2 rounded-lg font-semibold ${selectedSection==='projects' ? 'bg-conexia-green text-white' : 'hover:bg-conexia-green/10 text-conexia-green'}`}>Proyectos</button>
          <button onClick={() => setSelectedSection('people')} className={`text-left px-4 py-2 rounded-lg font-semibold ${selectedSection==='people' ? 'bg-conexia-green text-white' : 'hover:bg-conexia-green/10 text-conexia-green'}`}>Personas</button>
          <button onClick={() => setSelectedSection('services')} className={`text-left px-4 py-2 rounded-lg font-semibold ${selectedSection==='services' ? 'bg-conexia-green text-white' : 'hover:bg-conexia-green/10 text-conexia-green'}`}>Servicios</button>
        </aside>
        {/* Contenido central con secciones y scroll independiente */}
        <section className="flex-1 flex flex-col gap-12">
          {/* Sección Proyectos */}
          <div ref={projectsSectionRef} id="projects-section">
            <h2 className="text-2xl font-bold text-conexia-green mb-4">Proyectos</h2>
            <div ref={projectsScrollRef} style={{ maxHeight: 400, overflowY: 'auto' }}
              onScroll={e => {
                const el = e.target;
                if (el.scrollTop + el.clientHeight >= el.scrollHeight - 10 && projectsHasMore) {
                  setProjectsPage(p => p + 1);
                }
              }}
              className="bg-white rounded-xl shadow p-4">
              <ProjectList projects={projects} />
              {projectsHasMore && <div className="text-center py-4 text-conexia-green">Cargando más proyectos...</div>}
            </div>
          </div>
          {/* Sección Personas */}
          <div ref={peopleSectionRef} id="people-section">
            <h2 className="text-2xl font-bold text-conexia-green mb-4">Personas</h2>
            <div ref={peopleScrollRef} style={{ maxHeight: 400, overflowY: 'auto' }}
              onScroll={e => {
                const el = e.target;
                if (el.scrollTop + el.clientHeight >= el.scrollHeight - 10 && peopleHasMore) {
                  setPeoplePage(p => p + 1);
                }
              }}
              className="bg-white rounded-xl shadow p-4">
              <PeopleList people={people} />
              {peopleHasMore && <div className="text-center py-4 text-conexia-green">Cargando más personas...</div>}
            </div>
          </div>
          {/* Sección Servicios (placeholder) */}
          <div ref={servicesSectionRef} id="services-section">
            <h2 className="text-2xl font-bold text-conexia-green mb-4">Servicios</h2>
            <div className="bg-white rounded-xl shadow p-4 min-h-[120px] flex items-center justify-center text-gray-400">
              Próximamente...
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
