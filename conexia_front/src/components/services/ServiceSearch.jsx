import { useState, useEffect, useMemo, useRef } from 'react';
import { fetchServices } from '@/service/services/servicesFetch';
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
import ServiceSearchBar from './ServiceSearchBar';

export default function ServiceSearch() {
  const router = useRouter();
  const { roleName } = useUserStore();

  const canCreateService = roleName === ROLES.USER;
  const canViewHirings = roleName === ROLES.USER;
  
  // Estado exactamente como ProjectSearch
  const [filters, setFilters] = useState({ title: '' });
  const [services, setServices] = useState([]);
  const [pagination, setPagination] = useState({ 
    page: 1, 
    limit: 12, 
    total: 0, 
    totalPages: 1, 
    hasNext: false, 
    hasPrev: false 
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const pageSize = 12;

  // Estructura exacta de ProjectSearch
  const [pendingFilters, setPendingFilters] = useState(filters);
  const filtersKey = useMemo(() => JSON.stringify(pendingFilters), [pendingFilters]);

  // useEffect para manejar filtros exactamente como ProjectSearch
  useEffect(() => {
    const applyFilters = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const params = {
          search: pendingFilters.title.trim() || undefined,
          page,
          limit: pageSize
        };
        
        const { services: servicesData, pagination: paginationData } = await fetchServices(params);
        
        setServices(servicesData || []);
        setPagination(paginationData || { 
          page: 1, 
          limit: 12, 
          total: 0, 
          totalPages: 1, 
          hasNext: false, 
          hasPrev: false 
        });
      } catch (err) {
        console.error('Error cargando servicios:', err);
        setError(err.message);
        setServices([]);
        setPagination({ 
          page: 1, 
          limit: 12, 
          total: 0, 
          totalPages: 1, 
          hasNext: false, 
          hasPrev: false 
        });
      } finally {
        setLoading(false);
      }
      
      // CLAVE: setFilters AL FINAL como ProjectSearch
      setFilters(pendingFilters);
    };
    
    applyFilters();
  }, [filtersKey, page]); // Usar filtersKey exactamente como ProjectSearch





  // handleSearch exactamente como ProjectSearch
  const handleSearch = (newFilters) => {
    setPendingFilters(newFilters);
    setPage(1); // Reiniciar a la primera página al cambiar filtros
  };

  const handleClearSearch = () => {
    handleSearch({ title: '' });
  };

  const handleFiltersChange = (newFilters) => {
    // TODO: Implementar filtros adicionales si es necesario
    console.log('Filtros adicionales:', newFilters);
  };

  const handlePageChange = (newPage) => {
    setPage(newPage);
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
                  <ServiceSearchBar filters={filters} onSearch={handleSearch} />
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
                currentFilters={filters}
              />
            </aside>

            {/* Contenido principal con altura mínima fija */}
            <main className="flex-1 min-h-[900px] flex flex-col">
              {/* Resultados */}
              <div className="mb-6">
                {!loading && services.length > 0 && (
                  <p className="text-gray-600 text-sm">
                    Mostrando {services.length} de {pagination.total} servicio{pagination.total !== 1 ? 's' : ''}
                    {filters.title && ` para "${filters.title}"`}
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