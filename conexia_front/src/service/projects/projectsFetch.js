import { config } from '@/config';
import { fetchWithRefresh } from '../auth/fetchWithRefresh';

// Obtener proyecto por id (simulado)
export async function fetchProjectById(id) {
  const res = await fetchWithRefresh(`${config.API_URL}/projects/${id}`, {
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
    location: p.location,
    userId: p.userId, // Agregar userId para el filtro de proyectos propios
    owner: p.owner || 'Usuario', // El backend envía directamente el nombre como string
    ownerId: p.ownerId, // El backend envía directamente el ID
    ownerImage: p.ownerImage, // El backend envía directamente la imagen
    contractType: Array.isArray(p.contractType) ? p.contractType : (p.contractType ? [p.contractType] : []),
    collaborationType: Array.isArray(p.collaborationType) ? p.collaborationType : (p.collaborationType ? [p.collaborationType] : []),
    skills: Array.isArray(p.skills) ? p.skills : (p.skills ? [p.skills] : []),
    category: Array.isArray(p.category) ? p.category : (p.category ? [p.category] : []),
    maxCollaborators: p.maxCollaborators,
    approvedApplications: p.approvedApplications || 0,
    isActive: p.isActive,
    deletedAt: p.deletedAt, // <-- AGREGADO
    status: p.status, // Agregar el campo status desde el backend
    suspendedByModeration: p.suspendedByModeration || false, // Campo de moderación de proyectos
    startDate: p.startDate,
    endDate: p.endDate,
    isOwner: p.isOwner,
    isApplied: p.isApplied || false, // Agregar isApplied desde el backend
    hasReported: p.hasReported || false, // Agregar hasReported desde el backend
    userPostulationStatus: p.userPostulationStatus || null, // Estado de postulación del usuario
    userEvaluationDeadline: p.userEvaluationDeadline || null, // Fecha límite de evaluación
    roles: p.roles || [], // Agregar roles desde el backend
    applicationTypes: p.applicationTypes || [], // Agregar tipos de aplicación
    questions: p.questions || [], // Agregar preguntas
    evaluation: p.evaluation || null, // Agregar evaluación
    // Campos de moderación del owner
    ownerAccountStatus: p.ownerAccountStatus || 'active',
    ownerIsSuspended: p.ownerIsSuspended || false,
    ownerIsBanned: p.ownerIsBanned || false,
    ownerSuspensionExpiresAt: p.ownerSuspensionExpiresAt || null,
    ownerSuspensionReason: p.ownerSuspensionReason || null,
  };
  
  return result;
}
// Servicio para buscar proyectos según filtros

export async function fetchProjects({ title, category, skills, collaboration, contract, page = 1, limit = 12, currentUserId }) {
  try {
    const params = new URLSearchParams();
    if (title) params.append('search', title);
    if (category && Array.isArray(category) && category.length > 0) params.append('categoryIds', category.join(','));
    if (skills && Array.isArray(skills) && skills.length > 0) params.append('skillIds', skills.join(','));
    if (collaboration && Array.isArray(collaboration) && collaboration.length > 0) params.append('collaborationTypeIds', collaboration.join(','));
    if (contract && Array.isArray(contract) && contract.length > 0) params.append('contractTypeIds', contract.join(','));
    if (currentUserId) params.append('currentUserId', currentUserId);
    params.append('page', page);
    params.append('limit', limit);

    const res = await fetchWithRefresh(`${config.API_URL}/projects?${params.toString()}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
    });

    if (!res.ok) {
      let errorMessage = 'Error al obtener proyectos';
      try {
        const errorData = await res.json();
        errorMessage = errorData.message || errorData.error || `Error ${res.status}: ${res.statusText}`;
      } catch (parseError) {
        errorMessage = `Error ${res.status}: ${res.statusText}`;
      }
      // Si es un error del servidor (5xx), devolver array vacío en lugar de fallar
      if (res.status >= 500) {
        return { projects: [], pagination: { currentPage: 1, itemsPerPage: limit, totalItems: 0, totalPages: 1 } };
      }
      throw new Error(errorMessage);
    }

    const data = await res.json();
    // El backend devuelve { success, data: { projects, pagination } }
    const projects = data?.data?.projects || [];
    const pagination = data?.data?.pagination || { currentPage: 1, itemsPerPage: limit, totalItems: projects.length, totalPages: 1 };
    // Adaptar los proyectos al formato esperado por la UI
    return {
  projects: projects.map(p => ({
        id: p.id,
        title: p.title,
        description: p.description,
        image: p.image,
        userId: p.userId,
        owner: typeof p.owner === 'object' && p.owner !== null 
          ? `${p.owner.name || ''} ${p.owner.lastName || ''}`.trim() || p.owner.id || ''
          : p.owner,
        ownerId: typeof p.owner === 'object' && p.owner !== null ? p.owner.id : undefined,
        ownerImage: typeof p.owner === 'object' && p.owner !== null ? p.owner.image : p.ownerImage,
        category: typeof p.category === 'object' && p.category !== null ? p.category.name || '' : p.category,
        categoryId: typeof p.category === 'object' && p.category !== null ? p.category.id : undefined,
        contractType: typeof p.collaborationType === 'object' && p.collaborationType !== null ? p.collaborationType.name || '' : p.collaborationType,
        contractTypeId: typeof p.collaborationType === 'object' && p.collaborationType !== null ? p.collaborationType.id : undefined,
        collaborationType: typeof p.contractType === 'object' && p.contractType !== null ? p.contractType.name || '' : p.contractType,
        collaborationTypeId: typeof p.contractType === 'object' && p.contractType !== null ? p.contractType.id : undefined,
        skills: p.skills || p.requiredSkills || [],
        isActive: p.isActive,
        status: p.status,
        startDate: p.startDate,
        endDate: p.endDate,
        isOwner: p.isOwner,
        isApplied: p.isApplied || false,
        approvedApplications: p.approvedApplications || 0,
        maxCollaborators: p.maxCollaborators,
        postulationStatus: p.postulationStatus || null,
      })),
      pagination
    };
  } catch (error) {
    if (error.message.includes('Internal server error') || 
        error.message.includes('fetch') || 
        error.message.includes('network')) {
      return { projects: [], pagination: { currentPage: 1, itemsPerPage: limit, totalItems: 0, totalPages: 1 } };
    }
    throw error;
  }
}

// Función específica para obtener recomendaciones o proyectos recientes como fallback
export async function fetchRecommendations({ skillIds = [], limit = 12, page = 1 }) {
  try {
    const params = new URLSearchParams();
    
    // Si hay skillIds, obtener proyectos que coincidan con esas habilidades
    if (skillIds && Array.isArray(skillIds) && skillIds.length > 0) {
      params.append('skillIds', skillIds.join(','));
    }
    
    // Agregar parámetros de paginación
    params.append('limit', limit.toString());
    params.append('page', page.toString());

    const res = await fetchWithRefresh(`${config.API_URL}/projects?${params.toString()}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
    });

    if (!res.ok) {
      let errorMessage = 'Error al obtener recomendaciones';
      try {
        const errorData = await res.json();
        errorMessage = errorData.message || errorData.error || `Error ${res.status}: ${res.statusText}`;
      } catch (parseError) {
        errorMessage = `Error ${res.status}: ${res.statusText}`;
      }
      
      // Si es un error del servidor (5xx), devolver datos vacíos en lugar de fallar
      if (res.status >= 500) {
        return { projects: [], pagination: { total: 0 } };
      }
      
      throw new Error(errorMessage);
    }
    
    const data = await res.json();
    
    const projects = data?.data?.projects;
    
    if (!Array.isArray(projects)) {
      return { projects: [], pagination: { total: 0 } };
    }
    
    // Adaptar los proyectos al formato esperado por la UI (misma lógica que fetchProjects)
    const adaptedProjects = projects.map(p => ({
        id: p.id,
        title: p.title,
        description: p.description,
        image: p.image,
        userId: p.userId, // Agregar userId para el filtro de proyectos propios
        owner: typeof p.owner === 'object' && p.owner !== null 
          ? `${p.owner.name || ''} ${p.owner.lastName || ''}`.trim() || p.owner.id || ''
          : p.owner,
        ownerId: typeof p.owner === 'object' && p.owner !== null ? p.owner.id : undefined,
        ownerImage: typeof p.owner === 'object' && p.owner !== null ? p.owner.image : p.ownerImage,
        category: typeof p.category === 'object' && p.category !== null ? p.category.name || '' : p.category,
        categoryId: typeof p.category === 'object' && p.category !== null ? p.category.id : undefined,
        contractType: typeof p.collaborationType === 'object' && p.collaborationType !== null ? p.collaborationType.name || '' : p.collaborationType,
        contractTypeId: typeof p.collaborationType === 'object' && p.collaborationType !== null ? p.collaborationType.id : undefined,
        collaborationType: typeof p.contractType === 'object' && p.contractType !== null ? p.contractType.name || '' : p.contractType,
        collaborationTypeId: typeof p.contractType === 'object' && p.contractType !== null ? p.contractType.id : undefined,
        // Skills para ordenamiento por relevancia
        skills: p.skills || p.requiredSkills || [],
        isActive: p.isActive,
        status: p.status,
        startDate: p.startDate,
        endDate: p.endDate,
        isOwner: p.isOwner,
        approvedApplications: p.approvedApplications || 0,
        maxCollaborators: p.maxCollaborators,
        isApplied: p.isApplied || false,
        postulationStatus: p.postulationStatus || null,
      }));

    return {
      projects: adaptedProjects,
      pagination: data?.data?.pagination || { total: adaptedProjects.length }
    };
  } catch (error) {
    // Si es un error de red o del servidor, devolver datos vacíos como fallback
    if (error.message.includes('Internal server error') || 
        error.message.includes('fetch') || 
        error.message.includes('network')) {
      return { projects: [], pagination: { total: 0 } };
    }
    
    throw error;
  }
}

export async function fetchMyProjects({ ownerId, active, page = 1, limit = 16 }) {
  const params = new URLSearchParams();
  if (typeof active === 'boolean') {
    params.append('includeDeleted', (!active).toString());
  }
  params.append('page', page);
  params.append('limit', limit);

  const res = await fetchWithRefresh(`${config.API_URL}/projects/profile/${ownerId}?${params.toString()}`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ message: 'Error desconocido' }));
    throw new Error(errorData.message || 'Error al obtener proyectos del usuario');
  }

  const data = await res.json();
  const projects = data?.data?.projects;
  const pagination = data?.data?.pagination || { currentPage: page, itemsPerPage: limit, totalItems: Array.isArray(projects) ? projects.length : 0, totalPages: 1 };

  if (!Array.isArray(projects)) return { projects: [], pagination };

  return {
    projects: projects.map(p => ({
      id: p.id,
      title: p.title,
      description: p.description,
      image: p.image,
      userId: p.userId,
      owner: typeof p.owner === 'object' && p.owner !== null 
        ? `${p.owner.name || ''} ${p.owner.lastName || ''}`.trim() || p.owner.id || ''
        : p.owner,
      ownerId: typeof p.owner === 'object' && p.owner !== null ? p.owner.id : undefined,
      ownerImage: typeof p.owner === 'object' && p.owner !== null ? p.owner.image : p.ownerImage,
      category: typeof p.category === 'object' && p.category !== null ? p.category.name || '' : p.category,
      categoryId: typeof p.category === 'object' && p.category !== null ? p.category.id : undefined,
      contractType: typeof p.collaborationType === 'object' && p.collaborationType !== null ? p.collaborationType.name || '' : p.collaborationType,
      contractTypeId: typeof p.collaborationType === 'object' && p.collaborationType !== null ? p.collaborationType.id : undefined,
      collaborationType: typeof p.contractType === 'object' && p.contractType !== null ? p.contractType.name || '' : p.contractType,
      collaborationTypeId: typeof p.contractType === 'object' && p.contractType !== null ? p.contractType.id : undefined,
      skills: p.skills || p.requiredSkills || [],
      isOwner: p.isOwner,
      active: p.active !== undefined ? p.active : p.isActive,
      isActive: p.isActive,
      startDate: p.startDate,
      endDate: p.endDate,
      createdAt: p.createdAt,
      updatedAt: p.updatedAt,
      deletedAt: p.deletedAt,
      roles: p.roles || [],
      postulationsCount: p.postulationsCount || 0,
    })),
    pagination
  };
}

export async function fetchProjectsByUserId(userId) {
  const res = await fetchWithRefresh(`${config.API_URL}/projects/user/${userId}`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ message: 'Error desconocido' }));
    throw new Error(errorData.message || 'Error al obtener proyectos del usuario');
  }

  const data = await res.json();
  const projects = data?.data?.projects;

  if (!Array.isArray(projects)) return [];

  // Adaptar los proyectos al formato esperado por la UI
  return projects.map(p => ({
    id: p.id,
    title: p.title,
    description: p.description,
    image: p.image,
    userId: p.userId,
    owner: typeof p.owner === 'object' && p.owner !== null 
      ? `${p.owner.name || ''} ${p.owner.lastName || ''}`.trim() || p.owner.id || ''
      : p.owner,
    ownerId: typeof p.owner === 'object' && p.owner !== null ? p.owner.id : undefined,
    ownerImage: typeof p.owner === 'object' && p.owner !== null ? p.owner.image : p.ownerImage,
    category: typeof p.category === 'object' && p.category !== null ? p.category.name || '' : p.category,
    categoryId: typeof p.category === 'object' && p.category !== null ? p.category.id : undefined,
    contractType: typeof p.collaborationType === 'object' && p.collaborationType !== null ? p.collaborationType.name || '' : p.collaborationType,
    contractTypeId: typeof p.collaborationType === 'object' && p.collaborationType !== null ? p.collaborationType.id : undefined,
    collaborationType: typeof p.contractType === 'object' && p.contractType !== null ? p.contractType.name || '' : p.contractType,
    collaborationTypeId: typeof p.contractType === 'object' && p.contractType !== null ? p.contractType.id : undefined,
    skills: p.skills || p.requiredSkills || [],
    isOwner: p.isOwner,
    isActive: p.isActive,
    status: p.status,
    startDate: p.startDate,
    endDate: p.endDate,
  }));
}