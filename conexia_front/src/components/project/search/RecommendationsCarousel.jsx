'use client';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { config } from '@/config';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useCarouselNavigation } from '@/hooks/project/useCarouselNavigation';
import { isProjectFinished } from '@/utils/postulationValidation';

export default function RecommendationsCarousel({ projects, onProjectClick }) {
  // Mapear endDate: si no viene, poner null
  const normalizedProjects = (projects || []).map(p => ({ ...p, endDate: p.endDate ?? null }));
  // Log de depuración para ver todos los proyectos y sus fechas de fin
  if (normalizedProjects.length > 0) {
    // eslint-disable-next-line no-console
  }
  const router = useRouter();

  // Filtrar proyectos finalizados y log para depuración
  const filteredProjects = normalizedProjects.filter(project => {
    const finished = isProjectFinished(project);
    if (finished) {
      // eslint-disable-next-line no-console
    }
    return !finished;
  });

  const {
    currentPage,
    totalPages,
    totalPagesMobile,
    goToNext,
    goToPrevious,
    goToNextMobile,
    goToPreviousMobile,
    getCurrentItems,
    getCurrentItemMobile,
    goToPage
  } = useCarouselNavigation(filteredProjects.length, 3, 1);
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
    return null;
  }

  const handleProjectClick = (project) => {
    if (onProjectClick) {
      onProjectClick(project);
    } else {
      router.push(`/project/${project.id}`);
    }
  };

  const ProjectCard = ({ project, isMobile = false }) => (
    <div
      key={project.id}
      className={`bg-white rounded-2xl shadow-md p-3 sm:p-4 flex flex-col h-full items-stretch hover:shadow-lg transition ${
        isMobile ? 'w-full' : 'w-full'
      }`}
    >
      {/* Imagen, título y dueño */}
      <div className="flex flex-col xs:flex-row items-start gap-2 xs:gap-3 mb-3 w-full
        [@media(max-width:400px)]:flex-col [@media(max-width:400px)]:items-stretch">
        {/* Imagen del proyecto */}
        <div className="relative w-full flex justify-center items-center">
          <div className="relative w-32 h-32 sm:w-36 sm:h-36 flex-shrink-0 mx-auto">
            {project.image ? (
              <Image
                src={`${config.IMAGE_URL}/projects/images/${project.image}`}
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

      {/* Tipos/Badges */}
      <div className="flex flex-col gap-1 mb-4 w-full px-2">
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
        {project.collaborationType && (
          <div className="flex w-full">
            <span className="bg-orange-100 text-orange-700 px-2 py-1 rounded text-xs font-medium truncate w-full text-center">
              {project.collaborationType}
            </span>
          </div>
        )}
      </div>

      {/* Botón */}
      <div className="w-full mt-auto px-2">
        <div className="flex w-full">
          <button
            className="bg-conexia-green/90 text-white px-4 py-2 rounded-md text-sm font-semibold hover:bg-conexia-green transition w-full"
            onClick={() => handleProjectClick(project)}
          >
            Ver detalle
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="w-full">
      {/* Título del carrusel */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-conexia-green">
          Proyectos recomendados para ti
        </h2>
        <div className="text-sm text-conexia-green/70">
          {filteredProjects.length} {filteredProjects.length === 1 ? 'proyecto' : 'proyectos'}
        </div>
      </div>

      {/* Carrusel Desktop */}
      <div className="hidden md:block">
        <div className="relative">
          {/* Contenedor de proyectos */}
          <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 items-stretch w-full">
            {getCurrentItems(filteredProjects).map(project => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>

          {/* Controles de navegación */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-4 mt-6">
              <button
                onClick={goToPrevious}
                className="p-2 rounded-full bg-white shadow-md hover:shadow-lg transition-shadow border border-gray-200 hover:border-conexia-green"
                aria-label="Anterior"
              >
                <ChevronLeft className="h-5 w-5 text-conexia-green" />
              </button>

              {/* Indicadores de página */}
              <div className="flex gap-2">
                {Array.from({ length: totalPages }, (_, index) => (
                  <button
                    key={index}
                    onClick={() => goToPage(index)}
                    className={`w-3 h-3 rounded-full transition-colors ${
                      index === currentPage
                        ? 'bg-conexia-green'
                        : 'bg-gray-300 hover:bg-gray-400'
                    }`}
                    aria-label={`Ir a la página ${index + 1}`}
                  />
                ))}
              </div>

              <button
                onClick={goToNext}
                className="p-2 rounded-full bg-white shadow-md hover:shadow-lg transition-shadow border border-gray-200 hover:border-conexia-green"
                aria-label="Siguiente"
              >
                <ChevronRight className="h-5 w-5 text-conexia-green" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Carrusel Mobile */}
      <div className="block md:hidden">
        <div className="relative">
          {/* Contenedor de proyecto */}
          <div className="w-full">
            {getCurrentItemMobile(filteredProjects) && (
              <ProjectCard project={getCurrentItemMobile(filteredProjects)} isMobile={true} />
            )}
          </div>

          {/* Controles de navegación mobile */}
          {totalPagesMobile > 1 && (
            <div className="flex items-center justify-center gap-4 mt-6">
              <button
                onClick={goToPreviousMobile}
                className="p-2 rounded-full bg-white shadow-md hover:shadow-lg transition-shadow border border-gray-200 hover:border-conexia-green"
                aria-label="Anterior"
              >
                <ChevronLeft className="h-5 w-5 text-conexia-green" />
              </button>

              {/* Indicador de posición mobile */}
              <div className="text-sm text-conexia-green font-medium">
                {currentPage + 1} de {totalPagesMobile}
              </div>

              <button
                onClick={goToNextMobile}
                className="p-2 rounded-full bg-white shadow-md hover:shadow-lg transition-shadow border border-gray-200 hover:border-conexia-green"
                aria-label="Siguiente"
              >
                <ChevronRight className="h-5 w-5 text-conexia-green" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
