
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { config } from '@/config';
import { isProjectFinished } from '@/utils/postulationValidation';

export default function ProjectList({ projects, showFinished = false, showInactive = false, origin = '' }) {
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
    <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 items-stretch mt-0 w-full px-6 sm:px-0">
  {filteredProjects.map(project => {
    const projectFinished = isProjectFinished(project);
    return (
    <div
      key={project.id}
      className="bg-white rounded-2xl shadow-md p-3 sm:p-4 flex flex-col h-full items-stretch w-full hover:shadow-lg transition relative"
    >
      {/* Etiqueta Finalizado arriba a la derecha del card */}
      {projectFinished && (
        <span className="absolute top-3 right-4 bg-red-100 text-red-700 px-2 py-0.5 rounded text-[12px] font-semibold border border-red-200 shadow select-none whitespace-nowrap z-20" style={{lineHeight:'1.1'}}>⏰ Finalizado</span>
      )}
      {/* Etiqueta Inactivo al lado izquierdo de la imagen */}
        {(!project.isActive || project.deletedAt)&& (
        <span className="absolute top-3 left-4 bg-gray-200 text-gray-700 px-2 py-0.5 rounded text-[12px] font-semibold border border-gray-300 shadow select-none whitespace-nowrap z-20" style={{lineHeight:'1.1'}}>⏸ Inactivo</span>
      )}
      {/* Imagen, título y dueño */}
      <div className="flex flex-col xs:flex-row items-start gap-2 xs:gap-3 mb-3 w-full [@media(max-width:400px)]:flex-col [@media(max-width:400px)]:items-stretch">
        {/* Imagen centrada */}
        <div className="w-full flex justify-center items-center">
          <div className="relative w-32 h-32 sm:w-36 sm:h-36 flex-shrink-0">
            {project.image ? (
              <Image
                src={`${config.IMAGE_URL}/${project.image}`}
                alt={project.title}
                fill
                className="object-cover rounded-xl border-4 border-white bg-[#f3f9f8] shadow-sm"
                sizes="144px"
              />
            ) : (
              <Image
                src="/default_project.jpeg"
                alt="Imagen por defecto"
                fill
                className="object-cover rounded-xl border-4 border-white bg-[#f3f9f8] shadow-sm"
                sizes="144px"
              />
            )}
          </div>
        </div>

        {/* Título */}
        <div className="flex flex-col flex-1 justify-between w-full min-w-0">
          <div className="h-10 mb-2 flex items-start justify-center">
            <h3 className="font-bold text-conexia-green text-base sm:text-lg leading-tight break-words text-center line-clamp-2">
              {project.title}
            </h3>
          </div>
        </div>
      </div>


      {/* Dueño del proyecto */}
      <div 
        className="flex items-center gap-2 mb-3 min-w-0 px-2 cursor-pointer hover:bg-gray-50 rounded-lg p-2 transition-colors"
        onClick={() => router.push(`/profile/userProfile/${project.ownerId}`)}
      >
        <div className="relative w-7 h-7">
          {project.ownerImage ? (
            <Image
              src={`${config.IMAGE_URL}/${project.ownerImage}`}
              alt={project.owner || 'Usuario'}
              fill
              className="object-cover rounded-full border bg-[#f3f9f8]"
              sizes="28px"
            />
          ) : (
            <Image
              src="/logo.png"
              alt="Sin imagen"
              fill
              className="object-contain rounded-full border bg-[#f3f9f8]"
              sizes="28px"
            />
          )}
        </div>
        <span className="text-conexia-green font-semibold text-sm whitespace-pre-line break-words truncate hover:underline">
          {getShortName(project.owner)}
        </span>
      </div>

      {/* Tipos/Badges - Layout consistente */}
      <div className="flex flex-col gap-1 mb-4 w-full px-2 min-h-[56px]">
        {/* Espaciador para mantener altura consistente */}
        <div className="gap-1" style={{minHeight:'16px'}} />
        {/* Primera fila: Categoría y Tipo de Contrato */}
        <div className="flex gap-1 w-full">
          {project.category && (
            <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs font-medium truncate flex-1 min-w-0 text-center">
              {project.category}
            </span>
          )}
          {project.contractType && (
            <span className="bg-conexia-green/10 text-conexia-green px-2 py-1 rounded text-xs font-medium truncate flex-1 min-w-0 text-center">
              {project.contractType}
            </span>
          )}
        </div>
        {/* Segunda fila: Tipo de Colaboración */}
        {project.collaborationType && (
          <div className="flex w-full">
            <span className="bg-orange-100 text-orange-700 px-2 py-1 rounded text-xs font-medium truncate w-full text-center">
              {project.collaborationType}
            </span>
          </div>
        )}
      </div>

      {/* Botones responsive */}
      <div className="w-full mt-auto px-2">
        <div className="flex w-full">
          <button
            className="bg-conexia-green/90 text-white px-4 py-2 rounded-md text-sm font-semibold hover:bg-conexia-green transition w-full"
            onClick={() => {
              let url = `/project/${project.id}`;
              if (origin === 'my-projects') {
                url += '?from=my-projects';
              } else if (origin === 'user-projects') {
                url += '?from=user-projects';
              }
              router.push(url);
            }}
          >
            Ver detalle
          </button>
        </div>
      </div>
    </div>
    );
  })}
  </div>
  );
}
