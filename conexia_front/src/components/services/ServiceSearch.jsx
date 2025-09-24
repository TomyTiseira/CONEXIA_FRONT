import { useState, useEffect, useRef, useCallback } from 'react';
import { useServices } from '@/hooks/services';
import { useUserStore } from '@/store/userStore';
import { ROLES } from '@/constants/roles';
import Link from 'next/link';
import { FaTools } from 'react-icons/fa';
import Button from '@/components/ui/Button';
import Navbar from '@/components/navbar/Navbar';
import Pagination from '@/components/common/Pagination';
import ServiceSearchBar from './ServiceSearchBar';
import ServiceFilters from './ServiceFilters';
import ServiceList from './ServiceList';

export default function ServiceSearch() {
  const { roleName } = useUserStore();
  const { 
    services, 
    pagination, 
    loading, 
    error, 
    filters: currentFilters,
    loadAllServices,
    applyFilters 
  } = useServices();

  const canCreateService = roleName === ROLES.USER;
  const [isMounted, setIsMounted] = useState(false);

  // Cargar todos los servicios UNA SOLA VEZ al montar
  useEffect(() => {
    setIsMounted(true);
    loadAllServices();
  }, [loadAllServices]);

  const handleSearch = (searchTerm) => {
    if (!isMounted) return;
    
    console.log('🔍 Búsqueda:', searchTerm);
    applyFilters({ title: searchTerm, page: 1 });
  };

  const handleFiltersChange = (newFilters) => {
    if (!isMounted) return;
    
    console.log('🔧 Filtros cambiados:', newFilters);
    applyFilters({ ...newFilters, page: 1 });
  };

  const handlePageChange = (page) => {
    if (!isMounted) return;
    
    console.log('📄 Página cambiada:', page);
    applyFilters({ page });
  };

  return (
    <div className="relative min-h-screen w-full bg-[#f0f8f8] overflow-hidden flex flex-col">
      {/* Navbar fijo arriba */}
      <div className="fixed top-0 left-0 w-full z-30">
        <Navbar />
      </div>

      {/* Contenido principal */}
      <main className="flex-1 pt-20 pb-8">
        <div className="container mx-auto px-4 py-4">
          {/* Header */}
          <div className="mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-3xl md:text-4xl font-extrabold text-conexia-green-dark tracking-tight">
                  Servicios
                </h1>
                <p className="text-conexia-green-dark mt-2 text-base md:text-lg">
                  Descubre y contrata servicios de la comunidad
                </p>
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
          </div>

          {/* Barra de búsqueda */}
          <ServiceSearchBar 
            onSearch={handleSearch}
            loading={loading}
            placeholder="Buscar servicios por título..."
          />

          {/* Filtros */}
          <ServiceFilters 
            onFiltersChange={handleFiltersChange}
            loading={loading}
            currentFilters={currentFilters}
          />

          {/* Resultados */}
          <div className="mb-6">
            {!loading && services.length > 0 && (
              <p className="text-gray-600 text-sm">
                Mostrando {services.length} de {pagination.total} servicio{pagination.total !== 1 ? 's' : ''}
                {currentFilters.title && ` para "${currentFilters.title}"`}
              </p>
            )}
          </div>

          {/* Lista de servicios */}
          <ServiceList 
            services={services}
            loading={loading}
            error={error}
            emptyMessage="No se encontraron servicios"
            emptyDescription="Intenta ajustar los filtros de búsqueda o explorar otras categorías."
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
      </main>
    </div>
  );
}