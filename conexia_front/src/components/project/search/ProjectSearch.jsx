import { useState } from 'react';
import { fetchProjects } from '@/service/projects/projectsFetch';

import NavbarCommunity from '@/components/navbar/NavbarCommunity';
import ProjectSearchFilters from './ProjectSearchFilters';
import ProjectSearchBar from './ProjectSearchBar';
import ProjectList from './ProjectList';

export default function ProjectSearch() {
  const [filters, setFilters] = useState({
    title: '',
    category: '',
    skills: [],
    collaboration: '',
  });
  const [results, setResults] = useState([]);
  const [searched, setSearched] = useState(false);

  const handleSearch = async (newFilters) => {
    setFilters(newFilters);
    setSearched(true);
    const projects = await fetchProjects(newFilters);
    setResults(projects);
  };

  return (
    <>
      <NavbarCommunity />
      <div className="min-h-[calc(100vh-64px)] bg-[#f3f9f8] py-8 px-2 md:px-6 flex flex-col items-center">
      <div className="w-full max-w-7xl flex flex-col gap-6">
        {/* Header: título, buscador y botón */}
        <div className="flex flex-col md:flex-row md:items-center md:gap-6 mb-2 w-full">
          <div className="flex flex-col md:flex-row md:items-center w-full">
            <h1 className="text-3xl font-bold text-conexia-green bg-white rounded-lg px-6 py-3 shadow-sm w-full md:w-[320px] text-center md:text-left">Buscar Proyecto</h1>
            <div className="flex-1 flex justify-center md:justify-center w-full md:w-auto md:ml-6">
              <div className="w-full max-w-xl">
                <ProjectSearchBar filters={filters} onSearch={handleSearch} />
              </div>
            </div>
          </div>
          <div className="flex justify-center md:justify-end w-full md:w-auto mt-4 md:mt-0">
            <button className="bg-conexia-green text-white font-semibold rounded-lg px-6 py-3 shadow hover:bg-conexia-green/90 transition text-base w-full md:w-auto max-w-xs">
              ¿Tienes una idea que necesita apoyo? <br className="hidden md:block" /> Publica tu proyecto
            </button>
          </div>
        </div>
        <div className="flex flex-col md:flex-row gap-6">
          {/* Filtros laterales */}
          <aside className="w-full md:w-[320px] flex-shrink-0">
            <div className="bg-white rounded-xl shadow p-5 mb-4">
              <h2 className="text-lg font-bold text-conexia-green mb-4">Filtrar por</h2>
              <ProjectSearchFilters filters={filters} onChange={handleSearch} />
            </div>
          </aside>
          {/* Contenido principal */}
          <section className="flex-1 min-w-0">
            {searched ? (
              <ProjectList projects={results} />
            ) : (
              <div className="text-center text-conexia-green mt-12 text-lg opacity-70">
                Usa la barra de búsqueda o los filtros para ver proyectos.
              </div>
            )}
          </section>
        </div>
      </div>
      </div>
    </>
  );
}
