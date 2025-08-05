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
  return {
    id: p.id,
    title: p.title,
    description: p.description,
    image: p.image,
    owner: p.owner,
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
}
// Servicio para buscar proyectos según filtros

export async function fetchProjects({ title, category, skills, collaboration, contract}) {
  const params = new URLSearchParams();
  if (title) params.append('search', title);
  if (category) params.append('categoryIds', category);
  if (skills && skills.length > 0) params.append('skillsIds', skills.join(','));
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
    // Si contractType es objeto, extraer nombre
    contractType: typeof p.contractType === 'object' && p.contractType !== null ? p.contractType.name || '' : p.contractType,
    contractTypeId: typeof p.contractType === 'object' && p.contractType !== null ? p.contractType.id : undefined,
    // Si collaborationType es objeto, extraer nombre
    collaborationType: typeof p.collaborationType === 'object' && p.collaborationType !== null ? p.collaborationType.name || '' : p.collaborationType,
    collaborationTypeId: typeof p.collaborationType === 'object' && p.collaborationType !== null ? p.collaborationType.id : undefined,
    // Si category es objeto, extraer nombre
    category: typeof p.category === 'object' && p.category !== null ? p.category.name || '' : p.category,
    categoryId: typeof p.category === 'object' && p.category !== null ? p.category.id : undefined,
    // Otros campos planos
    isOwner: p.isOwner,
  }));
}

export async function fetchMyProjects({ ownerId, active }) {
  const params = new URLSearchParams();
  if (typeof active === 'boolean') params.append('active', active);

  const res = await fetch(`${config.API_URL}/projects/profile/${ownerId}?${params.toString()}`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
  });
  if (!res.ok) throw new Error('Error al obtener proyectos');
  const data = await res.json();
  // Adaptar los proyectos al formato esperado por la UI
  return data.map(p => ({
    id: p.id,
    title: p.title,
    description: p.description,
    image: p.image,
    owner: p.owner,
    ownerImage: p.ownerImage,
    contractType: p.contractType, // si existe
    collaborationType: p.collaborationType, // si existe
    category: p.category, // nombre o id según backend
  }));
}
