'use client';

import { useEffect, useState } from 'react';
import BackButton from '@/components/ui/BackButton';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Navbar from '@/components/navbar/Navbar';
import { getPostulationsByProject, getPostulationsByProjectAndRole, getPostulationStatuses } from '@/service/postulations/postulationService';
import { getProfileById } from '@/service/profiles/profilesFetch';
import { fetchProjectById } from '@/service/projects/projectsFetch';
import PostulationsTable from './PostulationsTable';
import PostulationEvaluationModal from './PostulationEvaluationModal';
import Toast from '@/components/ui/Toast';
import Pagination from '@/components/common/Pagination';

export default function ProjectPostulations({ projectId }) {
  const { user } = useAuth();
  const router = useRouter();
  const [project, setProject] = useState(null);
  const [postulations, setPostulations] = useState([]);
  const [projectRoles, setProjectRoles] = useState([]); // Roles del proyecto desde API
  const [postulationStatuses, setPostulationStatuses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedRole, setSelectedRole] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState(null);
  const [showEvaluationModal, setShowEvaluationModal] = useState(false);
  const [selectedPostulation, setSelectedPostulation] = useState(null);
  const [loadingProfiles, setLoadingProfiles] = useState(false);
  const [toast, setToast] = useState({ isVisible: false, type: 'info', message: '' });

  // Verificar si el usuario es dueño del proyecto
  const isOwner = user && project && (String(user.id) === String(project.ownerId) || project.isOwner);

  useEffect(() => {
    loadInitialData();
  }, [projectId]);

  useEffect(() => {
    if (project && isOwner) {
      loadPostulations();
    }
  }, [currentPage, selectedStatus, selectedRole, project, isOwner]);

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
      const roleId = selectedRole ? parseInt(selectedRole) : null;
      
      // Usar el endpoint apropiado según si hay filtro por rol o no
      let response;
      if (roleId) {
        response = await getPostulationsByProjectAndRole(projectId, roleId, currentPage, statusId);
      } else {
        response = await getPostulationsByProject(projectId, currentPage, statusId);
      }
      
      if (response.success) {
        // Guardar los roles del proyecto que vienen en la respuesta
        if (response.data.roles) {
          setProjectRoles(response.data.roles);
        }
        
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
              
              // Obtener el nombre del rol desde response.data.roles
              let roleName = 'Rol no especificado';
              if (postulation.roleId && response.data.roles) {
                const role = response.data.roles.find(r => r.id === postulation.roleId);
                if (role) {
                  roleName = role.title || role.name || `Rol ${postulation.roleId}`;
                }
              }
              
              return {
                ...postulation,
                applicantName: applicantName,
                roleName: roleName,
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

  const handleEvaluationResult = (result) => {
    // result: { status: 'approved' | 'rejected', message }
    setShowEvaluationModal(false);
    setSelectedPostulation(null);
    if (result?.status === 'approved') {
      setToast({ isVisible: true, type: 'success', message: result.message || 'Postulación aprobada correctamente.' });
    } else if (result?.status === 'rejected') {
      setToast({ isVisible: true, type: 'rejected', message: result.message || 'Postulación rechazada.' });
    } else if (result?.status === 'error') {
      setToast({ isVisible: true, type: 'error', message: result.message || 'Error al evaluar la postulación.' });
    }
    loadPostulations();
  };

  const handleStatusChange = (statusId) => {
    setSelectedStatus(statusId);
    setCurrentPage(1); // Reset to first page when changing filter
  };

  const handleRoleChange = (roleId) => {
    setSelectedRole(roleId);
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
          <div className="flex items-center mb-4">
            <h1 className="text-2xl md:text-3xl font-bold text-conexia-green">
              Postulaciones
            </h1>
          </div>

          {/* Filtros y Botón de Estadísticas */}
          <div className="flex flex-col md:flex-row items-start md:items-center gap-3">
            {/* Filtro por rol */}
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700">Filtrar por rol:</label>
              <select
                value={selectedRole}
                onChange={(e) => handleRoleChange(e.target.value)}
                className="border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-conexia-green"
              >
                <option value="">Todos los roles</option>
                {projectRoles && projectRoles.map((role) => (
                  <option key={role.id} value={role.id}>
                    {role.title || role.name || `Rol ${role.id}`}
                  </option>
                ))}
              </select>
            </div>
            
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

            {/* Botón de Estadísticas */}
            <button
              onClick={() => router.push(`/project/${projectId}/stats`)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition flex items-center justify-center gap-2"
              title="Ver estadísticas de postulaciones"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              Estadísticas
            </button>
          </div>

          {/* Project info */}
          <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
            <h2 className="text-lg font-semibold text-conexia-green mb-2">
              {project.title}
            </h2>
            <p className="text-gray-600 text-sm break-words whitespace-pre-line max-w-full overflow-x-auto">
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
            <BackButton onClick={() => router.push(`/project/${projectId}`)} />
          </div>
        </div>
      </div>

      {/* Modal de evaluación */}
      {showEvaluationModal && selectedPostulation && (
        <PostulationEvaluationModal
          postulation={selectedPostulation}
          onClose={() => setShowEvaluationModal(false)}
          onResult={handleEvaluationResult}
        />
      )}

      <Toast
        position="top-center"
        type={toast.type}
        message={toast.message}
        isVisible={toast.isVisible}
        onClose={() => setToast(t => ({ ...t, isVisible: false }))}
      />
    </>
  );
}
