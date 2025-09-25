import ServiceCard from './ServiceCard';
import { FaTools } from 'react-icons/fa';

const ServiceList = ({ 
  services, 
  loading, 
  error, 
  showInactiveLabel = false,
  emptyMessage = "No se encontraron servicios",
  emptyDescription = "Intenta ajustar los filtros o buscar con otros términos.",
  reserveGridSpace = false,
}) => {
  
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(12)].map((_, index) => (
          <div key={index} className="bg-white rounded-lg shadow-sm border overflow-hidden animate-pulse">
            <div className="aspect-video bg-gray-200"></div>
            <div className="p-4 space-y-3">
              <div className="h-5 bg-gray-200 rounded"></div>
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </div>
              <div className="flex justify-between items-center">
                <div className="h-4 bg-gray-200 rounded w-16"></div>
                <div className="h-4 bg-gray-200 rounded w-12"></div>
              </div>
              <div className="h-6 bg-gray-200 rounded w-20"></div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                  <div className="h-4 bg-gray-200 rounded w-20"></div>
                </div>
                <div className="h-4 bg-gray-200 rounded w-16"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-8">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FaTools className="w-8 h-8 text-red-500" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Error al cargar servicios
          </h3>
          <p className="text-gray-500 mb-4">
            {error}
          </p>
          <button 
            onClick={() => window.location.reload()} 
            className="bg-conexia-green hover:bg-conexia-green-dark text-white px-4 py-2 rounded-lg transition-colors"
          >
            Intentar nuevamente
          </button>
        </div>
      </div>
    );
  }

  if (!services || services.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-8">
        <div className="text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FaTools className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {emptyMessage}
          </h3>
          <p className="text-gray-500">
            {emptyDescription}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`${reserveGridSpace ? 'min-h-[800px] flex flex-col' : ''}`}>
      <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 ${reserveGridSpace ? 'flex-1' : ''}`}>
        {services.map(service => (
          <ServiceCard 
            key={service.id} 
            service={service} 
            showInactiveLabel={showInactiveLabel}
          />
        ))}
        {/* Rellenar con espacios vacíos sólo si se reserva espacio */}
        {reserveGridSpace && services.length < 12 && (
          Array.from({ length: 12 - services.length }).map((_, index) => (
            <div key={`empty-${index}`} className="invisible">
              <div className="aspect-[4/5] bg-transparent"></div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ServiceList;