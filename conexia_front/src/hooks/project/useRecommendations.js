import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { getProfileById } from '@/service/profiles/profilesFetch';
import { fetchProjects } from '@/service/projects/projectsFetch';
import { limitAndCleanProjects, sortProjectsByRelevance } from '@/utils/recommendationsUtils';
import { ROLES } from '@/constants/roles';

export const useRecommendations = () => {
  const { user } = useAuth();
  const [recommendations, setRecommendations] = useState([]);
  const [allProjects, setAllProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userHasSkills, setUserHasSkills] = useState(false);

  useEffect(() => {
    const fetchRecommendationsData = async () => {
      if (!user?.id) {
        setIsLoading(false);
        setUserHasSkills(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        // Para admin y moderator, obtener todos los proyectos directamente
        // Como user.role viene undefined, usamos principalmente user.roleId
        const isAdmin = user.roleId === 1;
        const isModerator = user.roleId === 3;
        
        if (isAdmin || isModerator) {
          try {
            const allProjectsResponse = await fetchProjects({
              title: '',
              category: [],
              skills: [],
              collaboration: [],
              contract: []
            });
            const projects = allProjectsResponse.projects || [];
            // Filtrar proyectos donde el usuario no sea el propietario
            const filteredProjects = projects.filter(project => 
              project.userId !== user.id && project.ownerId !== user.id
            );
            const limitedProjects = limitAndCleanProjects(filteredProjects, 20);
            setAllProjects(limitedProjects);
            setRecommendations([]);
            setUserHasSkills(false);
            setIsLoading(false);
            return;
          } catch (error) {
            console.error('Error obteniendo proyectos para admin/moderador:', error);
            setError('Error al cargar proyectos');
            setAllProjects([]);
            setRecommendations([]);
            setUserHasSkills(false);
            setIsLoading(false);
            return;
          }
        }

        // Para usuarios regulares, proceder con el flujo normal de recomendaciones
        // 1. Obtener el perfil del usuario para conseguir sus habilidades
        let userSkillIds = [];
        try {
          const profileResponse = await getProfileById(user.id);
          const userProfile = profileResponse.data || profileResponse;
          
          // 2. Extraer las skillIds del perfil - corregir la estructura
          // El perfil viene en userProfile.profile.skills
          const profileData = userProfile.profile || userProfile;
          const userSkills = profileData.skills || [];
          userSkillIds = userSkills.map(skill => skill.id || skill);
          
          // Guardar si el usuario tiene habilidades
          setUserHasSkills(userSkillIds.length > 0);
        } catch (profileError) {
          console.error('Error obteniendo perfil del usuario:', profileError);
          // Si no se puede obtener el perfil, tratarlo como usuario sin habilidades
          setUserHasSkills(false);
          userSkillIds = [];
        }

        // 3. Si el usuario tiene habilidades, obtener recomendaciones
        if (userSkillIds.length > 0) {
          // Usar la función fetchProjects existente que ya funciona
          const recommendedProjectsResponse = await fetchProjects({
            title: '',
            category: [],
            skills: userSkillIds,
            collaboration: [],
            contract: []
          });
          const recommendedProjects = recommendedProjectsResponse.projects || [];
            // Filtrar proyectos donde el usuario no sea el propietario, ni ya se haya postulado, ni esté completo el cupo
            const filteredProjects = recommendedProjects.filter(project => 
              project.userId !== user.id &&
              project.ownerId !== user.id &&
              !project.isApplied &&
              (typeof project.maxCollaborators !== 'number' || typeof project.approvedApplications !== 'number' || project.approvedApplications < project.maxCollaborators) &&
              (
                typeof project.maxCollaborators !== 'number' || typeof project.approvedApplications !== 'number' || project.approvedApplications !== project.maxCollaborators
              )
            );
          // Procesar y limpiar los proyectos - cambiar a 9 para que el carrusel salga completo
          // Asegurar que se ordenen por relevancia de skills
          const sortedProjects = sortProjectsByRelevance(filteredProjects, userSkillIds);
          const processedProjects = limitAndCleanProjects(sortedProjects, 9);
          setRecommendations(processedProjects);
        } else {
          // Si no tiene habilidades, obtener todos los proyectos para mostrar después
          const allProjectsResponse = await fetchProjects({
            title: '',
            category: [],
            skills: [],
            collaboration: [],
            contract: []
          });
          const allProjects = allProjectsResponse.projects || [];
          // Filtrar proyectos donde el usuario no sea el propietario ni ya se haya postulado (no filtrar por cupo en búsqueda general)
          const filteredProjects = allProjects.filter(project => 
            project.userId !== user.id && project.ownerId !== user.id && !project.isApplied
          );
          // Limitar a los primeros 20 proyectos para no sobrecargar
          const limitedProjects = limitAndCleanProjects(filteredProjects, 20);
          setAllProjects(limitedProjects);
          setRecommendations([]);
        }
      } catch (err) {
        console.error('Error fetching recommendations:', err);
        setError(err.message);
        setRecommendations([]);
        setAllProjects([]);
        setUserHasSkills(false);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRecommendationsData();
  }, [user?.id, user?.roleId]);

  return {
    recommendations,
    allProjects,
    isLoading,
    error,
    hasRecommendations: recommendations.length > 0,
    userHasSkills
  };
};
