import NavbarCommunity from '@/components/navbar/NavbarCommunity';
import NavbarAdmin from '@/components/navbar/NavbarAdmin';
import NavbarModerator from '@/components/navbar/NavbarModerator';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { fetchProjectById } from '@/service/projects/projectsFetch';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { ROLES } from '@/constants/roles';
import DeleteProjectModal from '@/components/project/deleteProject/DeleteProjectModal';

export default function ProjectDetail({ projectId }) {
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    fetchProjectById(projectId).then((data) => {
      setProject(data);
      setLoading(false);
    });
  }, [projectId]);

  if (loading) return <div className="min-h-screen flex items-center justify-center">Cargando...</div>;
  if (!project) return <div className="min-h-screen flex items-center justify-center text-conexia-green">Proyecto no encontrado</div>;

  const isOwner = user && project && (String(user.id) === String(project.ownerId) || project.isOwner);
  const skills = Array.isArray(project.skills) ? project.skills : (project.skills ? [project.skills] : []);
  const ownerName = project.ownerName || project.owner || '';
  const ownerImage = project.ownerImage || null;
  
  // Determinar el ID del dueño para navegación
  const ownerIdForNavigation = project.ownerId || (project.isOwner && user?.id) || null;
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

  // Renderizar la navbar apropiada según el rol
  const renderNavbar = () => {
    if (user?.role === ROLES.ADMIN) {
      return <NavbarAdmin />;
    } else if (user?.role === ROLES.MODERATOR) {
      return <NavbarModerator />;
    } else {
      return <NavbarCommunity />;
    }
  };

  return (
    <>
      {renderNavbar()}
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
              {skills.length > 0 && (
                <div className="mt-2">
                  <span className="block text-sm text-gray-500 font-semibold mb-1">Habilidades requeridas</span>
                  <div className="flex gap-2 flex-wrap">
                    {skills.map(skill => (
                      <span key={skill} className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-xs font-semibold">{skill}</span>
                    ))}
                  </div>
                </div>
              )}
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 mt-4">
                {project.maxCollaborators && (
                  <div className="text-sm text-gray-500">Máx. colaboradores: <span className="font-semibold text-gray-700">{project.maxCollaborators}</span></div>
                )}
                {project.startDate && (
                  <div className="text-sm text-gray-500 ml-2">Inicio: <span className="font-semibold text-gray-700">{new Date(project.startDate).toLocaleDateString()}</span></div>
                )}
                {project.endDate && (
                  <div className="text-sm text-gray-500 ml-2">Fin: <span className="font-semibold text-gray-700">{new Date(project.endDate).toLocaleDateString()}</span></div>
                )}
              </div>
              {/* Dueño del proyecto */}
              <div className="flex items-center gap-3 mt-4">
                <div 
                  className="relative w-10 h-10 cursor-pointer hover:opacity-80 transition-opacity"
                  onClick={() => {
                    if (ownerIdForNavigation) {
                      router.push(`/profile/userProfile/${ownerIdForNavigation}`);
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
                    if (ownerIdForNavigation) {
                      router.push(`/profile/userProfile/${ownerIdForNavigation}`);
                    }
                  }}
                >
                  <span className="text-conexia-green font-semibold text-base break-words hover:underline">{ownerName}</span>
                  <span className="text-xs text-gray-500">Dueño del proyecto</span>
                </div>
              </div>
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
                {/* Botón Contactar al lado del Atrás en mobile */}
                {!isOwner && (
                  <button className="md:hidden bg-blue-600 text-white px-3 py-2 rounded font-semibold hover:bg-blue-700 transition text-sm">Contactar</button>
                )}
              </div>
            </div>
            {/* Espacio entre columnas - solo en desktop */}
            <div className="hidden md:block md:w-10"></div>
            {/* Columna derecha - Otros botones alineados a la izquierda */}
            <div className="flex-1">
              <div className="flex flex-col sm:flex-row gap-3">
                {/* Botón Contactar solo en desktop */}
                {!isOwner && (
                  <button className="hidden md:block bg-blue-600 text-white px-5 py-2 rounded font-semibold hover:bg-blue-700 transition">Contactar</button>
                )}
                {isOwner ? (
                  <>
                    <button
                      className="bg-conexia-coral text-white px-5 py-2 rounded font-semibold hover:bg-conexia-coral/90 transition"
                      onClick={() => setShowDeleteModal(true)}
                    >
                      Eliminar proyecto
                    </button>
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
                  </>
                ) : (
                  user?.role === ROLES.USER && (
                    <button className="bg-conexia-green/90 text-white px-5 py-2 rounded font-semibold hover:bg-conexia-green transition">Postularse a proyecto</button>
                  )
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
