// Servicio para buscar proyectos según filtros
export async function fetchProjects({ title, category, skills, collaboration }) {
  // Simulación: reemplazar por fetch real a la API
  // Aquí deberías construir la query string según los filtros
  const params = new URLSearchParams();
  if (title) params.append('title', title);
  if (category) params.append('category', category);
  if (skills && skills.length > 0) params.append('skills', skills.join(','));
  if (collaboration) params.append('collaboration', collaboration);

  // Ejemplo de endpoint: /api/projects?title=...&category=...&skills=...&collaboration=...
  // const res = await fetch(`/api/projects?${params.toString()}`);
  // return await res.json();

  // Simulación de resultados
  return [
    {
      id: 1,
      title: 'Plataforma para gestionar tareas con IA',
      description: 'Buscamos desarrollar una app web con funciones de automatización usando IA.',
      image: '/img/proyecto1.jpg',
      location: 'Córdoba',
      price: 300,
      ownerName: 'Luis Rodríguez',
      ownerImage: '/img/user1.jpg',
      contractType: 'Remunerada',
      collaborationType: 'Remunerada',
      skills: ['React', 'Python'],
      category: 'Tecnología e Innovación',
    },
    {
      id: 2,
      title: 'Dibuja conmigo un cuento para chicos',
      description: 'Estoy escribiendo un libro infantil y necesito un ilustrador/a para crear los personajes y escenarios.',
      image: '/img/proyecto2.jpg',
      location: 'Córdoba',
      price: 300,
      ownerName: 'Julieta Ortega',
      ownerImage: '/img/user2.jpg',
      contractType: 'Remunerada',
      collaborationType: 'Voluntaria',
      skills: ['Creatividad', 'Comunicación'],
      category: 'Diseño y Creatividad',
    },
    // ...más proyectos de ejemplo
  ].filter(p => {
    if (title && !p.title.toLowerCase().includes(title.toLowerCase())) return false;
    if (category && p.category !== category) return false;
    if (skills && skills.length > 0 && !skills.every(s => p.skills.includes(s))) return false;
    if (collaboration && p.collaborationType !== collaboration) return false;
    return true;
  });
}
