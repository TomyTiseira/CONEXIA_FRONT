import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useUserServices } from '@/hooks/services';
import { useUserStore } from '@/store/userStore';
import { useAuth } from '@/context/AuthContext';
import { ROLES } from '@/constants/roles';
import { FaArrowLeft, FaTools, FaEye } from 'react-icons/fa';
import Button from '@/components/ui/Button';
import Navbar from '@/components/navbar/Navbar';
import Pagination from '@/components/common/Pagination';
import ServiceList from './ServiceList';
import ServiceCard from './ServiceCard';

const UserServicesView = ({ userId }) => {
  const router = useRouter();
  const { user } = useAuth();
  const { roleName } = useUserStore();
  const { services, pagination, loading, error, loadUserServices } = useUserServices(userId);
  
  const [showInactive, setShowInactive] = useState(false);
  const [page, setPage] = useState(1);
  const [recentServices, setRecentServices] = useState([]);
  const [showAllServices, setShowAllServices] = useState(false);

  const isOwnProfile = user?.id == userId;
  const canCreateService = roleName === ROLES.USER && isOwnProfile;

  // Cargar servicios cuando cambian los filtros
  useEffect(() => {
    const filters = {
      page,
      limit: 12,
      includeInactive: showInactive
    };
    loadUserServices(filters);
  }, [page, showInactive, loadUserServices]);

  // Separar los últimos 3 servicios para la vista compacta
  useEffect(() => {
    if (services.length > 0) {
      setRecentServices(services.slice(0, 3));
    }
  }, [services]);

  const handlePageChange = (newPage) => {
    setPage(newPage);
  };

  const handleShowInactiveChange = (e) => {
    setShowInactive(e.target.checked);
    setPage(1); // Reset to first page
  };

  const toggleShowAll = () => {
    setShowAllServices(!showAllServices);
  };

  if (loading && services.length === 0) {
    return (
      <div className="relative min-h-screen w-full bg-[#f0f8f8] overflow-hidden flex flex-col">
        <div className="fixed top-0 left-0 w-full z-30">
          <Navbar />
        </div>
        <main className="flex-1 pt-20 pb-8">
          <div className="container mx-auto px-4 py-4">
            <div className="bg-white rounded-lg shadow-sm border p-8">
              <div className="animate-pulse space-y-6">
                <div className="h-8 bg-gray-200 rounded w-48"></div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="space-y-4">
                      <div className="aspect-video bg-gray-200 rounded-lg"></div>
                      <div className="space-y-2">
                        <div className="h-5 bg-gray-200 rounded"></div>
                        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="relative min-h-screen w-full bg-[#f0f8f8] overflow-hidden flex flex-col">
        <div className="fixed top-0 left-0 w-full z-30">
          <Navbar />
        </div>
        <main className="flex-1 pt-20 pb-8">
          <div className="container mx-auto px-4 py-4">
            <div className="bg-white rounded-lg shadow-sm border p-8">
              <div className="text-center">
                <h2 className="text-xl font-semibold text-gray-700 mb-2">
                  Error al cargar servicios
                </h2>
                <p className="text-gray-500 mb-4">{error}</p>
                <Button onClick={() => router.back()} variant="outline">
                  Volver atrás
                </Button>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen w-full bg-[#f0f8f8] overflow-hidden flex flex-col">
      {/* Navbar fijo arriba */}
      <div className="fixed top-0 left-0 w-full z-30">
        <Navbar />
      </div>

      {/* Contenido principal */}
      <main className="flex-1 pt-20 pb-8">
        <div className="container mx-auto px-4 py-4">
          {/* Breadcrumbs y navegación */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                onClick={() => router.back()}
                className="flex items-center gap-2"
              >
                <FaArrowLeft size={14} />
                Volver
              </Button>
              
              <nav className="text-sm text-gray-500">
                <Link href="/services" className="hover:text-conexia-green">
                  Servicios
                </Link>
                <span className="mx-2">/</span>
                <span className="text-gray-700">
                  {isOwnProfile ? 'Mis servicios' : 'Servicios del usuario'}
                </span>
              </nav>
            </div>

            {canCreateService && (
              <Link href="/services/create">
                <Button variant="primary" className="flex items-center gap-2">
                  <FaTools size={16} />
                  Publicar servicio
                </Button>
              </Link>
            )}
          </div>

          {/* Vista compacta (primeros 3 servicios) */}
          {!showAllServices && services.length > 0 && (
            <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900">
                  {isOwnProfile ? 'Mis últimos servicios' : 'Últimos servicios'}
                </h2>
                {services.length > 3 && (
                  <Button
                    variant="outline"
                    onClick={toggleShowAll}
                    className="flex items-center gap-2"
                  >
                    <FaEye size={14} />
                    Ver todos ({pagination.total})
                  </Button>
                )}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {recentServices.map(service => (
                  <ServiceCard 
                    key={service.id} 
                    service={service} 
                    showInactiveLabel={isOwnProfile}
                  />
                ))}
              </div>

              {services.length > 3 && (
                <div className="text-center mt-6">
                  <Button
                    variant="primary"
                    onClick={toggleShowAll}
                    className="flex items-center gap-2 mx-auto"
                  >
                    Ver todos los servicios ({pagination.total})
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* Vista completa */}
          {showAllServices || services.length <= 3 ? (
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold text-gray-900">
                  {isOwnProfile ? 'Mis servicios' : 'Servicios del usuario'}
                </h1>

                {services.length > 3 && (
                  <Button
                    variant="outline"
                    onClick={toggleShowAll}
                    className="flex items-center gap-2"
                  >
                    Ver vista compacta
                  </Button>
                )}
              </div>

              {/* Filtro para servicios inactivos (solo para el propietario) */}
              {isOwnProfile && (
                <div className="mb-6">
                  <label className="flex items-center gap-2 text-sm text-gray-700">
                    <input
                      type="checkbox"
                      checked={showInactive}
                      onChange={handleShowInactiveChange}
                      className="rounded border-gray-300 text-conexia-green focus:ring-conexia-green"
                    />
                    Mostrar servicios inactivos
                  </label>
                </div>
              )}

              {/* Información de resultados */}
              {!loading && services.length > 0 && (
                <div className="mb-6">
                  <p className="text-gray-600 text-sm">
                    Mostrando {services.length} de {pagination.total} servicio{pagination.total !== 1 ? 's' : ''}
                  </p>
                </div>
              )}

              {/* Lista de servicios */}
              <ServiceList 
                services={services}
                loading={loading && showAllServices}
                error={showAllServices ? error : null}
                showInactiveLabel={isOwnProfile}
                emptyMessage={isOwnProfile ? "No has publicado servicios aún" : "Este usuario no ha publicado servicios"}
                emptyDescription={isOwnProfile ? "Publica tu primer servicio para conectar con potenciales clientes." : ""}
              />

              {/* Paginación */}
              {!loading && services.length > 0 && pagination.totalPages > 1 && (
                <div className="mt-8 flex justify-center">
                  <Pagination
                    currentPage={pagination.page}
                    totalPages={pagination.totalPages}
                    onPageChange={handlePageChange}
                  />
                </div>
              )}
            </div>
          ) : null}

          {/* Estado vacío inicial */}
          {!loading && services.length === 0 && (
            <div className="bg-white rounded-lg shadow-sm border p-8">
              <div className="text-center py-12">
                <div className="mb-6">
                  <div className="w-16 h-16 bg-conexia-green/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FaTools className="w-8 h-8 text-conexia-green" />
                  </div>
                  <h2 className="text-xl font-semibold text-gray-700 mb-2">
                    {isOwnProfile ? 'No has publicado servicios aún' : 'Este usuario no ha publicado servicios'}
                  </h2>
                  
                  {isOwnProfile ? (
                    <>
                      <p className="text-gray-500 max-w-md mx-auto mb-6">
                        Publica tu primer servicio y conecta con potenciales clientes en la comunidad.
                      </p>
                      <Link href="/services/create">
                        <Button variant="primary" className="inline-flex items-center gap-2">
                          <FaTools size={16} />
                          Publicar mi primer servicio
                        </Button>
                      </Link>
                    </>
                  ) : (
                    <p className="text-gray-500 max-w-md mx-auto">
                      Este usuario aún no ha compartido ningún servicio en la plataforma.
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default UserServicesView;