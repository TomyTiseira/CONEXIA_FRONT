import { config } from '@/config';
// Obtener proyecto por id (simulado)
export async function fetchProjectById(id) {
  const res = await fetch(`${config.API_URL}/projects/${id}`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
  });
  if (!res.ok) return null;
  const data = await res.json();
  const p = data.data || {};
  
  const result = {
    id: p.id,
    title: p.title,
    description: p.description,
    image: p.image,
    owner: p.owner,
    ownerId: (() => {
      // Intentar extraer ownerId de diferentes maneras
      if (typeof p.owner === 'object' && p.owner !== null && p.owner.id) {
        return p.owner.id;
      }
      if (p.ownerId) {
        return p.ownerId;
      }
      if (p.userId) {
        return p.userId;
      }
      if (p.createdBy) {
        return p.createdBy;
      }
      if (p.user && typeof p.user === 'object' && p.user.id) {
        return p.user.id;
      }
      // Si owner es un string que parece un ID numérico
      if (typeof p.owner === 'string' && /^\d+$/.test(p.owner)) {
        return p.owner;
      }
      // FALLBACK: Si no encontramos ownerId
      // Buscar cualquier campo que pueda contener el ID del dueño
      for (const [key, value] of Object.entries(p)) {
        if (key.toLowerCase().includes('owner') && value && typeof value === 'object' && value.id) {
          return value.id;
        }
        if (key.toLowerCase().includes('user') && value && typeof value === 'object' && value.id) {
          return value.id;
        }
      }
      
      return undefined;
    })(),
    ownerImage: p.ownerImage,
    contractType: Array.isArray(p.contractType) ? p.contractType : (p.contractType ? [p.contractType] : []),
    collaborationType: Array.isArray(p.collaborationType) ? p.collaborationType : (p.collaborationType ? [p.collaborationType] : []),
    skills: Array.isArray(p.skills) ? p.skills : (p.skills ? [p.skills] : []),
    category: Array.isArray(p.category) ? p.category : (p.category ? [p.category] : []),
    maxCollaborators: p.maxCollaborators,
    isActive: p.isActive,
    startDate: p.startDate,
    endDate: p.endDate,
    isOwner: p.isOwner,
  };
  
  return result;
}
// Servicio para buscar proyectos según filtros

export async function fetchProjects({ title, category, skills, collaboration, contract}) {
  const params = new URLSearchParams();
  if (title) params.append('search', title);
  if (category) params.append('categoryIds', category);
  if (skills && Array.isArray(skills) && skills.length > 0) params.append('skillIds', skills.join(','));
  if (collaboration && Array.isArray(collaboration) && collaboration.length > 0) params.append('collaborationTypeIds', collaboration.join(','));
  if (contract && Array.isArray(contract) && contract.length > 0) params.append('contractTypeIds', contract.join(','));

  const res = await fetch(`${config.API_URL}/projects?${params.toString()}`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
  });
  if (!res.ok) throw new Error('Error al obtener proyectos');
  const data = await res.json();
  // El backend devuelve { success, data: { projects, pagination } }
  const projects = data?.data?.projects;
  if (!Array.isArray(projects)) return [];
  // Adaptar los proyectos al formato esperado por la UI
  return projects.map(p => ({
    id: p.id,
    title: p.title,
    description: p.description,
    image: p.image,
    // Si owner es objeto, extraer nombre y/o id
    owner: typeof p.owner === 'object' && p.owner !== null ? p.owner.name || p.owner.id || '' : p.owner,
    ownerId: typeof p.owner === 'object' && p.owner !== null ? p.owner.id : undefined,
    ownerImage: typeof p.owner === 'object' && p.owner !== null ? p.owner.image : p.ownerImage,
    // Si category es objeto, extraer nombre
    category: typeof p.category === 'object' && p.category !== null ? p.category.name || '' : p.category,
    categoryId: typeof p.category === 'object' && p.category !== null ? p.category.id : undefined,
    // collaborationType en backend = tipo de contrato en UI
    contractType: typeof p.collaborationType === 'object' && p.collaborationType !== null ? p.collaborationType.name || '' : p.collaborationType,
    contractTypeId: typeof p.collaborationType === 'object' && p.collaborationType !== null ? p.collaborationType.id : undefined,
    // contractType en backend = tipo de colaboración en UI
    collaborationType: typeof p.contractType === 'object' && p.contractType !== null ? p.contractType.name || '' : p.contractType,
    collaborationTypeId: typeof p.contractType === 'object' && p.contractType !== null ? p.contractType.id : undefined,
    // Otros campos planos
    isOwner: p.isOwner,
  }));
}

// Función específica para obtener recomendaciones o proyectos recientes como fallback
export async function fetchRecommendations({ skillIds = [], limit = 12, page = 1 }) {
  console.log('🔗 fetchRecommendations called with:', { skillIds, limit, page });
  
  const params = new URLSearchParams();
  
  // Si hay skillIds, obtener proyectos que coincidan con esas habilidades
  if (skillIds && Array.isArray(skillIds) && skillIds.length > 0) {
    params.append('skillIds', skillIds.join(','));
  }
  
  // Agregar parámetros de paginación
  params.append('limit', limit.toString());
  params.append('page', page.toString());

  const url = `${config.API_URL}/projects?${params.toString()}`;
  console.log('🌐 API URL:', url);

  const res = await fetch(url, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
  });

  console.log('📡 API Response status:', res.status);

  if (!res.ok) throw new Error('Error al obtener recomendaciones');
  
  const data = await res.json();
  console.log('📦 API Response data:', data);
  
  const projects = data?.data?.projects;
  
  if (!Array.isArray(projects)) {
    console.log('⚠️ No projects array found in response');
    return { projects: [], pagination: { total: 0 } };
  }
  
  // Adaptar los proyectos al formato esperado por la UI (misma lógica que fetchProjects)
  const adaptedProjects = projects.map(p => ({
    id: p.id,
    title: p.title,
    description: p.description,
    image: p.image,
    owner: typeof p.owner === 'object' && p.owner !== null ? p.owner.name || p.owner.id || '' : p.owner,
    ownerId: typeof p.owner === 'object' && p.owner !== null ? p.owner.id : undefined,
    ownerImage: typeof p.owner === 'object' && p.owner !== null ? p.owner.image : p.ownerImage,
    category: typeof p.category === 'object' && p.category !== null ? p.category.name || '' : p.category,
    categoryId: typeof p.category === 'object' && p.category !== null ? p.category.id : undefined,
    contractType: typeof p.collaborationType === 'object' && p.collaborationType !== null ? p.collaborationType.name || '' : p.collaborationType,
    contractTypeId: typeof p.collaborationType === 'object' && p.collaborationType !== null ? p.collaborationType.id : undefined,
    collaborationType: typeof p.contractType === 'object' && p.contractType !== null ? p.contractType.name || '' : p.contractType,
    collaborationTypeId: typeof p.contractType === 'object' && p.contractType !== null ? p.contractType.id : undefined,
    isOwner: p.isOwner,
  }));

  return {
    projects: adaptedProjects,
    pagination: data?.data?.pagination || { total: adaptedProjects.length }
  };
}

export async function fetchMyProjects({ ownerId, active }) {
  const params = new URLSearchParams();
  // Convertir el parámetro 'active' al formato esperado por el backend
  if (typeof active === 'boolean') {
    // Si active=true, no incluir eliminados; si active=false, incluir eliminados
    params.append('includeDeleted', (!active).toString());
  }

  const res = await fetch(`${config.API_URL}/projects/profile/${ownerId}?${params.toString()}`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
  });
  if (!res.ok) throw new Error('Error al obtener proyectos');
  const data = await res.json();
  
  // Manejar diferentes estructuras de respuesta del backend
  const projects = data?.projects || data?.data?.projects || data?.data || [];
  
  return projects.map(p => ({
    id: p.id,
    title: p.title,
    description: p.description,
    image: p.image,
    // Usar la misma lógica que fetchProjects (que funciona correctamente)
    owner: typeof p.owner === 'object' && p.owner !== null ? p.owner.name || p.owner.id || '' : p.owner,
    ownerId: typeof p.owner === 'object' && p.owner !== null ? p.owner.id : p.ownerId || p.userId || ownerId,
    ownerImage: typeof p.owner === 'object' && p.owner !== null ? p.owner.image : p.ownerImage,
    // Si category es objeto, extraer nombre
    category: typeof p.category === 'object' && p.category !== null ? p.category.name || '' : p.category,
    categoryId: typeof p.category === 'object' && p.category !== null ? p.category.id : undefined,
    // collaborationType en backend = tipo de contrato en UI
    contractType: typeof p.collaborationType === 'object' && p.collaborationType !== null ? p.collaborationType.name || '' : p.collaborationType,
    contractTypeId: typeof p.collaborationType === 'object' && p.collaborationType !== null ? p.collaborationType.id : undefined,
    // contractType en backend = tipo de colaboración en UI
    collaborationType: typeof p.contractType === 'object' && p.contractType !== null ? p.contractType.name || '' : p.contractType,
    collaborationTypeId: typeof p.contractType === 'object' && p.contractType !== null ? p.contractType.id : undefined,
    // Otros campos planos
    isOwner: p.isOwner,
  }));
}
