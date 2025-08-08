import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Pagination from '@/components/common/Pagination';
import { fetchProjects } from '@/service/projects/projectsFetch';
import { useAuth } from '@/context/AuthContext';
import { useUserStore } from '@/store/userStore';
import { ROLES } from '@/constants/roles';
import { useRecommendations } from '@/hooks/project/useRecommendations';

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

  // Cargar todos los proyectos cuando no hay recomendaciones
  useEffect(() => {
    const loadAllProjects = async () => {
      if (roleName === ROLES.USER && !hasRecommendations && !isLoadingRecommendations) {
        setIsLoadingAllProjects(true);
        try {
          const allProjectsData = await fetchProjects({
            title: '',
            category: '',
            skills: [],
            collaboration: [],
            contract: [],
          });
          
          // Filtrar proyectos donde el usuario no sea el propietario
          const filteredProjects = allProjectsData.filter(project => project.userId !== user?.id);
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

      // Si hay filtros "Todas" o filtros activos, ocultar recomendaciones
      if (hasAllFilters || hasActiveFilters) {
        setSearched(true);
        setShowRecommendations(false);
        setPage(1);

        // Para filtros "Todas", obtener todos los proyectos sin filtrar
        if (hasAllFilters && !hasActiveFilters) {
          const allProjectsData = await fetchProjects({
            title: '',
            category: '',
            skills: [],
            collaboration: [],
            contract: [],
          });
          setResults(allProjectsData);
        } else {
          // Para otros filtros, aplicar filtrado normal
          const params = {
            title: pendingFilters.title,
            category: pendingFilters.category === 'all' ? '' : pendingFilters.category,
            skills: Array.isArray(pendingFilters.skills) && pendingFilters.skills.includes('all') ? [] : (pendingFilters.skills || []),
            collaboration: Array.isArray(pendingFilters.collaboration) && pendingFilters.collaboration.includes('all') ? [] : (pendingFilters.collaboration || []),
            contract: Array.isArray(pendingFilters.contract) && pendingFilters.contract.includes('all') ? [] : (pendingFilters.contract || []),
          };
          const projects = await fetchProjects(params);
          setResults(projects);
        }
      } else {
        // Si no hay filtros activos, resetear a estado inicial con recomendaciones
        setSearched(false);
        setShowRecommendations(true);
        setResults([]);
      }
      
      setFilters(pendingFilters);
    };
    applyFilters();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtersKey]);

  const handleSearch = (newFilters) => {
    setPendingFilters(newFilters);
    // La lógica de mostrar/ocultar recomendaciones ahora está en el useEffect
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
                {isLoadingRecommendations ? (
                  <div className="text-conexia-green text-center py-8">Cargando proyectos...</div>
                ) : allProjects.length > 0 ? (
                  <div>
                    <h2 className="text-xl font-semibold text-gray-800 mb-4">
                      Todos los proyectos
                    </h2>
                    <ProjectList projects={allProjects.slice((page-1)*pageSize, page*pageSize)} />
                    <Pagination
                      page={page}
                      hasPreviousPage={page > 1}
                      hasNextPage={allProjects.length > page * pageSize}
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

                <ProjectList projects={results.slice((page-1)*pageSize, page*pageSize)} />
                <Pagination
                  page={page}
                  hasPreviousPage={page > 1}
                  hasNextPage={results.length > page * pageSize}
                  onPageChange={setPage}
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
