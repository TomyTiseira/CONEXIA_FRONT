'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Navbar from '@/components/navbar/Navbar';
import { getPostulationsByProject, getPostulationStatuses } from '@/service/postulations/postulationService';
import { getProfileById } from '@/service/profiles/profilesFetch';
import { fetchProjectById } from '@/service/projects/projectsFetch';
import PostulationsTable from './PostulationsTable';
import PostulationEvaluationModal from './PostulationEvaluationModal';
import Pagination from '@/components/common/Pagination';

export default function ProjectPostulations({ projectId }) {
  const { user } = useAuth();
  const router = useRouter();
  const [project, setProject] = useState(null);
  const [postulations, setPostulations] = useState([]);
  const [postulationStatuses, setPostulationStatuses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState(null);
  const [showEvaluationModal, setShowEvaluationModal] = useState(false);
  const [selectedPostulation, setSelectedPostulation] = useState(null);
  const [loadingProfiles, setLoadingProfiles] = useState(false);

  // Verificar si el usuario es dueño del proyecto
  const isOwner = user && project && (String(user.id) === String(project.ownerId) || project.isOwner);

  useEffect(() => {
    loadInitialData();
  }, [projectId]);

  useEffect(() => {
    if (project && isOwner) {
      loadPostulations();
    }
  }, [currentPage, selectedStatus, project, isOwner]);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      
      // Cargar datos iniciales en paralelo
      const [projectData, statusesData] = await Promise.all([
        fetchProjectById(projectId),
        getPostulationStatuses()
      ]);

      setProject(projectData);
      setPostulationStatuses(statusesData.data || []);
    } catch (error) {
      console.error('Error loading initial data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadPostulations = async () => {
    try {
      setLoadingProfiles(true);
      
      const statusId = selectedStatus ? parseInt(selectedStatus) : null;
      const response = await getPostulationsByProject(projectId, currentPage, statusId);
      
      if (response.success) {
        const postulationsWithProfiles = await Promise.all(
          response.data.postulations.map(async (postulation) => {
            try {
              const profileResponse = await getProfileById(postulation.userId);
              
              // Los datos del perfil están en profileResponse.data.profile
              let applicantName = `Usuario ${postulation.userId}`; // Fallback con ID
              const profileData = profileResponse.data || {};
              const profile = profileData.profile || {};
              
              // Obtener primer nombre y primer apellido como en los proyectos
              if (profile.name && profile.lastName) {
                const firstName = profile.name.trim().split(' ')[0] || '';
                const firstLastName = profile.lastName.trim().split(' ')[0] || '';
                applicantName = `${firstName} ${firstLastName}`.trim();
              } else if (profile.name) {
                // Si solo hay name, usar la función original
                applicantName = getShortName(profile.name);
              } else if (profile.firstName && profile.lastName) {
                applicantName = `${profile.firstName} ${profile.lastName}`;
              } else if (profile.firstName) {
                applicantName = profile.firstName;
              } else if (profile.email) {
                // Como último recurso, usar la primera parte del email
                applicantName = profile.email.split('@')[0];
              }
              
              return {
                ...postulation,
                applicantName: applicantName,
                applicantProfile: profile
              };
            } catch (error) {
              console.error(`Error loading profile for user ${postulation.userId}:`, error);
              return {
                ...postulation,
                applicantName: `Usuario ${postulation.userId}`,
                applicantProfile: {}
              };
            }
          })
        );

        setPostulations(postulationsWithProfiles);
        setPagination(response.data.pagination);
      }
    } catch (error) {
      console.error('Error loading postulations:', error);
      setPostulations([]);
    } finally {
      setLoadingProfiles(false);
    }
  };

  const getShortName = (fullName) => {
    if (!fullName || typeof fullName !== 'string') {
      return 'Usuario';
    }
    
    const names = fullName.trim().split(' ').filter(name => name.length > 0);
    
    if (names.length === 0) return 'Usuario';
    if (names.length === 1) return names[0];
    if (names.length === 2) return `${names[0]} ${names[1]}`;
    
    // Para 3 o más nombres, asumimos: Primer_Nombre [Segundo_Nombre] Primer_Apellido [Segundo_Apellido]
    if (names.length >= 3) {
      return `${names[0]} ${names[2]}`;
    }
    
    return `${names[0]} ${names[1]}`;
  };

  const handleEvaluatePostulation = (postulation) => {
    setSelectedPostulation(postulation);
    setShowEvaluationModal(true);
  };

  const handlePostulationApproved = () => {
    setShowEvaluationModal(false);
    setSelectedPostulation(null);
    // Recargar postulaciones para ver los cambios
    loadPostulations();
  };

  const handleStatusChange = (statusId) => {
    setSelectedStatus(statusId);
    setCurrentPage(1); // Reset to first page when changing filter
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-conexia-green">Cargando...</div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-red-500">Proyecto no encontrado</div>
      </div>
    );
  }

  if (!isOwner) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-red-500">No tienes permisos para ver las postulaciones de este proyecto</div>
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-[calc(100vh-64px)] bg-[#f3f9f8] py-8 px-6 md:px-6 pb-20 md:pb-8 flex flex-col items-center">
        <div className="w-full max-w-7xl flex flex-col gap-6">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
            <h1 className="text-2xl md:text-3xl font-bold text-conexia-green mb-4 md:mb-0">
              Postulaciones
            </h1>
            
            {/* Filtro por estado */}
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700">Filtrar por estado:</label>
              <select
                value={selectedStatus}
                onChange={(e) => handleStatusChange(e.target.value)}
                className="border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-conexia-green"
              >
                <option value="">Todos los estados</option>
                {postulationStatuses.map((status) => (
                  <option key={status.id} value={status.id}>
                    {status.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Project info */}
          <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
            <h2 className="text-lg font-semibold text-conexia-green mb-2">
              {project.title}
            </h2>
            <p className="text-gray-600 text-sm">
              {project.description && project.description.length > 150
                ? `${project.description.substring(0, 150)}...`
                : project.description || 'Sin descripción'
              }
            </p>
          </div>

          {/* Tabla de postulaciones */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            {loadingProfiles ? (
              <div className="p-8 text-center text-conexia-green">
                Cargando postulaciones...
              </div>
            ) : (
              <PostulationsTable
                postulations={postulations}
                onEvaluate={handleEvaluatePostulation}
                isLoading={loadingProfiles}
              />
            )}
          </div>

          {/* Paginación */}
          {pagination && pagination.totalPages > 1 && (
            <div className="flex justify-center mt-6">
              <Pagination
                page={currentPage}
                hasPreviousPage={pagination.hasPreviousPage}
                hasNextPage={pagination.hasNextPage}
                onPageChange={setCurrentPage}
              />
            </div>
          )}

          {/* Botón Atrás */}
          <div className="flex justify-start mt-6">
            <button 
              className="bg-[#eef6f6] text-conexia-green px-4 py-2 rounded font-semibold hover:bg-[#e0f0f0] transition text-sm border border-[#c6e3e4]"
              onClick={() => router.push(`/project/${projectId}`)}
            >
              ← Atrás
            </button>
          </div>
        </div>
      </div>

      {/* Modal de evaluación */}
      {showEvaluationModal && selectedPostulation && (
        <PostulationEvaluationModal
          postulation={selectedPostulation}
          onClose={() => setShowEvaluationModal(false)}
          onApproved={handlePostulationApproved}
        />
      )}
    </>
  );
}
