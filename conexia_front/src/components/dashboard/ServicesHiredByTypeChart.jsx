'use client';
import { motion } from 'framer-motion';
import { DollarSign } from 'lucide-react';

/**
 * Gráfico de servicios contratados por tipo
 */
export const ServicesHiredByTypeChart = ({ servicesByType = [] }) => {
  if (!servicesByType || servicesByType.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-lg border-2 border-green-200 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 rounded-lg bg-green-50">
            <DollarSign className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-800">Servicios por Tipo</h3>
            <p className="text-sm text-gray-500">No hay servicios contratados</p>
          </div>
        </div>
      </div>
    );
  }

  const maxCount = Math.max(...servicesByType.map(service => service.count));
  const colors = [
    'bg-green-500', 'bg-blue-500', 'bg-purple-500', 
    'bg-yellow-500', 'bg-red-500', 'bg-pink-500',
    'bg-indigo-500', 'bg-teal-500', 'bg-orange-500'
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="bg-white rounded-xl shadow-lg border-2 border-green-200 p-6"
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 rounded-lg bg-green-50">
          <DollarSign className="w-6 h-6 text-green-600" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-gray-800">Servicios por Tipo</h3>
          <p className="text-sm text-gray-500">Distribución de contrataciones</p>
        </div>
      </div>

      <div className="space-y-4">
        {servicesByType.map((service, index) => {
          const percentage = maxCount > 0 ? (service.count / maxCount) * 100 : 0;
          const revenue = service.revenue || 0;
          
          return (
            <div key={index} className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700 truncate flex-1">
                  {service.type}
                </span>
                <div className="text-right ml-2">
                  <div className="text-lg font-bold text-green-600">
                    {service.count}
                  </div>
                  <div className="text-xs text-gray-500">
                    ${revenue.toLocaleString('es-AR')}
                  </div>
                </div>
              </div>
              <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${percentage}%` }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className={`h-full ${colors[index % colors.length]} rounded-full`}
                />
              </div>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
};
