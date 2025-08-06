
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { config } from '@/config';

export default function ProjectList({ projects }) {
  const router = useRouter();
  
  // Función para mostrar solo primer nombre y primer apellido
  const getShortName = (fullName) => {
    if (!fullName) return 'Usuario';
    const names = fullName.trim().split(' ');
    
    let shortName;
    if (names.length >= 2) {
      // Tomar el primer nombre y el último apellido
      shortName = `${names[0]} ${names[names.length - 1]}`;
    } else {
      shortName = names[0] || 'Usuario';
    }
    
    return shortName;
  };
  
  if (!projects || projects.length === 0) {
    return <div className="text-center text-conexia-green mt-12 text-lg opacity-70">No se encontraron proyectos.</div>;
  }
  return (
<div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 items-stretch mt-0 w-full px-6 sm:px-0">
  {projects.map(project => (
    <div
      key={project.id}
      className="bg-white rounded-2xl shadow-md p-3 sm:p-4 flex flex-col h-full items-stretch w-full hover:shadow-lg transition"
    >
      {/* Imagen, título y dueño */}
      <div className="flex flex-col xs:flex-row items-start gap-2 xs:gap-3 mb-3 w-full
        [@media(max-width:400px)]:flex-col [@media(max-width:400px)]:items-stretch">
        {/* Imagen del proyecto */}
        <div className="relative w-full flex justify-center items-center">
          <div className="relative w-32 h-32 sm:w-36 sm:h-36 flex-shrink-0 mx-auto">
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
          <div className="h-12 mb-2 flex items-start justify-center">
            <h3 className="font-bold text-conexia-green text-lg sm:text-xl leading-tight break-words text-center line-clamp-2">
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
      <div className="flex flex-col gap-1 mb-4 w-full px-2">
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
            onClick={() => router.push(`/project/${project.id}`)}
          >
            Ver detalle
          </button>
        </div>
      </div>
    </div>
  ))}
</div>
  );
}
