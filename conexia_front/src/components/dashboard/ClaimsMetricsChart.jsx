'use client';
import { motion } from 'framer-motion';
import { AlertCircle, CheckCircle, Clock, TrendingUp } from 'lucide-react';

/**
 * Componente visual para métricas de reclamos
 */
export const ClaimsMetricsChart = ({ claims }) => {
  if (!claims || claims.totalClaims === 0) {
    return (
      <div className="bg-white rounded-xl shadow-lg border-2 border-amber-200 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 rounded-lg bg-green-50">
            <CheckCircle className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-800">Reclamos</h3>
            <p className="text-sm text-green-600">✅ No hay reclamos activos</p>
          </div>
        </div>
      </div>
    );
  }

  const resolutionRate = claims.resolutionRate || 0;
  const claimRate = claims.claimRate || 0;
  const avgDays = (claims.averageResolutionTimeInHours / 24).toFixed(1);
  const avgHours = Math.round(claims.averageResolutionTimeInHours || 0);

  // Calcular reclamos activos (no resueltos)
  const activeClaims = claims.totalClaims - claims.resolvedClaims;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="bg-white rounded-xl shadow-lg border-2 border-amber-200 p-6"
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 rounded-lg bg-amber-50">
          <AlertCircle className="w-6 h-6 text-amber-600" />
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-bold text-gray-800">Reclamos de Servicios</h3>
          <p className="text-sm text-gray-500">
            Gestión y resolución de conflictos
          </p>
        </div>
      </div>

      {/* Estadísticas principales */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        {/* Total de reclamos */}
        <div className="bg-red-50 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle className="w-4 h-4 text-red-600" />
            <span className="text-xs font-medium text-red-800">Total</span>
          </div>
          <div className="text-2xl font-bold text-red-600">{claims.totalClaims}</div>
          <div className="text-xs text-red-600 mt-1">reclamos</div>
        </div>

        {/* Reclamos resueltos */}
        <div className="bg-green-50 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle className="w-4 h-4 text-green-600" />
            <span className="text-xs font-medium text-green-800">Resueltos</span>
          </div>
          <div className="text-2xl font-bold text-green-600">{claims.resolvedClaims}</div>
          <div className="text-xs text-green-600 mt-1">{resolutionRate.toFixed(1)}% del total</div>
        </div>
      </div>

      {/* Tasa de resolución */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">Tasa de resolución</span>
          <span className="text-sm font-bold text-green-600">{resolutionRate.toFixed(1)}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${resolutionRate}%` }}
            transition={{ duration: 1, delay: 0.3 }}
            className="h-full bg-green-500 rounded-full"
          />
        </div>
      </div>

      {/* Métricas adicionales */}
      <div className="space-y-3">
        <div className="flex items-center justify-between p-3 bg-amber-50 rounded-lg">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-600" />
            <span className="text-sm font-medium text-gray-700">Activos</span>
          </div>
          <span className="text-lg font-bold text-amber-600">{activeClaims}</span>
        </div>

        <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-medium text-gray-700">Tiempo promedio</span>
          </div>
          <div className="text-right">
            <div className="text-lg font-bold text-blue-600">{avgHours}h</div>
            <div className="text-xs text-blue-600">{avgDays} días</div>
          </div>
        </div>

        <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-purple-600" />
            <span className="text-sm font-medium text-gray-700">Tasa de reclamos</span>
          </div>
          <div className="text-right">
            <div className="text-lg font-bold text-purple-600">{claimRate.toFixed(1)}%</div>
            <div className="text-xs text-purple-600">de servicios en progreso</div>
          </div>
        </div>
      </div>

      {/* Notas informativas */}
      <div className="mt-6 space-y-2">
        <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-xs text-blue-800">
            <strong>ℹ️ Tasa de reclamos:</strong> Porcentaje de servicios en progreso que tienen un reclamo activo.
          </p>
        </div>
        <div className="p-3 bg-green-50 rounded-lg border border-green-200">
          <p className="text-xs text-green-800">
            <strong>✓ Resuelto:</strong> Reclamo con tipo de resolución, resuelto por y fecha de resolución completos.
          </p>
        </div>
      </div>
    </motion.div>
  );
};
