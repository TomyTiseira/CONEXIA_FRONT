import { useState, useCallback, useRef, useMemo } from 'react';
import { fetchServices } from '@/service/services/servicesFetch';

/**
 * Hook para manejar la lista de servicios con filtros y paginación en frontend
 */
export function useServices() {
  const [allServices, setAllServices] = useState([]); // Todos los servicios sin filtrar
  const [filters, setFilters] = useState({
    title: '',
    category: [],
    priceMin: '',
    priceMax: '',
    sortBy: '',
    page: 1,
    limit: 12
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const loadingRef = useRef(false); // Para prevenir llamadas múltiples

  // Cargar todos los servicios desde el backend (solo una vez)
  const loadAllServices = useCallback(async () => {
    // Prevenir llamadas múltiples simultáneas
    if (loadingRef.current) {
      return;
    }
    
    loadingRef.current = true;
    setLoading(true);
    setError(null);
    
    try {
      // Llamar sin filtros para obtener todos los servicios
      const response = await fetchServices({});
      setAllServices(response.services || []);
      console.log('✅ Servicios cargados:', response.services?.length || 0);
    } catch (err) {
      console.error('❌ Error cargando servicios:', err.message);
      setError(err.message);
      setAllServices([]);
    } finally {
      loadingRef.current = false;
      setLoading(false);
    }
  }, []);

  // Aplicar filtros localmente
  const applyFilters = useCallback((newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  // Servicios filtrados y ordenados (calculado)
  const filteredServices = useMemo(() => {
    let result = [...allServices];

    // Filtro por título
    if (filters.title.trim()) {
      const searchTerm = filters.title.toLowerCase().trim();
      result = result.filter(service => 
        service.title?.toLowerCase().includes(searchTerm) ||
        service.description?.toLowerCase().includes(searchTerm)
      );
    }

    // Filtro por categorías
    if (filters.category.length > 0) {
      result = result.filter(service => {
        // Probar diferentes campos posibles para la categoría
        const categoryField = service.categoryId || service.category_id || service.category?.id || service.categoryName;
        console.log('🔍 Debug categoría - service:', service.title, 'categoryField:', categoryField, 'filters:', filters.category);
        return filters.category.includes(categoryField);
      });
    }

    // Filtro por precio mínimo
    if (filters.priceMin && !isNaN(filters.priceMin)) {
      result = result.filter(service => 
        service.price >= parseFloat(filters.priceMin)
      );
    }

    // Filtro por precio máximo
    if (filters.priceMax && !isNaN(filters.priceMax)) {
      result = result.filter(service => 
        service.price <= parseFloat(filters.priceMax)
      );
    }

    // Ordenamiento
    if (filters.sortBy) {
      switch (filters.sortBy) {
        case 'price_asc':
          result.sort((a, b) => a.price - b.price);
          break;
        case 'price_desc':
          result.sort((a, b) => b.price - a.price);
          break;
        case 'newest':
          result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
          break;
        case 'oldest':
          result.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
          break;
        default:
          // Sin ordenamiento específico
          break;
      }
    }

    return result;
  }, [allServices, filters]);

  // Paginación calculada
  const pagination = useMemo(() => {
    const total = filteredServices.length;
    const totalPages = Math.ceil(total / filters.limit);
    const page = Math.min(filters.page, totalPages || 1);
    
    return {
      page,
      limit: filters.limit,
      total,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1
    };
  }, [filteredServices.length, filters.page, filters.limit]);

  // Servicios de la página actual
  const services = useMemo(() => {
    const startIndex = (pagination.page - 1) * filters.limit;
    const endIndex = startIndex + filters.limit;
    return filteredServices.slice(startIndex, endIndex);
  }, [filteredServices, pagination.page, filters.limit]);

  return {
    services, // Servicios paginados y filtrados
    pagination,
    loading,
    error,
    filters,
    allServices, // Todos los servicios (para debug)
    filteredServices, // Servicios filtrados sin paginar (para debug)
    loadAllServices, // Función para cargar todos los servicios
    applyFilters, // Función para aplicar filtros localmente
    setServices: setAllServices, // Para compatibilidad
    setPagination: () => {}, // No hacer nada, la paginación es calculada
  };
}