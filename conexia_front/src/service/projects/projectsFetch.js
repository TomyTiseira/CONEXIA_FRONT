// Obtener proyecto por id (simulado)
export async function fetchProjectById(id) {
  const res = await fetch(`http://localhost:8080/api/projects/${id}`, {
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
    price: p.price,
    ownerName: p.ownerName,
    ownerImage: p.ownerImage,
    ownerId: p.ownerId,
    contractType: p.contractType,
    collaborationType: p.collaborationType,
    skills: p.skills,
    category: p.category,
  };
}
// Servicio para buscar proyectos según filtros

export async function fetchProjects({ title, category, skills, collaboration, contract, ownerId, active }) {
  const params = new URLSearchParams();
  if (title) params.append('title', title);
  if (category) params.append('categoryId', category);
  if (skills && skills.length > 0) params.append('skills', skills.join(','));
  if (collaboration) params.append('collaborationTypeId', collaboration);
  if (contract) params.append('contractTypeId', contract);
  if (ownerId) params.append('ownerId', ownerId);
  if (typeof active === 'boolean') params.append('active', active);

  const res = await fetch(`http://localhost:8080/api/projects?${params.toString()}`, {
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
    location: p.location,
    price: p.price,
    ownerName: p.ownerName,
    ownerImage: p.ownerImage,
    ownerId: p.ownerId,
    contractType: p.contractType, // si existe
    collaborationType: p.collaborationType, // si existe
    skills: p.skills, // array de ids o nombres según backend
    category: p.category, // nombre o id según backend
  }));
}
