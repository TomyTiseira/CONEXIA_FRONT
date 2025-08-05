
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { config } from '@/config';

export default function ProjectList({ projects }) {
  const router = useRouter();
  if (!projects || projects.length === 0) {
    return <div className="text-center text-conexia-green mt-12 text-lg opacity-70">No se encontraron proyectos.</div>;
  }
  return (
<div className="grid gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 items-start mt-0">
  {projects.map(project => (
    <div
      key={project.id}
      className="bg-white rounded-2xl shadow-md p-6 sm:p-8 flex flex-col items-stretch min-h-[320px] max-w-full sm:max-w-[500px] w-full hover:shadow-lg transition"
      style={{ minWidth: '340px' }}
    >
      {/* Imagen, título y dueño */}
      <div className="flex flex-col sm:flex-row items-start gap-2 sm:gap-4 mb-4 w-full">
        {/* Imagen del proyecto */}
        <div className="relative w-full sm:w-40 h-40 sm:h-40 flex-shrink-0 mx-auto sm:mx-0">
          {project.image ? (
            <Image
              src={`${config.IMAGE_URL}/${project.image}`}
              alt={project.title}
              fill
              className="object-cover rounded-xl border bg-[#f3f9f8]"
              sizes="144px"
            />
          ) : (
            <Image
              src="/file.svg"
              alt="Sin imagen"
              fill
              className="object-contain rounded-xl border bg-[#f3f9f8]"
              sizes="144px"
            />
          )}
        </div>

        {/* Título, tipos, dueño */}
        <div className="flex flex-col flex-1 justify-between w-full min-w-0">
          <h3 className="font-bold text-conexia-green text-xl sm:text-2xl leading-tight mb-1 break-words whitespace-pre-line w-full truncate">
            {project.title}
          </h3>
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
          <div className="flex items-center gap-2 mt-2 min-w-0">
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
        </div>
      </div>

      {/* Botones responsive */}
      <div className="mt-auto w-full flex justify-center px-0">
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
