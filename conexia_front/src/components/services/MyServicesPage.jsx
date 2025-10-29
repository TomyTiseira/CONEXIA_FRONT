'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { fetchUserServices } from '@/service/services/servicesFetch';
import { fetchMyServiceRequests } from '@/service/service-hirings/serviceHiringsFetch';
import { useUserStore } from '@/store/userStore';
import { ArrowLeft, Briefcase, Users, Calendar, TrendingUp, ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-react';
import { FaRegEye, FaFileInvoiceDollar, FaEllipsisH, FaExchangeAlt } from 'react-icons/fa';
import { HiUserGroup } from 'react-icons/hi';
import { getUnitLabel } from '@/utils/timeUnit';
import { config } from '@/config';
import Navbar from '@/components/navbar/Navbar';
import Pagination from '@/components/common/Pagination';
import Toast from '@/components/ui/Toast';

export default function MyServicesPage() {
  const router = useRouter();
  const { user } = useUserStore();
  const [services, setServices] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState(null);
  const [requestsCounts, setRequestsCounts] = useState({});
  const [filters, setFilters] = useState({
    page: 1,
    includeInactive: false
  });
  const [sortConfig, setSortConfig] = useState({
    key: null,
    direction: 'asc'
  });

  useEffect(() => {
    loadMyServices();
  }, [filters]);

  const loadMyServices = async () => {
    if (!user?.id) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetchUserServices(user.id, filters);
      setServices(response.services || []);
      setPagination(response.pagination || { page: 1, totalPages: 1, total: 0 });
      
      // Cargar conteos de solicitudes para cada servicio
      await loadRequestsCounts(response.services || []);
    } catch (err) {
      setError(err.message);
      setServices([]);
    } finally {
      setLoading(false);
    }
  };

  const loadRequestsCounts = async (servicesList) => {
    const counts = {};
    
    // Cargar conteos en paralelo para mejor rendimiento
    await Promise.all(servicesList.map(async (service) => {
      try {
        const response = await fetchMyServiceRequests({
          serviceId: service.id,
          limit: 1,
          page: 1
        });
        counts[service.id] = {
          total: response.pagination?.total || 0,
          pending: 0 // Podríamos hacer otra consulta para obtener solo pendientes
        };
        
        // Consulta adicional para obtener solo pendientes
        const pendingResponse = await fetchMyServiceRequests({
          serviceId: service.id,
          status: 'pending',
          limit: 1,
          page: 1
        });
        counts[service.id].pending = pendingResponse.pagination?.total || 0;
      } catch (err) {
        console.error(`Error loading requests count for service ${service.id}:`, err);
        counts[service.id] = { total: 0, pending: 0 };
      }
    }));
    
    setRequestsCounts(counts);
  };

  const handlePageChange = (page) => {
    setFilters(prev => ({ ...prev, page }));
  };

  const handleToggleInactive = () => {
    setFilters(prev => ({ 
      ...prev, 
      includeInactive: !prev.includeInactive,
      page: 1 
    }));
  };

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const getSortIcon = (columnKey) => {
    if (sortConfig.key !== columnKey) {
      return <ChevronsUpDown size={14} className="text-gray-400" />;
    }
    return sortConfig.direction === 'asc' 
      ? <ChevronUp size={14} className="text-conexia-green" />
      : <ChevronDown size={14} className="text-conexia-green" />;
  };

  const sortedServices = React.useMemo(() => {
    if (!sortConfig.key) return services;
    
    return [...services].sort((a, b) => {
      let aValue, bValue;
      
      switch (sortConfig.key) {
        case 'price':
          aValue = a.price || 0;
          bValue = b.price || 0;
          break;
        case 'requests':
          aValue = (requestsCounts[a.id] || { total: 0 }).total;
          bValue = (requestsCounts[b.id] || { total: 0 }).total;
          break;
        case 'updatedAt':
          aValue = new Date(a.updatedAt);
          bValue = new Date(b.updatedAt);
          break;
        default:
          return 0;
      }
      
      if (aValue < bValue) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
  }, [services, sortConfig, requestsCounts]);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const getImageSrc = (imagePath) => {
    if (!imagePath) {
      return '/default_service.jpg';
    }
    
    if (imagePath.startsWith('http')) {
      return imagePath;
    }
    
    // Usar config.IMAGE_URL como en proyectos y quitar el /uploads del path
    const cleanPath = imagePath.startsWith('/uploads/') ? imagePath.substring(9) : imagePath;
    return `${config.IMAGE_URL}/${cleanPath}`;
  };

  const getServiceStatusBadge = (status) => {
    const statusMap = {
      active: { label: 'Activo', className: 'bg-green-100 text-green-800' },
      inactive: { label: 'Inactivo', className: 'bg-gray-100 text-gray-800' },
      deleted: { label: 'Eliminado', className: 'bg-red-100 text-red-800' }
    };
    
    const serviceStatus = statusMap[status] || { label: status, className: 'bg-gray-100 text-gray-800' };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap ${serviceStatus.className}`}>
        {serviceStatus.label}
      </span>
    );
  };

  const handleCloseToast = () => {
    setToast(null);
  };

  return (
    <>
      <Navbar />
      <div className="min-h-[calc(100vh-64px)] bg-[#f3f9f8] py-8 px-4 md:px-6 pb-20 md:pb-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex items-center gap-4 mb-6">
            <button
              onClick={() => router.back()}
              className="p-2 hover:bg-white rounded-lg transition"
            >
              <ArrowLeft size={24} className="text-conexia-green" />
            </button>
            <h1 className="text-3xl font-bold text-conexia-green">Mis Servicios</h1>
          </div>

          {/* Estadísticas rápidas */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-conexia-green/10 rounded-lg">
                  <Briefcase className="text-conexia-green" size={24} />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Servicios</p>
                  <p className="text-2xl font-bold text-gray-900">{pagination.total}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Users className="text-blue-600" size={24} />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Solicitudes Totales</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {Object.values(requestsCounts).reduce((sum, count) => sum + count.total, 0)}
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
                  <p className="text-sm text-gray-600">Pendientes</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {Object.values(requestsCounts).reduce((sum, count) => sum + count.pending, 0)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Controles y filtros */}
          <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={filters.includeInactive}
                    onChange={handleToggleInactive}
                    className="rounded border-gray-300 text-conexia-green focus:ring-conexia-green"
                  />
                  <span className="text-sm text-gray-700">Incluir inactivos</span>
                </label>
              </div>
              
              <button
                onClick={() => router.push('/services/create')}
                className="bg-conexia-green text-white px-4 py-2 rounded-lg hover:bg-conexia-green/90 transition flex items-center gap-2"
              >
                <Briefcase size={16} />
                Crear Nuevo Servicio
              </button>
            </div>
          </div>

          {/* Lista de servicios */}
          <div className="bg-white rounded-lg shadow-sm">
            {loading ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-conexia-green"></div>
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <p className="text-red-600 mb-4">{error}</p>
                <button
                  onClick={loadMyServices}
                  className="bg-conexia-green text-white px-4 py-2 rounded-lg hover:bg-conexia-green/90 transition"
                >
                  Reintentar
                </button>
              </div>
            ) : services.length === 0 ? (
              <div className="text-center py-12">
                <Briefcase size={48} className="text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No tienes servicios publicados
                </h3>
                <p className="text-gray-500 mb-4">
                  Comienza creando tu primer servicio para recibir solicitudes de contratación.
                </p>
                <button
                  onClick={() => router.push('/services/create')}
                  className="bg-conexia-green text-white px-4 py-2 rounded-lg hover:bg-conexia-green/90 transition"
                >
                  Crear Mi Primer Servicio
                </button>
              </div>
            ) : (
              <>
                {/* Tabla para desktop */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Servicio
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Estado
                        </th>
                        <th 
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 hover:text-gray-700 transition-colors select-none group"
                          onClick={() => handleSort('price')}
                          title="Click para ordenar por precio"
                        >
                          <div className="flex items-center gap-2">
                            Precio
                            <span className="group-hover:scale-110 transition-transform">
                              {getSortIcon('price')}
                            </span>
                          </div>
                        </th>
                        <th 
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 hover:text-gray-700 transition-colors select-none group"
                          onClick={() => handleSort('requests')}
                          title="Click para ordenar por número de solicitudes"
                        >
                          <div className="flex items-center gap-2">
                            Solicitudes
                            <span className="group-hover:scale-110 transition-transform">
                              {getSortIcon('requests')}
                            </span>
                          </div>
                        </th>
                        <th 
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 hover:text-gray-700 transition-colors select-none group"
                          onClick={() => handleSort('updatedAt')}
                          title="Click para ordenar por fecha de actualización"
                        >
                          <div className="flex items-center gap-2">
                            Última Actualización
                            <span className="group-hover:scale-110 transition-transform">
                              {getSortIcon('updatedAt')}
                            </span>
                          </div>
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Acciones
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {sortedServices.map((service) => {
                        const counts = requestsCounts[service.id] || { total: 0, pending: 0 };
                        
                        return (
                          <tr key={service.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4">
                              <div>
                                <div className="text-sm font-medium text-gray-900 max-w-xs truncate">
                                  {service.title}
                                </div>
                                <div className="text-sm text-gray-500">
                                  {service.category?.name}
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              {getServiceStatusBadge(service.status)}
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex flex-col">
                                <span className="text-sm font-medium text-gray-900">
                                  ${service.price?.toLocaleString()}
                                </span>
                                <span className="text-sm text-gray-500">
                                  por {service.timeUnit ? getUnitLabel(service.timeUnit) : 'unidad'}
                                </span>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex flex-col">
                                <span className="text-sm font-medium text-gray-900">
                                  {counts.total} total
                                </span>
                                {counts.pending > 0 && (
                                  <span className="text-sm text-orange-600 font-medium">
                                    {counts.pending} pendientes
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-500">
                              {formatDate(service.updatedAt)}
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center justify-center">
                                <div className="flex items-center bg-gray-50 rounded-lg p-1 shadow-sm border">
                                  {/* Botón para ver el servicio público */}
                                  <button
                                    onClick={() => router.push(`/services/${service.id}`)}
                                    className="flex items-center justify-center w-8 h-8 text-gray-600 hover:text-white hover:bg-gray-600 rounded-md transition-all duration-200 group"
                                    title="Ver servicio"
                                  >
                                    <Briefcase size={16} className="group-hover:scale-110 transition-transform" />
                                  </button>
                                  
                                  {/* Botón para ver solicitudes */}
                                  <button
                                    onClick={() => router.push(`/services/my-services/${service.id}/requests`)}
                                    className="flex items-center justify-center w-8 h-8 text-blue-600 hover:text-white hover:bg-blue-600 rounded-md transition-all duration-200 group"
                                    title="Ver solicitudes recibidas"
                                    aria-label="Ver solicitudes recibidas"
                                  >
                                    <HiUserGroup className="text-[18px] group-hover:scale-110 transition-transform" />
                                  </button>
                                </div>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Paginación para desktop */}
                <div className="hidden md:block px-6 py-4 border-t border-gray-200 flex justify-center">
                  <Pagination
                    currentPage={pagination.page || 1}
                    totalPages={pagination.totalPages || 1}
                    hasNextPage={pagination.hasNext || false}
                    hasPreviousPage={pagination.hasPrev || false}
                    onPageChange={handlePageChange}
                  />
                </div>

                {/* Cards para mobile */}
                <div className="md:hidden space-y-4 p-4">
                  {sortedServices.map((service) => {
                    const counts = requestsCounts[service.id] || { total: 0, pending: 0 };
                    return (
                      <div key={service.id} className="bg-gray-50 rounded-lg p-4">
                        <div className="flex flex-col gap-2 mb-3">
                          <div className="flex items-start gap-3">
                            <div className="flex-shrink-0">
                              {service.images && service.images.length > 0 ? (
                                <img
                                  className="h-12 w-12 rounded-lg object-cover"
                                  src={getImageSrc(service.images[0])}
                                  alt=""
                                  onError={(e) => {
                                    e.target.src = '/default_service.jpeg';
                                  }}
                                />
                              ) : (
                                <div className="h-12 w-12 rounded-lg bg-gray-200 flex items-center justify-center">
                                  <Briefcase size={20} className="text-gray-500" />
                                </div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex w-full items-center">
                                <h3 className="font-medium text-gray-900 truncate max-w-[200px] sm:max-w-[260px]">
                                  {service.title}
                                </h3>
                              </div>
                              <p className="text-sm text-gray-500">{service.category?.name}</p>
                            </div>
                            <div className="flex-shrink-0 flex items-start justify-end w-[80px]">
                              {getServiceStatusBadge(service.status)}
                            </div>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 mb-4">
                          <div>
                            <p className="text-sm text-gray-600">Precio</p>
                            <div className="flex flex-col">
                              <p className="font-medium text-conexia-green">
                                ${service.price?.toLocaleString()}
                              </p>
                              <p className="text-sm text-gray-500">
                                por {service.timeUnit ? getUnitLabel(service.timeUnit) : 'unidad'}
                              </p>
                            </div>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Solicitudes</p>
                            <p className="font-medium text-gray-900">
                              {counts.total} 
                              {counts.pending > 0 && (
                                <span className="text-orange-600 ml-1">
                                  ({counts.pending} pendientes)
                                </span>
                              )}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-500">
                            {formatDate(service.updatedAt)}
                          </span>
                          
                          <div className="flex items-center gap-1">
                            <div className="flex items-center bg-white rounded-lg p-1 shadow-sm border border-gray-200">
                              <button
                                onClick={() => router.push(`/services/${service.id}`)}
                                className="flex items-center justify-center w-7 h-7 text-gray-600 hover:text-white hover:bg-gray-600 rounded-md transition-all duration-200 group"
                                title="Ver servicio público"
                              >
                                <Briefcase size={14} className="group-hover:scale-110 transition-transform" />
                              </button>
                              
                              <button
                                onClick={() => router.push(`/services/my-services/${service.id}/requests`)}
                                className="flex items-center justify-center w-7 h-7 text-blue-600 hover:text-white hover:bg-blue-600 rounded-md transition-all duration-200 group"
                                title="Ver solicitudes"
                                aria-label="Ver solicitudes"
                              >
                                <HiUserGroup className="text-[15px] group-hover:scale-110 transition-transform" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Paginación para mobile */}
                <div className="md:hidden px-4 py-4 flex justify-center">
                  <Pagination
                    currentPage={pagination.page || 1}
                    totalPages={pagination.totalPages || 1}
                    hasNextPage={pagination.hasNext || false}
                    hasPreviousPage={pagination.hasPrev || false}
                    onPageChange={handlePageChange}
                  />
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <Toast
          type={toast.type}
          message={toast.message}
          isVisible={toast.isVisible}
          onClose={handleCloseToast}
          position="top-center"
        />
      )}
    </>
  );
}