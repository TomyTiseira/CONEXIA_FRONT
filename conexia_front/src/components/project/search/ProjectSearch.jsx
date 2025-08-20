import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Pagination from '@/components/common/Pagination';
import { fetchProjects } from '@/service/projects/projectsFetch';
import { useAuth } from '@/context/AuthContext';
import { useUserStore } from '@/store/userStore';
import { ROLES } from '@/constants/roles';
import { useRecommendations } from '@/hooks/project/useRecommendations';
import { limitAndCleanProjects } from '@/utils/recommendationsUtils';

import Navbar from '@/components/navbar/Navbar';
import ProjectSearchFilters from './ProjectSearchFilters';
import ProjectSearchBar from './ProjectSearchBar';
import ProjectList from './ProjectList';
import RecommendationsCarousel from './RecommendationsCarousel';
import EmptyRecommendationsState from './EmptyRecommendationsState';
import RecommendationsLoading from './RecommendationsLoading';
import NoRecommendationsFound from './NoRecommendationsFound';
import CompactNoRecommendations from './CompactNoRecommendations';

export default function ProjectSearch() {
  const router = useRouter();
  const { user } = useAuth();
  const { roleName } = useUserStore();
  const { recommendations, allProjects, isLoading: isLoadingRecommendations, hasRecommendations, userHasSkills } = useRecommendations();
  
  const [filters, setFilters] = useState({
    title: '',
    category: '',
    skills: [],
    collaboration: [],
    contract: [],
  });
  const [results, setResults] = useState([]);
  const [pagination, setPagination] = useState({ currentPage: 1, itemsPerPage: 12, totalItems: 0, totalPages: 1 });
  const [searched, setSearched] = useState(false);
  const [showRecommendations, setShowRecommendations] = useState(true);
  const [page, setPage] = useState(1);
  const pageSize = 12;
  const [allProjectsList, setAllProjectsList] = useState([]);
  const [isLoadingAllProjects, setIsLoadingAllProjects] = useState(false);

  // Aplica los filtros automáticamente al cambiar cualquier filtro
  const [pendingFilters, setPendingFilters] = useState(filters);
  
  // Crear una versión serializada de los filtros para evitar problemas de dependencias
  const filtersKey = useMemo(() => 
    JSON.stringify(pendingFilters), [pendingFilters]
  );

  // Cargar todos los proyectos cuando no hay recomendaciones o para admin/moderator
  useEffect(() => {
    const loadAllProjects = async () => {
      // Para usuarios regulares sin recomendaciones o para admin/moderator
      if ((roleName === ROLES.USER && !hasRecommendations && !isLoadingRecommendations) ||
          (roleName === ROLES.ADMIN || roleName === ROLES.MODERATOR)) {
        setIsLoadingAllProjects(true);
        try {
          const allProjectsResponse = await fetchProjects({
            title: '',
            category: [],
            skills: [],
            collaboration: [],
            contract: [],
            page: 1,
            limit: 1000 // traer muchos para recomendaciones, ajustar si es necesario
          });
          const projects = allProjectsResponse.projects || [];
          // Filtrar proyectos donde el usuario no sea el propietario
          const filteredProjects = projects.filter(project => 
            project.userId !== user?.id && project.ownerId !== user?.id
          );
          setAllProjectsList(filteredProjects);
        } catch (error) {
          console.error('Error cargando todos los proyectos:', error);
          setAllProjectsList([]);
        } finally {
          setIsLoadingAllProjects(false);
        }
      }
    };

    loadAllProjects();
  }, [roleName, hasRecommendations, isLoadingRecommendations, user?.id]);

  useEffect(() => {
    const applyFilters = async () => {
      // Detectar filtros "Todas" específicamente
      const hasAllFilters = 
        pendingFilters.category === 'all' ||
        (Array.isArray(pendingFilters.skills) && pendingFilters.skills.includes('all')) ||
        (Array.isArray(pendingFilters.collaboration) && pendingFilters.collaboration.includes('all')) ||
        (Array.isArray(pendingFilters.contract) && pendingFilters.contract.includes('all'));

      // Detectar otros filtros activos (no "Todas")
      const hasActiveFilters = 
        pendingFilters.title.trim() !== '' ||
        (pendingFilters.category !== '' && pendingFilters.category !== 'all') ||
        (Array.isArray(pendingFilters.skills) && pendingFilters.skills.length > 0 && !pendingFilters.skills.includes('all')) ||
        (Array.isArray(pendingFilters.collaboration) && pendingFilters.collaboration.length > 0 && !pendingFilters.collaboration.includes('all')) ||
        (Array.isArray(pendingFilters.contract) && pendingFilters.contract.length > 0 && !pendingFilters.contract.includes('all'));

      if (hasAllFilters && !hasActiveFilters) {
        // Si es "todas" (sin otros filtros), usar allProjectsList y paginar en frontend
        setSearched(true);
        setShowRecommendations(false);
        const totalItems = allProjectsList.length;
        const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
        const paginatedResults = allProjectsList.slice((page - 1) * pageSize, page * pageSize);
        setResults(paginatedResults);
        setPagination({
          currentPage: page,
          itemsPerPage: pageSize,
          totalItems,
          totalPages,
          hasPreviousPage: page > 1,
          hasNextPage: page < totalPages
        });
      } else if (hasAllFilters || hasActiveFilters) {
        setSearched(true);
        setShowRecommendations(false);
        // Normalizar filtros: si el array contiene 'all', enviar array vacío
        const normalizeArray = (arr) => Array.isArray(arr) ? (arr.includes('all') ? [] : arr) : [];
        const params = {
          title: pendingFilters.title,
          category: normalizeArray(pendingFilters.category),
          skills: normalizeArray(pendingFilters.skills),
          collaboration: normalizeArray(pendingFilters.collaboration),
          contract: normalizeArray(pendingFilters.contract),
          page,
          limit: pageSize
        };
        const { projects, pagination: pag } = await fetchProjects(params);
        // Debug: logs para depuración de filtrado
        // Filtrar ajenos y limpiar igual que recomendaciones
        // Filtrar solo por ownerId, igual que en recomendaciones
        const ajenos = projects.filter(project => project.ownerId !== user?.id);
        // Solo limpiar duplicados y proyectos inválidos, no limitar (el backend ya lo hace)
        const cleaned = limitAndCleanProjects(ajenos);
        setResults(cleaned);
        setPagination(pag);
      } else {
        // Si no hay filtros activos, resetear a estado inicial con recomendaciones
        setSearched(false);
        setShowRecommendations(true);
        setResults([]);
        setPagination({ currentPage: 1, itemsPerPage: pageSize, totalItems: 0, totalPages: 1 });
      }
      setFilters(pendingFilters);
    };
    applyFilters();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtersKey, page, allProjectsList]);

  const handleSearch = (newFilters) => {
    setPendingFilters(newFilters);
    setPage(1); // Reiniciar a la primera página al cambiar filtros
  };

  // Función para limpiar filtros y volver a mostrar recomendaciones
  const handleClearFilters = () => {
    const emptyFilters = {
      title: '',
      category: '',
      skills: [],
      collaboration: [],
      contract: [],
    };
    setPendingFilters(emptyFilters);
    setFilters(emptyFilters);
    setSearched(false);
    setShowRecommendations(true);
    setPage(1);
  };

  // Función para manejar el clic en un proyecto recomendado
  const handleRecommendationClick = (project) => {
    router.push(`/project/${project.id}`);
  };

  return (
    <>
      <Navbar />
      <div className="min-h-[calc(100vh-64px)] bg-[#f3f9f8] py-8 px-6 md:px-6 pb-20 md:pb-8 flex flex-col items-center">
      <div className="w-full max-w-7xl flex flex-col gap-6">
        {/* Header: título, buscador y botón */}
        <div className="flex flex-col md:flex-row md:items-center md:gap-6 mb-2 w-full">
          <div className="flex flex-col md:flex-row md:items-center w-full">
            <h1 className="text-2xl font-bold text-conexia-green bg-white rounded-lg px-6 py-3 shadow-sm w-full md:w-[320px] text-center md:text-left mb-4 md:mb-0">Buscar Proyecto</h1>
            <div className="flex-1 flex justify-center md:justify-center w-full md:w-auto md:ml-6">
              <div className="w-full max-w-xl">
                <ProjectSearchBar filters={filters} onSearch={handleSearch} />
              </div>
            </div>
          </div>
          {(roleName === ROLES.USER || user?.roleId === 2) && (
            <div className="flex flex-col sm:flex-row gap-2 justify-center md:justify-end w-full md:w-auto mt-4 md:mt-0">
              <button
                className="bg-conexia-green text-white font-semibold rounded-lg px-4 py-3 shadow hover:bg-conexia-green/90 transition text-sm whitespace-nowrap"
                onClick={() => router.push('/project/create')}
              >
                Publica tu proyecto
              </button>
              {roleName === ROLES.USER && (
                <button
                  className="bg-[#367d7d] text-white font-semibold rounded-lg px-4 py-3 shadow hover:bg-[#2b6a6a] transition text-sm whitespace-nowrap"
                  onClick={() => router.push('/project/my-postulations')}
                >
                  Mis postulaciones
                </button>
              )}
            </div>
          )}
        </div>
        <div className="flex flex-col md:flex-row gap-6">
          {/* Filtros laterales */}
          <aside className="w-full md:w-[320px] flex-shrink-0">
            <div className="bg-white rounded-xl shadow p-5 mb-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-conexia-green">Filtrar por</h2>
                <button
                  className="ml-2 px-2 py-1 rounded-md border border-conexia-green text-conexia-green hover:bg-conexia-green hover:text-white transition-colors text-xs font-semibold flex items-center gap-1"
                  title="Limpiar filtros"
                  onClick={() => {
                    const emptyFilters = {
                      title: '',
                      category: '',
                      skills: [],
                      collaboration: [],
                      contract: [],
                    };
                    handleSearch(emptyFilters);
                  }}
                >
                  {/* SVG escobillón personalizado*/}
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 225 225" width="20" height="20" className="inline-block align-middle">
                    <g transform="translate(0,225) scale(0.1,-0.1)" fill="#b45309" stroke="none">
                      <path d="M1940 2025 l-44 -45 40 -41 40 -40 47 48 c26 26 47 51 47 54 0 12-61 69-74 69-6 0-32-20-56-45z"/>
                      <path d="M1675 1760 l-180 -180 43 -42 42 -43 182 182 182 183-39 40 c-21 22-42 40-45 40-3 0-86-81-185-180z"/>
                      <path d="M1275 1360 l-180 -180 43 -42 42 -43 182 182 182 183-39 40 c-21 22-42 40-45 40-3 0-86-81-185-180z"/>
                      <path d="M1012 1097 l-52 -53 43 -42 43 -42 52 53 52 53-43 42-43 42-52-53z"/>
                      <path d="M565 990 l-50 -50 213 -212 212 -213 45 45 c78 77 83 67-136 286-126 126-201 194-214 194-12 0-43-22-70-50z"/>
                      <path d="M837 1002 l-37 -38 83 -82 83 -82 32 33 c18 18 32 42 32 53 0 20-128 154-147 154-5 0-26-17-46-38z"/>
                      <path d="M401 840 c-41 -27-105 -62-143 -77-37 -15-68 -31-68 -34 0-3 10-15 23-26 l22-21 73 23 c40 13 99 39 132 58 52 31 61 34 77 21 17-13 16-15-12-39-35-30-144-83-186-92-16-3-31-9-34-13-2-4 16-26 41-51 52-51 42-54 179 55 79 63 88 67 103 53 14-15 14-18-4-38-10-12-59-51-107-87 l-88-66 48-48 c26-26 50-45 53-40 4 4 32 41 62 82 66 89 103 125 117 115 21-12 10-36-52-115-100-126-98-121-45-178 l45-48 18 55 c29 93 91 201 116 201 25 0 17-37-25-122-25-51-49-112-54-135-9-37-7-44 12-62 26-24 36-26 36-8 0 20 63 147 110 221 l43 68-199 199 c-109 109-203 199-209 198-5 0-43-23-84-49z"/>
                    </g>
                  </svg>
                  Limpiar filtros
                </button>
              </div>
              <ProjectSearchFilters filters={filters} onChange={handleSearch} />
            </div>
          </aside>
          {/* Contenido principal */}
          <section className="flex-1 min-w-0">
            {/* Estado inicial: Mostrar recomendaciones solo para usuarios regulares */}
            {showRecommendations && !searched && roleName === ROLES.USER && (
              <div>
                {isLoadingRecommendations ? (
                  <RecommendationsLoading />
                ) : hasRecommendations ? (
                  <RecommendationsCarousel 
                    projects={recommendations}
                    onProjectClick={handleRecommendationClick}
                  />
                ) : (
                  <>
                    {/* Mensaje para completar perfil */}
                    <CompactNoRecommendations />
                    
                    {/* Mostrar todos los proyectos siempre cuando no hay recomendaciones */}
                    <div className="mt-8">
                      <h2 className="text-xl font-semibold text-gray-800 mb-4">
                        Todos los proyectos
                      </h2>
                      {isLoadingAllProjects ? (
                        <div className="text-conexia-green text-center py-8">Cargando proyectos...</div>
                      ) : allProjectsList.length > 0 ? (
                        <>
                          <ProjectList projects={allProjectsList.slice((page-1)*pageSize, page*pageSize)} />
                          <Pagination
                            page={page}
                            hasPreviousPage={page > 1}
                            hasNextPage={allProjectsList.length > page * pageSize}
                            onPageChange={setPage}
                          />
                        </>
                      ) : (
                        <div className="text-center text-gray-500 py-8">
                          No hay proyectos disponibles en este momento.
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Para admin y moderator, mostrar directamente todos los proyectos */}
            {showRecommendations && !searched && (roleName === ROLES.ADMIN || roleName === ROLES.MODERATOR) && (
              <div>
                {isLoadingAllProjects ? (
                  <div className="text-conexia-green text-center py-8">Cargando proyectos...</div>
                ) : allProjectsList.length > 0 ? (
                  <div>
                    <h2 className="text-xl font-semibold text-gray-800 mb-4">
                      Todos los proyectos
                    </h2>
                    <ProjectList projects={allProjectsList.slice((page-1)*pageSize, page*pageSize)} />
                    <Pagination
                      page={page}
                      hasPreviousPage={page > 1}
                      hasNextPage={allProjectsList.length > page * pageSize}
                      onPageChange={setPage}
                    />
                  </div>
                ) : (
                  <div className="text-center text-conexia-green mt-12 text-lg opacity-70">
                    No hay proyectos disponibles en este momento.
                  </div>
                )}
              </div>
            )}

            {/* Resultados de búsqueda */}
            {searched && (
              <>
                {/* Botón para volver a recomendaciones */}
                <div className="mb-6">
                  <button
                    onClick={handleClearFilters}
                    className="text-conexia-green hover:text-conexia-green-dark text-sm font-medium flex items-center gap-2"
                  >
                    ← Ver recomendaciones
                  </button>
                </div>

                <ProjectList projects={results} />
                <Pagination
                  page={pagination.currentPage}
                  hasPreviousPage={pagination.hasPreviousPage}
                  hasNextPage={pagination.hasNextPage}
                  onPageChange={setPage}
                  totalPages={pagination.totalPages}
                />
              </>
            )}

            {/* Estado cuando no se ha buscado y no hay recomendaciones visibles */}
            {!showRecommendations && !searched && (
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
