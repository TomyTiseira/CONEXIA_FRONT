"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { fetchMyProjects } from "@/service/projects/projectsFetch";
import Navbar from "@/components/navbar/Navbar";
import Pagination from "@/components/common/Pagination";
import Button from "@/components/ui/Button";
import { getUserDisplayName } from "@/utils/formatUserName";
import {
  Briefcase,
  Calendar,
  Users,
  AlertCircle,
  Eye,
  TrendingUp,
  FileText,
  ArrowDown,
  ArrowUp,
} from "lucide-react";
import { ROLES } from "@/constants/roles";
import NavbarCommunity from "@/components/navbar/NavbarCommunity";
import NavbarAdmin from "@/components/navbar/NavbarAdmin";
import NavbarModerator from "@/components/navbar/NavbarModerator";
import { PlanComparisonBanner } from "@/components/plans";
import { UpgradePlanButton } from "@/components/plans";
import { config } from "@/config";
import { useAccountStatus } from "@/hooks/useAccountStatus";
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

const ITEMS_PER_PAGE = 10;

export default function MyProjectsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { canCreateContent, suspensionMessage } = useAccountStatus();
  const [projects, setProjects] = useState([]);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    itemsPerPage: ITEMS_PER_PAGE,
    totalItems: 0,
    totalPages: 1,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showInactive, setShowInactive] = useState(false);
  const [filters, setFilters] = useState({
    page: 1,
  });
  const [totalPostulations, setTotalPostulations] = useState(0);
  const [activeProjects, setActiveProjects] = useState(0);
  const [totalAllProjects, setTotalAllProjects] = useState(0);
  const [sortConfig, setSortConfig] = useState({
    key: "postulations",
    direction: "desc",
  });

  const loadProjects = useCallback(async () => {
    if (!user?.id) return;
    setLoading(true);
    setError(null);
    try {
      // Si showInactive es false, solo mostrar activos (active: true)
      // Si showInactive es true, mostrar todos (active: false para que includeDeleted sea true)
      const activeFilter = showInactive ? false : true;
      const res = await fetchMyProjects({
        ownerId: user.id,
        active: activeFilter,
        page: filters.page,
        limit: ITEMS_PER_PAGE,
      });
      setProjects(res.projects || []);
      setPagination((prev) => res.pagination || prev);

      // Obtener el total de TODOS los proyectos (activos + inactivos) para la estadística
      const resAll = await fetchMyProjects({
        ownerId: user.id,
        active: false, // includeDeleted = true, trae todos
        page: 1,
        limit: 1, // Solo necesitamos el totalItems
      });
      setTotalAllProjects(resAll.pagination?.totalItems || 0);

      // Calcular estadísticas de solicitudes
      const projects = res.projects || [];
      const total = projects.reduce(
        (sum, project) => sum + (project.postulationsCount || 0),
        0,
      );
      setTotalPostulations(total);
      // Contar proyectos activos
      const activos = projects.filter((p) => p.active).length;
      setActiveProjects(activos);
    } catch (err) {
      console.error("Error loading projects:", err);
      setError("Error al cargar los proyectos");
    } finally {
      setLoading(false);
    }
  }, [user?.id, filters.page, showInactive]);

  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  const handlePageChange = (newPage) => {
    setFilters((prev) => ({ ...prev, page: newPage }));
  };

  const handleShowInactiveChange = (e) => {
    setShowInactive(e.target.checked);
    setFilters({ page: 1 });
  };

  const handleViewProject = (projectId) => {
    router.push(`/project/${projectId}?from=my-projects`);
  };

  const handleSort = (key) => {
    setSortConfig((prev) => {
      // Si es la misma columna, alternar dirección
      if (prev.key === key) {
        if (prev.direction === "desc") {
          return { key, direction: "asc" };
        } else {
          return { key, direction: "desc" };
        }
      }
      // Si es una columna diferente, empezar con descendente
      return { key, direction: "desc" };
    });
  };

  // Helper para URLs de imagen del proyecto
  const getProjectImageUrl = (img) => {
    if (!img) return null;
    if (img.startsWith("http")) return img;
    return `${config.IMAGE_URL}/projects/images/${img}`;
  };

  const sortedProjects = useMemo(() => {
    if (!sortConfig.key) return projects;

    // Crear una copia antes de ordenar para no mutar el estado
    return [...projects].sort((a, b) => {
      if (sortConfig.key === "postulations") {
        const countA = a.postulationsCount || 0;
        const countB = b.postulationsCount || 0;
        return sortConfig.direction === "desc"
          ? countB - countA
          : countA - countB;
      } else if (sortConfig.key === "status") {
        const statusA = a.active ? "Activo" : "Inactivo";
        const statusB = b.active ? "Activo" : "Inactivo";
        const comparison = statusA.localeCompare(statusB);
        return sortConfig.direction === "desc" ? -comparison : comparison;
      }
      return 0;
    });
  }, [projects, sortConfig]);

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
      <div className="min-h-[calc(100vh-64px)] bg-[#f3f9f8] py-8 px-4 md:px-6 pb-20 md:pb-8">
        <div className="max-w-7xl mx-auto">
          {/* Banner Mejorar Plan */}
          <div className="mb-6 empty:hidden">
            <UpgradePlanButton context="projects" />
          </div>

          {/* Header con título centrado y botón atrás */}
          <div className="bg-white px-6 py-4 rounded-xl shadow-sm mb-6">
            <div className="flex items-center justify-between">
              <button
                onClick={() => router.back()}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                title="Volver atrás"
              >
                <div className="relative w-6 h-6">
                  <svg
                    className="w-6 h-6 text-conexia-green"
                    viewBox="0 0 20 20"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <circle
                      cx="10"
                      cy="10"
                      r="8.5"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      fill="none"
                    />
                    <line
                      x1="6.5"
                      y1="10"
                      x2="13.5"
                      y2="10"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                    />
                    <polyline
                      points="9,7 6,10 9,13"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
              </button>
              <h1 className="text-2xl font-bold text-conexia-green flex-1 text-center mr-8">
                Mis proyectos
              </h1>
              <div className="w-10"></div>
            </div>
          </div>

          {/* Estadísticas rápidas */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-conexia-green/10 rounded-lg">
                  <Briefcase className="text-conexia-green" size={24} />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total proyectos</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {totalAllProjects}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg p-4 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Users className="text-blue-600" size={24} />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Solicitudes totales</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {totalPostulations}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg p-4 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-orange-100 rounded-lg">
                  <TrendingUp className="text-orange-600" size={24} />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Activos</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {activeProjects}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Controles y filtros */}
          <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
            <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={showInactive}
                    onChange={handleShowInactiveChange}
                    className="rounded border-gray-300 text-conexia-green focus:ring-conexia-green"
                  />
                  <span className="text-sm text-gray-700">
                    Incluir inactivos
                  </span>
                </label>
              </div>

              <div className="flex flex-wrap gap-2 items-center">
                {/* Ordenamiento */}
                <span className="text-sm font-medium text-gray-700">
                  Ordenar:
                </span>

                {/* Botón ordenar por solicitudes */}
                <button
                  onClick={() => handleSort("postulations")}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg border transition-all ${
                    sortConfig.key === "postulations"
                      ? "border-conexia-green bg-conexia-green text-white shadow-sm"
                      : "border-gray-300 bg-white text-gray-700 hover:border-gray-400"
                  }`}
                  title={
                    sortConfig.key === "postulations"
                      ? `Ordenado por solicitudes ${sortConfig.direction === "desc" ? "descendente" : "ascendente"}`
                      : "Ordenar por solicitudes"
                  }
                >
                  <Users size={16} />
                  <span className="text-sm font-medium">Solicitudes</span>
                  {sortConfig.key === "postulations" &&
                    (sortConfig.direction === "desc" ? (
                      <ArrowDown size={16} className="opacity-90" />
                    ) : (
                      <ArrowUp size={16} className="opacity-90" />
                    ))}
                </button>

                {/* Botón ordenar por estado */}
                <button
                  onClick={() => handleSort("status")}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg border transition-all ${
                    sortConfig.key === "status"
                      ? "border-conexia-green bg-conexia-green text-white shadow-sm"
                      : "border-gray-300 bg-white text-gray-700 hover:border-gray-400"
                  }`}
                  title={
                    sortConfig.key === "status"
                      ? `Ordenado por estado ${sortConfig.direction === "desc" ? "Z-A" : "A-Z"}`
                      : "Ordenar por estado"
                  }
                >
                  <FileText size={16} />
                  <span className="text-sm font-medium">Estado</span>
                  {sortConfig.key === "status" &&
                    (sortConfig.direction === "desc" ? (
                      <ArrowDown size={16} className="opacity-90" />
                    ) : (
                      <ArrowUp size={16} className="opacity-90" />
                    ))}
                </button>

                {canCreateContent ? (
                  <button
                    onClick={() => router.push("/project/create")}
                    className="bg-conexia-green text-white px-4 py-2 rounded-lg hover:bg-conexia-green/90 transition flex items-center gap-2"
                  >
                    <Briefcase size={16} />
                    Crear nuevo proyecto
                  </button>
                ) : (
                  <button
                    disabled
                    className="bg-gray-300 text-gray-500 px-4 py-2 rounded-lg cursor-not-allowed flex items-center gap-2"
                    title={suspensionMessage}
                  >
                    <Briefcase size={16} />
                    Crear nuevo proyecto
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Contenido */}
          {loading && (
            <LoadingSpinner message="Cargando proyectos" fullScreen={false} />
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
                {showInactive
                  ? "No se encontraron proyectos."
                  : "No tienes proyectos activos."}
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
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Acciones
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {sortedProjects.map((project) => (
                      <tr key={project.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div className="flex items-start gap-3">
                            {getProjectImageUrl(project.image) ? (
                              <img
                                src={getProjectImageUrl(project.image)}
                                alt={project.title}
                                className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
                                onError={(e) => {
                                  e.target.onerror = null;
                                  e.target.src = "/images/default-project.png";
                                }}
                              />
                            ) : (
                              <div className="w-12 h-12 rounded-lg bg-gray-200 flex items-center justify-center flex-shrink-0">
                                <Briefcase
                                  size={20}
                                  className="text-gray-400"
                                />
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
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap ${
                              project.active
                                ? "bg-green-100 text-green-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {project.active ? "Activo" : "Inactivo"}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-1 text-sm text-gray-600">
                            <Users size={16} />
                            <span>{project.rolesCount || 0}</span>
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
                {sortedProjects.map((project) => (
                  <div
                    key={project.id}
                    className="bg-white rounded-lg shadow-sm p-4"
                  >
                    <div className="flex items-start gap-3 mb-3">
                      {getProjectImageUrl(project.image) ? (
                        <img
                          src={getProjectImageUrl(project.image)}
                          alt={project.title}
                          className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = "/images/default-project.png";
                          }}
                        />
                      ) : (
                        <div className="w-16 h-16 rounded-lg bg-gray-200 flex items-center justify-center flex-shrink-0">
                          <Briefcase size={24} className="text-gray-400" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 mb-1">
                          {project.title}
                        </h3>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap ${
                            project.active
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {project.active ? "Activo" : "Inactivo"}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-2 mb-4 text-sm">
                      <div className="flex items-center gap-2 text-gray-600">
                        <Users size={16} />
                        <span>{project.rolesCount || 0} roles</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <span className="font-medium">Solicitudes:</span>
                        <span>{project.postulationsCount || 0}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <Calendar size={16} />
                        <span>
                          {project.updatedAt
                            ? new Date(project.updatedAt).toLocaleDateString(
                                "es-ES",
                              )
                            : "-"}
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
            </>
          )}

          {/* Paginación (siempre visible) */}
          {!loading && !error && (
            <div className="mt-6">
              <Pagination
                currentPage={pagination.currentPage}
                totalPages={pagination.totalPages || 1}
                hasPreviousPage={pagination.currentPage > 1}
                hasNextPage={
                  pagination.currentPage < (pagination.totalPages || 1)
                }
                onPageChange={handlePageChange}
              />
            </div>
          )}
        </div>
      </div>
    </>
  );
}
