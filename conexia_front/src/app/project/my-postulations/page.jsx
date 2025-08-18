'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useUserStore } from '@/store/userStore';
import Navbar from '@/components/navbar/Navbar';
import { getMyPostulations, cancelPostulation } from '@/service/postulations/postulationService';
import { fetchProjectById } from '@/service/projects/projectsFetch';
import Pagination from '@/components/common/Pagination';
import { ROLES } from '@/constants/roles';

export default function MyPostulationsPage() {
  const { user } = useAuth();
  const { roleName } = useUserStore();
  const router = useRouter();
  const [postulations, setPostulations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [selectedPostulation, setSelectedPostulation] = useState(null);
  const [cancelling, setCancelling] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (roleName !== ROLES.USER) {
      router.push('/project');
      return;
    }
    loadMyPostulations();
  }, [currentPage, roleName]);

  const loadMyPostulations = async () => {
    try {
      setLoading(true);
      const response = await getMyPostulations(currentPage);
      
      if (response.success) {
        // Enrich postulations with project data
        const postulationsWithProjects = await Promise.all(
          response.data.postulations.map(async (postulation) => {
            try {
              const projectData = await fetchProjectById(postulation.projectId);
              return {
                ...postulation,
                project: projectData
              };
            } catch (error) {
              console.error(`Error loading project ${postulation.projectId}:`, error);
              return {
                ...postulation,
                project: { title: 'Proyecto no disponible', id: postulation.projectId }
              };
            }
          })
        );

        setPostulations(postulationsWithProjects);
        setPagination(response.data.pagination);
      }
    } catch (error) {
      console.error('Error loading my postulations:', error);
      setError('Error al cargar las postulaciones');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelPostulation = async () => {
    if (!selectedPostulation) return;

    try {
      setCancelling(true);
      await cancelPostulation(selectedPostulation.id);
      
      // Refresh the list
      await loadMyPostulations();
      
      setShowCancelModal(false);
      setSelectedPostulation(null);
    } catch (error) {
      console.error('Error cancelling postulation:', error);
      setError(error.message || 'Error al cancelar la postulación');
    } finally {
      setCancelling(false);
    }
  };

  const getStatusColor = (statusCode) => {
    switch (statusCode) {
      case 'activo':
        return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'aceptada':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'rechazada':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'cancelada':
        return 'text-gray-600 bg-gray-50 border-gray-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-[calc(100vh-64px)] bg-[#f3f9f8] flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-conexia-green mx-auto mb-4"></div>
            <p className="text-conexia-green">Cargando mis postulaciones...</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-[calc(100vh-64px)] bg-[#f3f9f8] py-8 px-6 md:px-6 pb-20 md:pb-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
            <h1 className="text-2xl md:text-3xl font-bold text-conexia-green mb-4 md:mb-0">
              Mis Postulaciones
            </h1>
            <button
              onClick={() => router.push('/project/search')}
              className="bg-conexia-green text-white px-4 py-2 rounded font-medium hover:bg-conexia-green/90 transition text-sm"
            >
              Buscar Proyectos
            </button>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <p className="text-red-700">{error}</p>
            </div>
          )}

          {/* Postulations Grid */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            {postulations.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <p className="text-lg mb-2">No tienes postulaciones registradas</p>
                <p className="text-sm">¡Explora proyectos y postúlate a los que te interesen!</p>
              </div>
            ) : (
              <>
                {/* Desktop View */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Proyecto
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Fecha de Postulación
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Estado
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Acciones
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {postulations.map((postulation) => (
                        <tr key={postulation.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4">
                            <button
                              onClick={() => router.push(`/project/${postulation.projectId}`)}
                              className="text-conexia-green font-medium hover:underline focus:outline-none text-left"
                            >
                              {postulation.project?.title || 'Proyecto no disponible'}
                            </button>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600">
                            {formatDate(postulation.createdAt)}
                          </td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(postulation.status.code)}`}>
                              {postulation.status.name}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            {postulation.status.code === 'activo' && (
                              <button
                                onClick={() => {
                                  setSelectedPostulation(postulation);
                                  setShowCancelModal(true);
                                }}
                                className="text-[#777d7d] hover:text-[#5f6464] text-sm font-medium hover:underline"
                              >
                                Cancelar
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile View */}
                <div className="md:hidden">
                  {postulations.map((postulation) => (
                    <div key={postulation.id} className="p-4 border-b border-gray-200 last:border-b-0">
                      <div className="flex justify-between items-start mb-2">
                        <button
                          onClick={() => router.push(`/project/${postulation.projectId}`)}
                          className="text-conexia-green font-medium hover:underline focus:outline-none text-left flex-1 mr-2"
                        >
                          {postulation.project?.title || 'Proyecto no disponible'}
                        </button>
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(postulation.status.code)} whitespace-nowrap`}>
                          {postulation.status.name}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">
                        {formatDate(postulation.createdAt)}
                      </p>
                      {postulation.status.code === 'activo' && (
                        <button
                          onClick={() => {
                            setSelectedPostulation(postulation);
                            setShowCancelModal(true);
                          }}
                          className="text-red-600 hover:text-red-800 text-sm font-medium hover:underline"
                        >
                          Cancelar postulación
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <div className="flex justify-center mt-6">
              <Pagination
                page={currentPage}
                hasPreviousPage={pagination.hasPreviousPage}
                hasNextPage={pagination.hasNextPage}
                totalPages={pagination.totalPages}
                onPageChange={setCurrentPage}
              />
            </div>
          )}

          {/* Back Button */}
          <div className="flex justify-start mt-6">
            <button 
              className="bg-conexia-green text-white px-4 py-2 rounded font-semibold hover:bg-conexia-green/90 transition text-sm"
              onClick={() => router.push('/project')}
            >
              ← Volver a Proyectos
            </button>
          </div>
        </div>
      </div>

      {/* Cancel Confirmation Modal */}
      {showCancelModal && selectedPostulation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-xl">
            <div className="p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4">
                Cancelar postulación
              </h3>
              <p className="text-gray-600 mb-6">
                ¿Estás seguro que deseas cancelar tu postulación al proyecto "{selectedPostulation.project?.title}"?
              </p>
              {error && (
                <div className="mb-4 text-red-600 bg-red-50 p-3 rounded-lg text-sm">
                  {error}
                </div>
              )}
              <div className="flex space-x-3">
                <button
                  onClick={() => {
                    setShowCancelModal(false);
                    setSelectedPostulation(null);
                    setError('');
                  }}
                  className="flex-1 bg-[#f5f6f6] text-[#777d7d] px-4 py-2 rounded font-medium hover:bg-[#f1f2f2] transition border border-[#e1e4e4]"
                  disabled={cancelling}
                >
                  Volver
                </button>
                <button
                  onClick={handleCancelPostulation}
                  disabled={cancelling}
                  className="flex-1 bg-red-600 text-white px-4 py-2 rounded font-medium hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {cancelling ? 'Cancelando...' : 'Cancelar postulación'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
