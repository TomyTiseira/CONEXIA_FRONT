// Utilidades para manejar recomendaciones de proyectos

/**
 * Filtra proyectos duplicados basándose en el ID
 * @param {Array} projects - Array de proyectos
 * @returns {Array} - Array de proyectos únicos
 */
export const removeDuplicateProjects = (projects) => {
  if (!Array.isArray(projects)) return [];
  
  const seen = new Set();
  return projects.filter(project => {
    if (seen.has(project.id)) {
      return false;
    }
    seen.add(project.id);
    return true;
  });
};

/**
 * Ordena proyectos por relevancia (número de skills coincidentes)
 * @param {Array} projects - Array de proyectos
 * @param {Array} userSkillIds - Array de IDs de habilidades del usuario
 * @returns {Array} - Array de proyectos ordenados por relevancia
 */
export const sortProjectsByRelevance = (projects, userSkillIds = []) => {
  if (!Array.isArray(projects) || !Array.isArray(userSkillIds)) return projects;
  
  return [...projects].sort((a, b) => {
    // Si los proyectos tienen información de skills, usar eso para ordenar
    const aSkills = a.skills || a.requiredSkills || [];
    const bSkills = b.skills || b.requiredSkills || [];
    
    // Normalizar las skills para manejar diferentes formatos
    const normalizeSkills = (skills) => {
      if (!Array.isArray(skills)) return [];
      return skills.map(skill => {
        if (typeof skill === 'object' && skill !== null) {
          return skill.id || skill.skillId || skill;
        }
        return skill;
      });
    };
    
    const normalizedASkills = normalizeSkills(aSkills);
    const normalizedBSkills = normalizeSkills(bSkills);
    
    const aMatches = normalizedASkills.filter(skillId => 
      userSkillIds.includes(skillId)
    ).length;
    
    const bMatches = normalizedBSkills.filter(skillId => 
      userSkillIds.includes(skillId)
    ).length;
    
    // Ordenar por mayor número de coincidencias primero (descendente)
    // Si tienen las mismas coincidencias, mantener el orden original
    if (bMatches === aMatches) return 0;
    return bMatches - aMatches;
  });
};

/**
 * Limita el número de proyectos y asegura que estén limpios
 * @param {Array} projects - Array de proyectos
 * @param {number} limit - Número máximo de proyectos
 * @returns {Array} - Array limitado de proyectos
 */
export const limitAndCleanProjects = (projects, limit = 12) => {
  if (!Array.isArray(projects)) return [];
  
  return removeDuplicateProjects(projects)
    .filter(project => project && project.id) // Filtrar proyectos válidos
    .slice(0, limit);
};

/**
 * Formatea los datos del proyecto para asegurar consistencia
 * @param {Object} project - Proyecto a formatear
 * @returns {Object} - Proyecto formateado
 */
export const formatProjectData = (project) => {
  if (!project) return null;
  
  return {
    ...project,
    // Asegurar que campos críticos existan
    id: project.id,
    title: project.title || 'Proyecto sin título',
    description: project.description || '',
    image: project.image || null,
    owner: project.owner || 'Usuario',
    ownerId: project.ownerId || null,
    ownerImage: project.ownerImage || null,
    category: project.category || '',
    contractType: project.contractType || '',
    collaborationType: project.collaborationType || ''
  };
};

/**
 * Estados de las recomendaciones
 */
export const RECOMMENDATION_STATES = {
  LOADING: 'loading',
  HAS_RECOMMENDATIONS: 'has_recommendations',
  NO_SKILLS: 'no_skills',
  NO_MATCHES: 'no_matches',
  ERROR: 'error'
};

/**
 * Determina el estado actual de las recomendaciones
 * @param {boolean} isLoading - Si está cargando
 * @param {boolean} hasError - Si hay error
 * @param {boolean} userHasSkills - Si el usuario tiene habilidades
 * @param {boolean} hasRecommendations - Si hay recomendaciones
 * @returns {string} - Estado actual
 */
export const getRecommendationState = (isLoading, hasError, userHasSkills, hasRecommendations) => {
  if (isLoading) return RECOMMENDATION_STATES.LOADING;
  if (hasError) return RECOMMENDATION_STATES.ERROR;
  if (!userHasSkills) return RECOMMENDATION_STATES.NO_SKILLS;
  if (!hasRecommendations) return RECOMMENDATION_STATES.NO_MATCHES;
  return RECOMMENDATION_STATES.HAS_RECOMMENDATIONS;
};
