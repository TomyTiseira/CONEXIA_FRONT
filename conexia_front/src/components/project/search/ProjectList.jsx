
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { config } from '@/config';

export default function ProjectList({ projects }) {
  const router = useRouter();
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
          {/* Imagen principal */}
          <div className="flex flex-col items-center mb-2">
            <div className="w-full flex justify-center">
              <div className="relative w-32 h-28 mb-2">
                {project.image ? (
                  <Image
                    src={`${config.IMAGE_URL}/${project.image}`}
                    alt={project.title}
                    fill
                    className="object-cover rounded border bg-[#f3f9f8]"
                    style={{ background: '#f3f9f8' }}
                    sizes="128px"
                  />
                ) : (
                  <Image
                    src="/file.svg"
                    alt="Sin imagen"
                    fill
                    className="object-contain rounded border bg-[#f3f9f8]"
                    sizes="128px"
                  />
                )}
              </div>
            </div>
            <h3 className="font-bold text-conexia-green text-lg text-center mb-1 leading-tight min-h-[48px]">
              {project.title}
            </h3>
            {/* Info principal: ubicación */}
            <div className="flex justify-center items-center gap-2 mb-2">
              <span className="bg-[#e6f2ef] text-conexia-green px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 inline-block mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a2 2 0 01-2.828 0l-4.243-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                {project.location || 'Ubicación'}
              </span>
            </div>
            {/* Nombre y avatar del owner */}
            <div className="flex items-center gap-2 mb-2">
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
              <span className="text-conexia-green font-semibold text-sm">{project.owner || 'Usuario'}</span>
            </div>
          </div>
          {/* Botones */}
          <div className="flex gap-2 mt-auto">
            <button
              className="bg-conexia-coral text-white px-4 py-2 rounded text-sm font-semibold hover:bg-conexia-coral/90 transition"
              onClick={() => router.push(`/project/${project.id}`)}
            >
              + información
            </button>
            <button
              className="bg-conexia-green/90 text-white px-4 py-2 rounded text-sm font-semibold hover:bg-conexia-green transition"
              onClick={() => router.push(`/profile/userProfile/${project.ownerId}`)}
            >
              Ver perfil
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
