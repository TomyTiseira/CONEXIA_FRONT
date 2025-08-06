import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Pagination from '@/components/common/Pagination';
import { fetchProjects } from '@/service/projects/projectsFetch';
import { useAuth } from '@/context/AuthContext';
import { ROLES } from '@/constants/roles';

import NavbarCommunity from '@/components/navbar/NavbarCommunity';
import NavbarAdmin from '@/components/navbar/NavbarAdmin';
import NavbarModerator from '@/components/navbar/NavbarModerator';
import ProjectSearchFilters from './ProjectSearchFilters';
import ProjectSearchBar from './ProjectSearchBar';
import ProjectList from './ProjectList';

export default function ProjectSearch() {
  const router = useRouter();
  const { user } = useAuth();
  const [filters, setFilters] = useState({
    title: '',
    category: '',
    skills: [],
    collaboration: [],
    contract: [],
  });
  const [results, setResults] = useState([]);
  const [searched, setSearched] = useState(false);
  const [page, setPage] = useState(1);
  const pageSize = 12;

  // Aplica los filtros automáticamente al cambiar cualquier filtro
  const [pendingFilters, setPendingFilters] = useState(filters);
  useEffect(() => {
    const applyFilters = async () => {
      setSearched(true);
      setPage(1);
      const params = {
        title: pendingFilters.title,
        category: pendingFilters.category || '',
        skills: pendingFilters.skills || [],
        collaboration: Array.isArray(pendingFilters.collaboration) ? pendingFilters.collaboration : [],
        contract: Array.isArray(pendingFilters.contract) ? pendingFilters.contract : [],
      };
      const projects = await fetchProjects(params);
      setResults(projects);
      setFilters(pendingFilters);
    };
    applyFilters();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pendingFilters]);

  const handleSearch = (newFilters) => {
    setPendingFilters(newFilters);
  };

  // Renderizar la navbar apropiada según el rol
  const renderNavbar = () => {
    if (user?.role === ROLES.ADMIN) {
      return <NavbarAdmin />;
    } else if (user?.role === ROLES.MODERATOR) {
      return <NavbarModerator />;
    } else {
      return <NavbarCommunity />;
    }
  };

  return (
    <>
      {renderNavbar()}
      <div className="min-h-[calc(100vh-64px)] bg-[#f3f9f8] py-8 px-6 md:px-6 pb-20 md:pb-8 flex flex-col items-center">
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
          {user?.role === ROLES.USER && (
            <div className="flex justify-center md:justify-end w-full md:w-auto mt-4 md:mt-0">
              <button
                className="bg-conexia-green text-white font-semibold rounded-lg px-4 py-3 shadow hover:bg-conexia-green/90 transition text-sm whitespace-nowrap"
                onClick={() => router.push('/project/create')}
              >
                Publica tu proyecto
              </button>
            </div>
          )}
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
              <>
                <ProjectList projects={results.slice((page-1)*pageSize, page*pageSize)} />
                <Pagination
                  page={page}
                  hasPreviousPage={page > 1}
                  hasNextPage={results.length > page * pageSize}
                  onPageChange={setPage}
                />
              </>
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
