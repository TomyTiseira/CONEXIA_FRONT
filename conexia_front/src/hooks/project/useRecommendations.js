import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { getProfileById } from '@/service/profiles/profilesFetch';
import { fetchProjects } from '@/service/projects/projectsFetch';
import { limitAndCleanProjects, sortProjectsByRelevance } from '@/utils/recommendationsUtils';

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

        // 1. Obtener el perfil del usuario para conseguir sus habilidades
        const profileResponse = await getProfileById(user.id);
        const userProfile = profileResponse.data || profileResponse;
        
        // 2. Extraer las skillIds del perfil - corregir la estructura
        // El perfil viene en userProfile.profile.skills
        const profileData = userProfile.profile || userProfile;
        const userSkills = profileData.skills || [];
        const userSkillIds = userSkills.map(skill => skill.id || skill);
        
        // Guardar si el usuario tiene habilidades
        setUserHasSkills(userSkillIds.length > 0);

        // 3. Si el usuario tiene habilidades, obtener recomendaciones
        if (userSkillIds.length > 0) {
          // Usar la función fetchProjects existente que ya funciona
          const recommendedProjects = await fetchProjects({
            title: '',
            category: '',
            skills: userSkillIds,
            collaboration: [],
            contract: []
          });

          // Procesar y limpiar los proyectos
          const processedProjects = limitAndCleanProjects(
            sortProjectsByRelevance(recommendedProjects, userSkillIds),
            12
          );
          
          setRecommendations(processedProjects);
        } else {
          // Si no tiene habilidades, obtener todos los proyectos para mostrar después
          const allProjectsResponse = await fetchProjects({
            title: '',
            category: '',
            skills: [],
            collaboration: [],
            contract: []
          });
          
          // Limitar a los primeros 20 proyectos para no sobrecargar
          const limitedProjects = limitAndCleanProjects(allProjectsResponse, 20);
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
  }, [user?.id]);

  return {
    recommendations,
    allProjects,
    isLoading,
    error,
    hasRecommendations: recommendations.length > 0,
    userHasSkills
  };
};
