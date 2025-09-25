import { useState, useEffect, useRef, useCallback } from 'react';
import { useServices } from '@/hooks/services';
import { useUserStore } from '@/store/userStore';
import { ROLES } from '@/constants/roles';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Search, FileText } from 'lucide-react';
import { Briefcase } from 'lucide-react';
import Button from '@/components/ui/Button';
import Navbar from '@/components/navbar/Navbar';
import Pagination from '@/components/common/Pagination';
import ServiceFilters from './ServiceFilters';
import ServiceList from './ServiceList';

export default function ServiceSearch() {
  const router = useRouter();
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
  const canViewHirings = roleName === ROLES.USER;
  const [isMounted, setIsMounted] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const timeoutRef = useRef(null);

  // Cargar todos los servicios UNA SOLA VEZ al montar
  useEffect(() => {
    setIsMounted(true);
    loadAllServices();
  }, [loadAllServices]);

  const handleSearch = (newSearchTerm = searchTerm) => {
    if (!isMounted) return;
    
    applyFilters({ title: newSearchTerm, page: 1 });
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);

    // Limpiar timeout anterior
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Debounce: esperar 500ms antes de buscar
    timeoutRef.current = setTimeout(() => {
      handleSearch(value);
    }, 500);
  };

  const handleClearSearch = () => {
    setSearchTerm('');
    // Limpiar timeout pendiente
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    handleSearch('');
  };

  const handleFiltersChange = (newFilters) => {
    if (!isMounted) return;
    
    applyFilters({ ...newFilters, page: 1 });
  };

  const handlePageChange = (page) => {
    if (!isMounted) return;
    
    applyFilters({ page });
  };

  return (
    <>
      <Navbar />
      <div className="min-h-[calc(100vh-64px)] bg-[#f3f9f8] py-8 px-6 md:px-6 pb-20 md:pb-8 flex flex-col items-center">
        <div className="w-full max-w-7xl flex flex-col gap-6">
          {/* Header: título, buscador y botón */}
          <div className="flex flex-col md:flex-row md:items-center md:gap-6 mb-2 w-full">
            <div className="flex flex-col md:flex-row md:items-center w-full">
              <div className="bg-white rounded-lg px-6 py-3 shadow-sm w-full md:w-[320px] text-center md:text-left mb-4 md:mb-0">
                <h1 className="text-3xl md:text-4xl font-extrabold text-conexia-green-dark tracking-tight leading-tight">
                  Servicios
                </h1>
              </div>
              <div className="flex-1 flex justify-center md:justify-center w-full md:w-auto md:ml-6">
                <div className="w-full max-w-xl">
                  <div className="flex items-center w-full bg-white rounded-full shadow px-4 py-2 gap-2 border border-conexia-green/20 focus-within:border-conexia-green transition">
                    <Search className="text-conexia-green/70 mr-1" size={22} />
                    <input
                      type="text"
                      placeholder="Buscar servicios..."
                      value={searchTerm}
                      onChange={handleInputChange}
                      className="flex-1 bg-transparent outline-none text-conexia-green placeholder:text-conexia-green/40 text-base px-2"
                      disabled={loading}
                    />
                    {searchTerm && (
                      <button
                        onClick={handleClearSearch}
                        className="text-conexia-green/40 hover:text-conexia-green/60 ml-2"
                        type="button"
                      >
                        ✕
                      </button>
                    )}
                    {loading && (
                      <div className="ml-2">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-conexia-green"></div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 justify-center md:justify-end w-full md:w-auto mt-4 md:mt-0">
              {canViewHirings && (
                <button 
                  onClick={() => router.push('/services/my-hirings')}
                  className="bg-blue-600 text-white font-semibold rounded-lg px-4 py-3 shadow hover:bg-blue-700 transition text-sm whitespace-nowrap flex items-center justify-center gap-2 w-full sm:w-auto"
                >
                  <FileText size={16} />
                  <span>Mis Solicitudes</span>
                </button>
              )}
              
              {canCreateService && (
                <Link href="/services/create" className="w-full sm:w-auto">
                  <button className="bg-conexia-green text-white font-semibold rounded-lg px-4 py-3 shadow hover:bg-conexia-green/90 transition text-sm whitespace-nowrap flex items-center justify-center gap-2 w-full">
                    <span className="flex items-center justify-center gap-2 w-full">
                      <Briefcase size={16} className="text-base" />
                      <span>Publica tu servicio</span>
                    </span>
                  </button>
                </Link>
              )}
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-6">
            {/* Filtros laterales */}
            <aside className="w-full md:w-[320px] flex-shrink-0">
              <ServiceFilters 
                onFiltersChange={handleFiltersChange}
                loading={loading}
                currentFilters={currentFilters}
              />
            </aside>

            {/* Contenido principal con altura mínima fija */}
            <main className="flex-1 min-h-[900px] flex flex-col">
              {/* Resultados */}
              <div className="mb-6">
                {!loading && services.length > 0 && (
                  <p className="text-gray-600 text-sm">
                    Mostrando {services.length} de {pagination.total} servicio{pagination.total !== 1 ? 's' : ''}
                    {currentFilters.title && ` para "${currentFilters.title}"`}
                  </p>
                )}
              </div>

              {/* Lista de servicios - Ocupa el espacio disponible */}
              <div className="flex-1">
                <ServiceList 
                  services={services}
                  loading={loading}
                  error={error}
                  reserveGridSpace={true}
                  emptyMessage="No se encontraron servicios"
                  emptyDescription="Intenta ajustar los filtros de búsqueda o explorar otras categorías."
                />
              </div>

              {/* Paginación - Posición fija en la parte inferior */}
              <div className="mt-8 flex justify-center">
                {!loading && (
                  <Pagination
                    currentPage={pagination.page || 1}
                    totalPages={pagination.totalPages || 1}
                    hasNextPage={pagination.hasNext || false}
                    hasPreviousPage={pagination.hasPrev || false}
                    onPageChange={handlePageChange}
                  />
                )}
              </div>
            </main>
          </div>
        </div>
      </div>
    </>
  );
}