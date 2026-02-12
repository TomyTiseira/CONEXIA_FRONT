'use client';
import { motion } from 'framer-motion';
import { Briefcase, DollarSign, TrendingUp } from 'lucide-react';

/**
 * Card visual para resumen de servicios completados
 */
export const ServicesCompletedChart = ({ totalServicesHired, totalRevenue }) => {
  const averageRevenue = totalServicesHired > 0 
    ? (totalRevenue / totalServicesHired).toFixed(2) 
    : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="bg-white rounded-xl shadow-lg border-2 border-green-200 p-6 h-full"
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 rounded-lg bg-green-50">
          <Briefcase className="w-6 h-6 text-green-600" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-gray-800">Servicios completados</h3>
          <p className="text-sm text-gray-500">Resumen de ingresos</p>
        </div>
      </div>

      {/* Valor principal */}
      <div className="mb-6 text-center">
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="text-5xl font-bold text-green-600 mb-2"
        >
          {totalServicesHired}
        </motion.div>
        <p className="text-sm text-gray-500">Servicios finalizados</p>
      </div>

      {/* Métricas detalladas */}
      <div className="space-y-3">
        <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
          <div className="flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-medium text-gray-700">Ingresos totales</span>
          </div>
          <div className="text-right">
            <div className="text-lg font-bold text-blue-600">
              ${totalRevenue.toLocaleString('es-AR')}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-purple-600" />
            <span className="text-sm font-medium text-gray-700">Promedio por servicio</span>
          </div>
          <div className="text-right">
            <div className="text-lg font-bold text-purple-600">
              ${Number(averageRevenue).toLocaleString('es-AR')}
            </div>
          </div>
        </div>
      </div>

      {/* Indicador visual de éxito */}
      <div className="mt-4 p-3 bg-green-50 rounded-lg border border-green-200">
        <div className="flex items-center justify-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
          <span className="text-xs font-medium text-green-700">
            Solo servicios finalizados exitosamente
          </span>
        </div>
      </div>
    </motion.div>
  );
};
