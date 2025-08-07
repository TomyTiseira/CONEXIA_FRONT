import { useState, useCallback } from 'react';

export const useCarouselNavigation = (totalItems, itemsPerPage = 3, itemsPerPageMobile = 1) => {
  const [currentPage, setCurrentPage] = useState(0);
  
  // Calcular número de páginas
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const totalPagesMobile = Math.ceil(totalItems / itemsPerPageMobile);

  // Navegación circular para desktop
  const goToNext = useCallback(() => {
    setCurrentPage((prev) => (prev + 1) % totalPages);
  }, [totalPages]);

  const goToPrevious = useCallback(() => {
    setCurrentPage((prev) => (prev - 1 + totalPages) % totalPages);
  }, [totalPages]);

  // Navegación circular para mobile
  const goToNextMobile = useCallback(() => {
    setCurrentPage((prev) => (prev + 1) % totalPagesMobile);
  }, [totalPagesMobile]);

  const goToPreviousMobile = useCallback(() => {
    setCurrentPage((prev) => (prev - 1 + totalPagesMobile) % totalPagesMobile);
  }, [totalPagesMobile]);

  // Obtener elementos para la página actual (desktop)
  const getCurrentItems = useCallback((items) => {
    const startIndex = currentPage * itemsPerPage;
    return items.slice(startIndex, startIndex + itemsPerPage);
  }, [currentPage, itemsPerPage]);

  // Obtener elemento para la página actual (mobile)
  const getCurrentItemMobile = useCallback((items) => {
    return items[currentPage] || null;
  }, [currentPage]);

  // Ir a una página específica
  const goToPage = useCallback((pageIndex) => {
    setCurrentPage(Math.max(0, Math.min(pageIndex, totalPages - 1)));
  }, [totalPages]);

  // Reset a la primera página
  const resetPage = useCallback(() => {
    setCurrentPage(0);
  }, []);

  return {
    currentPage,
    totalPages,
    totalPagesMobile,
    goToNext,
    goToPrevious,
    goToNextMobile,
    goToPreviousMobile,
    getCurrentItems,
    getCurrentItemMobile,
    goToPage,
    resetPage,
    hasNext: currentPage < totalPages - 1,
    hasPrevious: currentPage > 0,
    hasNextMobile: currentPage < totalPagesMobile - 1,
    hasPreviousMobile: currentPage > 0
  };
};
