import { useState, useCallback, useRef } from 'react';
import { fetchServices } from '@/service/services/servicesFetch';

/**
 * Hook para manejar la lista de servicios con filtros y paginación desde el backend
 */
export function useServices() {
  const [services, setServices] = useState([]); // Servicios de la página actual
  const [pagination, setPagination] = useState({
    currentPage: 1,
    itemsPerPage: 12,
    totalItems: 0,
    totalPages: 1,
    hasNextPage: false,
    hasPreviousPage: false
  });
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
  const CLIENT_MAX_LIMIT = 1000; // Límite alto para obtener dataset completo cuando se ordena/filtra por precio en el cliente

  // Función para aplicar filtros del lado del cliente
  const applyClientSideFilters = useCallback((services, currentFilters) => {
    let filteredServices = [...services];

    // Helpers para precio seguro
    const getPrice = (value) => {
      if (value === null || value === undefined) return null;
      const n = typeof value === 'number' ? value : parseFloat(String(value).replace(/[^0-9.,-]/g, '').replace(',', '.'));
      return Number.isNaN(n) ? null : n;
    };

    // Filtro por precio mínimo
    if (currentFilters.priceMin !== undefined && currentFilters.priceMin !== '' && !Number.isNaN(Number(currentFilters.priceMin))) {
      const minPrice = Number(currentFilters.priceMin);
      filteredServices = filteredServices.filter(service => {
        const p = getPrice(service.price);
        return p !== null && p >= minPrice;
      });
    }

    // Filtro por precio máximo
    if (currentFilters.priceMax !== undefined && currentFilters.priceMax !== '' && !Number.isNaN(Number(currentFilters.priceMax))) {
      const maxPrice = Number(currentFilters.priceMax);
      filteredServices = filteredServices.filter(service => {
        const p = getPrice(service.price);
        return p !== null && p <= maxPrice;
      });
    }

    // Ordenamiento
    if (currentFilters.sortBy && currentFilters.sortBy.trim()) {
      switch (currentFilters.sortBy) {
        case 'price_asc':
          filteredServices.sort((a, b) => {
            const ap = getPrice(a.price);
            const bp = getPrice(b.price);
            return (ap === null ? Infinity : ap) - (bp === null ? Infinity : bp);
          });
          break;
        case 'price_desc':
          filteredServices.sort((a, b) => {
            const ap = getPrice(a.price);
            const bp = getPrice(b.price);
            return (bp === null ? -Infinity : bp) - (ap === null ? -Infinity : ap);
          });
          break;
        case 'newest':
          filteredServices.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
          break;
        case 'oldest':
          filteredServices.sort((a, b) => new Date(a.createdAt || 0) - new Date(b.createdAt || 0));
          break;
        default:
          // Sin ordenamiento específico
          break;
      }
    }

    return filteredServices;
  }, []);

  // Cargar servicios desde el backend con filtros
  const loadServices = useCallback(async (searchFilters = {}, clientFiltersOverride = null) => {
    // Prevenir llamadas múltiples simultáneas
    if (loadingRef.current) {
      return;
    }
    
    loadingRef.current = true;
    setLoading(true);
    setError(null);
    
    try {
      const effectiveClientFilters = clientFiltersOverride || filters;
      const clientMode = Boolean(
        (effectiveClientFilters.priceMin && effectiveClientFilters.priceMin !== '') ||
        (effectiveClientFilters.priceMax && effectiveClientFilters.priceMax !== '') ||
        (effectiveClientFilters.sortBy && effectiveClientFilters.sortBy.trim())
      );

      // Si hay ordenamiento por precio o filtros de precio, traemos un dataset grande (página 1)
      // para ordenar/filtrar en cliente y luego paginar manualmente
      const backendParams = { ...searchFilters };
      if (clientMode) {
        backendParams.page = 1;
        backendParams.limit = CLIENT_MAX_LIMIT;
      }

      const response = await fetchServices(backendParams);
      
      // Extraer servicios y paginación de la respuesta
      let servicesData = response.data?.services || response.services || [];

      if (clientMode) {
        // Filtrar/ordenar y paginar en el cliente
        const filteredSorted = applyClientSideFilters(servicesData, effectiveClientFilters);
        const currentLimit = Number(effectiveClientFilters.limit) || 12;
        const currentPage = Number(effectiveClientFilters.page) || 1;
        const total = filteredSorted.length;
        const totalPages = Math.max(1, Math.ceil(total / currentLimit));
        const start = (currentPage - 1) * currentLimit;
        const end = start + currentLimit;
        const pageSlice = filteredSorted.slice(start, end);

        setServices(pageSlice);
        setPagination({
          currentPage: currentPage,
          itemsPerPage: currentLimit,
          totalItems: total,
          totalPages,
          hasNextPage: currentPage < totalPages,
          hasPreviousPage: currentPage > 1,
        });
      } else {
        // Usar paginación del backend
        const paginationData = response.data?.pagination || response.pagination || {
          currentPage: searchFilters.page || 1,
          itemsPerPage: searchFilters.limit || 12,
          totalItems: servicesData.length,
          totalPages: Math.ceil(servicesData.length / (searchFilters.limit || 12)),
          hasNextPage: false,
          hasPreviousPage: false
        };

        setServices(servicesData);
        setPagination(paginationData);
      }
      
    } catch (err) {
      // Silenciar errores si la sesión fue terminada (baneo/logout)
      const { isSessionTerminated } = await import('@/service/auth/fetchWithRefresh');
      if (isSessionTerminated()) {
        // Sesión terminada, no loguear errores
        return;
      }
      
      console.error('❌ Error cargando servicios:', err.message);
      setError(err.message);
      setServices([]);
      setPagination({
        currentPage: 1,
        itemsPerPage: 12,
        totalItems: 0,
        totalPages: 1,
        hasNextPage: false,
        hasPreviousPage: false
      });
    } finally {
      loadingRef.current = false;
      setLoading(false);
    }
  }, [filters, applyClientSideFilters]);

  // Cargar todos los servicios (primera carga)
  const loadAllServices = useCallback(async () => {
    await loadServices({});
  }, [loadServices]);

  // Aplicar filtros
  const applyFilters = useCallback(async (newFilters) => {
    const updatedFilters = { ...filters, ...newFilters };
    setFilters(updatedFilters);
    
    // Preparar parámetros para el backend según el DTO esperado
    const backendParams = {
      page: updatedFilters.page || 1,
      limit: updatedFilters.limit || 12
    };

    // Solo agregar parámetros si tienen valor
    // El backend espera 'search' no 'title'
    if (updatedFilters.title && updatedFilters.title.trim()) {
      backendParams.search = updatedFilters.title.trim();
    }

    // El backend espera 'categoryIds' (array de números) no 'category'
    if (updatedFilters.category && Array.isArray(updatedFilters.category) && updatedFilters.category.length > 0) {
      // Convertir a números si son strings y eliminar NaN
      const ids = updatedFilters.category
        .map(id => (typeof id === 'string' ? parseInt(id, 10) : id))
        .filter((n) => Number.isFinite(n));
      if (ids.length > 0) backendParams.categoryIds = ids;
    }

    // Agregar minRating si existe y es mayor a 1 (número entre 2-5)
    // minRating = 1 es el valor por defecto y equivale a no filtrar
    if (updatedFilters.minRating !== null && updatedFilters.minRating !== undefined) {
      const rating = typeof updatedFilters.minRating === 'string' 
        ? parseFloat(updatedFilters.minRating) 
        : updatedFilters.minRating;
      if (Number.isFinite(rating) && rating >= 2 && rating <= 5) {
        backendParams.minRating = rating;
      }
    }

    // Nota: El backend no maneja priceMin, priceMax, ni sortBy según el DTO
    // Estos filtros se aplicarán en el frontend si es necesario

    await loadServices(backendParams, updatedFilters);
  }, [filters, loadServices]);

  return {
    services, // Servicios de la página actual
    pagination, // Paginación del backend
    loading,
    error,
    filters, // Filtros actuales
    loadAllServices, // Función para cargar servicios iniciales
    applyFilters, // Función para aplicar filtros
    setServices, // Para compatibilidad
    setPagination, // Para compatibilidad
  };
}