// Obtener proyecto por id (simulado)
export async function fetchProjectById(id) {
  const res = await fetch(`${config.API_URL}/projects/${id}`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
  });
  if (!res.ok) return null;
  const p = await res.json();
  return {
    id: p.id,
    title: p.title,
    description: p.description,
    image: p.image,
    location: p.location,
    owner: p.owner,
    ownerImage: p.ownerImage,
    contractType: p.contractType,
    collaborationType: p.collaborationType,
    skills: p.skills,
    category: p.category,
    maxCollaborators: p.maxCollaborators,
    isActive: p.isActive,
    start_date: p.start_date,
    end_date: p.end_date,
  };
}
// Servicio para buscar proyectos según filtros

export async function fetchProjects({ title, category, skills, collaboration, contract}) {
  const params = new URLSearchParams();
  if (title) params.append('search', title);
  if (category) params.append('categoryIds', category);
  if (skills && skills.length > 0) params.append('skillsIds', skills.join(','));
  if (collaboration) params.append('collaborationTypeIds', collaboration);
  if (contract) params.append('contractTypeIds', contract);

  const res = await fetch(`${config.API_URL}/projects?${params.toString()}`, {
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
