'use client';
import { motion } from 'framer-motion';
import { Briefcase, DollarSign, ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';

/**
 * Componente para mostrar servicios por tipo con desplegable
 */
export const ServicesByTypeSummary = ({ servicesByType }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!servicesByType || servicesByType.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-lg border-2 border-green-200 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 rounded-lg bg-green-50">
            <Briefcase className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-800">Servicios por Tipo</h3>
            <p className="text-sm text-gray-500">No hay servicios registrados</p>
          </div>
        </div>
      </div>
    );
  }

  // Calcular totales
  const totalServices = servicesByType.reduce((sum, item) => sum + item.count, 0);
  const totalRevenue = servicesByType.reduce((sum, item) => sum + (item.revenue || 0), 0);

  // Mostrar solo primeros 3 si no está expandido
  const displayedServices = isExpanded ? servicesByType : servicesByType.slice(0, 3);
  const hasMoreServices = servicesByType.length > 3;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl shadow-lg border-2 border-green-200 p-6"
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 rounded-lg bg-green-50">
          <Briefcase className="w-6 h-6 text-green-600" />
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-bold text-gray-800">Servicios por Tipo</h3>
          <p className="text-sm text-gray-500">
            Total: {totalServices} servicios • ${totalRevenue.toLocaleString('es-AR')} generados
          </p>
        </div>
      </div>

      {/* Lista de servicios */}
      <div className="space-y-3">
        {displayedServices.map((service, index) => {
          const percentage = ((service.count / totalServices) * 100).toFixed(1);
          const revenuePercentage = totalRevenue > 0 
            ? ((service.revenue / totalRevenue) * 100).toFixed(1) 
            : 0;

          return (
            <div
              key={index}
              className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-4 border border-green-200"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-800 mb-1">{service.type}</h4>
                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-1 text-green-700">
                      <Briefcase className="w-4 h-4" />
                      <span className="font-bold">{service.count}</span>
                      <span className="text-gray-500">({percentage}%)</span>
                    </div>
                    <div className="flex items-center gap-1 text-green-700">
                      <DollarSign className="w-4 h-4" />
                      <span className="font-bold">${service.revenue.toLocaleString('es-AR')}</span>
                      <span className="text-gray-500">({revenuePercentage}%)</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Barra de progreso dual */}
              <div className="space-y-1">
                <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                  <div
                    className="h-full bg-green-600 rounded-full transition-all duration-500"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                    style={{ width: `${revenuePercentage}%` }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Botón de expandir/colapsar */}
      {hasMoreServices && (
        <motion.button
          onClick={() => setIsExpanded(!isExpanded)}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="
            mt-4 w-full flex items-center justify-center gap-2 
            py-3 px-4 rounded-lg 
            bg-gradient-to-r from-green-100 to-emerald-100
            hover:from-green-200 hover:to-emerald-200
            text-green-700 font-semibold
            transition-all duration-300
            border-2 border-green-300
          "
        >
          {isExpanded ? (
            <>
              <ChevronUp className="w-5 h-5" />
              Mostrar menos
            </>
          ) : (
            <>
              <ChevronDown className="w-5 h-5" />
              Ver todos ({servicesByType.length} tipos)
            </>
          )}
        </motion.button>
      )}

      {/* Nota informativa */}
      <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
        <p className="text-xs text-gray-600">
          <span className="font-semibold">Nota:</span> Solo se cuentan servicios con estado COMPLETED
        </p>
      </div>
    </motion.div>
  );
};
