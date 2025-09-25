import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function Pagination({ 
  page, 
  currentPage, 
  hasNextPage, 
  hasPreviousPage, 
  onPageChange, 
  totalPages 
}) {
  // Usar currentPage si está disponible, sino usar page
  const activePage = currentPage || page;
  
  // Función para manejar el cambio de página con scroll-to-top
  const handlePageChange = (newPage) => {
    onPageChange(newPage);
    // Scroll to top of the page
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  // Si totalPages está disponible, mostrar números de página
  if (totalPages && totalPages > 1) {
    const getVisiblePages = () => {
      const delta = 2;
      const range = [];
      const rangeWithDots = [];
      
      for (let i = Math.max(2, activePage - delta); 
           i <= Math.min(totalPages - 1, activePage + delta); 
           i++) {
        range.push(i);
      }
      
      if (activePage - delta > 2) {
        rangeWithDots.push(1, '...');
      } else {
        rangeWithDots.push(1);
      }
      
      rangeWithDots.push(...range);
      
      if (activePage + delta < totalPages - 1) {
        rangeWithDots.push('...', totalPages);
      } else if (totalPages > 1) {
        rangeWithDots.push(totalPages);
      }
      
      return rangeWithDots;
    };
    
    const visiblePages = getVisiblePages();
    
    return (
      <div className="flex justify-center items-center gap-2 mt-6 flex-wrap">
        <button
          className="w-8 h-8 flex items-center justify-center rounded-full border-2 border-conexia-green text-conexia-green hover:bg-conexia-green hover:text-white transition-colors disabled:opacity-50"
          disabled={!hasPreviousPage}
          onClick={() => handlePageChange(activePage - 1)}
        >
          <ChevronLeft className="w-5 h-5 stroke-[3]" />
        </button>

        {visiblePages.map((pageNum, index) => {
          if (pageNum === '...') {
            return (
              <span key={`dots-${index}`} className="px-2 py-1 text-gray-500">
                ...
              </span>
            );
          }
          
          const isActive = pageNum === activePage;
          
          return (
            <button
              key={pageNum}
              onClick={() => handlePageChange(pageNum)}
              className={`w-8 h-8 flex items-center justify-center rounded-full font-medium transition-colors ${
                isActive
                  ? 'bg-conexia-green text-white'
                  : 'border-2 border-conexia-green text-conexia-green hover:bg-conexia-green hover:text-white'
              }`}
            >
              {pageNum}
            </button>
          );
        })}

        <button
          className="w-8 h-8 flex items-center justify-center rounded-full border-2 border-conexia-green text-conexia-green hover:bg-conexia-green hover:text-white transition-colors disabled:opacity-50"
          disabled={!hasNextPage}
          onClick={() => handlePageChange(activePage + 1)}
        >
          <ChevronRight className="w-5 h-5 stroke-[3]" />
        </button>
      </div>
    );
  }
  
  // Versión simple - SIEMPRE se muestra
  return (
    <div className="flex justify-center items-center gap-2 mt-6">
      <button
        className="w-8 h-8 flex items-center justify-center rounded-full border-2 border-conexia-green text-conexia-green hover:bg-conexia-green hover:text-white transition-colors disabled:opacity-50"
        disabled={!hasPreviousPage}
        onClick={() => handlePageChange(activePage - 1)}
      >
        <ChevronLeft className="w-5 h-5 stroke-[3]" />
      </button>

      <span className="bg-conexia-green text-white rounded-full w-8 h-8 flex items-center justify-center font-medium">
        {activePage}
      </span>

      <button
        className="w-8 h-8 flex items-center justify-center rounded-full border-2 border-conexia-green text-conexia-green hover:bg-conexia-green hover:text-white transition-colors disabled:opacity-50"
        disabled={!hasNextPage}
        onClick={() => handlePageChange(activePage + 1)}
      >
        <ChevronRight className="w-5 h-5 stroke-[3]" />
      </button>
    </div>
  );
}
