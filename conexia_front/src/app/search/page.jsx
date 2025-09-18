
'use client';
import { useSearchParams } from 'next/navigation';

import ProjectList from '@/components/project/search/ProjectList';
// import PeopleList from '@/components/people/PeopleList'; // Suponiendo que existe
import { useEffect, useState } from 'react';
import Navbar from '@/components/navbar/Navbar';
import { fetchProjects } from '@/service/projects/projectsFetch';
import { fetchUsers } from '@/service/user/userFetch';

export default function SearchResultsPage() {
  const params = useSearchParams();
  const query = params.get('q') || '';
  const [projects, setProjects] = useState([]);
  const [people, setPeople] = useState([]);
  const [showProjects, setShowProjects] = useState(true);
  const [showPeople, setShowPeople] = useState(true);
  // const [services, setServices] = useState([]); // No implementado

  useEffect(() => {
    async function fetchResults() {
      // Buscar proyectos reales
      try {
        const { projects } = await fetchProjects({ title: query, limit: 3 });
        setProjects(projects || []);
      } catch (e) {
        setProjects([]);
      }
      // Buscar personas reales
      try {
        const users = await fetchUsers({ search: query, page: 1, limit: 3 });
        setPeople(users || []);
      } catch (e) {
        setPeople([]);
      }
    }
    fetchResults();
  }, [query]);

  return (
    <div className="relative min-h-screen w-full bg-conexia-soft overflow-hidden flex flex-col">
      {/* Navbar fijo arriba */}
      <div className="fixed top-0 left-0 w-full z-30">
        <Navbar />
      </div>

      {/* Contenido principal */}
      <main className="flex-1 flex flex-col items-center pt-24 pb-8 px-4 max-w-5xl mx-auto w-full bg-conexia-soft">
        <div className="w-full flex justify-center mb-8">
          <h1 className="bg-white/80 py-4 rounded-2xl shadow text-3xl md:text-3xl font-bold text-conexia-green border border-conexia-green/10 tracking-tight w-full max-w-4xl text-center mx-auto">
            Resultados para "{query}"
          </h1>
        </div>
        <div className="mb-8 w-full">
          <div className="w-full flex items-center justify-start mb-4">
            <div className="bg-white/80 px-8 py-2 rounded-2xl shadow border border-conexia-green/10 tracking-tight w-full max-w-md flex items-center gap-4">
              <h2 className="text-lg md:text-xl font-bold text-conexia-green text-left flex-1">
                Proyectos
              </h2>
              <label className="flex items-center gap-1 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={showProjects}
                  onChange={() => setShowProjects(v => !v)}
                  className="accent-conexia-green w-4 h-4 rounded"
                />
                <span className="text-xs text-conexia-green font-medium">Mostrar</span>
              </label>
            </div>
          </div>
          {/* Muestra hasta 3 proyectos */}
          {showProjects && <ProjectList projects={projects.slice(0, 3)} />}
          {/* Botón para ver todos los proyectos */}
          {showProjects && (
            <div className="mt-2">
              <a href={`/project/search?q=${encodeURIComponent(query)}`} className="text-conexia-green hover:underline text-sm font-medium">Ver todos los proyectos</a>
            </div>
          )}
        </div>
        <div className="mb-8 w-full">
          <div className="w-full flex items-center justify-start mb-4">
            <div className="bg-white/80 px-8 py-2 rounded-2xl shadow border border-conexia-green/10 tracking-tight w-full max-w-md flex items-center gap-4">
              <h2 className="text-lg md:text-xl font-bold text-conexia-green text-left flex-1">
                Personas
              </h2>
              <label className="flex items-center gap-1 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={showPeople}
                  onChange={() => setShowPeople(v => !v)}
                  className="accent-conexia-green w-4 h-4 rounded"
                />
                <span className="text-xs text-conexia-green font-medium">Mostrar</span>
              </label>
            </div>
          </div>
          {/* Muestra hasta 3 personas */}
          {showPeople && (
            <>
              {/* <PeopleList people={people.slice(0, 3)} /> */}
              <div className="mt-2">
                <a href={`/people/search?q=${encodeURIComponent(query)}`} className="text-conexia-green hover:underline text-sm font-medium">Ver todas las personas</a>
              </div>
            </>
          )}
        </div>
        {/* Servicios no implementado */}
      </main>
    </div>
  );
}
