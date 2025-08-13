import Navbar from '@/components/navbar/Navbar';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { fetchProjectById } from '@/service/projects/projectsFetch';
import { useAuth } from '@/context/AuthContext';
import { useUserStore } from '@/store/userStore';
import { useRouter } from 'next/navigation';
import { ROLES } from '@/constants/roles';
import DeleteProjectModal from '@/components/project/deleteProject/DeleteProjectModal';
import { PostulationButton } from '@/components/project/postulation';
import { ProjectValidationStatus } from '@/components/project/validation';

export default function ProjectDetail({ projectId }) {
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const { user } = useAuth();
  const { roleName } = useUserStore();
  const router = useRouter();

  useEffect(() => {
    fetchProjectById(projectId).then((data) => {
      setProject(data);
      setLoading(false);
    });
  }, [projectId]);

  if (loading) return <div className="min-h-screen flex items-center justify-center">Cargando...</div>;
  if (!project) return <div className="min-h-screen flex items-center justify-center text-conexia-green">Proyecto no encontrado</div>;

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

  const isOwner = user && project && (String(user.id) === String(project.ownerId) || project.isOwner);
  
  // Debug: Log para entender por qué no se muestra el botón
  console.log('PostulationButton Debug:', {
    user: user?.id,
    projectOwnerId: project?.ownerId,
    projectIsOwner: project?.isOwner,
    isOwner: isOwner,
    roleName: roleName,
    shouldShowButton: !isOwner,
    roleCheck: roleName === 'USER'
  });
  
  const skills = Array.isArray(project.skills) ? project.skills : (project.skills ? [project.skills] : []);
  const ownerName = getShortName(project.owner || ''); // owner ya viene como string del backend
  const ownerImage = project.ownerImage || null; // ownerImage ya viene como string del backend
  const contractTypes = Array.isArray(project.contractType) ? project.contractType : (project.contractType ? [project.contractType] : []);
  const collaborationTypes = Array.isArray(project.collaborationType) ? project.collaborationType : (project.collaborationType ? [project.collaborationType] : []);
  const categories = Array.isArray(project.category) ? project.category : (project.category ? [project.category] : []);

  // Helper para asegurar URLs absolutas
  const { config } = require('@/config');
  const getImageUrl = (img) => {
    if (!img) return null;
    if (img.startsWith('http://') || img.startsWith('https://') || img.startsWith('/')) return img;
    return `${config.IMAGE_URL}/${img}`;
  };

  return (
    <>
      <Navbar />
      <div className="min-h-[calc(100vh-64px)] relative py-8 px-6 md:px-6 flex flex-col items-center overflow-x-hidden bg-[#f3f9f8] pb-20 md:pb-8">
        {/* Fondo decorativo */}
        <div className="pointer-events-none select-none fixed inset-0 w-screen h-screen z-0">
          <img
            src="/window.svg"
            alt="Decoración fondo"
            className="absolute top-[-120px] left-[-120px] w-[500px] opacity-20 rotate-12"
            aria-hidden="true"
          />
          <img
            src="/globe.svg"
            alt="Decoración fondo"
            className="absolute bottom-[-100px] right-[-100px] w-[400px] opacity-10"
            aria-hidden="true"
          />
        </div>
        <div className="w-full max-w-4xl bg-white rounded-2xl shadow p-8 z-10 relative">
          <div className="flex flex-col md:flex-row gap-10">
            {/* Imagen */}
            <div className="flex flex-col items-center md:items-start w-full md:w-56">
              <div className="relative w-48 h-48 rounded-xl border-4 border-white bg-[#f3f9f8] overflow-hidden mb-2 shadow-sm">
                {project.image ? (
                  <Image
                    src={getImageUrl(project.image)}
                    alt={project.title}
                    fill
                    className="object-cover rounded-xl"
                    sizes="192px"
                  />
                ) : (
                  <Image
                    src="/default_project.jpeg"
                    alt="Imagen por defecto"
                    fill
                    className="object-cover rounded-xl"
                    sizes="192px"
                  />
                )}
              </div>
            </div>
            {/* Info principal */}
            <div className="flex-1 flex flex-col gap-4 min-w-0">
              <h1 className="text-3xl font-bold text-conexia-green break-words">{project.title || 'Sin título'}</h1>
              <div className="flex flex-wrap gap-2 mb-1">
                {categories.length > 0 && categories.map((cat) => (
                  <span key={cat} className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-semibold">{cat}</span>
                ))}
                {collaborationTypes.length > 0 && collaborationTypes.map((type) => (
                  <span key={type} className="bg-conexia-green/10 text-conexia-green px-3 py-1 rounded-full text-xs font-semibold">{type}</span>
                ))}
                {contractTypes.length > 0 && contractTypes.map((type) => (
                  <span key={type} className="bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-xs font-semibold">{type}</span>
                ))}
              </div>
              <div>
                <span className="block text-sm text-gray-500 font-semibold mb-1">Descripción</span>
                <div className="text-base break-words whitespace-pre-line text-gray-700 bg-gray-50 rounded p-3 border border-gray-100">{project.description || 'Sin descripción'}</div>
              </div>
              {project.location && (
                <div>
                  <span className="block text-sm text-gray-500 font-semibold mb-1">Ubicación</span>
                  <div className="text-base break-words text-gray-700 bg-gray-50 rounded p-3 border border-gray-100">{project.location}</div>
                </div>
              )}
              {skills.length > 0 && (
                <div className="mt-2">
                  <span className="block text-sm text-gray-500 font-semibold mb-1">Habilidades requeridas</span>
                  <div className="flex gap-2 flex-wrap">
                    {skills.map(skill => (
                      <div
                        key={skill}
                        className="inline-flex items-center px-3 py-1 bg-conexia-green text-white rounded-full text-sm"
                      >
                        {skill}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 mt-4">
                {project.maxCollaborators && (
                  <div className="text-sm text-gray-500">Máx. colaboradores: <span className="font-semibold text-gray-700">{project.maxCollaborators}</span></div>
                )}
                {project.startDate && (
                  <div className="text-sm text-gray-500 sm:ml-2">Inicio: <span className="font-semibold text-gray-700">{new Date(project.startDate).toLocaleDateString()}</span></div>
                )}
                {project.endDate && (
                  <div className="text-sm text-gray-500 sm:ml-2">Fin: <span className="font-semibold text-gray-700">{new Date(project.endDate).toLocaleDateString()}</span></div>
                )}
              </div>
              {/* Dueño del proyecto */}
              <div className="flex items-center gap-3 mt-4">
                <div 
                  className="relative w-10 h-10 cursor-pointer hover:opacity-80 transition-opacity"
                  onClick={() => {
                    if (project.ownerId) {
                      router.push(`/profile/userProfile/${project.ownerId}`);
                    }
                  }}
                >
                  {ownerImage ? (
                    <Image
                      src={getImageUrl(ownerImage)}
                      alt={ownerName}
                      fill
                      className="object-cover rounded-full border"
                      sizes="40px"
                    />
                  ) : (
                    <Image
                      src="/logo.png"
                      alt="Sin imagen"
                      fill
                      className="object-contain rounded-full border bg-gray-200"
                      sizes="40px"
                    />
                  )}
                </div>
                <div 
                  className="flex flex-col cursor-pointer hover:bg-gray-50 rounded-lg p-2 transition-colors"
                  onClick={() => {
                    if (project.ownerId) {
                      router.push(`/profile/userProfile/${project.ownerId}`);
                    }
                  }}
                >
                  <span className="text-conexia-green font-semibold text-base break-words hover:underline">{ownerName}</span>
                  <span className="text-xs text-gray-500">Dueño del proyecto</span>
                </div>
              </div>
              
              {/* Estado de validación del proyecto */}
              <ProjectValidationStatus
                project={project}
                user={user}
                isOwner={isOwner}
                userRole={roleName}
              />
            </div>
          </div>
          {/* Fila de botones que abarca ambas columnas */}
          <div className="mt-6 flex flex-col md:flex-row gap-4 md:gap-0">
            {/* Columna izquierda - Botón Atrás alineado con la imagen */}
            <div className="w-full md:w-56 flex justify-start">
              <div className="flex gap-3">
                <button 
                  className="bg-red-500 text-white px-3 py-2 rounded font-semibold hover:bg-red-600 transition text-sm"
                  onClick={() => router.push('/project/search')}
                >
                  ← Atrás
                </button>
                {/* Botones Contactar y Postularse en mobile */}
                {!isOwner && (
                  <>
                    <button className="md:hidden bg-blue-600 text-white px-3 py-2 rounded font-semibold hover:bg-blue-700 transition text-sm">Contactar</button>
                    <PostulationButton
                      projectId={projectId}
                      projectTitle={project.title}
                      isOwner={isOwner}
                      userRole={roleName}
                      initialIsApplied={project.isApplied || false}
                      className="md:hidden text-sm px-3 py-2"
                    />
                  </>
                )}
                {/* Botón Eliminar proyecto en mobile */}
                {isOwner && (
                  <button
                    className="md:hidden bg-conexia-coral text-white px-3 py-2 rounded font-semibold hover:bg-conexia-coral/90 transition text-sm"
                    onClick={() => setShowDeleteModal(true)}
                  >
                    Eliminar proyecto
                  </button>
                )}
              </div>
            </div>
            {/* Espacio entre columnas - solo en desktop */}
            <div className="hidden md:block md:w-6"></div>
            {/* Columna derecha - Otros botones alineados a la izquierda */}
            <div className="flex-1 min-w-0">
              <div className="flex flex-col sm:flex-row gap-3 flex-wrap">
                {/* Botón Contactar solo en desktop */}
                {!isOwner && (
                  <button className="hidden md:block bg-blue-600 text-white px-5 py-2 rounded font-semibold hover:bg-blue-700 transition">Contactar</button>
                )}
                {isOwner ? (
                  <button
                    className="hidden md:block bg-conexia-coral text-white px-5 py-2 rounded font-semibold hover:bg-conexia-coral/90 transition"
                    onClick={() => setShowDeleteModal(true)}
                  >
                    Eliminar proyecto
                  </button>
                ) : (
                  <PostulationButton
                    projectId={projectId}
                    projectTitle={project.title}
                    isOwner={isOwner}
                    userRole={roleName}
                    initialIsApplied={project.isApplied || false}
                    className="hidden md:block"
                  />
                )}
              </div>
            </div>
          </div>
        </div>
        
        {/* Modal de eliminación fuera del contenedor principal */}
        {showDeleteModal && (
          <DeleteProjectModal
            projectId={projectId}
            onCancel={() => setShowDeleteModal(false)}
            onProjectDeleted={() => {
              setShowDeleteModal(false);
              // Opcional: recargar o redirigir
            }}
          />
        )}
      </div>
    </>
  );
}
