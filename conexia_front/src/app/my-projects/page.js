'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { fetchMyProjects } from '@/service/projects/projectsFetch';
import Navbar from '@/components/navbar/Navbar';
import Pagination from '@/components/common/Pagination';
import StatusBadge from '@/components/common/StatusBadge';
import Button from '@/components/ui/Button';
import { getUserDisplayName } from '@/utils/formatUserName';
import { ArrowLeft, Briefcase, Calendar, Users, AlertCircle, Eye } from 'lucide-react';
import { ROLES } from '@/constants/roles';
import NavbarCommunity from '@/components/navbar/NavbarCommunity';
import NavbarAdmin from '@/components/navbar/NavbarAdmin';
import NavbarModerator from '@/components/navbar/NavbarModerator';
import { PlanComparisonBanner } from '@/components/plans';
import { config } from '@/config';

const STATUS_OPTIONS = [
  { value: '', label: 'Todos los estados' },
  { value: 'true', label: 'Activos' },
  { value: 'false', label: 'Inactivos' }
];

export default function MyProjectsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [pagination, setPagination] = useState({ 
    currentPage: 1, 
    itemsPerPage: 10, 
    totalItems: 0, 
    totalPages: 1 
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    active: '',
    page: 1
  });

  useEffect(() => {
    if (!user?.id) return;
    loadProjects();
  }, [user?.id, filters]);

  const loadProjects = async () => {
    setLoading(true);
    setError(null);
    try {
      const activeFilter = filters.active === '' ? undefined : filters.active === 'true';
      const res = await fetchMyProjects({ 
        ownerId: user.id, 
        active: activeFilter, 
        page: filters.page, 
        limit: pagination.itemsPerPage 
      });
      setProjects(res.projects || []);
      setPagination(res.pagination || pagination);
    } catch (err) {
      console.error('Error loading projects:', err);
      setError('Error al cargar los proyectos');
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (newPage) => {
    setFilters(prev => ({ ...prev, page: newPage }));
  };

  const handleStatusChange = (e) => {
    setFilters({ active: e.target.value, page: 1 });
  };

  const handleViewProject = (projectId) => {
    router.push(`/project/${projectId}`);
  };

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
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Plan Comparison Banner */}
          {user?.role === ROLES.USER && (
            <div className="mb-6">
              <PlanComparisonBanner context="projects" />
            </div>
          )}

          {/* Header */}
          <div className="mb-6">
            <button
              onClick={() => router.back()}
              className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
            >
              <ArrowLeft size={20} className="mr-2" />
              Volver
            </button>
            <h1 className="text-3xl font-bold text-gray-900">
              Mis Proyectos
            </h1>
            <p className="text-gray-600 mt-2">
              Gestiona y visualiza todos tus proyectos colaborativos
            </p>
          </div>

          {/* Filtros */}
          <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
              <div className="flex-1 max-w-xs">
                <label htmlFor="status-filter" className="block text-sm font-medium text-gray-700 mb-2">
                  Filtrar por estado:
                </label>
                <select
                  id="status-filter"
                  value={filters.active}
                  onChange={handleStatusChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-conexia-green focus:border-transparent"
                >
                  {STATUS_OPTIONS.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="text-sm text-gray-600">
                Total: {pagination.totalItems || 0} proyectos
              </div>
            </div>
          </div>

          {/* Contenido */}
          {loading && (
            <div className="bg-white rounded-lg shadow-sm p-8 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-conexia-green mx-auto"></div>
              <p className="text-gray-600 mt-4">Cargando proyectos...</p>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <div className="flex items-center gap-2">
                <AlertCircle size={20} className="text-red-600" />
                <p className="text-red-800">{error}</p>
              </div>
            </div>
          )}

          {!loading && !error && projects.length === 0 && (
            <div className="bg-white rounded-lg shadow-sm p-12 text-center">
              <Briefcase size={64} className="mx-auto text-gray-400 mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No tienes proyectos
              </h3>
              <p className="text-gray-600">
                {filters.active !== '' 
                  ? 'No hay proyectos con el estado seleccionado.' 
                  : 'Aún no tienes proyectos creados.'}
              </p>
            </div>
          )}

          {!loading && !error && projects.length > 0 && (
            <>
              {/* Vista Desktop: Tabla */}
              <div className="hidden lg:block bg-white rounded-lg shadow-sm overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Proyecto
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Estado
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Roles
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Solicitudes
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Última Actualización
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {projects.map((project) => (
                      <tr key={project.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div className="flex items-start gap-3">
                            {project.image ? (
                              <img 
                                src={`${config.IMAGE_URL}/projects/images/${project.image}`}
                                alt={project.title}
                                className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
                                onError={(e) => {
                                  e.target.onerror = null;
                                  e.target.src = '/images/default-project.png';
                                }}
                              />
                            ) : (
                              <div className="w-12 h-12 rounded-lg bg-gray-200 flex items-center justify-center flex-shrink-0">
                                <Briefcase size={20} className="text-gray-400" />
                              </div>
                            )}
                            <div className="min-w-0">
                              <p className="text-sm font-medium text-gray-900 truncate max-w-xs">
                                {project.title}
                              </p>
                              {project.description && (
                                <p className="text-sm text-gray-500 truncate max-w-xs">
                                  {project.description}
                                </p>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <StatusBadge 
                            status={project.active ? 'Activo' : 'Inactivo'} 
                            variant={project.active ? 'success' : 'danger'}
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-1 text-sm text-gray-600">
                            <Users size={16} />
                            <span>{project.roles?.length || 0}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm text-gray-900">
                            {project.postulationsCount || 0} total
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <button
                            onClick={() => handleViewProject(project.id)}
                            className="inline-flex items-center justify-center p-2 rounded-lg text-gray-600 hover:bg-gray-100 hover:text-conexia-green transition-colors"
                            title="Ver proyecto"
                          >
                            <Eye size={20} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Vista Mobile: Cards */}
              <div className="lg:hidden space-y-4">
                {projects.map((project) => (
                  <div key={project.id} className="bg-white rounded-lg shadow-sm p-4">
                    <div className="flex items-start gap-3 mb-3">
                      {project.image ? (
                        <img 
                          src={`${config.IMAGE_URL}/projects/images/${project.image}`}
                          alt={project.title}
                          className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = '/images/default-project.png';
                          }}
                        />
                      ) : (
                        <div className="w-16 h-16 rounded-lg bg-gray-200 flex items-center justify-center flex-shrink-0">
                          <Briefcase size={24} className="text-gray-400" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 mb-1">{project.title}</h3>
                        <StatusBadge 
                          status={project.active ? 'Activo' : 'Inactivo'} 
                          variant={project.active ? 'success' : 'danger'}
                        />
                      </div>
                    </div>

                    <div className="space-y-2 mb-4 text-sm">
                      <div className="flex items-center gap-2 text-gray-600">
                        <Users size={16} />
                        <span>{project.roles?.length || 0} roles</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <span className="font-medium">Solicitudes:</span>
                        <span>{project.postulationsCount || 0}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <Calendar size={16} />
                        <span>
                          {project.updatedAt 
                            ? new Date(project.updatedAt).toLocaleDateString('es-ES')
                            : '-'}
                        </span>
                      </div>
                    </div>

                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => handleViewProject(project.id)}
                      className="w-full flex items-center justify-center gap-2"
                    >
                      <Eye size={16} />
                      Ver proyecto
                    </Button>
                  </div>
                ))}
              </div>

              {/* Paginación */}
              {pagination.totalPages > 1 && (
                <div className="mt-6">
                  <Pagination
                    currentPage={pagination.currentPage}
                    totalPages={pagination.totalPages}
                    onPageChange={handlePageChange}
                  />
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
}
