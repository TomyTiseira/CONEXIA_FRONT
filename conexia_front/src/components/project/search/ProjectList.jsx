// Lista de proyectos (vacía por defecto)
export default function ProjectList({ projects }) {
  if (!projects || projects.length === 0) {
    return <div className="text-center text-conexia-green mt-12 text-lg opacity-70">No se encontraron proyectos.</div>;
  }
  return (
    <div className="grid gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 mt-8">
      {projects.map(project => (
        <div
          key={project.id}
          className="bg-white rounded-xl shadow-md p-5 flex flex-col items-stretch min-h-[370px] hover:shadow-lg transition"
        >
          <div className="flex flex-col items-center mb-2">
            <img
              src={project.image}
              alt={project.title}
              className="w-28 h-28 object-cover rounded mb-2 border"
              style={{ background: '#f3f9f8' }}
            />
            <h3 className="font-bold text-conexia-green text-lg text-center mb-1 leading-tight min-h-[48px]">
              {project.title}
            </h3>
            <div className="text-sm text-conexia-green/80 mb-1 text-center">
              {project.contractType} - {project.collaborationType}
            </div>
          </div>
          <div className="flex items-center gap-2 mb-2 mt-auto">
            <img
              src={project.ownerImage}
              alt={project.ownerName}
              className="w-8 h-8 rounded-full border"
              style={{ background: '#f3f9f8' }}
            />
            <span className="text-conexia-green font-semibold text-sm">{project.ownerName}</span>
          </div>
          <div className="flex gap-2 mt-2">
            <button className="bg-conexia-coral text-white px-4 py-2 rounded text-sm font-semibold hover:bg-conexia-coral/90 transition">+ información</button>
            <button className="bg-conexia-green/90 text-white px-4 py-2 rounded text-sm font-semibold hover:bg-conexia-green transition">Ver perfil</button>
          </div>
        </div>
      ))}
    </div>
  );
}
