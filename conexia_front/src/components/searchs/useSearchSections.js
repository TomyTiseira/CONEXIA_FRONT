import { useState, useRef, useEffect } from 'react';
import { fetchProjects } from '@/service/projects/projectsFetch';
import { fetchUsers } from '@/service/user/userFetch';

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
  };
}
