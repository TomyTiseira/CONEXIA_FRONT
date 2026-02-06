import { useState, useRef, useEffect } from 'react';
import { fetchProjects } from '@/service/projects/projectsFetch';
import { fetchUsers } from '@/service/user/userFetch';
import { fetchServices } from '@/service/services/servicesFetch';

export function useSearchSections(query) {
  // --- Proyectos ---
  const [projects, setProjects] = useState([]);
  const [projectsPage, setProjectsPage] = useState(1);
  const [projectsHasMore, setProjectsHasMore] = useState(true);
  const [showAllProjects, setShowAllProjects] = useState(false);
  const [showProjects, setShowProjects] = useState(true);
  // --- Personas ---
  const [people, setPeople] = useState([]);
  const [peoplePage, setPeoplePage] = useState(1);
  const [peopleHasMore, setPeopleHasMore] = useState(true);
  const [showAllPeople, setShowAllPeople] = useState(false);
  const [showPeople, setShowPeople] = useState(true);
  // --- Servicios ---
  const [services, setServices] = useState([]);
  const [servicesPage, setServicesPage] = useState(1);
  const [servicesHasMore, setServicesHasMore] = useState(true);
  const [showAllServices, setShowAllServices] = useState(false);
  const [showServices, setShowServices] = useState(true);

  // Reiniciar resultados y paginación cuando cambia el query
  useEffect(() => {
    setProjects([]);
    setProjectsPage(1);
    setProjectsHasMore(true);
    setShowAllProjects(false);

    setPeople([]);
    setPeoplePage(1);
    setPeopleHasMore(true);
    setShowAllPeople(false);

    setServices([]);
    setServicesPage(1);
    setServicesHasMore(true);
    setShowAllServices(false);
  }, [query]);

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
        const { users, pagination } = await fetchUsers({ search: query, page: peoplePage, limit: 6 });
        if (!ignore) {
          setPeople(prev => peoplePage === 1 ? users : [...prev, ...users]);
          setPeopleHasMore(pagination?.hasNextPage ?? false);
        }
      } catch (e) {
        if (!ignore) setPeopleHasMore(false);
      }
    }
    fetchMorePeople();
    return () => { ignore = true; };
  }, [query, peoplePage]);

  // --- Fetch inicial y paginado para servicios ---
  useEffect(() => {
    let ignore = false;
    async function fetchMoreServices() {
      try {
        // Buscar por nombre/título del servicio: el backend espera 'search'
        const { services: newServices, pagination } = await fetchServices({ search: query, page: servicesPage, limit: 6 });
        if (!ignore) {
          setServices(prev => servicesPage === 1 ? newServices : [...prev, ...newServices]);
          // Cálculo robusto de hasMore según diferentes formatos de paginación
          const current = (pagination?.currentPage ?? pagination?.page ?? servicesPage);
          const totalPages = (pagination?.totalPages ?? 1);
          const hasNext = (typeof pagination?.hasNext === 'boolean') ? pagination.hasNext : (current < totalPages);
          setServicesHasMore(Boolean(hasNext) || (Array.isArray(newServices) && newServices.length === 6));
        }
      } catch (e) {
        if (!ignore) setServicesHasMore(false);
      }
    }
    fetchMoreServices();
    return () => { ignore = true; };
  }, [query, servicesPage]);

  return {
    // Proyectos
    projects,
    projectsPage,
    setProjectsPage,
    projectsHasMore,
    showAllProjects,
    setShowAllProjects,
    showProjects,
    setShowProjects,
    // Personas
    people,
    peoplePage,
    setPeoplePage,
    peopleHasMore,
    showAllPeople,
    setShowAllPeople,
    showPeople,
    setShowPeople,
    // Servicios
    services,
    servicesPage,
    setServicesPage,
    servicesHasMore,
    showAllServices,
    setShowAllServices,
    showServices,
    setShowServices,
  };
}
