
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { config } from '@/config';

export default function ProjectList({ projects }) {
  const router = useRouter();
  if (!projects || projects.length === 0) {
    return <div className="text-center text-conexia-green mt-12 text-lg opacity-70">No se encontraron proyectos.</div>;
  }
  return (
<div className="grid gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 items-start mt-0 w-full">
  {projects.map(project => (
    <div
      key={project.id}
      className="bg-white rounded-2xl shadow-md p-4 sm:p-4 flex flex-col h-full items-stretch w-full hover:shadow-lg transition"
    >
      {/* Imagen, título y dueño */}
      <div className="flex flex-col xs:flex-row items-start gap-2 xs:gap-4 mb-2 w-full
        [@media(max-width:400px)]:flex-col [@media(max-width:400px)]:items-stretch">
        {/* Imagen del proyecto */}
        <div className="relative w-full flex justify-center items-center">
          <div className="relative w-44 h-44 sm:w-48 sm:h-48 flex-shrink-0 mx-auto">
            {project.image ? (
              <Image
                src={`${config.IMAGE_URL}/${project.image}`}
                alt={project.title}
                fill
                className="object-cover rounded-xl border bg-[#f3f9f8]"
                sizes="192px"
              />
            ) : (
              <Image
                src="/file.svg"
                alt="Sin imagen"
                fill
                className="object-contain rounded-xl border bg-[#f3f9f8]"
                sizes="192px"
              />
            )}
          </div>
        </div>

        {/* Título, dueño, tipos */}
        <div className="flex flex-col flex-1 justify-between w-full min-w-0">
          <h3 className="font-bold text-conexia-green text-xl sm:text-2xl leading-tight mb-1 break-words whitespace-pre-line w-full truncate text-center">
            {project.title}
          </h3>
          {/* Dueño */}
          <div className="flex items-center gap-2 mt-2 min-w-0 mb-2">
            <div className="relative w-8 h-8">
              {project.ownerImage ? (
                <Image
                  src={`${config.IMAGE_URL}/${project.ownerImage}`}
                  alt={project.owner || 'Usuario'}
                  fill
                  className="object-cover rounded-full border bg-[#f3f9f8]"
                  sizes="32px"
                />
              ) : (
                <Image
                  src="/logo.png"
                  alt="Sin imagen"
                  fill
                  className="object-contain rounded-full border bg-[#f3f9f8]"
                  sizes="32px"
                />
              )}
            </div>
            <span className="text-conexia-green font-semibold text-base whitespace-pre-line break-words truncate">
              {project.owner || 'Usuario'}
            </span>
          </div>
          {/* Tipos */}
          <div className="flex flex-wrap gap-2 mb-2 w-full">
            {project.contractType && (
              <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs font-medium truncate">
                {project.contractType}
              </span>
            )}
            {project.collaborationType && (
              <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs font-medium truncate">
                {project.collaborationType}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Botones responsive */}
      <div className="w-full flex justify-center px-0 mt-auto">
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto justify-center items-center px-0">
          <button
            className="bg-conexia-coral text-white px-5 py-2 rounded-md text-base font-semibold hover:bg-conexia-coral/90 transition w-full sm:w-auto"
            onClick={() => router.push(`/project/${project.id}`)}
          >
            + Información
          </button>
          <button
            className="bg-conexia-green/90 text-white px-5 py-2 rounded-md text-base font-semibold hover:bg-conexia-green transition w-full sm:w-auto"
            onClick={() => router.push(`/profile/userProfile/${project.ownerId}`)}
          >
            Ver Perfil
          </button>
        </div>
      </div>
    </div>
  ))}
</div>
  );
}
