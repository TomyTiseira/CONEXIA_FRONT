'use client';
import { motion } from 'framer-motion';
import { DollarSign, CheckCircle, Clock, AlertCircle } from 'lucide-react';

/**
 * Gráfico visual para métricas de cotizaciones
 */
export const QuotationsMetricsChart = ({ quotations }) => {
  if (!quotations || quotations.sent === 0) {
    return (
      <div className="bg-white rounded-xl shadow-lg border-2 border-blue-200 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 rounded-lg bg-blue-50">
            <DollarSign className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-800">Cotizaciones</h3>
            <p className="text-sm text-gray-500">No hay datos de cotizaciones</p>
          </div>
        </div>
      </div>
    );
  }

  const acceptanceRate = quotations.acceptanceRate || 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="bg-white rounded-xl shadow-lg border-2 border-blue-200 p-6"
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 rounded-lg bg-blue-50">
          <DollarSign className="w-6 h-6 text-blue-600" />
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-bold text-gray-800">Cotizaciones</h3>
          <p className="text-sm text-gray-500">
            Solicitudes procesadas (excl. canceladas/rechazadas)
          </p>
        </div>
      </div>

      {/* Visualización circular */}
      <div className="flex items-center justify-center mb-6">
        <div className="relative w-48 h-48">
          <svg viewBox="0 0 100 100" className="transform -rotate-90">
            {/* Círculo de fondo */}
            <circle
              cx="50"
              cy="50"
              r="40"
              fill="none"
              stroke="#E5E7EB"
              strokeWidth="20"
            />
            {/* Círculo de progreso */}
            <circle
              cx="50"
              cy="50"
              r="40"
              fill="none"
              stroke="#3B82F6"
              strokeWidth="20"
              strokeDasharray={`${acceptanceRate * 2.51327} 251.327`}
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-3xl font-bold text-blue-600">{acceptanceRate.toFixed(0)}%</span>
            <span className="text-sm text-gray-500">Aceptación</span>
          </div>
        </div>
      </div>

      {/* Métricas */}
      <div className="space-y-3">
        <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-medium text-gray-700">Enviadas</span>
          </div>
          <span className="text-lg font-bold text-blue-600">{quotations.sent}</span>
        </div>
        <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-green-600" />
            <span className="text-sm font-medium text-gray-700">Aceptadas</span>
          </div>
          <span className="text-lg font-bold text-green-600">{quotations.accepted}</span>
        </div>
      </div>

      {/* Nota informativa */}
      <div className="mt-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
        <p className="text-xs text-gray-600">
          ℹ️ Las cotizaciones enviadas excluyen solicitudes canceladas o rechazadas antes de cotizar.
        </p>
      </div>
    </motion.div>
  );
};
