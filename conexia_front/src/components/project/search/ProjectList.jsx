
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { config } from '@/config';
import { isProjectFinished } from '@/utils/postulationValidation';

export default function ProjectList({ projects, showFinished = false, showInactive = false, origin = '', reserveGridSpace = false }) {
  const router = useRouter();

  // Filtrar proyectos finalizados si no se deben mostrar
  const filteredProjects = showFinished
    ? projects
    : projects?.filter(project => !isProjectFinished(project)) || [];

  // Función para mostrar primer nombre y primer apellido
  const getShortName = (fullName) => {
    if (!fullName) return 'Usuario';
    const names = fullName.trim().split(' ').filter(name => name.length > 0);

    if (names.length === 0) return 'Usuario';
    if (names.length === 1) return names[0];
    if (names.length === 2) return `${names[0]} ${names[1]}`;

    // Para 3 o más nombres, asumimos: Primer_Nombre [Segundo_Nombre] Primer_Apellido [Segundo_Apellido]
    // Tomamos el primer nombre (names[0]) y el primer apellido (names[2] si existe, sino names[1])
    if (names.length >= 3) {
      return `${names[0]} ${names[2]}`;
    }

    return `${names[0]} ${names[1]}`;
  };

  if (!filteredProjects || filteredProjects.length === 0) {
    return <div className="text-center text-conexia-green mt-12 text-lg opacity-70">No se encontraron proyectos.</div>;
  }

  return (
    <div className={`${reserveGridSpace ? 'min-h-[800px] flex flex-col' : ''}`}>
      <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 ${reserveGridSpace ? 'flex-1' : ''}`}>
        {filteredProjects.map(project => {
          const projectFinished = isProjectFinished(project);
          return (
            <div
              key={project.id}
              className="bg-white rounded-2xl shadow-md p-2.5 sm:p-3 flex flex-col h-full items-stretch w-full hover:shadow-lg transition relative"
            >
              {/* Etiquetas arriba de la imagen */}
              <div className="flex flex-row gap-2 mb-0.5 w-full justify-between items-center px-1.5" style={{ minHeight: (!project.isActive || project.deletedAt || projectFinished) ? '20px' : '8px' }}>
                {(!project.isActive || project.deletedAt) && (
                  <span className="bg-gray-200 text-gray-700 px-2 py-0.5 rounded text-[12px] font-semibold border border-gray-300 shadow select-none whitespace-nowrap" style={{ lineHeight: '1.1' }}>⏸ Inactivo</span>
                )}
                <div className="flex-1" />
                {projectFinished && (
                  <span className="bg-red-100 text-red-700 px-2 py-0.5 rounded text-[12px] font-semibold border border-red-200 shadow select-none whitespace-nowrap" style={{ lineHeight: '1.1' }}>⏰ Finalizado</span>
                )}
              </div>

              {/* Imagen */}
              <div className="flex justify-center items-center mb-2.5 w-full">
                <div className="relative w-52 h-52 sm:w-56 sm:h-56 flex-shrink-0">
                  {project.image ? (
                    <Image
                      src={`${config.IMAGE_URL}/projects/images/${project.image}`}
                      alt={project.title}
                      fill
                      className="object-cover rounded-xl border-4 border-white bg-[#f3f9f8] shadow-sm"
                      sizes="224px"
                    />
                  ) : (
                    <Image
                      src="/default_project.jpeg"
                      alt="Imagen por defecto"
                      fill
                      className="object-cover rounded-xl border-4 border-white bg-[#f3f9f8] shadow-sm"
                      sizes="224px"
                    />
                  )}
                </div>
              </div>

              {/* Título y dueño */}
              <div className="mb-1.5 flex flex-col items-center w-full">
                <div className="h-10 sm:h-12 flex items-center justify-center w-full overflow-hidden">
                  <h3 className="font-bold text-conexia-green text-sm sm:text-base leading-tight break-words text-center line-clamp-2 w-full">
                    {project.title}
                  </h3>
                </div>
                
                <div
                  className="flex items-center gap-2 mt-0.5 min-w-0 px-1.5 cursor-pointer hover:bg-gray-50 rounded-lg p-1.5 transition-colors"
                  onClick={() => router.push(`/profile/userProfile/${project.ownerId}`)}
                  style={{ maxWidth: '100%' }}
                >
                  <div className="relative w-6 h-6">
                    {project.ownerImage ? (
                      <Image
                        src={`${config.IMAGE_URL}/${project.ownerImage}`}
                        alt={project.owner || 'Usuario'}
                        fill
                        className="object-cover rounded-full border bg-[#f3f9f8]"
                        sizes="24px"
                      />
                    ) : (
                      <Image
                        src="/logo.png"
                        alt="Sin imagen"
                        fill
                        className="object-contain rounded-full border bg-[#f3f9f8]"
                        sizes="24px"
                      />
                    )}
                  </div>
                  <span className="text-conexia-green font-semibold text-xs sm:text-sm whitespace-pre-line break-words truncate hover:underline max-w-[120px] md:max-w-[180px] lg:max-w-[220px]">
                    {getShortName(project.owner)}
                  </span>
                </div>
              </div>

              {/* Badges */}
              <div className="flex flex-col gap-1.5 mb-3 w-full px-1.5 min-h-[48px]">
                <div className="gap-0.5" style={{ minHeight: '8px' }} />
                <div className="flex gap-1 w-full">
                  {project.category && (
                    <span className="bg-blue-100 text-blue-700 px-2.5 py-1.5 rounded text-xs font-medium truncate flex-1 min-w-0 text-center">
                      {project.category}
                    </span>
                  )}
                  {project.contractType && (
                    <span className="bg-conexia-green/10 text-conexia-green px-2.5 py-1.5 rounded text-xs font-medium truncate flex-1 min-w-0 text-center">
                      {project.contractType}
                    </span>
                  )}
                </div>
                {project.collaborationType && (
                  <div className="flex w-full">
                    <span className="bg-orange-100 text-orange-700 px-2 py-1 rounded text-xs font-medium truncate w-full text-center">
                      {project.collaborationType}
                    </span>
                  </div>
                )}
              </div>

              {/* Botón */}
              <div className="w-full mt-auto px-1.5 mb-2.5">
                <button
                  className="bg-conexia-green hover:bg-conexia-green/90 text-white px-3 py-1.5 rounded-md text-sm font-semibold transition w-full"
                  onClick={() => {
                    let url = `/project/${project.id}`;
                    if (origin === 'my-projects') {
                      url += '?from=my-projects';
                    } else if (origin === 'my-projects-preview') {
                      url += '?from=profile';
                    } else if (origin === 'user-projects') {
                      url += '?from=user-projects';
                    } else if (origin === 'user-projects-preview') {
                      url += '?from=profile';
                    }
                    router.push(url);
                  }}
                >
                  Ver detalle
                </button>
              </div>
            </div>
          );
        })}

        {/* Rellenar con espacios vacíos si hay menos de 12 proyectos */}
        {reserveGridSpace && filteredProjects.length < 12 && (
          Array.from({ length: 12 - filteredProjects.length }).map((_, index) => (
            <div key={`empty-${index}`} className="invisible">
              <div className="aspect-[4/5] bg-transparent"></div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
