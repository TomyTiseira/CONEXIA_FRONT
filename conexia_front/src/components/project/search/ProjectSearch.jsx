import { useState, useEffect, useMemo } from 'react';
import Toast from '@/components/ui/Toast';
import { useRouter } from 'next/navigation';
import Pagination from '@/components/common/Pagination';
import { fetchProjects } from '@/service/projects/projectsFetch';
import { useAuth } from '@/context/AuthContext';
import { useUserStore } from '@/store/userStore';
import { ROLES } from '@/constants/roles';
import { useRecommendations } from '@/hooks/project/useRecommendations';
import { limitAndCleanProjects, removeDuplicateProjects } from '@/utils/recommendationsUtils';

import Navbar from '@/components/navbar/Navbar';
import { FaRegLightbulb } from 'react-icons/fa';
import { HiOutlineClipboardList } from 'react-icons/hi';
import { MdCleaningServices } from 'react-icons/md';
import ProjectSearchFilters from './ProjectSearchFilters';
import ProjectSearchBar from './ProjectSearchBar';
import ProjectList from './ProjectList';
import RecommendationsCarousel from './RecommendationsCarousel';
import EmptyRecommendationsState from './EmptyRecommendationsState';
import RecommendationsLoading from './RecommendationsLoading';
import NoRecommendationsFound from './NoRecommendationsFound';
import CompactNoRecommendations from './CompactNoRecommendations';
import MessagingWidget from '@/components/messaging/MessagingWidget';
import { config } from '@/config';

export default function ProjectSearch() {
  const router = useRouter();
  const { user } = useAuth();
  const { roleName } = useUserStore();
  const { recommendations, allProjects, isLoading: isLoadingRecommendations, hasRecommendations, userHasSkills } = useRecommendations();
  
  const [filters, setFilters] = useState({
    title: '',
    category: [],
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
  // Toast state (e.g., for project created redirect)
  const [toast, setToast] = useState({ visible: false, type: 'success', message: '' });

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
          setAllProjectsList([]);
        } finally {
          setIsLoadingAllProjects(false);
        }
      }
    };

    loadAllProjects();
  }, [roleName, hasRecommendations, isLoadingRecommendations, user?.id]);

  // Leer sessionStorage para toast (creación o eliminación de proyecto)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Prioridad a la eliminación si existen ambos
      const deletion = sessionStorage.getItem('projectDeletionToast');
      const creation = sessionStorage.getItem('projectCreationToast');
      const target = deletion || creation;
      if (target) {
        try {
          const data = JSON.parse(target);
          setToast({ visible: true, type: data.type || 'success', message: data.message || 'Acción realizada.' });
        } catch {
          // ignore parse error
        } finally {
          if (deletion) sessionStorage.removeItem('projectDeletionToast');
          if (creation) sessionStorage.removeItem('projectCreationToast');
        }
      }
    }
  }, []);

  useEffect(() => {
    const applyFilters = async () => {
      // Detectar filtros "Todas" específicamente

      const isAll = arr => Array.isArray(arr) && arr.length === 1 && arr[0] === 'all';
      const hasAllFilters =
        isAll(pendingFilters.category) ||
        isAll(pendingFilters.skills) ||
        isAll(pendingFilters.collaboration) ||
        isAll(pendingFilters.contract);

      // Detectar otros filtros activos (no "Todas")
      const hasActiveFilters =
        pendingFilters.title.trim() !== '' ||
        (Array.isArray(pendingFilters.category) && pendingFilters.category.length > 0 && !isAll(pendingFilters.category)) ||
        (Array.isArray(pendingFilters.skills) && pendingFilters.skills.length > 0 && !isAll(pendingFilters.skills)) ||
        (Array.isArray(pendingFilters.collaboration) && pendingFilters.collaboration.length > 0 && !isAll(pendingFilters.collaboration)) ||
        (Array.isArray(pendingFilters.contract) && pendingFilters.contract.length > 0 && !isAll(pendingFilters.contract));

      if (hasAllFilters && !hasActiveFilters) {
        // Si es "todas" (sin otros filtros), buscar todos los proyectos al backend con paginación real
        setSearched(true);
        setShowRecommendations(false);
        const params = {
          page,
          limit: pageSize
        };
        try {
          const { projects, pagination: pag } = await fetchProjects(params);
          // Limpiar duplicados y proyectos inválidos, sin limitar (el backend ya pagina y filtra)
          const cleaned = removeDuplicateProjects(projects).filter(project => project && project.id);
          setResults(cleaned);
          setPagination(pag);
        } catch (error) {
          console.error('Error en fetchProjects:', error);
        }
      } else if (hasAllFilters || hasActiveFilters) {
        setSearched(true);
        setShowRecommendations(false);
        // Normalizar filtros: si el array contiene 'all', enviar array vacío
  const normalizeArray = (arr) => Array.isArray(arr) ? (arr.length === 1 && arr[0] === 'all' ? [] : arr) : [];
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
  // Limpiar duplicados y proyectos inválidos, sin limitar (el backend ya pagina y filtra)
  const cleaned = removeDuplicateProjects(projects).filter(project => project && project.id);
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
      category: [],
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

  // Obtener profile del store para calcular avatar (igual que en ClientCommunity)
  const { profile } = useUserStore();
  const avatar = profile?.profilePicture
    ? `${config.IMAGE_URL}/${profile.profilePicture}`
    : '/images/default-avatar.png';

  return (
    <>
      <Navbar />
      <div className="min-h-[calc(100vh-64px)] bg-[#f3f9f8] py-8 px-6 md:px-6 pb-20 md:pb-8 flex flex-col items-center">
        <div className="w-full max-w-7xl flex flex-col gap-6">
          {/* Header: título, buscador y botón */}
          <div className="flex flex-col md:flex-row md:items-center md:gap-6 mb-2 w-full">
            <div className="flex flex-col md:flex-row md:items-center w-full">
              <h1 className="text-3xl md:text-4xl font-extrabold text-conexia-green-dark tracking-tight leading-tight bg-white rounded-lg px-6 py-3 shadow-sm w-full md:w-[320px] text-center md:text-left mb-4 md:mb-0">Proyectos</h1>
              <div className="flex-1 flex justify-center md:justify-center w-full md:w-auto md:ml-6">
                <div className="w-full max-w-xl">
                  <ProjectSearchBar filters={filters} onSearch={handleSearch} />
                </div>
              </div>
            </div>
            {(roleName === ROLES.USER || user?.roleId === 2) && (
              <div className="flex flex-col sm:flex-row gap-2 justify-center md:justify-end w-full md:w-auto mt-4 md:mt-0">
                <button
                  className="bg-conexia-green text-white font-semibold rounded-lg px-4 py-3 shadow hover:bg-conexia-green/90 transition text-sm whitespace-nowrap flex items-center justify-center gap-2 w-full"
                  onClick={() => router.push('/project/create')}
                >
                  <span className="flex items-center justify-center gap-2 w-full">
                    <FaRegLightbulb className="text-base" />
                    <span>Publica tu proyecto</span>
                  </span>
                </button>
                {roleName === ROLES.USER && (
                  <button
                    className="bg-[#367d7d] text-white font-semibold rounded-lg px-4 py-3 shadow hover:bg-[#2b6a6a] transition text-sm whitespace-nowrap flex items-center justify-center gap-2 w-full"
                    onClick={() => router.push('/project/my-postulations')}
                  >
                    <span className="flex items-center justify-center gap-2 w-full">
                      <HiOutlineClipboardList className="text-lg" />
                      <span>Mis postulaciones</span>
                    </span>
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
                    className="ml-1 px-1.5 py-1 rounded border border-conexia-green text-conexia-green hover:bg-conexia-green hover:text-white transition-colors text-xs font-semibold flex items-center gap-1"
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
                    <MdCleaningServices className="w-4 h-4" />
                    <span className="hidden sm:inline">Limpiar filtros</span>
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
                        {/* Proyectos recomendados para ti - mobile: título arriba, cantidad abajo; desktop: igual que antes */}
                        <>
                          {/* Título y cantidad apilados y centrados en todas las vistas */}
                          <div className="mb-4 flex flex-col items-center w-full">
                            <div className="text-lg xs:text-xl font-semibold text-gray-800 text-center">Proyectos recomendados para ti</div>
                            <div className="text-conexia-green text-sm xs:text-base font-medium text-center mt-1">{recommendations?.length || 0} proyecto{(recommendations?.length === 1) ? '' : 's'}</div>
                          </div>
                        </>
                        {isLoadingAllProjects ? (
                          <div className="text-conexia-green text-center py-8">Cargando proyectos...</div>
                        ) : allProjectsList.length > 0 ? (
                          <div className="min-h-[900px] flex flex-col">
                            <div className="flex-1">
                              <ProjectList projects={allProjectsList.slice((page-1)*pageSize, page*pageSize)} reserveGridSpace={true} />
                            </div>
                            <div className="mt-8 flex justify-center">
                              <Pagination
                                page={page}
                                hasPreviousPage={page > 1}
                                hasNextPage={allProjectsList.length > page * pageSize}
                                onPageChange={setPage}
                              />
                            </div>
                          </div>
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
                    <div className="min-h-[900px] flex flex-col">
                      <h2 className="text-xl font-semibold text-gray-800 mb-4">
                        Todos los proyectos
                      </h2>
                      <div className="flex-1">
                        <ProjectList projects={allProjectsList.slice((page-1)*pageSize, page*pageSize)} reserveGridSpace={true} />
                      </div>
                      <div className="mt-8 flex justify-center">
                        <Pagination
                          page={page}
                          hasPreviousPage={page > 1}
                          hasNextPage={allProjectsList.length > page * pageSize}
                          onPageChange={setPage}
                        />
                      </div>
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
                      className="text-conexia-green hover:text-conexia-green-dark text-sm font-medium flex items-center gap-1"
                    >
                      <svg className="w-5 h-5 mr-1" width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="10" cy="10" r="8.5" stroke="currentColor" strokeWidth="1.5" fill="none" />
                        <line x1="6.5" y1="10" x2="13.5" y2="10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                        <polyline points="9,7 6,10 9,13" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      Ver recomendaciones
                    </button>
                  </div>

                  <div className="min-h-[900px] flex flex-col">
                    <div className="flex-1">
                      <ProjectList projects={results} reserveGridSpace={true} />
                    </div>
                    <div className="mt-8 flex justify-center">
                      <Pagination
                        page={pagination.currentPage}
                        hasPreviousPage={pagination.hasPreviousPage}
                        hasNextPage={pagination.hasNextPage}
                        onPageChange={setPage}
                        totalPages={pagination.totalPages}
                      />
                    </div>
                  </div>
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

      {/* Widget de mensajería reutilizable (igual que en ClientCommunity) */}
      <MessagingWidget
        avatar={avatar}
      />
      <Toast
        type={toast.type}
        message={toast.message}
        isVisible={toast.visible}
        onClose={() => setToast(t => ({ ...t, visible: false }))}
        position="top-center"
        duration={5000}
      />
    </>
  );
}
